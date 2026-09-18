import React from 'react';
import styles from './HowItWorksSection.module.css';

const steps = [
  {
    number: '01',
    title: 'Describe',
    description: 'Tell us your problem in your own words — Hindi, English, or Hinglish. No technical jargon needed.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Understand',
    description: 'Our AI reads your description and identifies the right service category — from plumber to AC technician.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Discover',
    description: 'We search our community directory for verified local professionals in your area, sorted by rating.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Connect',
    description: 'Call or WhatsApp the provider directly. No middleman, no complicated booking — just direct contact.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.62 19.79 19.79 0 01.06 2A2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
      </svg>
    ),
  },
];

export const HowItWorksSection: React.FC = () => (
  <section id="how-it-works" className={styles.section} aria-labelledby="how-heading">
    <div className="container">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Simple process</p>
        <h2 id="how-heading" className={styles.title}>
          From problem to professional<br />in four easy steps
        </h2>
        <p className={styles.subtitle}>
          No registration required to browse. Sign in only when you want to save favourites or submit a review.
        </p>
      </div>

      <div className={styles.steps}>
        {steps.map((step, i) => (
          <div key={step.number} className={styles.step}>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={styles.connector} aria-hidden="true" />
            )}

            <div className={styles.stepIcon} aria-hidden="true">
              {step.icon}
            </div>

            <div className={styles.stepNumber} aria-hidden="true">{step.number}</div>

            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDesc}>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
