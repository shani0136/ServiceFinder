import React, { useState } from 'react';
import type { AppUser } from '../../types';
import { useAuth, formatAuthError } from '../../lib/auth';
import styles from './ContactAuthModal.module.css';

interface ContactAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AppUser) => void;
  onOpenFullAuth: () => void;
  actionType?: 'call' | 'whatsapp' | 'review';
  providerName?: string;
}

export const ContactAuthModal: React.FC<ContactAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onOpenFullAuth,
  actionType = 'call',
  providerName,
}) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // Direct customer Google login (role = 'customer')
      const loggedUser = await signInWithGoogle('customer');
      if (loggedUser) {
        onAuthSuccess(loggedUser);
        onClose();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Service Provider')) {
        setError(err.message);
      } else {
        console.warn('[ContactAuthModal] Google login failed:', err);
        setError(formatAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const actionText =
    actionType === 'call'
      ? 'call'
      : actionType === 'whatsapp'
      ? 'WhatsApp'
      : 'leave a review for';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-auth-title"
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        <div className={styles.iconWrap} aria-hidden="true">
          {actionType === 'call' ? '📞' : actionType === 'whatsapp' ? '💬' : '⭐'}
        </div>

        <h2 id="contact-auth-title" className={styles.title}>
          Login required
        </h2>

        <p className={styles.subtitle}>
          Please sign in to contact a service provider.
        </p>

        {providerName && (
          <div className={styles.providerNotice}>
            Signing in to {actionText} <strong>{providerName}</strong>
          </div>
        )}

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.buttonGroup}>
          {/* Button 1: Continue with Google */}
          <button
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            {loading ? 'Connecting to Google…' : 'Continue with Google'}
          </button>

          {/* Button 2: Login / Sign Up */}
          <button
            type="button"
            className={styles.emailBtn}
            onClick={() => {
              onClose();
              onOpenFullAuth();
            }}
          >
            Login / Sign Up
          </button>
        </div>

        <div className={styles.secureNotice}>
          🔒 Genuine local directory · Direct technician contact
        </div>
      </div>
    </div>
  );
};

export default ContactAuthModal;
