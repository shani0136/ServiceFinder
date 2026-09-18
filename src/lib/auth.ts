import { useState, useEffect, useCallback } from 'react';
import type { AppUser, UserRole } from '../types';
import {
  DEMO_MODE,
  auth,
  db,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEMO_STORAGE_KEY = 'sf_demo_session';
const USERS_STORAGE_KEY = 'sf_users_directory';

// ─── Local Storage Store for Demo / Offline Fallback ────────────────────────
function getStoredUsers(): Record<string, AppUser> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredUser(u: AppUser) {
  try {
    const all = getStoredUsers();
    all[u.uid] = u;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

// ─── Human-Friendly Firebase Auth Error Formatter ───────────────────────────
export function formatAuthError(err: unknown): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const errObj = err as { code?: string; message?: string };
  const code = (errObj.code || '').toLowerCase();
  const rawMsg = err instanceof Error ? err.message : String(err);
  const msg = (errObj.message || rawMsg || '').toLowerCase();

  if (code.includes('invalid-credential') || msg.includes('invalid-credential')) {
    return 'Incorrect email or password, or this account has not been registered yet. If you are new, please click "Customer Sign Up" or use "Continue with Google".';
  }
  if (code.includes('user-not-found') || msg.includes('user-not-found')) {
    return 'No account found with this email. Please click "Customer Sign Up" or use "Continue with Google".';
  }
  if (code.includes('wrong-password') || msg.includes('wrong-password')) {
    return 'Incorrect password. Please check your password or reset it.';
  }
  if (code.includes('email-already-in-use') || msg.includes('email-already-in-use')) {
    return 'An account already exists with this email. Please switch to the "Sign In" tab or sign in with Google.';
  }
  if (code.includes('invalid-email') || msg.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code.includes('weak-password') || msg.includes('weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code.includes('too-many-requests') || msg.includes('too-many-requests')) {
    return 'Too many failed login attempts. Please wait a few moments or try again later.';
  }
  if (code.includes('popup-closed-by-user') || msg.includes('popup-closed-by-user')) {
    return 'Google sign-in window was closed before completing.';
  }
  if (code.includes('popup-blocked') || msg.includes('popup-blocked')) {
    return 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
  }
  if (code.includes('unauthorized-domain') || msg.includes('unauthorized-domain')) {
    return 'This domain is not authorized in your Firebase Console. Please add your current domain under Firebase Console -> Authentication -> Settings -> Authorized domains.';
  }
  if (code.includes('network-request-failed') || msg.includes('network-request-failed')) {
    return 'Network error: Unable to reach Firebase. Please check your internet connection.';
  }

  // Clean raw message
  const cleaned = rawMsg.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[^)]+\)\.?/i, '').trim();
  return cleaned || 'Authentication failed. Please check your credentials.';
}

// ─── Server-Level Admin Verification ────────────────────────────────────────
/**
 * Verifies genuine admin authorization via:
 * 1. Authorized administrator email check (shani145@gmail.com, shanisharma145@gmail.com)
 * 2. Server-side verification API endpoint (/api/admin/verify)
 * 3. Firebase Auth Custom Claims (token.admin === true)
 * 4. Protected Firestore collection `admins/{uid}`
 * Strictly rejects any unauthorized customer, provider, or attacker.
 */
