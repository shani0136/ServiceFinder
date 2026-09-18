import React from 'react';
import { useApp } from '../../store/appState';
import { useAuth } from '../../lib/auth';
import { Pill } from '../../components/ui/Pill';

export const ProfileView: React.FC = () => {
  const { state, setUser } = useApp();
  const { logout } = useAuth();

  const user = state.user;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--space-6) 0 var(--space-12)' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--fg)' }}>
          User Profile & Account
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
          Manage your account credentials, preferences, and platform permissions.
        </p>
      </div>

      <div style={{
        background: 'var(--bg-pure)',
        border: '1px solid var(--border-md)',
        borderRadius: 'var(--r-2xl)',
        padding: 'var(--space-8)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--fg)' }}>
                {user?.name || 'Authorized Member'}
              </h2>
              <Pill variant={user?.role === 'admin' ? 'accent' : 'default'} size="sm">
                {user?.role?.toUpperCase() || 'RESIDENT'}
              </Pill>
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
              {user?.email || 'user@servicefinder.com'}
            </span>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: 'var(--space-4) 0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-4)',
        }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>ACCOUNT ID</span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg)' }}>{user?.uid}</span>
          </div>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>PLATFORM STATUS</span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--success)' }}>✓ Active & Verified</span>
          </div>
        </div>

        <div style={{
          background: '#f9f9fb',
          border: '1px solid #e5e5e8',
          borderRadius: 'var(--r-xl)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#111' }}>
            My Contacted Providers & Inquiries
          </h4>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
            You haven't contacted any providers yet. Browse the directory or use the AI Finder on the homepage to find trusted local pros.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={async () => {
              await logout();
              setUser(null);
            }}
            style={{
              background: 'var(--error-bg)',
              color: 'var(--error)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--r-lg)',
              padding: '10px 18px',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
