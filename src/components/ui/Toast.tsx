import React from 'react';
import { useApp } from '../../store/appState';
import type { Toast as ToastType } from '../../types';
import styles from './Toast.module.css';

/** Single toast notification item */
const ToastItem: React.FC<{ toast: ToastType; onClose: (id: string) => void }> = ({
  toast,
  onClose,
}) => {
  const icons: Record<ToastType['type'], string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠️',
  };

  return (
    <div
      className={[styles.toast, styles[toast.type]].join(' ')}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.icon} aria-hidden="true">
        {icons[toast.type]}
      </span>
      <span className={styles.message}>{toast.message}</span>
      <button
        className={styles.close}
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss notification"
        type="button"
      >
        ✕
      </button>
    </div>
  );
};

/** Toast container — renders all active toasts from app state */
export const ToastContainer: React.FC = () => {
  const { state, removeToast } = useApp();

  if (state.toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-label="Notifications">
      {state.toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};
