import React, { useState } from 'react';
import { useApp } from '../../store/appState';
import { SERVICE_NAMES, type ServiceCategory } from '../../constants/services';
import { MUMBAI_LOCATIONS } from '../../constants/locations';
import { GlowButton } from '../../components/ui/GlowButton';
import { registerProvider } from '../../lib/directoryService';
import styles from './OnboardingView.module.css';

interface OnboardingViewProps {
  onRegistered?: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onRegistered }) => {
  const { addToast } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

      await registerProvider({
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

      setSubmitted(true);
      addToast('Application submitted! Status: Pending Administrator Review', 'success');
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
          <span className={styles.badgePending}>⏳ Application Status: Pending Admin Review</span>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: '8px 0' }}>
            Application Submitted, {formData.name}!
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', maxWidth: '520px', lineHeight: 1.6 }}>
            Your provider profile for <strong>{formData.service}</strong> in <strong>{formData.serviceArea}, Mumbai</strong> has been registered.
            To maintain directory trust, an administrator reviews credentials before public listing.
          </p>

          <div className={styles.infoGrid}>
            <div className={styles.infoBox}>
              <span className={styles.infoVal}>100%</span>
              <span className={styles.infoLabel}>Direct Call & WhatsApp</span>
            </div>
            <div className={styles.infoBox}>
              <span className={styles.infoVal}>₹0</span>
              <span className={styles.infoLabel}>Zero Platform Commission</span>
            </div>
            <div className={styles.infoBox}>
              <span className={styles.infoVal}>Manual</span>
              <span className={styles.infoLabel}>Quality Review Process</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            style={{
              marginTop: 'var(--space-4)',
              background: 'transparent',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
            }}
          >
            ← Submit another registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <h1 className={styles.title}>Service Provider Registration</h1>
        <p className={styles.subtitle}>
          Register your local trade on ServiceFinder. Connect directly with residents in your Mumbai area with zero middleman commissions.
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
              <label className={styles.label}>Main Service Category *</label>
              <select
                name="service"
                className={styles.select}
                value={formData.service}
                onChange={handleChange}
              >
                {SERVICE_NAMES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Primary Mumbai Service Area *</label>
              <select
                name="serviceArea"
                className={styles.select}
                value={formData.serviceArea}
                onChange={handleChange}
              >
                {MUMBAI_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Phone Number (For Direct Calls) *</label>
              <input
                type="tel"
                name="phone"
                className={styles.input}
                placeholder="e.g. 9820012345"
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
              <label className={styles.label}>About Your Work & Experience</label>
              <textarea
                name="description"
                className={styles.textarea}
                placeholder="Describe your services, working hours, or specializations..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
            <GlowButton
              type="submit"
              loading={submitting}
              size="lg"
            >
              {submitting ? 'Submitting Application…' : 'Submit for Admin Review →'}
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingView;