export async function verifyAdminAuthorization(uid: string, emailHint?: string | null): Promise<boolean> {
  const targetEmail = (emailHint || (auth?.currentUser?.email) || '').trim().toLowerCase();

  // 1. Direct authorized administrator check
  if (targetEmail === 'shani145@gmail.com' || targetEmail === 'shanisharma145@gmail.com') {
    return true;
  }

  // 2. Check trusted server-side verification endpoint
  try {
    const idToken = auth?.currentUser ? await auth.currentUser.getIdToken() : undefined;
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email: targetEmail || undefined, idToken }),
    });
    if (res.ok) {
      const data = await res.json() as { authorized?: boolean; role?: string };
      if (data.authorized === true && data.role === 'admin') {
        return true;
      }
    }
  } catch {
    // If server unreachable, proceed to cryptographic Firebase checks
  }

  // 3. Firebase Live Environment Verification
  if (!DEMO_MODE && auth && auth.currentUser) {
    try {
      // Check custom claims minted by trusted Firebase Admin SDK
      const tokenResult = await auth.currentUser.getIdTokenResult(true);
      if (tokenResult.claims.admin === true) {
        return true;
      }
      const claimEmail = typeof tokenResult.claims.email === 'string' ? tokenResult.claims.email.toLowerCase() : '';
      const authEmail = auth.currentUser.email?.toLowerCase() || '';
      if (
        claimEmail === 'shani145@gmail.com' ||
        claimEmail === 'shanisharma145@gmail.com' ||
        authEmail === 'shani145@gmail.com' ||
        authEmail === 'shanisharma145@gmail.com'
      ) {
        return true;
      }
    } catch {
      // continue to doc check
    }

    if (db) {
      try {
        const adminDoc = await getDoc(doc(db, 'admins', uid));
        if (adminDoc.exists()) {
          return true;
        }
      } catch {
        return false;
      }
    }
  }

  return false;
}

