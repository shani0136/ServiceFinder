import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  deleteDoc,
  deleteField,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db, DEMO_MODE } from './firebase';
import type { Provider, ProviderStatus, Review, AppUser, ProviderPendingUpdates } from '../types';
import { SERVICE_NAMES, type ServiceCategory } from '../constants/services';
import { MUMBAI_LOCATIONS, type MumbaiLocation } from '../constants/locations';

const STORAGE_PROVIDERS_KEY = 'sf_providers_store';
const STORAGE_REVIEWS_KEY   = 'sf_reviews_store';

// ─── Local Storage Persistence for Offline / Fallback (ZERO FAKE DATA) ─────
function getLocalProviders(): Provider[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROVIDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProviders(providers: Provider[]) {
  try {
    localStorage.setItem(STORAGE_PROVIDERS_KEY, JSON.stringify(providers));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sf_directory_updated'));
    }
  } catch {
    // ignore
  }
}

function getLocalReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReviews(reviews: Review[]) {
  try {
    localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  } catch {
    // ignore
  }
}

// ─── Catalog Validation Helpers ────────────────────────────────────────────
function validateServiceCategory(service: string): boolean {
  return SERVICE_NAMES.includes(service as ServiceCategory);
}

function validateMumbaiLocation(location: string): boolean {
  return MUMBAI_LOCATIONS.includes(location as MumbaiLocation);
}

// ─── Public Discovery: ONLY Approved Providers (Requirement 8 & 21) ────────
/**
 * Fetch approved providers filtered by optional service, Mumbai Western Line location, and keyword.
 * Strictly queries status === 'approved'. NEVER returns pending, rejected, or suspended providers.
 */
export async function getApprovedProviders(
  service?: string,
  area?: string,
  keyword?: string
): Promise<Provider[]> {
  // STRICT PROVIDER ISOLATION: A service provider MUST NOT browse, search, or view other service providers
  try {
    const rawSession = typeof window !== 'undefined' ? localStorage.getItem('sf_demo_session') : null;
    if (rawSession) {
      const sessionUser = JSON.parse(rawSession);
      if (sessionUser?.role === 'provider') {
        return [];
      }
    }
  } catch {
    // continue
  }

  let list: Provider[] = [];

  if (!DEMO_MODE && db) {
    try {
      let q = query(
        collection(db, 'providers'),
        where('status', '==', 'approved')
      );

      if (service && service !== 'All') {
        q = query(q, where('service', '==', service));
      }

      const snap = await getDocs(q);
      snap.forEach((d) => {
        const data = d.data();
        if (data.available !== false) {
          list.push({ id: d.id, ...data, available: data.available !== false } as Provider);
        }
      });
    } catch (err: unknown) {
      const isPermDenied = err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'permission-denied';
      if (isPermDenied) {
        console.warn('[directoryService] Public discovery query blocked by Firestore security rules (caller is a provider).');
        return [];
      }
      console.warn('[directoryService] Firestore query failed, falling back to local store:', err);
      list = getLocalProviders().filter((p) => p.status === 'approved' && p.available !== false);
    }
  } else {
    list = getLocalProviders().filter((p) => p.status === 'approved' && p.available !== false);
  }

  // Refine in-memory for exact service, multi-service areas, and keyword
  return list.filter((p) => {
    // Critical safety check: reject any unapproved or unavailable provider
    if (p.status !== 'approved') return false;
    if (p.available === false) return false;

    if (service && service !== 'All') {
      const matchService =
        p.service?.toLowerCase() === service.toLowerCase() ||
        p.primaryService?.toLowerCase() === service.toLowerCase();
      if (!matchService) return false;
    }

    if (area && area !== 'Select Location' && area !== 'All') {
      const targetArea = area.toLowerCase();
      const matchPrimary = p.serviceArea?.toLowerCase() === targetArea;
      const matchMulti = p.serviceAreas && p.serviceAreas.some(
        (a) => a.toLowerCase() === targetArea
      );
      if (!matchPrimary && !matchMulti) {
        return false;
      }
    }

    if (keyword && keyword.trim().length > 1) {
      const k = keyword.toLowerCase().trim();
      const matchName = p.name?.toLowerCase().includes(k);
      const matchDesc = p.description?.toLowerCase().includes(k);
      const matchSkills = p.skills && p.skills.some((s) => s.toLowerCase().includes(k));
      if (!matchName && !matchDesc && !matchSkills) {
        return false;
      }
    }

    return true;
  });
}

const STORAGE_DELETED_PROVIDERS_KEY = 'sf_deleted_providers_v2';

