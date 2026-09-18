import React from 'react';
import acSpotlightImg from '../../assets/ac_spotlight.jpg';
import plumbingSpotlightImg from '../../assets/plumbing_spotlight.jpg';
import electricalSpotlightImg from '../../assets/electrical_spotlight.jpg';
import { usePolymorphicTilt } from '../../hooks/usePolymorphicTilt';
import styles from './SpotlightSection.module.css';

interface SpotlightSectionProps {
  onSelectService: (service: string) => void;
}

const SPOTLIGHT_ITEMS = [
  {
    id: 'ac',
    title: 'AC & Appliance Repair',
    subtitle: 'Split/window AC servicing, cooling troubleshooting & gas leak detection',
    image: acSpotlightImg,
    service: 'AC & Appliance Repair',
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Drainage',
    subtitle: 'Bathroom mixers, pipe leakage, concealed fittings & water drainage',
    image: plumbingSpotlightImg,
    service: 'Plumber',
  },
  {
    id: 'electric',
    title: 'Electrical & Power Repairs',
    subtitle: 'Short circuit diagnosis, MCB board fixing & safe home wiring check',
    image: electricalSpotlightImg,
    service: 'Electrician',
  },
];

const SpotlightCard: React.FC<{
  item: typeof SPOTLIGHT_ITEMS[0];
  onSelect: (service: string) => void;
}> = ({ item, onSelect }) => {
  const cardRef = usePolymorphicTilt<HTMLDivElement>({
    maxTilt: 6,
    scale: 1.02,
    perspective: 1000,
    speed: 350,
    glare: true,
  });

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onClick={() => onSelect(item.service)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect(item.service);
      }}
    >
      <div className={styles.sheenLayer} aria-hidden="true" />
      <div className={styles.bevelHighlight} aria-hidden="true" />

      <img
        src={item.image}
        alt={item.title}
        className={styles.cardBg}
      />
      <div className={styles.gradientOverlay} aria-hidden="true" />

      <div className={styles.contentTop}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <span className={styles.cardSubtitle}>{item.subtitle}</span>
      </div>

      <div className={styles.contentBottom}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
          Direct Contact with Local Specialists
        </div>

        <button
          type="button"
          className={styles.bookBtn}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item.service);
          }}
          aria-label={`Find ${item.service} specialists`}
        >
          Find Specialists →
        </button>
      </div>
    </div>
  );
};

export const SpotlightSection: React.FC<SpotlightSectionProps> = ({ onSelectService }) => {
  return (
    <section className={styles.spotlightSection} aria-labelledby="spotlight-heading">
      <div className={styles.container}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
          <h2 id="spotlight-heading" className={styles.title}>
            Frequently Needed Everyday Services
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px' }}>
            Choose a trade below to view active service providers in your Mumbai Western Line area.
          </p>
        </div>

        <div className={styles.grid}>
          {SPOTLIGHT_ITEMS.map((item) => (
            <SpotlightCard
              key={item.id}
              item={item}
              onSelect={onSelectService}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpotlightSection;
