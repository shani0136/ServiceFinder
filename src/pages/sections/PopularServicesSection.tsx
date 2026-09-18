import React from 'react';
import { CategoryCard3D, type CategoryCardData } from '../../components/ui/CategoryCard3D';
import styles from './PopularServicesSection.module.css';

interface PopularServicesSectionProps {
  onCategorySelect?: (category: string) => void;
}

const CATEGORIES_3D: CategoryCardData[] = [
  {
    emoji: '🔧',
    label: 'Plumbing & Water',
    description: 'Pipe leaks, taps, bathroom fittings & drainage repair',
    category: 'Plumber',
    color: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 70%)',
  },
  {
    emoji: '⚡',
    label: 'Electrical Systems',
    description: 'Short circuits, wiring, switches, fans & panel boards',
    category: 'Electrician',
    color: 'radial-gradient(circle, rgba(234, 179, 8, 0.35) 0%, transparent 70%)',
  },
  {
    emoji: '🪚',
    label: 'Carpentry & Woodwork',
    description: 'Furniture assembly, doors, locks, cabinets & repair',
    category: 'Carpenter',
    color: 'radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, transparent 70%)',
  },
  {
    emoji: '📱',
    label: 'Electronics & Mobile',
    description: 'Screen replacement, battery issues & audio setup',
    category: 'Electronics & Mobile Repair',
    color: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)',
  },
  {
    emoji: '❄️',
    label: 'Appliance Care & AC',
    description: 'AC servicing, gas refills, refrigerators & washing machines',
    category: 'Appliance Care',
    color: 'radial-gradient(circle, rgba(20, 184, 166, 0.35) 0%, transparent 70%)',
  },
  {
    emoji: '🚗',
    label: 'Vehicle & Mechanic',
    description: 'On-road breakdown, battery jumpstart, tyre punctures',
    category: 'Vehicle & Mechanic',
    color: 'radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, transparent 70%)',
  },
];

export const PopularServicesSection: React.FC<PopularServicesSectionProps> = ({
  onCategorySelect,
}) => (
  <section id="services" className={styles.section} aria-labelledby="services-heading">
    <div className="container">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Explore By Category</p>
        <h2 id="services-heading" className={styles.title}>Popular Services</h2>
        <p className={styles.subtitle}>
          Select a category or describe your issue above for instant AI diagnosis and matching.
        </p>
      </div>

      <div className={styles.grid} role="list">
        {CATEGORIES_3D.map((cat) => (
          <CategoryCard3D
            key={cat.category}
            data={cat}
            onClick={(c) => onCategorySelect?.(c)}
          />
        ))}
      </div>

      <p className={styles.moreNote}>
        + House Painting, Pest Control, Cleaning, Masonry, Home Automation, and more
      </p>
    </div>
  </section>
);
