import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🔍',
  title,
  description,
  actions,
}) => (
  <div className={styles.container}>
    <span className={styles.icon} aria-hidden="true">{icon}</span>
    <h3 className={styles.title}>{title}</h3>
    {description && <p className={styles.description}>{description}</p>}
    {actions && <div className={styles.actions}>{actions}</div>}
  </div>
);
