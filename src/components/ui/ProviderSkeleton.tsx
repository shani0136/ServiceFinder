import React from 'react';
import styles from './ProviderSkeleton.module.css';

/** Animated shimmer skeleton that matches the ProviderCard layout */
export const ProviderSkeleton: React.FC = () => (
  <div className={styles.card} aria-hidden="true" aria-label="Loading provider">
    <div className={styles.header}>
      <div className={[styles.avatar, 'skeleton'].join(' ')} />
      <div className={styles.headerInfo}>
        <div className={[styles.lineLg, 'skeleton'].join(' ')} />
        <div className={[styles.lineSm, 'skeleton'].join(' ')} />
      </div>
    </div>

    <div className={styles.stats}>
      <div className={[styles.statBlock, 'skeleton'].join(' ')} />
      <div className={[styles.statBlock, 'skeleton'].join(' ')} />
      <div className={[styles.statBlock, 'skeleton'].join(' ')} />
    </div>

    <div className={styles.descBlock}>
      <div className={[styles.lineDesc, 'skeleton'].join(' ')} />
      <div className={[styles.lineDescShort, 'skeleton'].join(' ')} />
    </div>

    <div className={styles.actions}>
      <div className={[styles.btnSkel, 'skeleton'].join(' ')} />
      <div className={[styles.btnSkel, 'skeleton'].join(' ')} />
    </div>
  </div>
);

/** Renders N skeleton cards */
export const ProviderSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <ProviderSkeleton key={i} />
    ))}
  </>
);
