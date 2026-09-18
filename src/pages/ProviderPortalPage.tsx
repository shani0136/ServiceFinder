import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/appState';
import { useAuth } from '../lib/auth';
import {
  registerProvider,
  getProviderByUid,
  updateProviderProfile,
  submitProviderProfileEdit,
  setProviderAvailability,
} from '../lib/directoryService';
import { SERVICE_NAMES, TRADE_SKILL_SUGGESTIONS, type ServiceCategory } from '../constants/services';
import { MUMBAI_LOCATIONS } from '../constants/locations';
import { ProviderDetailsModal } from '../components/ui/ProviderDetailsModal';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import type { Provider, PublicView } from '../types';
import styles from './ProviderPortalPage.module.css';

interface ProviderPortalPageProps {
  onNavigate: (view: PublicView) => void;
  onSignInCustomer: () => void;
}

type PortalMode = 'landing' | 'signup' | 'login' | 'forgot_password' | 'create_profile' | 'dashboard' | 'edit_profile';

export const ProviderPortalPage: React.FC<ProviderPortalPageProps> = ({
  onNavigate,
  onSignInCustomer,
}) => {
  const { addToast } = useApp();
  const {
    user: authUser,
    signInProvider,
    createProviderAccount,
    sendResetEmail,
    logout,
  } = useAuth();

  const [mode, setMode] = useState<PortalMode>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('login')) return 'login';
      if (hash.includes('signup') || hash.includes('register')) return 'signup';
    }
    return 'landing';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('login')) {
        setMode('login');
      } else if (hash.includes('signup') || hash.includes('register')) {
        setMode('signup');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  const [providerProfile, setProviderProfile] = useState<Provider | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [previewProvider, setPreviewProvider] = useState<Provider | null>(null);

  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [primaryService, setPrimaryService] = useState<ServiceCategory>('Electrician');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Borivali', 'Kandivali']);
  const [phone, setPhone] = useState('');
  const [workProof, setWorkProof] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [description, setDescription] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Hidden file input refs for Camera and Gallery
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoPickerModal, setShowPhotoPickerModal] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, JPEG, PNG, or WEBP).', 'warning');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      addToast('Image size exceeds 8MB. Please select a smaller photo.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setProfilePhoto(compressedDataUrl);
          addToast('Profile photo selected! ✓', 'success');
        } else {
          setProfilePhoto(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Load existing provider profile if user is logged in
  useEffect(() => {
    let isMounted = true;
    if (authUser && authUser.role === 'customer') {
      addToast('The Provider Portal is for service professionals only.', 'info');
      onNavigate('customer_home');
      return;
    }

    if (authUser && authUser.role === 'provider') {
      Promise.resolve().then(() => {
        if (isMounted) setLoadingProfile(true);
      });
      getProviderByUid(authUser.uid)
        .then((profile) => {
          if (isMounted) {
            setProviderProfile(profile);
            if (profile) {
              setMode('dashboard');
              // Prefill edit fields
              setFullName(profile.name);
              setProfilePhoto(profile.profileImage || '');
              setPrimaryService(profile.service);
              setSelectedSkills(profile.skills || []);
              setExperienceYears(String(profile.experienceYears || 3));
              setSelectedAreas(profile.serviceAreas || [profile.serviceArea]);
              setPhone(profile.phone);
              setWorkProof(profile.workProof || profile.submittedProof || '');
              setWhatsapp(profile.whatsapp);
              setDescription(profile.description);
            } else {
              // Authenticated provider with no profile yet -> go to profile creation
              setMode('create_profile');
              setFullName(authUser.name || '');
              setPhone((prev) => prev || authPhone || '');
            }
          }
        })
        .finally(() => {
          if (isMounted) setLoadingProfile(false);
        });
    } else if (!authUser) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setMode((current) => {
            if (['dashboard', 'create_profile', 'edit_profile'].includes(current)) {
              const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
              if (hash.includes('login')) return 'login';
              if (hash.includes('signup') || hash.includes('register')) return 'signup';
              return 'landing';
            }
            return current;
          });
        }
      });
    }
    return () => { isMounted = false; };
  }, [authUser, authPhone]);

  // Update default skill suggestions when primary service changes
  const handleServiceChange = (service: ServiceCategory) => {
    setPrimaryService(service);
    const defaults = TRADE_SKILL_SUGGESTIONS[service] || [];
    setSelectedSkills(defaults.slice(0, 3));
  };

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customSkill.trim();
    if (clean && !selectedSkills.includes(clean)) {
      setSelectedSkills((prev) => [...prev, clean]);
      setCustomSkill('');
    }
  };

  const handleToggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSelectAllAreas = () => {
    if (selectedAreas.length === MUMBAI_LOCATIONS.length) {
      setSelectedAreas(['Borivali']);
    } else {
      setSelectedAreas([...MUMBAI_LOCATIONS]);
    }
  };

  // Auth Handlers
  const handleProviderSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim() || !authEmail.trim() || !authPhone.trim() || !authPassword) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      const newUser = await createProviderAccount(authName, authEmail, authPhone, authPassword);
      if (newUser) {
        setFullName(authName.trim());
        setPhone(authPhone.trim());
        setWhatsapp(authPhone.trim());
        addToast('Provider account created! Please complete your profile.', 'success');
        setMode('create_profile');
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Signup failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const handleToggleAvailability = async () => {
    if (!providerProfile) return;
    const current = providerProfile.available !== false;
    const next = !current;
    setTogglingAvailability(true);
    try {
      await setProviderAvailability(providerProfile.id, next);
      setProviderProfile((prev) => (prev ? { ...prev, available: next } : null));
      addToast(
        next
          ? 'Available for Service turned ON. You can receive enquiries! ✓'
          : 'Available for Service turned OFF. Your listing is paused from customer searches.',
        'info'
      );
    } catch {
      addToast('Failed to update availability status. Please try again.', 'error');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleProviderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      const logged = await signInProvider(authEmail, authPassword);
      if (logged) {
        addToast(`Welcome back, ${logged.name || 'Provider'}!`, 'success');
        const profile = await getProviderByUid(logged.uid);
        if (profile) {
          setProviderProfile(profile);
          setMode('dashboard');
        } else {
          setMode('create_profile');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Customer Login')) {
        setAuthError(err.message);
      } else {
        setAuthError(err instanceof Error ? err.message : 'Login failed. Please check credentials.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      setAuthError('Please enter your registered email address.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      await sendResetEmail(authEmail.trim());
      addToast('Password reset link sent to your email!', 'success');
      setMode('login');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Failed to send reset link.');
    } finally {
      setAuthLoading(false);
    }
  };

    // Profile Submission Handler (Initial Creation or Edit)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || selectedAreas.length === 0) {
      addToast('Please provide your name, phone number, and at least one Mumbai service area.', 'warning');
      return;
    }

    const finalWhatsapp = sameAsPhone ? phone.trim() : (whatsapp.trim() || phone.trim());
    const primaryArea = selectedAreas[0] || 'Borivali';
    const skillsList = selectedSkills.length > 0 ? selectedSkills : [primaryService];
    const defaultDesc = `${primaryService} professional providing reliable local repair services across ${selectedAreas.slice(0, 3).join(', ')}, Mumbai.`;

    setProfileSaving(true);
    try {
      if (providerProfile && mode === 'edit_profile') {
        if (providerProfile.status === 'approved') {
          // Approved provider editing profile: stage changes for Admin confirmation!
          const pendingData = {
            name: fullName.trim(),
            service: primaryService,
            primaryService,
            phone: phone.trim(),
            workProof: workProof.trim(),
            submittedProof: workProof.trim(),
            whatsapp: finalWhatsapp,
            whatsappPhone: finalWhatsapp,
            profileImage: profilePhoto.trim() || undefined,
            serviceArea: primaryArea,
            serviceAreas: selectedAreas,
            experienceYears: Math.max(0, Number(experienceYears) || 1),
            description: description.trim() || defaultDesc,
            skills: skillsList,
          };
          await submitProviderProfileEdit(providerProfile.id, pendingData);
          setProviderProfile((prev) =>
            prev
              ? {
                  ...prev,
                  editPending: true,
                  pendingUpdates: {
                    ...pendingData,
                    requestedAt: new Date().toISOString(),
                  },
                }
              : null
          );
          addToast(
            'Profile updates submitted to Admin for approval! Your live listing remains active until verified.',
            'success'
          );
          setMode('dashboard');
        } else {
          // Updating pending or draft application
          const updates: Partial<Provider> = {
            name: fullName.trim(),
            service: primaryService,
            primaryService,
            phone: phone.trim(),
            phoneVerified: true,
            workProof: workProof.trim(),
            submittedProof: workProof.trim(),
            whatsapp: finalWhatsapp,
            whatsappPhone: finalWhatsapp,
            profileImage: profilePhoto.trim() || undefined,
            serviceArea: primaryArea,
            serviceAreas: selectedAreas,
            experienceYears: Math.max(0, Number(experienceYears) || 1),
            description: description.trim() || defaultDesc,
            skills: skillsList,
          };
          await updateProviderProfile(providerProfile.id, updates);
          setProviderProfile((prev) => (prev ? { ...prev, ...updates } : null));
          addToast('Application details updated successfully!', 'success');
          setMode('dashboard');
        }
      } else {
        // Creating new profile (strictly status: pending)
        const newProvider = await registerProvider({
          uid: authUser?.uid,
          email: authUser?.email || authEmail || undefined,
          name: fullName.trim(),
          service: primaryService,
          primaryService,
          phone: phone.trim(),
          phoneVerified: true,
          workProof: workProof.trim(),
          submittedProof: workProof.trim(),
          whatsapp: finalWhatsapp,
          whatsappPhone: finalWhatsapp,
          profileImage: profilePhoto.trim() || undefined,
          serviceArea: primaryArea,
          serviceAreas: selectedAreas,
          experienceYears: Math.max(0, Number(experienceYears) || 1),
          description: description.trim() || defaultDesc,
          skills: skillsList,
        });

        setProviderProfile(newProvider);
        addToast('Profile submitted for review. Provider status: pending.', 'success');
        setMode('dashboard');
      }
    } catch {
      addToast('Failed to save profile. Please check your connection.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogoutProvider = async () => {
    await logout();
    setProviderProfile(null);
    setMode('landing');
    addToast('Signed out of provider account', 'info');
  };

  const handleProviderNav = (tab: 'profile' | 'edit' | 'service' | 'areas' | 'status') => {
    if (tab === 'edit') {
      setMode('edit_profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setMode('dashboard');
      setTimeout(() => {
        let el: HTMLElement | null = null;
        if (tab === 'profile') el = document.getElementById('profile-overview');
        else if (tab === 'service') el = document.getElementById('provider-service-section');
        else if (tab === 'areas') el = document.getElementById('provider-areas-section');
        else if (tab === 'status') el = document.getElementById('provider-status-section');

        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  useEffect(() => {
    const handleCustomNav = (e: Event) => {
      const custom = e as CustomEvent<{ tab: 'profile' | 'edit' | 'service' | 'areas' | 'status' }>;
      if (custom.detail?.tab) {
        handleProviderNav(custom.detail.tab);
      }
    };
    window.addEventListener('sf_provider_portal_nav', handleCustomNav);
    return () => {
      window.removeEventListener('sf_provider_portal_nav', handleCustomNav);
    };
  }, []);

  return (
    <>
      <Navbar
        currentView="provider"
        onNavigate={onNavigate}
        onSignIn={onSignInCustomer}
        onRegister={() => setMode('signup')}
        onProviderNav={handleProviderNav}
        providerActiveTab={mode === 'edit_profile' ? 'edit' : 'profile'}
      />

      <main className={styles.container}>
        {/* Top bar: strictly provider portal for authenticated providers */}
        {authUser && authUser.role === 'provider' ? (
          <div className={styles.topNav} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                ServiceFinder Pro • Provider Workspace
              </span>
            </div>
            <button
              type="button"
              className={styles.backBtn}
              onClick={handleLogoutProvider}
            >
              Sign Out ({authUser.name || 'Provider'}) 🚪
            </button>
          </div>
        ) : (
          <div className={styles.topNav}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => onNavigate('home')}
            >
              ← Return to ServiceFinder
            </button>
          </div>
        )}

        {/* ─── 1. LANDING VIEW ─── */}
        {mode === 'landing' && (
          <>
            <section className={styles.hero}>
              <span className={styles.heroBadge}>⚡ ServiceFinder for Professionals</span>
              <h1 className={styles.heroTitle}>
                Grow your local service business with{' '}
                <span className={styles.heroTitleHighlight}>ServiceFinder.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Create your professional profile and let nearby customers discover and contact you directly across Mumbai’s Western Line corridor.
              </p>

              <div className={styles.heroActions}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => setMode('signup')}
                >
                  Join as a Service Provider
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setMode('login')}
                >
                  Provider Login
                </button>
              </div>
            </section>

            {/* 5 Core Benefits */}
            <section className={styles.benefitsSection}>
              <h2 className={styles.benefitsTitle}>Why Independent Tradespeople Choose ServiceFinder</h2>
              <div className={styles.benefitsGrid}>
                <div className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>📍</div>
                  <h3 className={styles.benefitHeading}>Get Discovered Locally</h3>
                  <p className={styles.benefitDesc}>
                    Appear in search results when residents in your chosen Mumbai stations (from Churchgate to Dahisar) search for your trade.
                  </p>
                </div>

                <div className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>⭐</div>
                  <h3 className={styles.benefitHeading}>Showcase Skills & Areas</h3>
                  <p className={styles.benefitDesc}>
                    List your exact specialties (e.g. pipe leaks, switch repair) and all stations where you are willing to travel.
                  </p>
                </div>

                <div className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>📞</div>
                  <h3 className={styles.benefitHeading}>Direct Calls & WhatsApp</h3>
                  <p className={styles.benefitDesc}>
                    Clients contact your phone directly with pre-filled details. No middlemen, no call centers, no app barriers.
                  </p>
                </div>

                <div className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>🗓️</div>
                  <h3 className={styles.benefitHeading}>No Complicated Booking</h3>
                  <p className={styles.benefitDesc}>
                    You decide your own availability, prices, and schedule directly with the customer. No forced orders or penalties.
                  </p>
                </div>

                <div className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>₹0</div>
                  <h3 className={styles.benefitHeading}>Zero Platform Commission</h3>
                  <p className={styles.benefitDesc}>
                    Keep 100% of your earnings. ServiceFinder does not take cuts or charge commission on your hard-earned work.
                  </p>
                </div>
              </div>
            </section>

            {/* How It Works for Providers */}
            <section className={styles.stepsSection}>
              <h2 className={styles.stepsTitle}>How It Works for Service Providers</h2>
              <div className={styles.stepsGrid}>
                <div className={styles.stepCard}>
                  <div className={styles.stepNum}>1</div>
                  <h3 className={styles.stepCardTitle}>Quick Sign Up</h3>
                  <p className={styles.stepCardDesc}>
                    Register with your name, phone number, and primary trade.
                  </p>
                </div>

                <div className={styles.stepCard}>
                  <div className={styles.stepNum}>2</div>
                  <h3 className={styles.stepCardTitle}>Build Your Profile</h3>
                  <p className={styles.stepCardDesc}>
                    Select your skills, Mumbai service areas, and years of experience.
                  </p>
                </div>

                <div className={styles.stepCard}>
                  <div className={styles.stepNum}>3</div>
                  <h3 className={styles.stepCardTitle}>Admin Review</h3>
                  <p className={styles.stepCardDesc}>
                    Credentials are human-reviewed to prevent directory spam.
                  </p>
                </div>

                <div className={styles.stepCard}>
                  <div className={styles.stepNum}>4</div>
                  <h3 className={styles.stepCardTitle}>Receive Enquiries</h3>
                  <p className={styles.stepCardDesc}>
                    Get direct calls and WhatsApp messages from local residents.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ─── 2. SIGNUP VIEW ─── */}
        {mode === 'signup' && (
          <div className={styles.authContainer}>
            <div className={styles.authHeader}>
              <h2 className={styles.authHeaderTitle}>Join as a Service Provider</h2>
              <p className={styles.authHeaderSub}>
                Create your professional account to list your trade in Mumbai.
              </p>
            </div>

            {authError && <div className={styles.errorBanner}>{authError}</div>}

            <form onSubmit={handleProviderSignup}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Patil"
                  className={styles.formInput}
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className={styles.formInput}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9820012345"
                  className={styles.formInput}
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Create Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className={styles.formInput}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={styles.btnPrimary}
                style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
              >
                {authLoading ? 'Creating Account...' : 'Continue to Professional Profile →'}
              </button>
            </form>

            <div className={styles.authSwitchRow}>
              Already registered?{' '}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => { setAuthError(''); setMode('login'); }}
              >
                Log In
              </button>
            </div>
          </div>
        )}

        {/* ─── 3. LOGIN VIEW ─── */}
        {mode === 'login' && (
          <div className={styles.authContainer}>
            <div className={styles.authHeader}>
              <h2 className={styles.authHeaderTitle}>Provider Log In</h2>
              <p className={styles.authHeaderSub}>
                Manage your professional profile, skills, and Mumbai service areas.
              </p>
            </div>

            {authError && <div className={styles.errorBanner}>{authError}</div>}

            <form onSubmit={handleProviderLogin}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className={styles.formInput}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.formLabel}>Password</label>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    style={{ fontSize: '11px' }}
                    onClick={() => { setAuthError(''); setMode('forgot_password'); }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Your password"
                  className={styles.formInput}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={styles.btnPrimary}
                style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
              >
                {authLoading ? 'Signing In...' : 'Log In to Dashboard'}
              </button>
            </form>

            <div className={styles.authSwitchRow}>
              Don't have a provider profile yet?{' '}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => { setAuthError(''); setMode('signup'); }}
              >
                Join as a Service Provider
              </button>
            </div>
          </div>
        )}

        {/* ─── 4. FORGOT PASSWORD VIEW ─── */}
        {mode === 'forgot_password' && (
          <div className={styles.authContainer}>
            <div className={styles.authHeader}>
              <h2 className={styles.authHeaderTitle}>Reset Password</h2>
              <p className={styles.authHeaderSub}>
                Enter your registered email and we’ll send a password recovery link.
              </p>
            </div>

            {authError && <div className={styles.errorBanner}>{authError}</div>}

            <form onSubmit={handleForgotPassword}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className={styles.formInput}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={styles.btnPrimary}
                style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
              >
                {authLoading ? 'Sending Link...' : 'Send Recovery Email'}
              </button>
            </form>

            <div className={styles.authSwitchRow}>
              Remembered your password?{' '}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => { setAuthError(''); setMode('login'); }}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* ─── 5. PROFILE FORM (Create or Edit) ─── */}
        {(mode === 'create_profile' || mode === 'edit_profile') && (
          <div className={styles.dashboardCard} style={{ maxWidth: '780px', margin: '0 auto' }}>
            <div className={styles.authHeader}>
              <h2 className={styles.authHeaderTitle}>
                {mode === 'edit_profile' ? 'Edit Your Professional Profile' : 'Create Your Professional Profile'}
              </h2>
              <p className={styles.authHeaderSub}>
                Provide your accurate trade details so local residents across Mumbai can contact you directly.
              </p>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patil"
                    className={styles.formInput}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Years of Experience *</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    className={styles.formInput}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number (Calls & Inquiries) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9820012345"
                    className={styles.formInput}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                    Contact number for direct customer phone calls.
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>WhatsApp Number</label>
                  <input
                    type="tel"
                    disabled={sameAsPhone}
                    placeholder="e.g. 9820012345"
                    className={styles.formInput}
                    value={sameAsPhone ? phone : whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                  <label className={styles.formCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => setSameAsPhone(e.target.checked)}
                    />
                    Same as calling phone number
                  </label>
                </div>
              </div>

              {/* Primary Service Dropdown (Strict 14 Core Services) */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Primary Trade Service *</label>
                <select
                  className={styles.formSelect}
                  value={primaryService}
                  onChange={(e) => handleServiceChange(e.target.value as ServiceCategory)}
                >
                  {SERVICE_NAMES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginTop: '4px' }}>
                  Choose from ServiceFinder's 14 verified everyday trades.
                </span>
              </div>

              {/* Trade Skills Multi-select */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Skills & Specialties for {primaryService} ({selectedSkills.length} selected)
                </label>
                <div className={styles.chipsWrap}>
                  {(TRADE_SKILL_SUGGESTIONS[primaryService] || []).map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        className={[styles.chipBtn, isSelected ? styles.chipSelected : ''].join(' ')}
                        onClick={() => handleToggleSkill(skill)}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {skill}
                      </button>
                    );
                  })}
                  {selectedSkills
                    .filter((s) => !(TRADE_SKILL_SUGGESTIONS[primaryService] || []).includes(s))
                    .map((custom) => (
                      <button
                        key={custom}
                        type="button"
                        className={[styles.chipBtn, styles.chipSelected].join(' ')}
                        onClick={() => handleToggleSkill(custom)}
                      >
                        ✓ {custom} (custom)
                      </button>
                    ))}
                </div>

                {/* Custom Skill Adder */}
                <div className={styles.customSkillInputRow}>
                  <input
                    type="text"
                    placeholder="Add custom specialty (e.g. Geyser service)..."
                    className={styles.formInput}
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.btnSmallAdd}
                    onClick={handleAddCustomSkill}
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Service Areas (Mumbai Western Line Corridor) */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.formLabel}>
                    Mumbai Service Areas ({selectedAreas.length} selected) *
                  </label>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    style={{ fontSize: '11px' }}
                    onClick={handleSelectAllAreas}
                  >
                    {selectedAreas.length === MUMBAI_LOCATIONS.length ? 'Reset selection' : 'Select All 23 Stations'}
                  </button>
                </div>
                <div className={styles.chipsWrap}>
                  {MUMBAI_LOCATIONS.map((loc) => {
                    const isSelected = selectedAreas.includes(loc);
                    return (
                      <button
                        key={loc}
                        type="button"
                        className={[styles.chipBtn, isSelected ? styles.chipSelected : ''].join(' ')}
                        onClick={() => handleToggleArea(loc)}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {loc}
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginTop: '4px' }}>
                  You will appear in customer searches for any of your selected stations.
                </span>
              </div>

              {/* Short Professional Description */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Professional Description</label>
                <textarea
                  rows={3}
                  className={styles.formTextarea}
                  placeholder={`e.g. Dedicated ${primaryService} with ${experienceYears} years experience providing reliable residential service.`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Work / Service Proof (Requirement 1 & 2) */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Work / Service Proof (License, Certificate, Trade Registration, or Project Link)
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Maharashtra Trade License #MH-4921, GSTIN, or drive/portfolio link"
                  value={workProof}
                  onChange={(e) => setWorkProof(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                  Admin Review: ServiceFinder administrators manually check whether submitted information and available proof are reasonable and consistent before approving.
                </span>
              </div>

              {/* Profile Photo (Camera & Gallery Upload) */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>PROFILE PHOTO</label>

                {/* Hidden Native File Inputs */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageFileChange}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  style={{ display: 'none' }}
                  onChange={handleImageFileChange}
                />

                {!profilePhoto ? (
                  <div
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '16px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      onClick={() => setShowPhotoPickerModal(true)}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '30px',
                        border: '1px solid #bfdbfe',
                        cursor: 'pointer',
                      }}
                      title="Tap to upload profile photo"
                    >
                      📷
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setShowPhotoPickerModal(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '16px',
                          fontWeight: 800,
                          color: '#0f172a',
                          marginBottom: '4px',
                          cursor: 'pointer',
                          display: 'block',
                          margin: '0 auto',
                        }}
                      >
                        Upload Profile Photo
                      </button>
                      <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '280px', margin: '4px auto 0' }}>
                        Take a photo or choose one from your gallery
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#4f46e5',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 18px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                        }}
                      >
                        <span>📷</span> Camera
                      </button>

                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#ffffff',
                          color: '#334155',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '10px 18px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <span>🖼️</span> Gallery / Photos
                      </button>
                    </div>

                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Accepted formats: JPG, JPEG, PNG, WEBP
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    {/* PHOTO PREVIEW */}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={profilePhoto}
                        alt="Profile Preview"
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #4f46e5',
                          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.2)',
                          display: 'block',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          background: '#16a34a',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          border: '2px solid #ffffff',
                        }}
                        title="Photo ready"
                      >
                        ✓
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                      Profile photo ready for submission
                    </div>

                    {/* Change Photo actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setShowPhotoPickerModal(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#f1f5f9',
                          color: '#1e293b',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '8px 18px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <span>🔄</span> Change Photo
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfilePhoto('')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          color: '#dc2626',
                          border: 'none',
                          padding: '8px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Source Selection Modal (Camera vs Gallery) */}
                {showPhotoPickerModal && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(15, 23, 42, 0.65)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 9999,
                      padding: '16px',
                    }}
                    onClick={() => setShowPhotoPickerModal(false)}
                  >
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '20px',
                        padding: '24px',
                        maxWidth: '380px',
                        width: '100%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                        textAlign: 'center',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          margin: '0 auto 12px',
                        }}
                      >
                        📷
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                        Choose Profile Photo
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
                        Take a new photo with your camera or select an existing photo from your gallery.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPhotoPickerModal(false);
                            cameraInputRef.current?.click();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '13px',
                            borderRadius: '12px',
                            background: '#4f46e5',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '14px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>📷</span> Take Photo (Camera)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowPhotoPickerModal(false);
                            galleryInputRef.current?.click();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '13px',
                            borderRadius: '12px',
                            background: '#f8fafc',
                            color: '#1e293b',
                            fontWeight: 700,
                            fontSize: '14px',
                            border: '1.5px solid #cbd5e1',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>🖼️</span> Choose from Gallery / Photos
                        </button>

                        {profilePhoto && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfilePhoto('');
                              setShowPhotoPickerModal(false);
                            }}
                            style={{
                              padding: '11px',
                              borderRadius: '12px',
                              background: '#fef2f2',
                              color: '#dc2626',
                              fontWeight: 600,
                              fontSize: '13px',
                              border: '1px solid #fecaca',
                              cursor: 'pointer',
                              marginTop: '2px',
                            }}
                          >
                            Remove Photo
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowPhotoPickerModal(false)}
                          style={{
                            padding: '10px',
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginTop: '4px',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className={styles.btnPrimary}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {profileSaving ? 'Saving Profile...' : mode === 'edit_profile' ? 'Save Profile Changes' : 'Submit Profile for Review'}
                </button>
                {mode === 'edit_profile' && (
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setMode('dashboard')}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ─── Loading Profile State ─── */}
        {loadingProfile && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
            <p style={{ fontWeight: 600 }}>Loading your provider profile...</p>
          </div>
        )}

        {/* ─── 6. PROVIDER DASHBOARD VIEW ─── */}
        {!loadingProfile && mode === 'dashboard' && providerProfile && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
                  Your ServiceFinder Profile
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Manage your trade credentials, contact numbers, and Mumbai Western Line coverage.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogoutProvider}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                Sign Out 🚪
              </button>
            </div>

            {/* ─── Available for Service Toggle Card ─── */}
            <div
              id="provider-availability-section"
              style={{
                background: providerProfile.available !== false ? '#f0fdf4' : '#f8fafc',
                border: `2px solid ${providerProfile.available !== false ? '#86efac' : '#cbd5e1'}`,
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    Available for Service
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: providerProfile.available !== false ? '#dcfce7' : '#f1f5f9',
                      color: providerProfile.available !== false ? '#15803d' : '#64748b',
                      border: `1px solid ${providerProfile.available !== false ? '#bbf7d0' : '#e2e8f0'}`,
                    }}
                  >
                    {providerProfile.available !== false ? '🟢 AVAILABLE (ON)' : '⚪ PAUSED (OFF)'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  {providerProfile.available !== false ? (
                    <>
                      You are <strong>accepting service enquiries</strong>.
                      {providerProfile.status === 'approved'
                        ? ' Your profile is actively discoverable in Customer search across Mumbai Western Line.'
                        : ' Note: Once your application is approved by admin, customers will be able to discover and contact you.'}
                    </>
                  ) : (
                    <>
                      You are <strong>temporarily unavailable</strong>. Your listing is paused and will not appear in customer searches.
                      (Your profile, submitted proofs, ratings, and account remain safely preserved).
                    </>
                  )}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: providerProfile.available !== false ? '#166534' : '#64748b' }}>
                  {providerProfile.available !== false ? 'ACCEPTING JOBS' : 'PAUSED'}
                </span>
                <button
                  type="button"
                  onClick={handleToggleAvailability}
                  disabled={togglingAvailability}
                  style={{
                    position: 'relative',
                    width: '68px',
                    height: '36px',
                    borderRadius: '999px',
                    background: providerProfile.available !== false ? '#10b981' : '#94a3b8',
                    border: 'none',
                    cursor: togglingAvailability ? 'not-allowed' : 'pointer',
                    transition: 'background 0.25s ease',
                    padding: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                  }}
                  title={providerProfile.available !== false ? 'Click to mark Unavailable (OFF)' : 'Click to mark Available (ON)'}
                  aria-label="Toggle Available for Service"
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
                      transform: providerProfile.available !== false ? 'translateX(32px)' : 'translateX(0px)',
                      transition: 'transform 0.25s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 900,
                      color: providerProfile.available !== false ? '#10b981' : '#64748b',
                    }}
                  >
                    {providerProfile.available !== false ? 'ON' : 'OFF'}
                  </div>
                </button>
              </div>
            </div>

            {/* Status Banner */}
            <div id="provider-status-section" style={{ marginBottom: '20px' }}>
              {providerProfile.status === 'pending' && (
                <div className={styles.statusBannerPending} style={{ border: '2px solid #f59e0b', background: '#fffdf5', padding: '20px', borderRadius: '16px' }}>
                  <div className={styles.statusIcon} style={{ fontSize: '2rem' }}>⏳</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                      <h3 className={styles.statusHeading} style={{ margin: 0, fontSize: '17px', color: '#92400e' }}>
                        Your profile is pending Admin review.
                      </h3>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '999px', border: '1px solid #fde68a' }}>
                        AWAITING ADMIN REVIEW
                      </span>
                    </div>
                    <p className={styles.statusText} style={{ color: '#4b5563', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                      Your service listing for <strong>{providerProfile.service}</strong> in <strong>{providerProfile.serviceAreas?.join(', ') || providerProfile.serviceArea}</strong> has been submitted. Your profile is pending Admin review. Once an authorized ServiceFinder administrator verifies your trade credentials and submitted evidence, your listing will be published to the public directory.
                    </p>
                  </div>
                </div>
              )}

              {providerProfile.status === 'approved' && (
                <div className={styles.statusBannerApproved} style={{ border: '2px solid #10b981', background: '#f0fdf4', padding: '20px', borderRadius: '16px' }}>
                  <div className={styles.statusIcon} style={{ fontSize: '2rem' }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                      <h3 className={styles.statusHeading} style={{ margin: 0, fontSize: '17px', color: '#065f46' }}>
                        Profile Status: APPROVED & Publicly Listed
                        {providerProfile.verified && ' • 🛡️ Verified Professional'}
                      </h3>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                        LIVE & ACTIVE
                      </span>
                    </div>
                    <p className={styles.statusText} style={{ color: '#374151', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                      Your profile is active! Customers searching for <strong>{providerProfile.service}</strong> in <strong>{providerProfile.serviceAreas?.join(', ') || providerProfile.serviceArea}</strong> can discover and contact you directly via phone call and WhatsApp.
                    </p>
                  </div>
                </div>
              )}

              {/* Edit Pending Confirmation Banner */}
              {providerProfile.editPending && providerProfile.pendingUpdates && (
                <div
                  style={{
                    border: '2px solid #3b82f6',
                    background: '#eff6ff',
                    padding: '18px 20px',
                    borderRadius: '16px',
                    marginTop: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                  }}
                >
                  <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>📝</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e40af' }}>
                        Profile Update Submitted to Admin for Verification
                      </h4>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
                        EDIT PENDING APPROVAL
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                      You requested updates to your profile (Requested Profession: <strong>{providerProfile.pendingUpdates.service}</strong>
                      {providerProfile.pendingUpdates.skills && providerProfile.pendingUpdates.skills.length > 0 && (
                        <span> · Skills: {providerProfile.pendingUpdates.skills.join(', ')}</span>
                      )}
                      ). An authorized administrator is reviewing these changes.
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      ℹ️ Your live public directory listing continues displaying your current approved profession (<strong>{providerProfile.service}</strong>) until confirmed by Admin.
                    </p>
                  </div>
                </div>
              )}

            {providerProfile.status === 'rejected' && (
              <div className={styles.statusBannerRejected}>
                <div className={styles.statusIcon}>✗</div>
                <div>
                  <h3 className={styles.statusHeading}>Application Rejected</h3>
                  <p className={styles.statusText}>
                    Your application was not approved during administrative review. Please update your experience or contact details to re-apply.
                  </p>
                </div>
              </div>
            )}

            {providerProfile.status === 'suspended' && (
              <div style={{ border: '2px solid #ef4444', background: '#fef2f2', padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2rem' }}>⛔</div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '17px', color: '#991b1b', fontWeight: 800 }}>
                      Profile Status: SUSPENDED (Hidden from Directory)
                    </h3>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '999px', border: '1px solid #fca5a5' }}>
                      SUSPENDED BY ADMIN
                    </span>
                  </div>
                  <p style={{ color: '#7f1d1d', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                    Your service listing has been suspended due to an administrative review or reported issue. While suspended, your listing is hidden from public customer search. Contact ServiceFinder support or your local administrator for further assistance.
                  </p>
                </div>
              </div>
            )}
            </div>

            {/* Performance Analytics (Real Tracked Counters) */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{providerProfile.profileViews || 0}</div>
                <div className={styles.statLabel}>Profile Views</div>
                <div className={styles.statNote}>Local residents who opened your profile</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statVal}>{providerProfile.callClicks || 0}</div>
                <div className={styles.statLabel}>Direct Phone Calls</div>
                <div className={styles.statNote}>Calls initiated via Call button</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statVal}>{providerProfile.whatsappClicks || 0}</div>
                <div className={styles.statLabel}>WhatsApp Inquiries</div>
                <div className={styles.statNote}>Chats started with your number</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statVal}>
                  {providerProfile.rating !== null ? `⭐ ${providerProfile.rating.toFixed(1)}` : '—'}
                </div>
                <div className={styles.statLabel}>Community Rating</div>
                <div className={styles.statNote}>
                  {providerProfile.reviewCount > 0
                    ? `Based on ${providerProfile.reviewCount} genuine review${providerProfile.reviewCount > 1 ? 's' : ''}`
                    : 'No reviews yet'}
                </div>
              </div>
            </div>

            {/* Profile Overview Card */}
            <div id="profile-overview" className={styles.dashboardCard}>
              <div className={styles.overviewGrid}>
                {/* Left: Details */}
                <div className={styles.profileDetailsBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: '#111827', margin: 0 }}>
                        {providerProfile.name}
                      </h2>
                      <span style={{ fontSize: 'var(--text-sm)', color: '#4f46e5', fontWeight: 700 }}>
                        {providerProfile.service} • {providerProfile.experienceYears} Years Experience
                      </span>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: providerProfile.status === 'approved' ? '#ecfdf5' : '#fffbeb',
                      color: providerProfile.status === 'approved' ? '#059669' : '#d97706',
                      border: `1px solid ${providerProfile.status === 'approved' ? '#a7f3d0' : '#fde68a'}`,
                    }}>
                      {providerProfile.status.toUpperCase()}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>About / Bio</div>
                    <div className={styles.detailVal} style={{ fontWeight: 400, color: '#4b5563', lineHeight: 1.6 }}>
                      {providerProfile.description}
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Direct Contact Details</div>
                    <div className={styles.detailVal}>
                      Phone: <a href={`tel:${providerProfile.phone}`} style={{ color: '#4f46e5' }}>{providerProfile.phone}</a>
                      {providerProfile.whatsapp && (
                        <span style={{ marginLeft: '16px' }}>
                          WhatsApp: <span style={{ color: '#059669' }}>{providerProfile.whatsapp}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div id="provider-service-section" className={styles.detailRow}>
                    <div className={styles.detailLabel}>Skills & Specialties</div>
                    <div className={styles.chipsWrap}>
                      {providerProfile.skills.map((s) => (
                        <span key={s} className={[styles.chipBtn, styles.chipSelected].join(' ')} style={{ cursor: 'default' }}>
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div id="provider-areas-section" className={styles.detailRow}>
                    <div className={styles.detailLabel}>Mumbai Service Areas ({providerProfile.serviceAreas?.length || 1})</div>
                    <div className={styles.chipsWrap}>
                      {(providerProfile.serviceAreas || [providerProfile.serviceArea]).map((a) => (
                        <span key={a} className={styles.chipBtn} style={{ cursor: 'default' }}>
                          📍 {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={styles.actionRow} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      className={styles.btnAction}
                      onClick={() => setMode('edit_profile')}
                    >
                      ✏️ Edit Profile
                    </button>
                    <button
                      type="button"
                      className={styles.btnAction}
                      onClick={() => setMode('edit_profile')}
                    >
                      🛠️ Update Services
                    </button>
                    <button
                      type="button"
                      className={styles.btnAction}
                      onClick={() => setMode('edit_profile')}
                    >
                      📍 Update Areas
                    </button>
                    <button
                      type="button"
                      className={styles.btnAction}
                      onClick={() => setPreviewProvider(providerProfile)}
                    >
                      👁️ Preview My Profile
                    </button>
                    <button
                      type="button"
                      className={styles.btnAction}
                      onClick={handleLogoutProvider}
                      style={{ color: '#dc2626' }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>

                {/* Right: Summary Tips */}
                <div>
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                  }}>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                      📋 Provider Directives & Legal
                    </h3>
                    <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                      <li>Ensure your phone number is always reachable during working hours.</li>
                      <li>Customers contact you directly on WhatsApp with pre-filled details.</li>
                      <li>ServiceFinder never takes commission on your work.</li>
                      <li>Always quote honest, fair estimates to local residents.</li>
                    </ul>
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => onNavigate('contact')}
                        style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, fontSize: '12px', cursor: 'pointer', padding: 0 }}
                      >
                        📞 Contact Support
                      </button>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <button
                        type="button"
                        onClick={() => onNavigate('terms')}
                        style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, fontSize: '12px', cursor: 'pointer', padding: 0 }}
                      >
                        📜 Terms & Conditions
                      </button>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <button
                        type="button"
                        onClick={() => onNavigate('privacy')}
                        style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, fontSize: '12px', cursor: 'pointer', padding: 0 }}
                      >
                        🔒 Privacy Policy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewProvider && (
        <ProviderDetailsModal
          provider={previewProvider}
          onClose={() => setPreviewProvider(null)}
          selectedArea={previewProvider.serviceArea}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigate={onNavigate}
        onRegister={() => setMode('signup')}
      />
    </>
  );
};
