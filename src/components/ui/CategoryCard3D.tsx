import React from 'react';
import { usePolymorphicTilt } from '../../hooks/usePolymorphicTilt';
import styles from './CategoryCard3D.module.css';

export interface CategoryCardData {
  emoji: string;
  label: string;
  description: string;
  category: string;
  color: string; // CSS gradient
}

interface CategoryCard3DProps {
  data: CategoryCardData;
  onClick: (category: string) => void;
}

export const CategoryCard3D: React.FC<CategoryCard3DProps> = ({ data, onClick }) => {
  const cardRef = usePolymorphicTilt<HTMLButtonElement>({
    maxTilt: 12,
    scale: 1.035,
    perspective: 850,
    speed: 350,
    glare: true,
  });

  return (
    <button
      ref={cardRef}
      className={styles.card}
      onClick={() => onClick(data.category)}
      type="button"
      aria-label={`Browse ${data.label} providers`}
    >
      <div className={styles.sheenLayer} aria-hidden="true" />
      <div className={styles.bevelHighlight} aria-hidden="true" />

      {/* Gradient blob */}
      <div className={styles.blob} style={{ background: data.color }} aria-hidden="true" />

      <span className={styles.emoji} aria-hidden="true">{data.emoji}</span>
      <span className={styles.label}>{data.label}</span>
      <span className={styles.desc}>{data.description}</span>

      <span className={styles.arrow} aria-hidden="true">→</span>
    </button>
  );
};

export default CategoryCard3D;
