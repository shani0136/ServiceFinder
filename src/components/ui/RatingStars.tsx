import React from 'react';
import styles from './RatingStars.module.css';

interface RatingStarsProps {
  value: number;          // Current rating (1–5), 0 = none selected
  onChange?: (v: number) => void; // If provided, renders interactive stars
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

/** Renders 5 stars. Interactive when onChange is provided, display-only otherwise. */
export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  size = 'md',
  showValue = false,
}) => {
  const [hovered, setHovered] = React.useState(0);
  const interactive = Boolean(onChange);
  const display = hovered || value;

  return (
    <span
      className={[styles.stars, styles[size], interactive ? styles.interactive : ''].join(' ')}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Rate your experience' : `Rating: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={[styles.star, display >= star ? styles.filled : styles.empty].join(' ')}
          aria-label={interactive ? `${star} star${star > 1 ? 's' : ''}` : undefined}
          role={interactive ? 'radio' : undefined}
          aria-checked={interactive ? value === star : undefined}
          tabIndex={interactive ? 0 : undefined}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => onChange?.(star)}
          onKeyDown={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) {
              onChange?.(star);
            }
          }}
        >
          ★
        </span>
      ))}
      {showValue && value > 0 && (
        <span className={styles.value}>{value.toFixed(1)}</span>
      )}
    </span>
  );
};
