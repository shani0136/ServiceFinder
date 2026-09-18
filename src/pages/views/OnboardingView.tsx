import React, { useState } from 'react';
import { useApp } from '../../store/appState';
import { SERVICE_NAMES, type ServiceCategory } from '../../constants/services';
import { MUMBAI_LOCATIONS } from '../../constants/locations';
import { GlowButton } from '../../components/ui/GlowButton';
import { registerProvider, updateProviderStatus } from '../../lib/directoryService';
import styles from './OnboardingView.module.css';

interface OnboardingViewProps {
  onRegistered?: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onRegistered }) => {
  const { state, setView, addToast } = useApp();
  const isAdmin = state.user?.role === 'admin';

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    service: 'Electrician' as ServiceCategory,
    phone: '',
    whatsapp: '',
    serviceArea: 'Borivali',
    experienceYears: '3',
    skills: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.serviceArea) {
      addToast('Please fill out all required name, phone, and Mumbai area fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [formData.service];

      const newProv = await registerProvider({
        name: formData.name.trim(),
        businessName: formData.businessName.trim() || undefined,
        service: formData.service,
        primaryService: formData.service,
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        serviceArea: formData.serviceArea,
        serviceAreas: [formData.serviceArea],
        experienceYears: Math.max(0, Number(formData.experienceYears) || 1),
        description: formData.description.trim() || `${formData.service} specialist serving residents across ${formData.serviceArea}, Mumbai.`,
        skills: skillsArray,
      });

      if (isAdmin && autoApprove) {
        await updateProviderStatus(newProv.id, 'approved', true);
        addToast(`Provider "${formData.name}" onboarded and published to live directory! ✓`, 'success');
      } else {
        addToast(
          isAdmin
            ? `Provider "${formData.name}" added to Admin verification queue.`
            : 'Application submitted! Status: Pending Administrator Review',
          'success'
        );
      }

      setSubmitted(true);
      if (onRegistered) onRegistered();
    } catch {
      addToast('Failed to submit registration. Please check your connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.view}>
        <div className={styles.statusCard}>
          <div style={{ fontSize: '3rem' }}>📋</div>
          <span className={styles.badgePending}>
            {isAdmin && autoApprove ? '✓ Status: Live & Approved in Directory' : '⏳ Application Status: Pending Admin Review'}
          </span>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: '8px 0' }}>
            {isAdmin ? `Provider "${formData.name}" Successfully Registered!` : `Application Submitted, ${formData.name}!`}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', maxWidth: '520px', lineHeight: 1.6 }}>
            The provider profile for <strong>{formData.service}</strong> in <strong>{formData.serviceArea}, Mumbai</strong> has been created.
            {isAdmin && autoApprove
              ? ' This provider is now live and will appear in public customer queries.'
              : ' An administrator can review and verify credentials before public directory listing.'}
          </p>

          <div className={styles.infoGrid}>
            <div className={styles.infoBox}>
              <span className={styles.infoVal}>100%</span>
              <span className={styles.infoLabel}>Direct Call & WhatsApp</span>
            </div>
            <div className={styles.infoBox}>
              <span className={styles.infoVal}>₹0</span>
              <span className={styles.infoLabel}>Zero Commission</span>
            </div>
            <div className={styles.infoBox}>
              <span className={styles.infoVal}>{isAdmin && autoApprove ? 'Approved' : 'Pending'}</span>
              <span className={styles.infoLabel}>Verification Status</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setView('admin')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#4f46e5',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                }}
              >
                Go to Admin Control Center →
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  businessName: '',
                  email: '',
                  service: 'Electrician',
                  phone: '',
                  whatsapp: '',
                  serviceArea: 'Borivali',
                  experienceYears: '3',
                  skills: '',
                  description: '',
                });
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                padding: '9px 18px',
                borderRadius: '10px',
                color: '#334155',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              + Register Another Provider
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.view}>
      {isAdmin && (
        <div
          style={{
            background: '#f5f3ff',
            border: '1.5px solid #ddd6fe',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🛠️</span>
            <div>
              <strong style={{ fontSize: '13.5px', color: '#5b21b6' }}>
                Administrator Provider Onboarding Mode
              </strong>
              <p style={{ fontSize: '12px', color: '#6d28d9', margin: 0 }}>
                Manually register a verified technician into the Mumbai Western Line directory.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setView('admin')}
            style={{
              background: '#ffffff',
              border: '1.5px solid #c4b5fd',
              color: '#6d28d9',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← Back to Admin Panel
          </button>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>
          {isAdmin ? 'Admin Tradesman Onboarding' : 'Service Provider Registration'}
        </h1>
        <p className={styles.subtitle}>
          {isAdmin
            ? 'Add and onboard verified local tradesmen directly into the ServiceFinder network across Mumbai Western Line.'
            : 'Register your local trade on ServiceFinder. Connect directly with residents in your Mumbai area with zero middleman commissions.'}
        </p>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.label}>Full Name *</label>
              <input
                type="text"
                name="name"
                className={styles.input}
                placeholder="e.g. Rajesh Kumar"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Business / Shop Name (Optional)</label>
              <input
                type="text"
                name="businessName"
                className={styles.input}
                placeholder="e.g. Kumar Electricals"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Email Address (Optional)</label>
              <input
                type="email"
                name="email"
                className={styles.input}
                placeholder="rajesh@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Service Trade / Category *</label>
              <select
                name="service"
                className={styles.select}
                value={formData.service}
                onChange={handleChange}
                required
              >
                {SERVICE_NAMES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Phone Number (Calls) *</label>
              <input
                type="tel"
                name="phone"
                className={styles.input}
                placeholder="e.g. 98200 12345"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>WhatsApp Number</label>
              <input
                type="tel"
                name="whatsapp"
                className={styles.input}
                placeholder="Leave blank if same as phone"
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Primary Western Line Station *</label>
              <select
                name="serviceArea"
                className={styles.select}
                value={formData.serviceArea}
                onChange={handleChange}
                required
              >
                {MUMBAI_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Years of Experience</label>
              <input
                type="number"
                name="experienceYears"
                className={styles.input}
                min="0"
                max="50"
                value={formData.experienceYears}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Specific Skills (Comma-separated)</label>
              <input
                type="text"
                name="skills"
                className={styles.input}
                placeholder="e.g. MCB Wiring, Inverter Setup, Fan Repair"
                value={formData.skills}
                onChange={handleChange}
              />
            </div>

            <div className={[styles.formField, styles.fullWidth].join(' ')}>
              <label className={styles.label}>About Work & Experience</label>
              <textarea
                name="description"
                className={styles.textarea}
                placeholder="Describe services, working hours, or specializations..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {isAdmin && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <input
                type="checkbox"
                id="autoApproveCheck"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
              />
              <label htmlFor="autoApproveCheck" style={{ fontSize: '13px', fontWeight: 700, color: '#166534', cursor: 'pointer' }}>
                ✓ Instantly approve and publish this provider to live directory (Skip pending review)
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-5)' }}>
            <GlowButton
              type="submit"
              loading={submitting}
              size="lg"
            >
              {submitting
                ? 'Processing…'
                : isAdmin
                ? (autoApprove ? 'Publish Provider to Live Directory ✓' : 'Register Provider to Queue →')
                : 'Submit for Admin Review →'}
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingView;
