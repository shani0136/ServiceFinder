import React, { useEffect } from 'react';
import styles from './LegalModal.module.css';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
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
      aria-label="ServiceFinder Terms and Conditions"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modalPanel}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleArea}>
            <span className={styles.modalBadge} style={{ color: '#2563eb', background: '#eff6ff' }}>
              Legal Agreement
            </span>
            <h2 className={styles.modalTitle}>Terms & Conditions</h2>
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
          <div className={styles.introBox}>
            <strong>Effective Date:</strong> Updated for 2026. These Terms of Service govern your use of the ServiceFinder platform, localized service directory, and direct contact tools across the Mumbai Western Railway corridor (Churchgate to Dahisar).
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>1. Purpose of ServiceFinder</h3>
            <p>
              ServiceFinder operates as a digital community directory and discovery engine. Our mission is to bridge neighborhood homeowners and residents directly with local trade specialists (such as Electricians, Plumbers, Appliance Technicians, and Carpenters) with <strong>zero middleman markups and zero commission fees</strong>.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>2. Direct Contractual Relationship</h3>
            <p>
              ServiceFinder is NOT an employer, contractor, or broker of service professionals. Service providers listed on ServiceFinder are independent tradesmen and business operators:
            </p>
            <ul className={styles.bulletList}>
              <li>All agreements regarding work scope, timelines, pricing, and spare parts are entered directly between the customer and the technician.</li>
              <li>ServiceFinder does not handle service fees, escrow funds, or commissions. You pay the visiting technician directly via cash or UPI.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>3. Quality Verification & Badges</h3>
            <p>
              ServiceFinder reviews submitted trade credentials, experience claims, and active telephone contacts before issuing directory listings. However:
            </p>
            <ul className={styles.bulletList}>
              <li>Customers are advised to agree on diagnostic fees and material estimates before work commences.</li>
              <li>Genuine community reviews and star ratings help maintain trust and transparent quality across neighborhoods.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>4. User Conduct & Fair Use</h3>
            <p>
              When utilizing direct contact links (Call, WhatsApp) or submitting service requests, users agree to:
            </p>
            <ul className={styles.bulletList}>
              <li>Provide accurate contact phone numbers and residential area locations.</li>
              <li>Maintain respectful and professional communication with local service providers.</li>
              <li>Refrain from automated data scraping, spamming, or fraudulent inquiry submissions.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>5. Pricing & Payments</h3>
            <p>
              Service providers set their own competitive rates based on job complexity, required materials, and travel distance. ServiceFinder does not set standard rates or inflate inspection fees.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>6. Limitation of Liability & Support</h3>
            <p>
              While ServiceFinder takes extensive care to list genuine neighborhood professionals, ServiceFinder is not liable for trade workmanship defects, property damages, or scheduling delays caused by independent technicians. In case of disputes, our Mumbai customer helpline (+91 84237 73933) is available to assist with mediation.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>7. Governing Law</h3>
            <p>
              These terms are governed by and construed in accordance with the laws of India, under the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <span>ServiceFinder · Mumbai Local Services Directory</span>
          <button type="button" className={styles.actionBtn} onClick={onClose}>
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
