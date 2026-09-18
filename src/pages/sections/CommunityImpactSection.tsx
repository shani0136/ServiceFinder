import React from 'react';
import styles from './CommunityImpactSection.module.css';

const stats = [
  { value: '1,240+', label: 'Successful Matches',  icon: '🔍' },
  { value: '250+',   label: 'Verified Providers',   icon: '🏠' },
  { value: '4.8★',   label: 'Average Satisfaction', icon: '⭐' },
  { value: '12+',    label: 'Cities Covered',       icon: '📍' },
];

export const CommunityImpactSection: React.FC = () => (
  <section id="impact" className={styles.section} aria-labelledby="impact-heading">
    <div className="container">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Platform Impact</p>
        <h2 id="impact-heading" className={styles.title}>
          Empowering Local<br />Service Economies
        </h2>
        <p className={styles.subtitle}>
          ServiceFinder connects neighborhood residents with skilled, verified technicians
          and home care experts. We help local pros build their reputation while ensuring
          homeowners get prompt, quality service without middlemen markups.
        </p>
      </div>

      {/* Stats row */}
      <div className={styles.statsGrid} aria-label="Impact statistics">
        {stats.map(({ value, label, icon }) => (
          <div key={label} className={styles.statCard}>
            <span className={styles.statIcon} aria-hidden="true">{icon}</span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* Verified Network banner */}
      <div className={styles.banner}>
        <div className={styles.bannerText}>
          <h3 className={styles.bannerTitle}>Are you a skilled service provider?</h3>
          <p className={styles.bannerDesc}>
            Join thousands of verified electricians, plumbers, carpenters, and appliance experts.
            Get high-intent neighborhood leads directly via phone and WhatsApp with zero commission fees.
          </p>
        </div>
        <div className={styles.bannerBadge} aria-hidden="true">
          <span>PRO</span>
        </div>
      </div>
    </div>
  </section>
);
