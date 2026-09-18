import React, { useState } from 'react';
import heroCollageImg from '../../assets/hero_collage.jpg';
import logoImg from '../../assets/logo.png';
import { usePolymorphicTilt } from '../../hooks/usePolymorphicTilt';
import { CORE_SERVICES } from '../../constants/services';
import { MUMBAI_LOCATIONS } from '../../constants/locations';
import { useApp } from '../../store/appState';
import styles from './UrbanHeroSection.module.css';

interface UrbanHeroSectionProps {
  onSelectCategory: (category: string) => void;
  onSearchSubmit: (problem: string) => void;
  onDirectMatch: (service: string, area: string) => void;
}

const FEATURED_HERO_SERVICES = CORE_SERVICES.slice(0, 6);

/**
 * HeroServiceTile
 * Polymorphic 3D interactive tile for quick service selection
 */
const HeroServiceTile: React.FC<{
  item: typeof FEATURED_HERO_SERVICES[0];
  onSelect: () => void;
}> = ({ item, onSelect }) => {
  const tileRef = usePolymorphicTilt<HTMLButtonElement>({
    maxTilt: 10,
    scale: 1.03,
    perspective: 800,
    speed: 300,
    glare: true,
  });

  return (
    <button
      ref={tileRef}
      type="button"
      className={styles.catItem}
      onClick={onSelect}
      aria-label={`Select ${item.label} service`}
    >
      <div className={styles.sheenLayer} aria-hidden="true" />
      <div className={styles.bevelHighlight} aria-hidden="true" />
      <span className={styles.catEmoji} aria-hidden="true">{item.emoji}</span>
      <span className={styles.catLabel}>{item.label}</span>
    </button>
  );
};

export const UrbanHeroSection: React.FC<UrbanHeroSectionProps> = ({
  onSelectCategory,
  onSearchSubmit,
  onDirectMatch,
}) => {
  const { state, setArea } = useApp();
  const [selectedService, setSelectedService] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(state.selectedArea || '');
  const [naturalText, setNaturalText] = useState('');

  const collageRef = usePolymorphicTilt<HTMLDivElement>({
    maxTilt: 4,
    scale: 1.01,
    perspective: 1200,
    speed: 500,
    glare: true,
  });

  const handleDirectSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation) setArea(selectedLocation);
    onDirectMatch(selectedService, selectedLocation);
  };

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (naturalText.trim()) {
      onSearchSubmit(naturalText.trim());
    }
  };

  return (
    <section className={styles.heroSection} aria-label="Hero Overview">
      <div className={styles.container}>
        {/* Left Column: Heading and Dual Finder Card */}
        <div className={styles.leftCol}>
          <div>
            <span className={styles.pillTag}>
              📍 Mumbai Western Line Service Discovery
            </span>
            <h1 className={styles.headline}>
              Find trusted local services<br />
              <span className={styles.headlineGradient}>near you.</span>
            </h1>
            <p className={styles.subheadline}>
              Discover local service professionals in your Mumbai area and connect with them directly. No middleman, no booking fees.
            </p>
          </div>

          {/* Primary Dual Finder Interaction */}
          <div className={styles.directFinderCard}>
            {/* Flow A: [ Select Service ] [ Select Location ] [ Find Service ] */}
            <form onSubmit={handleDirectSearch} className={styles.selectorRow}>
              <div className={styles.selectWrap}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                <select
                  className={styles.selectInput}
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  aria-label="Select Service"
                >
                  <option value="">Select Service</option>
                  {CORE_SERVICES.map((s) => (
                    <option key={s.label} value={s.label}>
                      {s.emoji} {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.selectWrap}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <select
                  className={styles.selectInput}
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setArea(e.target.value);
                  }}
                  aria-label="Select Location"
                >
                  <option value="">Select Location</option>
                  {MUMBAI_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className={styles.findBtn}>
                Find Service →
              </button>
            </form>

            {/* Divider */}
            <div className={styles.aiDivider}>
              <div className={styles.aiDividerLine} />
              <span className={styles.aiDividerText}>or describe your problem</span>
              <div className={styles.aiDividerLine} />
            </div>

            {/* Flow B: AI Natural Language search */}
            <form onSubmit={handleAiSearch} className={styles.aiRow}>
              <input
                type="text"
                className={styles.aiInput}
                placeholder="Tell us what you need help with (e.g. 'Bathroom tap is leaking', 'AC cooling nahi kar raha')..."
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
              />
              <button type="submit" className={styles.aiBtn}>
                AI Match
              </button>
            </form>
          </div>

          {/* Popular everyday service shortcuts */}
          <div className={styles.categoryGridCard}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Common Everyday Services in Mumbai:
            </div>
            <div className={styles.grid}>
              {FEATURED_HERO_SERVICES.map((item) => (
                <HeroServiceTile
                  key={item.label}
                  item={item}
                  onSelect={() => onSelectCategory(item.label)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-panel Image Collage */}
        <div className={styles.rightCol}>
          <div ref={collageRef} className={styles.collageWrap}>
            <div className={styles.sheenLayer} aria-hidden="true" />
            <img
              src={heroCollageImg}
              alt="Local service professionals serving Mumbai Western Line communities"
              className={styles.heroImg}
            />
            <div className={styles.badgeOverlay}>
              <img src={logoImg} alt="ServiceFinder" className={styles.badgeLogo} />
              <span className={styles.greenDot} aria-hidden="true" />
              <span>Direct Contact · Mumbai Local Specialists</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UrbanHeroSection;