export function getDeletedProviderTokens(): string[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_DELETED_PROVIDERS_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedProviderTokens(tokens: string[]) {
  try {
    const current = getDeletedProviderTokens();
    const cleanTokens = tokens.map(t => (t || '').trim().toLowerCase()).filter(Boolean);
    const updated = Array.from(new Set([...current, ...cleanTokens]));
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DELETED_PROVIDERS_KEY, JSON.stringify(updated));
    }
  } catch {
    // ignore
  }
}

// ─── Admin Review Queue: Fetch All Provider Registrations & Sync ──────────
export async function getAllProvidersForAdmin(): Promise<Provider[]> {
  const providerMap = new Map<string, Provider>();
  const deletedTokens = getDeletedProviderTokens();

  const isTombstoned = (id?: string, uid?: string, email?: string): boolean => {
    const cleanId = (id || '').toLowerCase();
    const cleanUid = (uid || '').toLowerCase();
    const cleanEmail = (email || '').toLowerCase();
    return deletedTokens.some(t =>
      (cleanId && t === cleanId) ||
      (cleanUid && t === cleanUid) ||
      (cleanEmail && t === cleanEmail)
    );
  };

  if (!DEMO_MODE && db) {
    const firestore = db;
    try {
      // 1. Fetch all docs from 'providers' collection
      const snap = await getDocs(collection(firestore, 'providers'));
      snap.forEach((d) => {
        const p = { id: d.id, ...d.data() } as Provider;
        if (!isTombstoned(p.id, p.uid, p.email)) {
          providerMap.set(p.id, p);
          if (p.uid) providerMap.set(p.uid, p);
        }
      });

      // 2. Fetch from 'providers_draft' collection (read only, NO setDoc resurrection)
      try {
        const draftSnap = await getDocs(collection(firestore, 'providers_draft'));
        draftSnap.forEach((d) => {
          const draft = d.data();
          const targetId = draft.uid || d.id;
          if (!isTombstoned(targetId, d.id, draft.email) && !providerMap.has(targetId) && !providerMap.has(d.id)) {
            const newProv: Provider = {
              id: targetId,
              uid: targetId,
              name: draft.name || 'Service Provider Applicant',
              email: draft.email || undefined,
              phone: draft.phone || '',
              whatsapp: draft.phone || '',
              whatsappPhone: draft.phone || '',
              service: draft.service || 'Electrician',
              primaryService: draft.service || 'Electrician',
              serviceArea: draft.serviceArea || 'Borivali',
              serviceAreas: draft.serviceAreas || [draft.serviceArea || 'Borivali'],
              experienceYears: draft.experienceYears || 1,
              description: draft.description || '',
              skills: draft.skills || [draft.service || 'Electrician'],
              status: draft.status || 'pending',
              verified: draft.verified === true,
              rating: null,
              reviewCount: 0,
              workProof: draft.workProof || '',
              submittedProof: draft.submittedProof || draft.workProof || '',
              createdAt: draft.createdAt || new Date().toISOString(),
            };
            providerMap.set(targetId, newProv);
          }
        });
      } catch (draftErr) {
        console.warn('[directoryService] Draft query notice:', draftErr);
      }

      // 3. Fetch from 'users' collection where role === 'provider' (read only, NO setDoc resurrection)
      try {
        const usersSnap = await getDocs(collection(firestore, 'users'));
        usersSnap.forEach((d) => {
          const u = d.data();
          if (u.role === 'provider' && u.phone) {
            const targetId = u.uid || d.id;
            if (!isTombstoned(targetId, d.id, u.email) && !providerMap.has(targetId) && !providerMap.has(d.id)) {
              const newProv: Provider = {
                id: targetId,
                uid: targetId,
                name: u.name || 'Service Provider Applicant',
                email: u.email || undefined,
                phone: u.phone || '',
                whatsapp: u.phone || '',
                whatsappPhone: u.phone || '',
                service: u.service || 'Electrician',
                primaryService: u.service || 'Electrician',
                serviceArea: u.area || 'Borivali',
                serviceAreas: [u.area || 'Borivali'],
                experienceYears: u.experienceYears || 1,
                description: u.description || '',
                skills: [u.service || 'Electrician'],
                status: 'pending',
                verified: false,
                rating: null,
                reviewCount: 0,
                workProof: '',
                submittedProof: '',
                createdAt: u.createdAt && typeof u.createdAt === 'string' ? u.createdAt : new Date().toISOString(),
              };
              providerMap.set(targetId, newProv);
            }
          }
        });
      } catch (usersErr) {
        console.warn('[directoryService] Users provider query notice:', usersErr);
      }

      const deduplicated = Array.from(new Set(providerMap.values())).filter(p => !isTombstoned(p.id, p.uid, p.email));
      saveLocalProviders(deduplicated);
      return deduplicated;
    } catch (err) {
      console.warn('[directoryService] Firestore admin query failed:', err);
    }
  }

  const local = getLocalProviders().filter(p => !isTombstoned(p.id, p.uid, p.email));
  return local;
}

