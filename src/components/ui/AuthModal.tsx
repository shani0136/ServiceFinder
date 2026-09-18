import React, { useState, useEffect } from 'react';
import type { AppUser } from '../../types';
import { useAuth, formatAuthError } from '../../lib/auth';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AppUser) => void;
  initialRole?: 'customer' | 'provider' | null;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialRole = null,
  initialMode = 'signin',
}) => {
  const {
    signInWithGoogle,
    signInCustomer,
    signInProvider,
    createCustomerAccount,
    createProviderAccount,
  } = useAuth();

  // Public users may sign up ONLY as 'customer' or 'provider'. No admin option.
  const [selectedRole, setSelectedRole] = useState<'customer' | 'provider' | null>(
    initialRole
  );
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(initialRole);
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setError('');
      setLoading(false);
    }
  }, [isOpen, initialRole, initialMode]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
    setLoading(false);
  };

  const handleRoleSelect = (role: 'customer' | 'provider') => {
    setSelectedRole(role);
    setMode('signin');
    resetForm();
  };

  const handleSwitchRole = () => {
    setSelectedRole((prev) => (prev === 'provider' ? 'customer' : 'provider'));
    resetForm();
  };

  // ── Customer Submission (Strictly Customer Role Only) ─────────────────────
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let loggedUser: AppUser | null = null;
      if (mode === 'signin') {
        loggedUser = await signInCustomer(email, password);
      } else {
        loggedUser = await createCustomerAccount(email, password, name);
      }

      if (loggedUser) {
        onAuthSuccess(loggedUser);
        onClose();
        resetForm();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Service Provider')) {
        setError(err.message);
      } else {
        setError(formatAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Provider Submission (Strictly Provider Role Only) ─────────────────────
  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (mode === 'signup' && (!name.trim() || !phone.trim())) {
      setError('Please provide your full name and contact phone number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let loggedUser: AppUser | null = null;
      if (mode === 'signin') {
        loggedUser = await signInProvider(email, password);
      } else {
        loggedUser = await createProviderAccount(name, email, phone, password);
      }

      if (loggedUser) {
        onAuthSuccess(loggedUser);
        onClose();
        resetForm();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Customer')) {
        setError(err.message);
      } else {
        setError(formatAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign In (Role-gated) ───────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const loggedUser = await signInWithGoogle(selectedRole || 'customer');
      if (loggedUser) {
        onAuthSuccess(loggedUser);
        onClose();
        resetForm();
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.includes('Service Provider') || err.message.includes('Customer'))) {
        setError(err.message);
      } else {
        setError(formatAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* ─── STEP 1: EXPLICIT ROLE SELECTION (CUSTOMER OR PROVIDER ONLY) ─── */}
        {!selectedRole && (
          <div>
            <div className={styles.header}>
              <h2 className={styles.title}>Welcome to ServiceFinder</h2>
              <p className={styles.subtitle}>
                Mumbai's community directory for local household and trade services.
              </p>
            </div>

            <div className={styles.rolePrompt}>Continue as</div>

            <div className={styles.roleGrid}>
              {/* Customer Option */}
              <button
                type="button"
                className={styles.roleCard}
                onClick={() => handleRoleSelect('customer')}
              >
                <div className={styles.roleIconWrap}>👤</div>
                <div className={styles.roleInfo}>
                  <div className={styles.roleTitle}>
                    Customer
                    <span className={styles.roleArrow}>→</span>
                  </div>
                  <p className={styles.roleDesc}>
                    I want to find, read profiles, and directly call or WhatsApp trusted local service providers in Mumbai.
                  </p>
                </div>
              </button>

              {/* Service Provider Option */}
              <button
                type="button"
                className={styles.roleCard}
                onClick={() => handleRoleSelect('provider')}
              >
                <div className={styles.roleIconWrap}>🛠️</div>
                <div className={styles.roleInfo}>
                  <div className={styles.roleTitle}>
                    Service Provider
                    <span className={styles.roleArrow}>→</span>
                  </div>
                  <p className={styles.roleDesc}>
                    I am a trade specialist or technician looking to list my services, get verified, and receive direct customer calls.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2A: CUSTOMER AUTHENTICATION ─── */}
        {selectedRole === 'customer' && (
          <div>
            <div className={styles.header}>
              <h2 className={styles.title}>Customer Account</h2>
              <p className={styles.subtitle}>
                Discover local specialists, read honest reviews, and contact them directly.
              </p>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <div>{error}</div>
                {mode === 'signin' && !error.includes('Service Provider') && (
                  <button
                    type="button"
                    className={styles.switchModeAction}
                    onClick={() => {
                      setMode('signup');
                      setError('');
                    }}
                  >
                    New user? Click here to Sign Up with this email →
                  </button>
                )}
                {mode === 'signup' && error.includes('already exists') && (
                  <button
                    type="button"
                    className={styles.switchModeAction}
                    onClick={() => {
                      setMode('signin');
                      setError('');
                    }}
                  >
                    Already have an account? Click here to Sign In →
                  </button>
                )}
              </div>
            )}

            <div className={styles.tabsRow}>
              <button
                type="button"
                className={[styles.tab, mode === 'signin' ? styles.activeTab : ''].join(' ')}
                onClick={() => { setMode('signin'); setError(''); }}
              >
                Customer Sign In
              </button>
              <button
                type="button"
                className={[styles.tab, mode === 'signup' ? styles.activeTab : ''].join(' ')}
                onClick={() => { setMode('signup'); setError(''); }}
              >
                Customer Sign Up
              </button>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              className={styles.googleBtn}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className={styles.divider}>
              <span>or continue with email</span>
            </div>

            <form onSubmit={handleCustomerSubmit} className={styles.form}>
              {mode === 'signup' && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  required
                  placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading
                  ? 'Processing…'
                  : mode === 'signin'
                  ? 'Sign In as Customer'
                  : 'Create Customer Account →'}
              </button>
            </form>

            <div className={styles.footerSwitch}>
              {mode === 'signin' ? (
                <>
                  New to ServiceFinder?{' '}
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => { setMode('signup'); setError(''); }}
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => { setMode('signin'); setError(''); }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              className={styles.switchRoleBtn}
              onClick={handleSwitchRole}
            >
              — Looking for the Service Provider Portal? Switch role
            </button>
          </div>
        )}

        {/* ─── STEP 2B: PROVIDER AUTHENTICATION (SERVICE PROVIDER PORTAL) ─── */}
        {selectedRole === 'provider' && (
          <div>
            <div className={styles.header}>
              <h2 className={styles.title}>Service Provider Portal</h2>
              <p className={styles.subtitle}>
                List your trades, get verified by administrators, and receive direct customer calls.
              </p>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <div>{error}</div>
                {mode === 'signin' && (
                  <button
                    type="button"
                    className={styles.switchModeAction}
                    onClick={() => {
                      setMode('signup');
                      setError('');
                    }}
                  >
                    New provider? Click here to Register Trade →
                  </button>
                )}
                {mode === 'signup' && error.includes('already exists') && (
                  <button
                    type="button"
                    className={styles.switchModeAction}
                    onClick={() => {
                      setMode('signin');
                      setError('');
                    }}
                  >
                    Already registered? Click here to Sign In →
                  </button>
                )}
              </div>
            )}

            <div className={styles.tabsRow}>
              <button
                type="button"
                className={[styles.tab, mode === 'signin' ? styles.activeTab : ''].join(' ')}
                onClick={() => { setMode('signin'); setError(''); }}
              >
                Provider Sign In
              </button>
              <button
                type="button"
                className={[styles.tab, mode === 'signup' ? styles.activeTab : ''].join(' ')}
                onClick={() => { setMode('signup'); setError(''); }}
              >
                Register Trade
              </button>
            </div>

            <form onSubmit={handleProviderSubmit} className={styles.form}>
              {mode === 'signup' && (
                <>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Full Name / Trade Contact</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      className={styles.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Direct Contact Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9820012345 (10-digit mobile)"
                      className={styles.input}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  required
                  placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading
                  ? 'Processing…'
                  : mode === 'signin'
                  ? 'Log In to Provider Dashboard'
                  : 'Register as Service Provider →'}
              </button>
            </form>

            <div className={styles.footerSwitch}>
              {mode === 'signin' ? (
                <>
                  Want to register your trade?{' '}
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => { setMode('signup'); setError(''); }}
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => { setMode('signin'); setError(''); }}
                  >
                    Log In
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              className={styles.switchRoleBtn}
              onClick={handleSwitchRole}
            >
              — Looking to find services instead? Switch role
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
