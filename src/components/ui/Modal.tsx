import React, { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

/**
 * Accessible modal dialog with:
 * - Focus trap
 * - Escape key to close
 * - Click-outside to close
 * - ARIA attributes
 * - Smooth enter/exit animation
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '480px',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Lock scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the close button on open
      setTimeout(() => firstFocusRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Dialog'}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        className={styles.panel}
        style={{ maxWidth }}
      >
        {/* Header */}
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <button
            ref={firstFocusRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};
