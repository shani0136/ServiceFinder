import React from 'react';
import type { DashboardView, AppUser } from '../../types';
import logoImg from '../../assets/logo.png';
import styles from './Sidebar.module.css';

// ─── Nav item definitions ─────────────────────────────────────────────────

interface NavItem {
  id: DashboardView;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  providerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'finder',
    label: 'AI Finder',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
  },
  {
    id: 'directory',
    label: 'Directory',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'onboarding',
    label: 'Register as Provider',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Admin Panel',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    adminOnly: true,
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 20v2M19.07 19.07l-1.41-1.41M20 12h2"/>
      </svg>
    ),
  },
];

interface SidebarProps {
  currentView: DashboardView;
  user: AppUser;
  onNavigate: (view: DashboardView) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  user,
  onNavigate,
  onLogout,
  mobileOpen,
  onMobileClose,
}) => {
  const isAdmin = user.role === 'admin';
  const initial = (user.name ?? user.email ?? 'U').charAt(0).toUpperCase();

  const handleNav = (view: DashboardView) => {
    onNavigate(view);
    onMobileClose();
  };

  const sidebarContent = (
    <div className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <img src={logoImg} alt="ServiceFinder" className={styles.logoImg} />
        <span className={styles.logoText}>ServiceFinder</span>
      </div>

      {/* User chip */}
      <div className={styles.userChip}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user.name ?? 'User'}</p>
          <p className={styles.userEmail}>{user.email ?? ''}</p>
        </div>
        {isAdmin && <span className={styles.adminBadge}>Admin</span>}
      </div>

      {/* Main nav */}
      <nav className={styles.nav} aria-label="Dashboard navigation">
        <ul role="list">
          {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => (
            <li key={item.id}>
              <button
                className={[styles.navItem, currentView === item.id ? styles.active : ''].join(' ')}
                onClick={() => handleNav(item.id)}
                aria-current={currentView === item.id ? 'page' : undefined}
                type="button"
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className={styles.divider} aria-hidden="true" />

      {/* Bottom nav */}
      <nav aria-label="Account navigation">
        <ul role="list">
          {BOTTOM_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                className={[styles.navItem, currentView === item.id ? styles.active : ''].join(' ')}
                onClick={() => handleNav(item.id)}
                aria-current={currentView === item.id ? 'page' : undefined}
                type="button"
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}

          {/* Sign out */}
          <li>
            <button
              className={styles.navItem}
              onClick={() => { onMobileClose(); onLogout(); }}
              type="button"
              aria-label="Sign out"
            >
              <span className={styles.navIcon} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </span>
              Sign Out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={styles.desktopSidebar} aria-label="Sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className={styles.overlay} onClick={onMobileClose} aria-hidden="true" />
          <aside className={styles.mobileSidebar} aria-label="Mobile sidebar">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
};
