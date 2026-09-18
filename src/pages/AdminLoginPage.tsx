import React, { useState } from 'react';
import { useAuth, formatAuthError } from '../lib/auth';
import type { AppUser, PublicView } from '../types';
import styles from './AdminLoginPage.module.css';

interface AdminLoginPageProps {
  onNavigate: (view: PublicView) => void;
  onAdminAuthenticated: (user: AppUser) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigate,
  onAdminAuthenticated,
}) => {
  const { signInAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter administrator email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const adminUser = await signInAdmin(email, password);
      if (adminUser && adminUser.role === 'admin') {
        onAdminAuthenticated(adminUser);
      } else {
        setError('ACCESS DENIED: You do not have verified administrator privileges.');
      }
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.shieldIcon}>🛡️</div>
          <h1 className={styles.title}>Admin Control Center</h1>
          <p className={styles.subtitle}>
            Restricted administrative portal. Verification of server-side admin privileges is required.
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Administrator Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="admin@servicefinder.com"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Verifying Privileges…' : 'Authenticate & Access Admin Center →'}
          </button>
        </form>

        <button
          type="button"
          className={styles.backBtn}
          onClick={() => onNavigate('home')}
        >
          ← Return to Public ServiceFinder
        </button>
      </div>
    </div>
  );
};
