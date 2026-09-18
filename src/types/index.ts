import type { ServiceCategory } from '../constants/services';
import type { MumbaiLocation } from '../constants/locations';

export type { ServiceCategory, MumbaiLocation };

// ─── Provider ───────────────────────────────────────────────────────────────

export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Provider {
  id: string;
  uid?: string;
  name: string;
  businessName?: string;
  email?: string;
  service: ServiceCategory;
  primaryService?: ServiceCategory;
  phone: string;
  whatsapp: string;
  whatsappPhone?: string;
  profileImage?: string;
  photoURL?: string;
  serviceArea: string;        // Primary Mumbai Western Line location
  serviceAreas?: string[];    // Multiple Mumbai Western Line locations
  experienceYears: number;
  description: string;
  skills: string[];
  rating: number | null;      // null if no reviews yet
  reviewCount: number;        // 0 if no reviews yet
  verified: boolean;          // True only if admin reviewed & verified
  adminVerified?: boolean;     // Explicit admin reviewed flag
  phoneVerified?: boolean;    // True if phone number OTP verified
  workProof?: string;         // Submitted work/service proof document, link, or trade license
  submittedProof?: string;    // Alias for submitted proof
  status: ProviderStatus;     // Only 'approved' appears publicly
  available?: boolean;        // True if provider is currently available to accept service enquiries
  createdAt: string;
  updatedAt?: string;
  verifiedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  profileViews?: number;
  callClicks?: number;
  whatsappClicks?: number;
  pricingInfo?: string;
  workingHours?: string;
  editPending?: boolean;
  pendingUpdates?: ProviderPendingUpdates;
  editRejectedAt?: string;
  editRejectionReason?: string;
  lastEditedApprovedAt?: string;
  lastEditedApprovedBy?: string;
}

export interface ProviderPendingUpdates {
  name?: string;
  service?: ServiceCategory;
  primaryService?: ServiceCategory;
  skills?: string[];
  serviceArea?: string;
  serviceAreas?: string[];
  experienceYears?: number;
  description?: string;
  workProof?: string;
  submittedProof?: string;
  phone?: string;
  whatsapp?: string;
  whatsappPhone?: string;
  profileImage?: string;
  requestedAt: string;
}


// ─── Review ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  providerId: string;
  userId: string;
  userName: string;
  rating: number; // 1–5
  comment: string;
  createdAt: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'provider' | 'admin';

export interface AppUser {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
  phone?: string;
  status?: string;
  createdAt?: string;
}

// ─── Gemini / AI ─────────────────────────────────────────────────────────────

export type Urgency = 'low' | 'medium' | 'high';

export interface ClassifyResponse {
  serviceCategory: ServiceCategory;
  confidence: number;
  urgency: Urgency;
  problemSummary: string;
  likelyCause?: string;
  suggestedSolution?: string;
  error?: boolean;
}

export interface ContactActionPayload {
  type: 'call' | 'whatsapp' | 'review';
  providerName: string;
  phone: string;
  whatsappUrl: string;
}

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  user: AppUser | null;
  authLoading: boolean;
  selectedArea: string;          // Selected Mumbai Western Line location
  problemText: string;
  detectedService: ServiceCategory | null;
  classifyResult: ClassifyResponse | null;
  urgency: Urgency | null;
  providers: Provider[];
  providersLoading: boolean;
  currentView: DashboardView;
  publicView: PublicView;
  isEmergency: boolean;
  toasts: Toast[];
  pendingContactAction: ContactActionPayload | null;
  contactModalOpen: boolean;
}

export type DashboardView =
  | 'finder'
  | 'directory'
  | 'onboarding'
  | 'admin'
  | 'profile'
  | 'settings';

export type PublicView =
  | 'home'
  | 'services'
  | 'providers'
  | 'about'
  | 'contact'
  | 'terms'
  | 'privacy'
  | 'provider'
  | 'admin'
  | 'customer_home'
  | 'admin_login';

// ─── Toast ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// ─── Onboarding Form ─────────────────────────────────────────────────────────

export interface OnboardingForm {
  name: string;
  businessName: string;
  service: ServiceCategory;
  phone: string;
  whatsapp: string;
  serviceArea: string;
  experienceYears: number;
  skills: string;
  description: string;
}

// ─── Callback & Support Requests ───────────────────────────────────────────

export type CallbackRequestStatus = 'pending' | 'in_progress' | 'resolved' | 'cancelled';

export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  area: string;
  service: string;
  role: 'provider' | 'customer';
  inquiryTopic?: string;
  message?: string;
  status: CallbackRequestStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
  userId?: string;
}
