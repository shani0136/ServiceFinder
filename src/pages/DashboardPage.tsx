import React, { useState } from 'react';
import { useApp } from '../store/appState';
import { useAuth } from '../lib/auth';
import { Sidebar } from '../components/layout/Sidebar';
import { AdminView } from './views/AdminView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import type { DashboardView } from '../types';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const { state, setView, setPublicView, setUser, toggleEmergency, addToast } = useApp();
  const { logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const user = state.user!;

  const handleLogout = async () => {
    await logout();
    setUser(null);
    addToast('Signed out successfully', 'info');
  };

  const handleNavigateView = (view: DashboardView) => {
    setView(view);
    const hash = view === 'admin' ? '' : `#${view}`;
    window.history.replaceState(null, '', `/admin/dashboard${hash}`);
  };

  const renderView = () => {
    switch (state.currentView) {
      case 'admin':
        return (
          <AdminView
            initialSection="overview"
            onSectionChange={(sec) => handleNavigateView(sec === 'overview' ? 'admin' : (sec as DashboardView))}
          />
        );
      case 'providers':
        return (
          <AdminView
            initialSection="providers"
            onSectionChange={(sec) => handleNavigateView(sec === 'overview' ? 'admin' : (sec as DashboardView))}
          />
        );
      case 'users':
        return (
          <AdminView
            initialSection="users"
            onSectionChange={(sec) => handleNavigateView(sec === 'overview' ? 'admin' : (sec as DashboardView))}
          />
        );
      case 'callbacks':
        return (
          <AdminView
            initialSection="callbacks"
            onSectionChange={(sec) => handleNavigateView(sec === 'overview' ? 'admin' : (sec as DashboardView))}
          />
        );
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <AdminView
            initialSection="overview"
            onSectionChange={(sec) => handleNavigateView(sec === 'overview' ? 'admin' : (sec as DashboardView))}
          />
        );
    }
  };

  const getViewTitle = () => {
    switch (state.currentView) {
      case 'admin':
        return 'Admin Dashboard & KPIs';
      case 'providers':
        return 'Service Provider Verification & Registry';
      case 'users':
        return 'User Accounts Management';
      case 'callbacks':
        return 'Support Inquiries & Callbacks';
      case 'profile':
        return 'Administrator Profile';
      case 'settings':
        return 'Platform Settings';
      default:
        return 'Admin Control Center';
    }
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar navigation */}
      <Sidebar
        currentView={state.currentView}
        user={user}
        onNavigate={handleNavigateView}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onVisitCustomerSite={() => {
          setPublicView('customer_home');
          window.history.pushState(null, '', '/customer_home');
        }}
      />

      {/* Main Workspace Area */}
      <div className={styles.mainArea}>
        <header className={styles.topBar}>
          <div className={styles.barLeft}>
            <button
              type="button"
              className={styles.hamburgerBtn}
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className={styles.breadcrumb}>
              <span>{getViewTitle()}</span>
              {user.role === 'admin' && (
                <span className={styles.breadcrumbBadge}>ADMIN</span>
              )}
            </div>
          </div>

          <div className={styles.barRight}>
            {user.role !== 'admin' ? (
              <button
                type="button"
                className={[
                  styles.emergencyBtn,
                  state.isEmergency ? styles.emergencyBtnActive : '',
                ].join(' ')}
                onClick={toggleEmergency}
                title="Toggle Emergency Mode for urgent breakdowns"
              >
                <span>🚨</span>
                <span>{state.isEmergency ? 'Emergency Active' : 'Emergency Mode'}</span>
              </button>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#15803d',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '4px 12px',
                borderRadius: '999px',
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Real-Time Cloud
              </span>
            )}

            <button
              type="button"
              className={styles.userBtn}
              onClick={() => setView('profile')}
              aria-label="View user profile"
            >
              <div className={styles.userAvatar}>
                {(user.name ?? user.email ?? 'U').charAt(0).toUpperCase()}
              </div>
            </button>
          </div>
        </header>

        <main className={styles.content}>
          {renderView()}
        </main>
      </div>
    </div>
  );
};