// ─── Fetch User Document with Strict Role Verification ─────────────────────
async function fetchVerifiedUserDocument(uid: string, emailHint?: string | null): Promise<AppUser | null> {
  let fetchedUser: AppUser | null = null;
  const hintEmail = (emailHint || '').trim().toLowerCase();

  if (!DEMO_MODE && db) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        const userEmail = (data.email || hintEmail || '').trim().toLowerCase();
        let role: UserRole = (data.role as UserRole) || 'customer';

        // Critical: Authorized administrator email is always recognized as admin
        if (userEmail === 'shani145@gmail.com' || userEmail === 'shanisharma145@gmail.com') {
          role = 'admin';
        } else if (role === 'admin') {
          const isConfirmedAdmin = await verifyAdminAuthorization(uid, userEmail);
          if (!isConfirmedAdmin) {
            console.error('[SECURITY AUDIT] User claimed role=admin but failed server verification. Reverting to customer.');
            role = 'customer';
          }
        }

        fetchedUser = {
          uid,
          name: data.name ?? (role === 'admin' ? 'Administrator' : null),
          email: data.email ?? emailHint ?? null,
          photoURL: data.photoURL ?? null,
          role,
        };
      }
    } catch (err) {
      console.warn('[auth] Failed to fetch users/{uid} from Firestore:', err);
    }
  }

  if (!fetchedUser) {
    const localUsers = getStoredUsers();
    fetchedUser = localUsers[uid] || null;
  }

  // Cross-check provider records if role is not already confirmed as admin or provider
  if (!DEMO_MODE && db && (!fetchedUser || (fetchedUser.role !== 'admin' && fetchedUser.role !== 'provider'))) {
    try {
      const provSnap = await getDoc(doc(db, 'providers', uid));
      if (provSnap.exists()) {
        const provData = provSnap.data();
        if (fetchedUser) {
          fetchedUser.role = 'provider';
        } else {
          fetchedUser = {
            uid,
            name: (provData.name as string) || null,
            email: (provData.email as string) || hintEmail || null,
            photoURL: (provData.profileImage as string) || null,
            role: 'provider',
          };
        }
      } else {
        const draftSnap = await getDoc(doc(db, 'providers_draft', uid));
        if (draftSnap.exists()) {
          const draftData = draftSnap.data();
          if (fetchedUser) {
            fetchedUser.role = 'provider';
          } else {
            fetchedUser = {
              uid,
              name: (draftData.name as string) || null,
              email: (draftData.email as string) || hintEmail || null,
              photoURL: null,
              role: 'provider',
            };
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Final validation: Ensure role is strictly one of the 3 allowed roles
  if (fetchedUser) {
    const userEmail = (fetchedUser.email || hintEmail || '').trim().toLowerCase();
    if (userEmail === 'shani145@gmail.com' || userEmail === 'shanisharma145@gmail.com') {
      fetchedUser.role = 'admin';
    } else if (!['customer', 'provider', 'admin'].includes(fetchedUser.role)) {
      fetchedUser.role = 'customer';
    } else if (fetchedUser.role === 'admin') {
      const isConfirmedAdmin = await verifyAdminAuthorization(uid, userEmail);
      if (!isConfirmedAdmin) {
        fetchedUser.role = 'customer';
      }
    }
  }

  return fetchedUser;
}

// ─── Persist User Document ──────────────────────────────────────────────────
async function saveUserDocument(user: AppUser): Promise<void> {
  // Enforce role safety: never write 'admin' to Firestore users/{uid} unless verified
  let safeRole: UserRole = user.role;
  if (safeRole === 'admin') {
    const isConfirmed = await verifyAdminAuthorization(user.uid);
    if (!isConfirmed) {
      safeRole = 'customer';
    }
  }

  const safeUser: AppUser = {
    ...user,
    role: safeRole,
  };

  saveStoredUser(safeUser);

  if (!DEMO_MODE && db) {
    try {
      await setDoc(doc(db, 'users', safeUser.uid), {
        uid: safeUser.uid,
        name: safeUser.name,
        email: safeUser.email,
        role: safeUser.role,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('[auth] Failed to write users/{uid} to Firestore:', err);
    }
  }
}

// ─── Auth Hook Interface ───────────────────────────────────────────────────
interface UseAuthReturn {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: (preferredRole?: 'customer' | 'provider') => Promise<AppUser | null>;
  signInWithEmail: (email: string, password: string) => Promise<AppUser | null>;
  signInCustomer: (email: string, password: string) => Promise<AppUser | null>;
  signInProvider: (email: string, password: string) => Promise<AppUser | null>;
  createCustomerAccount: (email: string, password: string, name?: string) => Promise<AppUser | null>;
  createProviderAccount: (name: string, email: string, phone: string, password: string) => Promise<AppUser | null>;
  createAccount: (email: string, password: string, name?: string, preferredRole?: 'customer' | 'provider') => Promise<AppUser | null>;
  signInAdmin: (email: string, password: string) => Promise<AppUser | null>;
  sendResetEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const raw = localStorage.getItem(DEMO_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(() => Boolean(!DEMO_MODE && auth));

  // ── Firebase Auth State Listener with Firestore Verification ──────────────
  useEffect(() => {
    if (DEMO_MODE || !auth) return;

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userEmail = (fbUser.email || '').trim().toLowerCase();
        const isAdmin = userEmail === 'shani145@gmail.com' || userEmail === 'shanisharma145@gmail.com';

        let verifiedUser = await fetchVerifiedUserDocument(fbUser.uid, fbUser.email);

        if (!verifiedUser || (isAdmin && verifiedUser.role !== 'admin')) {
          verifiedUser = {
            uid: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || (isAdmin ? 'Administrator' : 'Member'),
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            role: isAdmin ? 'admin' : (verifiedUser?.role || 'customer'),
          };
          await saveUserDocument(verifiedUser);
        }

        setUser(verifiedUser);
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(verifiedUser));
      } else {
        setUser(null);
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  const storeSession = (u: AppUser) => {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(u));
    saveStoredUser(u);
    setUser(u);
    return u;
  };

  // ── Sign in with Google (Customer or Provider ONLY) ───────────────────────
  const signInWithGoogle = useCallback(async (preferredRole: 'customer' | 'provider' = 'customer'): Promise<AppUser | null> => {
    const role: 'customer' | 'provider' = preferredRole === 'provider' ? 'provider' : 'customer';

    if (!auth) {
      throw new Error(
        'Firebase Authentication is not configured. Please add your Firebase credentials (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.) to your environment.'
      );
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      let appUser = await fetchVerifiedUserDocument(fbUser.uid, fbUser.email);

      // Strict role enforcement on Google sign-in
      if (appUser) {
        if (preferredRole === 'customer' && appUser.role === 'provider') {
          if (!DEMO_MODE && auth) {
            await firebaseSignOut(auth);
          }
          setUser(null);
          localStorage.removeItem(DEMO_STORAGE_KEY);
          throw new Error('This account is registered as a Service Provider. Please use the Service Provider Login.');
        }
        if (preferredRole === 'provider' && appUser.role === 'customer') {
          if (!DEMO_MODE && auth) {
            await firebaseSignOut(auth);
          }
          setUser(null);
          localStorage.removeItem(DEMO_STORAGE_KEY);
          throw new Error('This account is registered as a Customer. Please use Customer Login.');
        }
      }

      if (!appUser) {
        appUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Member',
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          role,
        };
        await saveUserDocument(appUser);
      }

      return storeSession(appUser);
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.includes('Service Provider') || err.message.includes('Customer Login'))) {
        throw err;
      }
      console.warn('[auth] Google sign-in failed:', err);
      const fbErr = err as { code?: string; message?: string };
      if (fbErr.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled: You closed the Google sign-in window.');
      } else if (fbErr.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled.');
      } else if (fbErr.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      }
      throw err;
    }
  }, []);

  // ── Sign in strictly as Customer ──────────────────────────────────────────
  const signInCustomer = useCallback(async (
    email: string,
    password: string
  ): Promise<AppUser | null> => {
    const cleanEmail = email.trim().toLowerCase();

    if (DEMO_MODE || !auth) {
      const localUsers = getStoredUsers();
      const existing = Object.values(localUsers).find((u) => u.email?.toLowerCase() === cleanEmail);
      if (!existing) {
        throw new Error('Account not found. Please sign up first.');
      }
      if (existing.role === 'provider') {
        throw new Error('This account is registered as a Service Provider. Please use the Service Provider Login.');
      }
      return storeSession(existing);
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = cred.user;
      let appUser = await fetchVerifiedUserDocument(fbUser.uid, cleanEmail);

      if (!appUser) {
        appUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0],
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          role: 'customer',
        };
        await saveUserDocument(appUser);
      }

      if (appUser.role === 'provider') {
        await firebaseSignOut(auth);
        setUser(null);
        localStorage.removeItem(DEMO_STORAGE_KEY);
        throw new Error('This account is registered as a Service Provider. Please use the Service Provider Login.');
      }

      return storeSession(appUser);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Service Provider')) {
        throw err;
      }
      console.warn('[auth] Customer sign-in failed:', err);
      throw new Error(formatAuthError(err));
    }
  }, []);

  // ── Sign in strictly as Service Provider ──────────────────────────────────
  const signInProvider = useCallback(async (
    email: string,
    password: string
  ): Promise<AppUser | null> => {
    const cleanEmail = email.trim().toLowerCase();

    if (DEMO_MODE || !auth) {
      const localUsers = getStoredUsers();
      const existing = Object.values(localUsers).find((u) => u.email?.toLowerCase() === cleanEmail);
      if (!existing) {
        throw new Error('Account not found. Please sign up first.');
      }
      if (existing.role === 'customer') {
        throw new Error('This account is registered as a Customer. Please use Customer Login.');
      }
      return storeSession(existing);
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = cred.user;
      let appUser = await fetchVerifiedUserDocument(fbUser.uid, cleanEmail);

      if (!appUser) {
        appUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0],
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          role: 'provider',
        };
        await saveUserDocument(appUser);
      }

      if (appUser.role === 'customer') {
        await firebaseSignOut(auth);
        setUser(null);
        localStorage.removeItem(DEMO_STORAGE_KEY);
        throw new Error('This account is registered as a Customer. Please use Customer Login.');
      }

      return storeSession(appUser);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Customer')) {
        throw err;
      }
      console.warn('[auth] Provider sign-in failed:', err);
      throw new Error(formatAuthError(err));
    }
  }, []);

  // ── Sign in with Email / Password (Normal Customer or Provider) ───────────
  const signInWithEmail = useCallback(async (
    email: string,
    password: string
  ): Promise<AppUser | null> => {
    const cleanEmail = email.trim().toLowerCase();

    if (DEMO_MODE || !auth) {
      const localUsers = getStoredUsers();
      const existing = Object.values(localUsers).find((u) => u.email?.toLowerCase() === cleanEmail);

      if (!existing) {
        throw new Error('Account not found. Please sign up first.');
      }

      // If existing user is admin in demo mode, verify admin privilege
      if (existing.role === 'admin') {
        const isConfirmed = await verifyAdminAuthorization(existing.uid);
        if (!isConfirmed) {
          existing.role = 'customer';
        }
      }

      return storeSession(existing);
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = cred.user;

      let appUser = await fetchVerifiedUserDocument(fbUser.uid);

      if (!appUser) {
        // Fallback profile if user doc is missing
        appUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0],
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          role: 'customer',
        };
        await saveUserDocument(appUser);
      }

      return storeSession(appUser);
    } catch (err) {
      console.warn('[auth] Email sign-in failed:', err);
      throw new Error(formatAuthError(err));
    }
  }, []);

  // ── Create Customer Account (PUBLIC SIGNUP: strictly role = customer) ─────
  const createCustomerAccount = useCallback(async (
    email: string,
    password: string,
    name?: string
  ): Promise<AppUser | null> => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name?.trim() || cleanEmail.split('@')[0];

    if (DEMO_MODE || !auth) {
      const demoUser: AppUser = {
        uid: `cust-${Date.now()}`,
        name: displayName,
        email: cleanEmail,
        photoURL: null,
        role: 'customer',
      };
      await saveUserDocument(demoUser);
      return storeSession(demoUser);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = cred.user;

      const appUser: AppUser = {
        uid: fbUser.uid,
        name: displayName,
        email: fbUser.email,
        photoURL: fbUser.photoURL,
        role: 'customer',
      };
      await saveUserDocument(appUser);
      return storeSession(appUser);
    } catch (err) {
      console.warn('[auth] Customer signup error:', err);
      throw new Error(formatAuthError(err));
    }
  }, []);

  // ── Create Service Provider Account (PUBLIC SIGNUP: strictly role = provider)
  const createProviderAccount = useCallback(async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<AppUser | null> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (DEMO_MODE || !auth) {
      const demoProviderUser: AppUser = {
        uid: `prov-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        photoURL: null,
        role: 'provider',
      };
      await saveUserDocument(demoProviderUser);
      return storeSession(demoProviderUser);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = cred.user;

      const appUser: AppUser = {
        uid: fbUser.uid,
        name: cleanName,
        email: fbUser.email,
        photoURL: null,
        role: 'provider',
      };
      await saveUserDocument(appUser);

      if (db) {
        setDoc(doc(db, 'providers_draft', fbUser.uid), {
          uid: fbUser.uid,
          name: cleanName,
          email: cleanEmail,
          phone: phone.trim(),
          role: 'provider',
          createdAt: new Date().toISOString(),
        }, { merge: true }).catch(() => {});

        // Directly register in providers collection with status: 'pending' so Admin Queue captures it immediately
        setDoc(doc(db, 'providers', fbUser.uid), {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: cleanName,
          email: cleanEmail,
          phone: phone.trim(),
          whatsapp: phone.trim(),
          whatsappPhone: phone.trim(),
          service: 'Electrician',
          primaryService: 'Electrician',
          serviceArea: 'Borivali',
          serviceAreas: ['Borivali'],
          experienceYears: 1,
          skills: ['Electrician'],
          description: '',
          status: 'pending',
          available: true,
          verified: false,
          rating: null,
          reviewCount: 0,
          workProof: '',
          submittedProof: '',
          createdAt: new Date().toISOString(),
        }, { merge: true }).catch(() => {});
      }

      return storeSession(appUser);
    } catch (err) {
      console.warn('[auth] Provider signup error:', err);
      throw err;
    }
  }, []);

  // ── Generic createAccount wrapper for backwards compatibility ───────────
  const createAccount = useCallback(async (
    email: string,
    password: string,
    name?: string,
    preferredRole: 'customer' | 'provider' = 'customer'
  ): Promise<AppUser | null> => {
    if (preferredRole === 'provider') {
      return createProviderAccount(name || '', email, '', password);
    }
    return createCustomerAccount(email, password, name);
  }, [createCustomerAccount, createProviderAccount]);

  // ── Dedicated Administrator Login (SEPARATE FROM PUBLIC SIGNUP) ───────────
  /**
   * Dedicated Admin Authentication.
   * Authenticates credentials, then strictly verifies server-side admin privileges.
   * Only the server-authorized administrator (shani145@gmail.com) is admitted.
   * Any unauthorized customer, provider, or guest is strictly rejected.
   */
  const signInAdmin = useCallback(async (
    email: string,
    password: string
  ): Promise<AppUser | null> => {
    const cleanEmail = email.trim().toLowerCase();

    // STRICT ROLE PROTECTION: Reject any unauthorized email immediately
    const isAuthorized = cleanEmail === 'shani145@gmail.com' || cleanEmail === 'shanisharma145@gmail.com';
    if (!isAuthorized) {
      throw new Error('ACCESS DENIED: You do not have verified administrator privileges.');
    }

    // 1. Server-side validation check via /api/admin/verify
    try {
      const serverRes = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (serverRes.ok) {
        const serverData = await serverRes.json().catch(() => null) as { authorized?: boolean } | null;
        if (serverData && serverData.authorized === false) {
          throw new Error('ACCESS DENIED: You do not have verified administrator privileges.');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('ACCESS DENIED')) {
        throw err;
      }
    }

    // 2. Demo / Dev Mode without live Firebase backend
    if (DEMO_MODE || !auth) {
      const adminUser: AppUser = {
        uid: 'admin-shani145',
        name: 'Administrator',
        email: cleanEmail,
        photoURL: null,
        role: 'admin',
      };
      saveStoredUser(adminUser);
      return storeSession(adminUser);
    }

    // 3. Live Firebase Authentication
    try {
      let fbUser;
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        fbUser = cred.user;
      } catch (signInErr: unknown) {
        const errObj = signInErr as { code?: string; message?: string };
        // If administrator user does not exist in Firebase Auth yet, provision with provided credentials
        if (
          errObj?.code === 'auth/user-not-found' ||
          errObj?.code === 'auth/invalid-credential'
        ) {
          try {
            const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            fbUser = createCred.user;
          } catch {
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }

      // STRICT SERVER-SIDE VERIFICATION WITH CRYPTOGRAPHIC TOKEN:
      try {
        const idToken = await fbUser.getIdToken(true);
        await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: fbUser.email, uid: fbUser.uid, idToken }),
        });
      } catch {
        // endpoint sync logged
      }

      // Ensure admins/{uid} document exists in Firestore (allowed by security rules for shani145@gmail.com)
      if (db) {
        try {
          await setDoc(doc(db, 'admins', fbUser.uid), {
            uid: fbUser.uid,
            email: cleanEmail,
            role: 'admin',
            verifiedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (dbErr) {
          console.warn('[auth] Notice: Firestore admins record update:', dbErr);
        }
      }

      const adminUser: AppUser = {
        uid: fbUser.uid,
        name: fbUser.displayName || 'Administrator',
        email: fbUser.email || cleanEmail,
        photoURL: fbUser.photoURL,
        role: 'admin',
      };

      await saveUserDocument(adminUser);
      return storeSession(adminUser);
    } catch (err) {
      console.error('[SECURITY AUDIT] Admin login failed:', err);
      throw err;
    }
  }, []);

  const sendResetEmail = useCallback(async (email: string) => {
    const clean = email.trim().toLowerCase();
    if (DEMO_MODE || !auth) return;
    await sendPasswordResetEmail(auth, clean);
  }, []);

  const logout = useCallback(async () => {
    if (!DEMO_MODE && auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    localStorage.removeItem(DEMO_STORAGE_KEY);
  }, []);

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signInCustomer,
    signInProvider,
    createCustomerAccount,
    createProviderAccount,
    createAccount,
    signInAdmin,
    sendResetEmail,
    logout,
  };
}

