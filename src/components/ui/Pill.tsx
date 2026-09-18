import React from 'react';
import styles from './Pill.module.css';

type PillVariant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'ghost';

interface PillProps {
  children: React.ReactNode;
  variant?: PillVariant;
  size?: 'sm' | 'md';
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

/** Small pill badge — for tags like service category, verified badge, urgency, etc. */
export const Pill: React.FC<PillProps> = ({
  children,
  variant = 'default',
  size = 'md',
  onClick,
  active = false,
  className = '',
}) => {
  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      className={[
        styles.pill,
        styles[variant],
        styles[size],
        active ? styles.active : '',
        onClick ? styles.clickable : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(onClick ? { onClick, type: 'button' as const } : {})}
    >
      {children}
    </Tag>
  );
};
