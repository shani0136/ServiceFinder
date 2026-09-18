import React from 'react';
import styles from './CommunityTrustSection.module.css';

const trustPoints = [
  {
    icon: '✓',
    title: 'Manually Reviewed Providers',
    description:
      'Providers register their genuine experience, area, and skills. Verification badges are awarded only after manual administrator review.',
  },
  {
    icon: '⭐',
    title: 'Genuine Community Ratings',
    description:
      'Ratings and reviews come from real residents in your locality. Honest community feedback with zero artificial 5.0 ratings.',
  },
  {
    icon: '📞',
    title: 'Direct Communication',
    description:
      'Call or WhatsApp the provider directly. Discuss the job, timing, and pricing directly with the specialist.',
  },
  {
    icon: '🔒',
    title: 'Zero Commissions & No Booking Complexities',
    description:
      'ServiceFinder is only the discovery layer. We take no cut, hold no payments in escrow, and charge zero commission.',
  },
];

export const CommunityTrustSection: React.FC = () => (
  <section id="trust" className={styles.section} aria-labelledby="trust-heading">
    <div className="container">
      <div className={styles.layout}>
        {/* Left — text */}
        <div className={styles.textSide}>
          <p className={styles.eyebrow}>Honest & Transparent</p>
          <h2 id="trust-heading" className={styles.title}>
            Your Mumbai Neighbourhood.<br />Local Professionals.
          </h2>
          <p className={styles.body}>
            ServiceFinder is a direct local service discovery platform built on simplicity and transparency.
            Our purpose is to help Mumbai residents quickly find dependable local technicians, while giving
            hardworking independent professionals a digital platform to be discovered without paying heavy commissions.
          </p>
          <div className={styles.stat}>
            <span className={styles.statNum}>100%</span>
            <span className={styles.statLabel}>Direct connection. Zero middleman fees.</span>
          </div>
        </div>

        {/* Right — trust cards */}
        <div className={styles.cards}>
          {trustPoints.map((pt) => (
            <div key={pt.title} className={styles.card}>
              <span className={styles.cardIcon} aria-hidden="true">{pt.icon}</span>
              <div>
                <h3 className={styles.cardTitle}>{pt.title}</h3>
                <p className={styles.cardDesc}>{pt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default CommunityTrustSection;