// ─── Admin Users Directory: Fetch All Registered Customers & Providers ─────
export async function getAllUsersForAdmin(): Promise<AppUser[]> {
  if (!DEMO_MODE && db) {
    const firestore = db;
    try {
      const [snap, provSnap] = await Promise.all([
        getDocs(collection(firestore, 'users')),
        getDocs(collection(firestore, 'providers')).catch(() => null),
      ]);

      const userMap = new Map<string, AppUser>();

      snap.forEach((d) => {
        const data = d.data();
        userMap.set(d.id, {
          uid: d.id,
          name: data.name || (data.role === 'admin' ? 'Administrator' : data.role === 'provider' ? 'Service Provider' : 'Customer'),
          email: data.email || null,
          photoURL: data.photoURL || null,
          role: data.role || 'customer',
          phone: data.phone || undefined,
          status: data.status || 'active',
          createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
        });
      });

      // Synchronize with providers collection: ensure every provider profile has role: 'provider'
      // and their name, email, and phone are populated in the admin user directory
      if (provSnap) {
        provSnap.forEach((d) => {
          const p = d.data();
          const targetId = p.uid || d.id;
          const existing = userMap.get(targetId);
          if (existing) {
            if (existing.role !== 'admin') {
              existing.role = 'provider';
            }
            if (!existing.name || existing.name === 'Customer' || existing.name === 'Member' || existing.name === 'Service Provider') {
              existing.name = p.name || existing.name;
            }
            if (!existing.email && p.email) {
              existing.email = p.email;
            }
            if (!existing.phone && (p.phone || p.whatsappPhone || p.whatsapp)) {
              existing.phone = p.phone || p.whatsappPhone || p.whatsapp;
            }
          } else {
            userMap.set(targetId, {
              uid: targetId,
              name: p.name || 'Service Provider',
              email: p.email || null,
              photoURL: p.profileImage || null,
              role: 'provider',
              phone: p.phone || p.whatsappPhone || p.whatsapp || undefined,
              status: p.status === 'approved' ? 'active' : (p.status || 'active'),
              createdAt: p.createdAt || undefined,
            });
          }
        });
      }

      return Array.from(userMap.values());
    } catch (err) {
      console.warn('[directoryService] Firestore getAllUsersForAdmin failed:', err);
    }
  }

  try {
    const raw = localStorage.getItem('sf_users_directory');
    if (raw) {
      return Object.values(JSON.parse(raw));
    }
  } catch {
    // ignore
  }

  return [];
}

