import React from 'react';
import styles from './DirectoryPreviewSection.module.css';

interface DirectoryPreviewSectionProps {
  onViewAll?: () => void;
}

export const DirectoryPreviewSection: React.FC<DirectoryPreviewSectionProps> = ({
  onViewAll,
}) => {
  return (
    <section id="directory" className={styles.section} aria-labelledby="dir-heading">
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>Local Directory</p>
            <h2 id="dir-heading" className={styles.title}>
              Meet local Mumbai professionals
            </h2>
            <p className={styles.subtitle}>
              Real technicians from your Western Line locality, reviewed by administrators.
            </p>
          </div>
          <button className={styles.viewAll} onClick={onViewAll} type="button">
            View directory →
          </button>
        </div>
      </div>
    </section>
  );
};

export default DirectoryPreviewSection;
