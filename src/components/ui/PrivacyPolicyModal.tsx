import React, { useEffect } from 'react';
import styles from './LegalModal.module.css';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="ServiceFinder Privacy Policy"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modalPanel}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleArea}>
            <span className={styles.modalBadge} style={{ color: '#059669', background: '#ecfdf5' }}>
              Privacy & Trust
            </span>
            <h2 className={styles.modalTitle}>Privacy Policy</h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.modalBody}>
          <div className={styles.introBox} style={{ borderLeftColor: '#059669' }}>
            <strong>Commitment to Privacy:</strong> At ServiceFinder, we believe residents and tradesmen deserve transparent and secure privacy protections. We respect your data and do not engage in surveillance or third-party data brokerage.
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>1. What Information We Collect</h3>
            <p>
              We collect minimal information necessary to deliver fast, localized trade discovery across Mumbai:
            </p>
            <ul className={styles.bulletList}>
              <li><strong>Customer Profiles:</strong> Name, email address, phone number, and chosen Western Railway locality (e.g. Borivali, Andheri, Bandra).</li>
              <li><strong>Provider Profiles:</strong> Professional trade name, service areas, experience years, phone number, WhatsApp contact, and submitted proof of trade.</li>
              <li><strong>AI Diagnosis Queries:</strong> Natural language problem statements (e.g. "pipe leakage in kitchen") analyzed securely by Gemini AI solely to match appropriate trades.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>2. How We Use Your Data</h3>
            <p>
              Your personal information is strictly used for the following legitimate purposes:
            </p>
            <ul className={styles.bulletList}>
              <li>Connecting you directly with your selected tradesperson via direct phone call or WhatsApp.</li>
              <li>Enabling account sign-in and session security via Firebase Authentication.</li>
              <li>Reviewing provider credentials to prevent spam listings and fraud.</li>
              <li>Displaying genuine customer reviews and ratings to help neighborhood residents make informed decisions.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>3. Zero Third-Party Selling Policy</h3>
            <p>
              <strong>We NEVER sell, rent, monetize, or lease your personal information to third-party telemarketers, data brokers, or advertising networks.</strong> Your contact phone is utilized exclusively to establish direct communication between you and the technician you choose to contact.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>4. Data Security & Encryption</h3>
            <p>
              ServiceFinder enforces stringent enterprise-grade security protocols:
            </p>
            <ul className={styles.bulletList}>
              <li>All network transmissions are secured via TLS 1.3 encryption.</li>
              <li>User records in Google Cloud Firestore are protected by granular Firestore Security Rules preventing unauthorized database read/write access.</li>
              <li>Sensitive administrative routes are secured with multi-layer cryptographic verification.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>5. Cookies & Local Preferences</h3>
            <p>
              We use lightweight local storage items to preserve your selected Mumbai station and active session. You can manage or revoke analytical cookie preferences at any time using the "Cookie Preferences 🍪" link in our footer.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>6. Your Rights & Data Erasure</h3>
            <p>
              Under applicable Indian privacy and digital data regulations, you retain the right to:
            </p>
            <ul className={styles.bulletList}>
              <li>Access and review all personal data stored in your ServiceFinder profile.</li>
              <li>Request correction of outdated contact numbers or business information.</li>
              <li>Request immediate and permanent deletion of your account and review history by emailing <strong>privacy@servicefinder.in</strong>.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>7. Contact Our Privacy Desk</h3>
            <p>
              For questions regarding our privacy practices, contact our Data Protection Desk at <strong>privacy@servicefinder.in</strong> or call our Mumbai helpline at <strong>+91 84237 73933</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <span>ServiceFinder · Mumbai Local Services Directory</span>
          <button
            type="button"
            className={styles.actionBtn}
            style={{ background: '#059669' }}
            onClick={onClose}
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
