import React from 'react';
import styles from './GlowButton.module.css';

interface GlowButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  id?: string;
  'aria-label'?: string;
}

/**
 * Primary CTA button with an animated conic-gradient glow ring
 * that travels continuously around the button perimeter.
 * Animation respects prefers-reduced-motion.
 */
export const GlowButton: React.FC<GlowButtonProps> = ({
  onClick,
  children,
  disabled = false,
  loading = false,
  type = 'button',
  size = 'lg',
  fullWidth = false,
  id,
  'aria-label': ariaLabel,
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      id={id}
      type={type}
      className={[
        styles.btn,
        styles[size],
        fullWidth ? styles.fullWidth : '',
        isDisabled ? styles.disabled : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {/* Spinning glow ring — rendered via CSS ::before/::after */}
      <span className={styles.label}>
        {loading ? (
          <span className="dot-loader" aria-hidden="true">
            <span /><span /><span />
          </span>
        ) : (
          children
        )}
      </span>
    </button>
  );
};