// ─── Admin Delete Actions: Provider and User Records ─────────────────────────
export async function deleteProviderForAdmin(
  providerId: string,
  providerUid?: string,
  providerEmail?: string
): Promise<void> {
  const rawTokens = [providerId, providerUid, providerEmail].filter(Boolean) as string[];
  addDeletedProviderTokens(rawTokens);

  if (!DEMO_MODE && db) {
    const firestore = db;
    const docIds = Array.from(new Set([providerId, providerUid].filter(Boolean) as string[]));
    for (const docId of docIds) {
      try {
        await Promise.allSettled([
          deleteDoc(doc(firestore, 'providers', docId)),
          deleteDoc(doc(firestore, 'providers_draft', docId)),
          updateDoc(doc(firestore, 'users', docId), { role: 'customer' }),
        ]);
      } catch (err) {
        console.warn('[directoryService] Firestore delete error for id:', docId, err);
      }
    }

    if (providerEmail) {
      const cleanEmail = providerEmail.trim().toLowerCase();
      try {
        const qUsers = query(collection(firestore, 'users'), where('email', '==', cleanEmail));
        const uSnap = await getDocs(qUsers);
        for (const uDoc of uSnap.docs) {
          updateDoc(doc(firestore, 'users', uDoc.id), { role: 'customer' }).catch(() => {});
        }
      } catch {
        // ignore
      }
      try {
        const qDrafts = query(collection(firestore, 'providers_draft'), where('email', '==', cleanEmail));
        const dSnap = await getDocs(qDrafts);
        for (const dDoc of dSnap.docs) {
          deleteDoc(doc(firestore, 'providers_draft', dDoc.id)).catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  }

  // Purge from local storage cache
  const deletedTokens = getDeletedProviderTokens();
  const existing = getLocalProviders().filter((p) => {
    const pId = (p.id || '').toLowerCase();
    const pUid = (p.uid || '').toLowerCase();
    const pEmail = (p.email || '').toLowerCase();
    return !deletedTokens.some(t => (pId && t === pId) || (pUid && t === pUid) || (pEmail && t === pEmail));
  });
  saveLocalProviders(existing);
}

export async function deleteUserForAdmin(userId: string): Promise<void> {
  if (!DEMO_MODE && db) {
    const firestore = db;
    try {
      await deleteDoc(doc(firestore, 'users', userId));
    } catch (err) {
      console.warn('[directoryService] Firestore delete user failed:', err);
    }
  }
}

// ─── Provider Registration (Strict Initial Submission) ─────────────────────
/**
 * Register a new provider profile.
 * Strictly enforces:
 * - status: 'pending' (MUST NEVER BE APPROVED BY PROVIDER)
 * - verified: false
 * - rating: null
 * - reviewCount: 0
 * - primaryService MUST be in approved 14 services catalog
 * - serviceArea MUST be in approved 23 Mumbai Western Line stations catalog
 */
export async function registerProvider(
  input: Omit<Provider, 'id' | 'status' | 'verified' | 'rating' | 'reviewCount' | 'createdAt'>
): Promise<Provider> {
  const chosenService = input.primaryService || input.service;
  if (!validateServiceCategory(chosenService)) {
    throw new Error(`Invalid service: "${chosenService}". Service must be from the official 14 ServiceFinder trades.`);
  }

  const primaryArea = input.serviceAreas?.[0] || input.serviceArea || 'Borivali';
  if (!validateMumbaiLocation(primaryArea)) {
    throw new Error(`Invalid location: "${primaryArea}". Location must be an official Mumbai Western Line station.`);
  }

  const allAreas = input.serviceAreas || [primaryArea];
  for (const a of allAreas) {
    if (!validateMumbaiLocation(a)) {
      throw new Error(`Invalid service area: "${a}". All locations must be on Mumbai Western Line.`);
    }
  }

  const docId = input.uid || `prov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Strict sanitization: ensure no provider can self-approve or forge ratings
  const newProvider: Provider = {
    id: docId,
    uid: input.uid || docId,
    name: input.name.trim(),
    businessName: input.businessName?.trim(),
    email: input.email?.trim(),
    phone: input.phone.trim(),
    whatsapp: input.whatsapp?.trim() || input.phone.trim(),
    whatsappPhone: input.whatsappPhone?.trim() || input.whatsapp?.trim() || input.phone.trim(),
    profileImage: input.profileImage?.trim(),
    service: chosenService as ServiceCategory,
    primaryService: chosenService as ServiceCategory,
    serviceArea: primaryArea,
    serviceAreas: allAreas,
    experienceYears: Math.max(0, Number(input.experienceYears) || 1),
    description: input.description.trim(),
    skills: Array.isArray(input.skills) ? input.skills : [],
    phoneVerified: false,
    workProof: input.workProof?.trim() || input.submittedProof?.trim() || '',
    submittedProof: input.submittedProof?.trim() || input.workProof?.trim() || '',
    pricingInfo: input.pricingInfo?.trim(),
    workingHours: input.workingHours?.trim(),
    profileViews: 0,
    callClicks: 0,
    whatsappClicks: 0,
    status: 'pending',        // CRITICAL: Strictly pending upon submission
    available: true,          // Default available for service enquiries
    verified: false,          // CRITICAL: Verified badge only set by Admin
    rating: null,             // CRITICAL: Genuine rating only calculated from reviews
    reviewCount: 0,           // CRITICAL: Genuine count only
    createdAt: new Date().toISOString(),
  };

  if (!DEMO_MODE && db) {
    const firestore = db;
    try {
      await setDoc(doc(firestore, 'providers', docId), {
        ...newProvider,
        serverCreatedAt: serverTimestamp(),
      });
      // Synchronize to users collection so the user directory recognizes the provider
      try {
        await setDoc(doc(firestore, 'users', docId), {
          uid: docId,
          name: newProvider.name,
          email: newProvider.email || null,
          phone: newProvider.phone,
          role: 'provider',
          status: 'pending',
          createdAt: newProvider.createdAt,
        }, { merge: true });
      } catch {
        // ignore user doc sync error
      }
      return newProvider;
    } catch (err) {
      console.warn('[directoryService] Firestore register failed, saving locally:', err);
    }
  }

  const existing = getLocalProviders().filter((p) => p.id !== docId && p.uid !== newProvider.uid);
  saveLocalProviders([...existing, newProvider]);
  return newProvider;
}

// ─── Admin Action: Update Provider Status & Verification ───────────────────
/**
 * Strictly authorized for administrators.
 * Allows setting provider status to pending, approved, suspended, or rejected.
 */
export async function updateProviderStatus(
  providerId: string,
  newStatus: ProviderStatus,
  verified?: boolean,
  adminUid?: string
): Promise<void> {
  const isVerified = verified !== undefined ? verified : newStatus === 'approved';
  const now = new Date().toISOString();

  const patch: Record<string, unknown> = {
    status: newStatus,
    verified: isVerified,
    updatedAt: now,
  };

  if (newStatus === 'approved') {
    patch.approvedAt = now;
    patch.approvedBy = adminUid || 'admin';
    patch.verifiedAt = now;
  } else {
    patch.verified = false;
  }

  if (!DEMO_MODE && db) {
    const firestore = db;
    try {
      const ref = doc(firestore, 'providers', providerId);
      await setDoc(ref, patch, { merge: true });

      // If user document exists, also sync status in users collection
      try {
        const provDocSnap = await getDoc(ref);
        const provData = provDocSnap.exists() ? provDocSnap.data() : null;
        await setDoc(doc(firestore, 'users', providerId), {
          uid: providerId,
          status: newStatus === 'approved' ? 'active' : newStatus,
          role: 'provider',
          ...(provData?.name ? { name: provData.name } : {}),
          ...(provData?.email ? { email: provData.email } : {}),
          ...(provData?.phone ? { phone: provData.phone } : {}),
          updatedAt: now,
        }, { merge: true });
      } catch {
        // ignore user doc sync error
      }
    } catch (err) {
      console.warn('[directoryService] Firestore status update failed, updating locally:', err);
    }
  }

  const existing = getLocalProviders().map((p) =>
    p.id === providerId || p.uid === providerId
      ? {
          ...p,
          ...patch,
        }
      : p
  );
  saveLocalProviders(existing);
}

// ─── Provider Profile Retrieval ────────────────────────────────────────────
export async function getProviderByUid(uid: string): Promise<Provider | null> {
  if (!DEMO_MODE && db) {
    try {
      const docSnap = await getDoc(doc(db, 'providers', uid));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Provider;
      }

      const q = query(collection(db, 'providers'), where('uid', '==', uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as Provider;
      }
    } catch (err) {
      console.warn('[directoryService] getProviderByUid failed:', err);
    }
  }

  const match = getLocalProviders().find((p) => p.uid === uid || p.id === uid);
  return match || null;
}

export async function getProviderById(id: string): Promise<Provider | null> {
  // STRICT PROVIDER ISOLATION: A service provider can only view their own provider record
  try {
    const rawSession = typeof window !== 'undefined' ? localStorage.getItem('sf_demo_session') : null;
    if (rawSession) {
      const sessionUser = JSON.parse(rawSession);
      if (sessionUser?.role === 'provider' && sessionUser.uid !== id) {
        return null;
      }
    }
  } catch {
    // continue
  }

  if (!DEMO_MODE && db) {
    try {
      const snap = await getDoc(doc(db, 'providers', id));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Provider;
      }
    } catch (err: unknown) {
      const isPermDenied = err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'permission-denied';
      if (isPermDenied) {
        console.warn('[directoryService] Provider document read blocked by Firestore security rules.');
        return null;
      }
      console.warn('[directoryService] getProviderById failed:', err);
    }
  }

  const match = getLocalProviders().find((p) => p.id === id);
  return match || null;
}

// ─── Provider Availability Action ──────────────────────────────────────────
/**
 * Toggles a provider's service availability.
 * Turning availability OFF temporarily hides the provider from customer discovery
 * without deleting, rejecting, or suspending the provider or modifying reputation data.
 */
export async function setProviderAvailability(
  providerId: string,
  available: boolean
): Promise<void> {
  const now = new Date().toISOString();

  if (!DEMO_MODE && db) {
    try {
      await updateDoc(doc(db, 'providers', providerId), {
        available,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('[directoryService] Failed to update availability in Firestore:', err);
    }
  }

  const existing = getLocalProviders();
  const updated = existing.map((p) => (p.id === providerId ? { ...p, available, updatedAt: now } : p));
  saveLocalProviders(updated);
}

// ─── Provider Action: Update Own Profile Details ────────────────────────────
/**
 * Providers can update their normal profile info.
 * CRITICAL SECURITY: Status, verified, rating, reviewCount, and approval fields
 * are STRIPED and PROTECTED. Providers cannot tamper with them.
 */
export async function updateProviderProfile(
  providerId: string,
  updates: Partial<Provider>
): Promise<void> {
  // Validate catalogs if being updated
  if (updates.primaryService && !validateServiceCategory(updates.primaryService)) {
    throw new Error(`Invalid service: "${updates.primaryService}". Service must be from the official 14 ServiceFinder trades.`);
  }

  if (updates.serviceAreas) {
    for (const a of updates.serviceAreas) {
      if (!validateMumbaiLocation(a)) {
        throw new Error(`Invalid service area: "${a}". Location must be on Mumbai Western Line.`);
      }
    }
  }

  const patch: Record<string, unknown> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // STRICT PROTECTION: Delete any protected fields that client might attempt to send
  delete patch.status;
  delete patch.verified;
  delete patch.approvedAt;
  delete patch.approvedBy;
  delete patch.rating;
  delete patch.reviewCount;

  if (!DEMO_MODE && db) {
    try {
      const ref = doc(db, 'providers', providerId);
      await updateDoc(ref, patch);
    } catch (err) {
      console.warn('[directoryService] Firestore updateProviderProfile failed:', err);
    }
  }

  const existing = getLocalProviders().map((p) =>
    p.id === providerId || p.uid === providerId
      ? {
          ...p,
          ...patch,
        }
      : p
  );
  saveLocalProviders(existing);
}

// ─── Provider Action: Submit Profile Edits for Admin Confirmation ─────────
/**
 * When an approved provider edits skills, trades, service areas, proof, etc.,
 * changes are staged as pendingUpdates with editPending: true.
 * The live directory listing continues serving existing verified info until Admin approves.
 */
export async function submitProviderProfileEdit(
  providerId: string,
  updates: Partial<ProviderPendingUpdates>
): Promise<void> {
  if (updates.primaryService && !validateServiceCategory(updates.primaryService)) {
    throw new Error(`Invalid service: "${updates.primaryService}". Service must be from the official 14 ServiceFinder trades.`);
  }

  if (updates.serviceAreas) {
    for (const a of updates.serviceAreas) {
      if (!validateMumbaiLocation(a)) {
        throw new Error(`Invalid service area: "${a}". Location must be on Mumbai Western Line.`);
      }
    }
  }

  const now = new Date().toISOString();
  const pendingUpdates: ProviderPendingUpdates = {
    name: updates.name?.trim(),
    service: updates.service || updates.primaryService,
    primaryService: updates.primaryService || updates.service,
    skills: updates.skills || [],
    serviceArea: updates.serviceArea || updates.serviceAreas?.[0] || 'Borivali',
    serviceAreas: updates.serviceAreas || [],
    experienceYears: updates.experienceYears,
    description: updates.description?.trim(),
    workProof: updates.workProof?.trim() || updates.submittedProof?.trim() || '',
    submittedProof: updates.submittedProof?.trim() || updates.workProof?.trim() || '',
    phone: updates.phone?.trim(),
    whatsapp: updates.whatsapp?.trim() || updates.phone?.trim(),
    whatsappPhone: updates.whatsappPhone?.trim() || updates.whatsapp?.trim() || updates.phone?.trim(),
    profileImage: updates.profileImage?.trim(),
    requestedAt: now,
  };

  const patch = {
    editPending: true,
    pendingUpdates,
    updatedAt: now,
  };

  if (!DEMO_MODE && db) {
    try {
      const ref = doc(db, 'providers', providerId);
      await updateDoc(ref, patch);
    } catch (err) {
      console.warn('[directoryService] Firestore submitProviderProfileEdit failed:', err);
    }
  }

  const existing = getLocalProviders().map((p) =>
    p.id === providerId || p.uid === providerId
      ? {
          ...p,
          ...patch,
        }
      : p
  );
  saveLocalProviders(existing);
}

// ─── Admin Action: Approve Provider Profile Edit ───────────────────────────
/**
 * Administrator confirms the provider's requested trade/skill/detail update.
 * Merges pendingUpdates into the live provider profile, publishes to directory,
 * and clears editPending.
 */
export async function approveProviderProfileEdit(
  providerId: string,
  adminUid?: string
): Promise<void> {
  const now = new Date().toISOString();
  let providerToApprove: Provider | null = null;

  if (!DEMO_MODE && db) {
    try {
      const snap = await getDoc(doc(db, 'providers', providerId));
      if (snap.exists()) {
        providerToApprove = { id: snap.id, ...snap.data() } as Provider;
      }
    } catch {
      // ignore
    }
  }

  if (!providerToApprove) {
    providerToApprove = getLocalProviders().find((p) => p.id === providerId || p.uid === providerId) || null;
  }

  if (!providerToApprove || !providerToApprove.pendingUpdates) {
    return;
  }

  const upd = providerToApprove.pendingUpdates;
  const mergedName = upd.name?.trim() || providerToApprove.name;
  const mergedService = (upd.service || upd.primaryService || providerToApprove.service) as ServiceCategory;
  const mergedPrimaryService = (upd.primaryService || upd.service || providerToApprove.primaryService || mergedService) as ServiceCategory;
  const mergedSkills = upd.skills && upd.skills.length > 0 ? upd.skills : providerToApprove.skills;
  const mergedArea = upd.serviceArea || upd.serviceAreas?.[0] || providerToApprove.serviceArea;
  const mergedAreas = upd.serviceAreas && upd.serviceAreas.length > 0 ? upd.serviceAreas : (providerToApprove.serviceAreas || [mergedArea]);
  const mergedExp = upd.experienceYears !== undefined ? upd.experienceYears : providerToApprove.experienceYears;
  const mergedDesc = upd.description !== undefined ? upd.description : providerToApprove.description;
  const mergedWorkProof = upd.workProof !== undefined ? upd.workProof : (upd.submittedProof || providerToApprove.workProof || '');
  const mergedPhone = upd.phone?.trim() || providerToApprove.phone;
  const mergedWhatsapp = upd.whatsapp?.trim() || upd.whatsappPhone?.trim() || providerToApprove.whatsapp;
  const mergedWhatsappPhone = upd.whatsappPhone?.trim() || upd.whatsapp?.trim() || providerToApprove.whatsappPhone;
  const mergedProfileImg = upd.profileImage !== undefined ? upd.profileImage : providerToApprove.profileImage;

  const patch: Record<string, unknown> = {
    name: mergedName,
    service: mergedService,
    primaryService: mergedPrimaryService,
    skills: mergedSkills,
    serviceArea: mergedArea,
    serviceAreas: mergedAreas,
    experienceYears: mergedExp,
    description: mergedDesc,
    workProof: mergedWorkProof,
    submittedProof: mergedWorkProof,
    phone: mergedPhone,
    whatsapp: mergedWhatsapp,
    whatsappPhone: mergedWhatsappPhone,
    ...(mergedProfileImg !== undefined ? { profileImage: mergedProfileImg } : {}),
    editPending: false,
    updatedAt: now,
    lastEditedApprovedAt: now,
    lastEditedApprovedBy: adminUid || 'admin',
  };

  if (!DEMO_MODE && db) {
    try {
      const ref = doc(db, 'providers', providerId);
      await updateDoc(ref, {
        ...patch,
        pendingUpdates: deleteField(),
      });

      // Also sync user document if name or phone changed
      try {
        await updateDoc(doc(db, 'users', providerId), {
          name: mergedName,
          phone: mergedPhone,
          updatedAt: now,
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.warn('[directoryService] Firestore approveProviderProfileEdit failed:', err);
    }
  }

  const existing = getLocalProviders().map((p) => {
    if (p.id === providerId || p.uid === providerId) {
      const copy: Provider = { ...p, ...patch } as Provider;
      delete copy.pendingUpdates;
      return copy;
    }
    return p;
  });
  saveLocalProviders(existing);
}

// ─── Admin Action: Reject Provider Profile Edit ────────────────────────────
/**
 * Administrator rejects proposed profile edits. Provider's current approved listing
 * remains intact.
 */
export async function rejectProviderProfileEdit(
  providerId: string,
  reason?: string
): Promise<void> {
  const now = new Date().toISOString();
  if (!DEMO_MODE && db) {
    try {
      const ref = doc(db, 'providers', providerId);
      await updateDoc(ref, {
        editPending: false,
        pendingUpdates: deleteField(),
        editRejectedAt: now,
        editRejectionReason: reason || 'Declined by administrator',
        updatedAt: now,
      });
    } catch (err) {
      console.warn('[directoryService] Firestore rejectProviderProfileEdit failed:', err);
    }
  }

  const existing = getLocalProviders().map((p) => {
    if (p.id === providerId || p.uid === providerId) {
      const copy: Provider = {
        ...p,
        editPending: false,
        editRejectedAt: now,
        editRejectionReason: reason || 'Declined by administrator',
        updatedAt: now,
      };
      delete copy.pendingUpdates;
      return copy;
    }
    return p;
  });
  saveLocalProviders(existing);
}


// ─── Analytics Counters (Tracked User Direct Actions) ──────────────────────
export async function incrementProfileViews(providerId: string): Promise<void> {
  if (!DEMO_MODE && db) {
    try {
      const ref = doc(db, 'providers', providerId);
      await updateDoc(ref, { profileViews: increment(1) });
      return;
    } catch {
      // fallback
    }
  }

  const existing = getLocalProviders().map((p) =>
    p.id === providerId ? { ...p, profileViews: (p.profileViews || 0) + 1 } : p
  );
  saveLocalProviders(existing);
}

export async function incrementCallClicks(providerId: string): Promise<void> {
  if (!DEMO_MODE && db) {
    try {
      const ref = doc(db, 'providers', providerId);
      await updateDoc(ref, { callClicks: increment(1) });
      return;
    } catch {
      // fallback
    }
  }

  const existing = getLocalProviders().map((p) =>
    p.id === providerId ? { ...p, callClicks: (p.callClicks || 0) + 1 } : p
  );
  saveLocalProviders(existing);
}

export async function incrementWhatsappClicks(providerId: string): Promise<void> {
  if (!DEMO_MODE && db) {
    try {
      const ref = doc(db, 'providers', providerId);
      await updateDoc(ref, { whatsappClicks: increment(1) });
      return;
    } catch {
      // fallback
    }
  }

  const existing = getLocalProviders().map((p) =>
    p.id === providerId ? { ...p, whatsappClicks: (p.whatsappClicks || 0) + 1 } : p
  );
  saveLocalProviders(existing);
}

export async function recordProviderInteraction(
  providerId: string,
  type: 'call' | 'whatsapp' | 'view'
): Promise<void> {
  if (type === 'call') {
    return incrementCallClicks(providerId);
  } else if (type === 'whatsapp') {
    return incrementWhatsappClicks(providerId);
  } else {
    return incrementProfileViews(providerId);
  }
}

// ─── Genuine Reviews Submission & Accurate Community Rating Calculation ───
export async function getProviderReviews(providerId: string): Promise<Review[]> {
  if (!DEMO_MODE && db) {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('providerId', '==', providerId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const list: Review[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Review);
      });
      return list;
    } catch (err) {
      console.warn('[directoryService] Reviews fetch failed:', err);
    }
  }

  return getLocalReviews().filter((r) => r.providerId === providerId);
}

export interface SubmitReviewParams {
  providerId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}

/**
 * Submit a genuine customer review.
 * Enforces rating 1-5, records reviewer UID, and recomputes the true mathematical average.
 */
export async function submitProviderReview(
  providerIdOrParams: string | SubmitReviewParams,
  userId?: string,
  userName?: string,
  rating?: number,
  comment?: string
): Promise<Review> {
  let pid: string;
  let uid: string;
  let uname: string;
  let rate: number;
  let comm: string;

  if (typeof providerIdOrParams === 'object') {
    pid = providerIdOrParams.providerId;
    uid = providerIdOrParams.userId;
    uname = providerIdOrParams.userName;
    rate = providerIdOrParams.rating;
    comm = providerIdOrParams.comment;
  } else {
    pid = providerIdOrParams;
    uid = userId!;
    uname = userName || 'Customer';
    rate = rating || 5;
    comm = comment || '';
  }

  if (rate < 1 || rate > 5) {
    throw new Error('Rating must be an integer between 1 and 5 stars.');
  }

  const cleanComment = comm.trim();
  if (cleanComment.length < 5) {
    throw new Error('Please enter at least 5 characters in your review comment.');
  }

  const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newReview: Review = {
    id: reviewId,
    providerId: pid,
    userId: uid,
    userName: uname || 'Customer',
    rating: Math.min(5, Math.max(1, Math.round(rate))),
    comment: cleanComment,
    createdAt: new Date().toISOString(),
  };

  if (!DEMO_MODE && db) {
    try {
      await addDoc(collection(db, 'reviews'), newReview);
    } catch (err) {
      console.warn('[directoryService] Firestore review submit failed:', err);
    }
  }

  const allReviews = [...getLocalReviews(), newReview];
  saveLocalReviews(allReviews);

  // Recalculate true community rating from actual genuine reviews
  const providerReviews = allReviews.filter((r) => r.providerId === pid);
  const totalCount = providerReviews.length;
  const avgRating =
    totalCount > 0
      ? Number((providerReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1))
      : null;

  // Persist genuine rating update to provider
  if (!DEMO_MODE && db) {
    try {
      await updateDoc(doc(db, 'providers', pid), {
        rating: avgRating,
        reviewCount: totalCount,
      });
    } catch (err) {
      console.warn('[directoryService] Provider rating recompute failed:', err);
    }
  }

  const existingProviders = getLocalProviders().map((p) =>
    p.id === pid
      ? {
          ...p,
          rating: avgRating,
          reviewCount: totalCount,
        }
      : p
  );
  saveLocalProviders(existingProviders);

  return newReview;
}
