import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/appState';
import { SERVICE_NAMES } from '../../constants/services';
import { MUMBAI_LOCATIONS } from '../../constants/locations';
import { submitCallbackRequest } from '../../lib/directoryService';
import styles from './ContactUsModal.module.css';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactUsModal: React.FC<ContactUsModalProps> = ({ isOpen, onClose }) => {
  const { state, addToast } = useApp();
  const user = state.user;
  const isProvider = user?.role === 'provider';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    area: 'Borivali',
    service: 'Electrician',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-fill user information if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
      if (user.role === 'provider') {
        try {
          const raw = localStorage.getItem('sf_providers_store');
          if (raw) {
            const list = JSON.parse(raw);
            const found = list.find((p: any) => p.uid === user.uid || p.id === user.uid);
            if (found) {
              setFormData((prev) => ({
                ...prev,
                service: found.service || found.primaryService || prev.service,
                area: found.serviceArea || found.serviceAreas?.[0] || prev.area,
              }));
            }
          }
        } catch {
          // ignore
        }
      }
    }
    if (state.selectedArea) {
      setFormData((prev) => ({ ...prev, area: state.selectedArea }));
    }
  }, [user, state.selectedArea, isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      addToast('Please enter your name and contact phone number.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await submitCallbackRequest({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        area: formData.area,
        service: formData.service,
        role: isProvider ? 'provider' : 'customer',
        message: formData.message.trim() || undefined,
        userId: user?.uid,
      });

      setSubmitted(true);
      if (isProvider) {
        addToast('Provider support request received! Our partner relations desk will call you within 15 minutes.', 'success');
      } else {
        addToast('Inquiry submitted! Our Mumbai support desk will reach out within 15 minutes.', 'success');
      }
    } catch (err) {
      console.error('[ContactUsModal] Failed to submit callback request:', err);
      addToast('Failed to submit inquiry. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="Contact ServiceFinder Customer Support"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modalPanel}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleArea}>
            <span className={styles.modalBadge}>
              {isProvider ? '⚡ Service Provider Partner Operations' : 'Mumbai Western Line Helpdesk'}
            </span>
            <h2 className={styles.modalTitle}>
              {isProvider ? 'Service Provider Help & Support' : 'Contact Customer Support'}
            </h2>
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

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Quick Direct Channels */}
          <div className={styles.channelsGrid}>
            <a
              href="tel:+918423773933"
              className={`${styles.channelCard} ${styles.channelCardPhone}`}
            >
              <div className={`${styles.channelIcon} ${styles.iconPhone}`}>📞</div>
              <div className={styles.channelInfo}>
                <span className={styles.channelLabel}>
                  {isProvider ? 'Partner Phone Support' : 'Direct Call Helpline'}
                </span>
                <span className={styles.channelValue}>+91 84237 73933</span>
                <span className={styles.channelAction}>
                  {isProvider ? 'Direct Provider Desk Assistance →' : 'Tap to Call Now →'}
                </span>
              </div>
            </a>

            <a
              href={
                isProvider
                  ? 'https://wa.me/918423773933?text=Hello%20ServiceFinder%20Support%2C%20I%20am%20a%20registered%20Service%20Provider%20and%20need%20assistance'
                  : 'https://wa.me/918423773933?text=Hello%20ServiceFinder%20Support%2C%20I%20need%20help%20with%20a%20local%20service%20in%20Mumbai'
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.channelCard} ${styles.channelCardWhatsApp}`}
            >
              <div className={`${styles.channelIcon} ${styles.iconWhatsApp}`}>💬</div>
              <div className={styles.channelInfo}>
                <span className={styles.channelLabel}>
                  {isProvider ? 'Partner WhatsApp Desk' : 'Direct WhatsApp Chat'}
                </span>
                <span className={styles.channelValue}>+91 84237 73933</span>
                <span className={styles.channelAction} style={{ color: '#16a34a' }}>
                  {isProvider ? 'Start Partner WhatsApp Conversation →' : 'Chat on WhatsApp →'}
                </span>
              </div>
            </a>
          </div>

          {/* Secondary Info Line */}
          <div className={styles.secondaryInfo}>
            <div className={styles.infoLine}>
              <span className={styles.infoDot} />
              <span>
                <strong>{isProvider ? 'Partner Desk Hours:' : 'Live Support:'}</strong> 8:00 AM – 9:00 PM Daily · Borivali West Operations Hub
              </span>
            </div>
            <div className={styles.infoLine} style={{ color: '#64748b' }}>
              <span>✉️ Support Email:</span>
              <a href="mailto:support@servicefinder.in">support@servicefinder.in</a>
            </div>
          </div>

          {/* Form or Submitted State */}
          <div className={styles.formSection}>
            {submitted ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px 16px',
                  background: '#f0fdf4',
                  borderRadius: '14px',
                  border: '1.5px solid #bbf7d0',
                }}
              >
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '6px' }}>
                  ✅
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#166534', margin: '0 0 4px' }}>
                  {isProvider ? `Support Request Received, ${formData.name}!` : `Inquiry Received, ${formData.name}!`}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#15803d', margin: 0, lineHeight: 1.5 }}>
                  {isProvider ? (
                    <>
                      Our Mumbai provider relations coordinator will call you directly at <strong>{formData.phone}</strong> regarding your <strong>{formData.service}</strong> listing in <strong>{formData.area}</strong>.
                    </>
                  ) : (
                    <>
                      Our neighborhood coordinator will call you directly at <strong>{formData.phone}</strong> regarding your {formData.service} request in <strong>{formData.area}</strong>.
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  style={{
                    marginTop: '14px',
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: '1px solid #86efac',
                    background: '#ffffff',
                    color: '#166534',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className={styles.sectionTitle}>
                  {isProvider ? 'Request Provider Help & Support Callback' : 'Request Instant Callback / Support'}
                </h3>
                <p className={styles.sectionDesc}>
                  {isProvider
                    ? 'Provide your trade details and an authorized partner support coordinator will phone you directly.'
                    : 'Leave your requirement and a coordinator will connect with you directly.'}
                </p>

                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.label}>
                      {isProvider ? 'Your Provider Name *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder={isProvider ? 'e.g. Ramesh Mehta (Technician)' : 'e.g. Ramesh Mehta'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.label}>Contact Phone Number *</label>
                    <input
                      type="tel"
                      className={styles.input}
                      placeholder="e.g. 98201 23456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.label}>
                      {isProvider ? 'Primary Operating Station' : 'Mumbai Area / Station'}
                    </label>
                    <select
                      className={styles.select}
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    >
                      {MUMBAI_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.label}>
                      {isProvider ? 'Your Trade / Profession' : 'Service Category'}
                    </label>
                    <select
                      className={styles.select}
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    >
                      {SERVICE_NAMES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formFieldFull}>
                    <label className={styles.label}>
                      {isProvider ? 'Inquiry / Issue Details (Optional)' : 'How can we assist you? (Optional)'}
                    </label>
                    <textarea
                      className={styles.textarea}
                      placeholder={
                        isProvider
                          ? 'Describe your question regarding profile verification, trade change request, or listing assistance...'
                          : 'Describe your issue or trade requirement...'
                      }
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Submitting Request…'
                    : isProvider
                    ? 'Request Provider Support Callback 📞'
                    : 'Request Instant Callback 📞'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
