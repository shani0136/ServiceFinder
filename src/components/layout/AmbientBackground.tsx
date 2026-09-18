import React from 'react';
import styles from './AmbientBackground.module.css';

/**
 * AmbientBackground provides dynamic, luminous floating gradient orbs
 * that drift smoothly beneath frosted glass surfaces, producing rich optical refraction
 * and modern minimalism.
 */
export const AmbientBackground: React.FC = () => {
  return (
    <div className={styles.ambientContainer} aria-hidden="true">
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />
      <div className={`${styles.orb} ${styles.orb4}`} />
      <div className={`${styles.orb} ${styles.orb5}`} />
    </div>
  );
};

export default AmbientBackground;
