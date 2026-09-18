import React, { useState } from 'react';
import { useApp } from '../../store/appState';
import { useVoice } from '../../hooks/useVoice';
import { useAuth, updateUserProfile } from '../../lib/auth';
import { MUMBAI_LOCATIONS } from '../../constants/locations';
import type { PublicView } from '../../types';
import logoImg from '../../assets/logo.png';
import styles from './Navbar.module.css';

interface NavbarProps {
  currentView?: PublicView;
  onNavigate: (view: PublicView) => void;
  onSignIn: () => void;
  onRegister?: () => void;
  onSearchSubmit?: (query: string) => void;
  onProviderNav?: (tab: 'profile' | 'edit' | 'service' | 'areas' | 'status') => void;
  providerActiveTab?: 'profile' | 'edit' | 'service' | 'areas' | 'status';
}

const TABS: { label: string; view: PublicView }[] = [
  { label: 'All Services', view: 'services' },
  { label: 'Service Providers', view: 'providers' },
  { label: 'How It Works', view: 'about' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentView = 'home',
  onNavigate,
  onSignIn,
  onRegister,
  onSearchSubmit,
  onProviderNav,
  providerActiveTab = 'profile',
}) => {
  const { state, setArea, setProblemText, setUser, addToast } = useApp();
  const { logout } = useAuth();
  const [searchInput, setSearchInput] = useState(state.problemText || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile modal editing state
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalSaving, setModalSaving] = useState(false);

  const { isListening, isSupported, start, stop } = useVoice((transcript: string) => {
    setSearchInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setArea(val);
    if (val) {
      addToast(`Selected area: ${val}, Mumbai`, 'info');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = searchInput.trim();
      if (q) {
        setProblemText(q);
        if (onSearchSubmit) {
          onSearchSubmit(q);
        } else {
          onNavigate('providers');
        }
      }
    }
  };

  const user = state.user;
  const isProviderUser = user?.role === 'provider';

  const handleProviderTabClick = (tab: 'profile' | 'edit' | 'service' | 'areas' | 'status') => {
    if (onProviderNav) {
      onProviderNav(tab);
    } else {
      onNavigate('provider');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('sf_provider_portal_nav', { detail: { tab } }));
      }, 50);
    }
  };

  const handleSaveModalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setModalSaving(true);
    try {
      const updates = {
        name: modalName.trim() || (user.role === 'admin' ? 'Administrator' : 'Member'),
        adminTitle: user.role === 'admin' ? (modalTitle.trim() || 'Platform Super Administrator') : undefined,
        phone: modalPhone.trim() || undefined,
      };

      await updateUserProfile(user.uid, updates);

      setUser({
        ...user,
        ...updates,
      });

      addToast('Profile updated and saved successfully! ✓', 'success');
      setIsEditingModal(false);
    } catch (err) {
      console.error('Failed to update profile from modal:', err);
      addToast('Failed to save profile changes. Please try again.', 'error');
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <header className={styles.navbar} role="banner">
      <div className={styles.inner}>
        {/* Left: Logo & Navigation Tabs */}
        <div className={styles.leftGroup}>
          <button
            type="button"
            className={styles.logo}
            onClick={() => {
              if (isProviderUser) {
                handleProviderTabClick('profile');
              } else {
                onNavigate('home');
              }
            }}
            aria-label={isProviderUser ? 'ServiceFinder Provider Portal' : 'ServiceFinder Home'}
          >
            <img src={logoImg} alt="ServiceFinder Logo" className={styles.logoImg} />
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>ServiceFinder</span>
              <span className={styles.logoSub}>
                {isProviderUser ? 'Provider Portal' : 'Mumbai Local Directory'}
              </span>
            </div>
          </button>

          {/* Navigation Category Tabs: CUSTOMER vs SERVICE PROVIDER */}
          <nav className={styles.categoryTabs} aria-label="Main Navigation">
            {isProviderUser ? (
              // ─── SERVICE PROVIDER NAVIGATION ───
              <>
                <button
                  type="button"
                  className={[styles.tabBtn, providerActiveTab === 'profile' ? styles.tabActive : ''].join(' ')}
                  onClick={() => handleProviderTabClick('profile')}
                >
                  My Profile
                </button>
                <button
                  type="button"
                  className={[styles.tabBtn, providerActiveTab === 'edit' ? styles.tabActive : ''].join(' ')}
                  onClick={() => handleProviderTabClick('edit')}
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  className={[styles.tabBtn, providerActiveTab === 'service' ? styles.tabActive : ''].join(' ')}
                  onClick={() => handleProviderTabClick('service')}
                >
                  My Service
                </button>
                <button
                  type="button"
                  className={[styles.tabBtn, providerActiveTab === 'areas' ? styles.tabActive : ''].join(' ')}
                  onClick={() => handleProviderTabClick('areas')}
                >
                  My Service Areas
                </button>
                <button
                  type="button"
                  className={[styles.tabBtn, providerActiveTab === 'status' ? styles.tabActive : ''].join(' ')}
                  onClick={() => handleProviderTabClick('status')}
                >
                  Application Status
                </button>
              </>
            ) : (
              // ─── CUSTOMER NAVIGATION ───
              <>
                <button
                  type="button"
                  className={[styles.tabBtn, currentView === 'home' ? styles.tabActive : ''].join(' ')}
                  onClick={() => onNavigate('home')}
                >
                  Overview
                </button>
                {TABS.map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    className={[styles.tabBtn, currentView === tab.view ? styles.tabActive : ''].join(' ')}
                    onClick={() => onNavigate(tab.view)}
                  >
                    {tab.label}
                  </button>
                ))}
              </>
            )}
          </nav>
        </div>

        {/* Middle: Mumbai Western Line Corridor Dropdown & Search Bar (CUSTOMER ONLY) */}
        {!isProviderUser ? (
          <div className={styles.searchControls}>
            <div className={styles.locationWrap} title="Select Mumbai area along the Western Line corridor">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <select
                className={styles.locationSelect}
                value={state.selectedArea || ''}
                onChange={handleLocationChange}
                aria-label="Select Location"
              >
                <option value="">Select Location</option>
                {MUMBAI_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search 'Tap leak', 'AC repair', 'Electrician'..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              {isSupported && (
                <button
                  type="button"
                  className={[styles.searchMicBtn, isListening ? styles.searchMicActive : ''].join(' ')}
                  onClick={isListening ? stop : start}
                  title={isListening ? 'Stop voice' : 'Search by voice'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.providerHeaderBadge}>
            <span className={styles.providerBadgePill}>⚡ Professional Provider Dashboard</span>
          </div>
        )}

        {/* Right: Become Provider CTA & User Login/Avatar */}
        <div className={styles.rightGroup}>
          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              🛡️ Admin Queue
            </button>
          )}

          {/* Show "Become a Service Provider" ONLY to unauthenticated visitors */}
          {!user && (
            <button
              type="button"
              className={styles.becomeProviderBtn}
              onClick={() => {
                if (onRegister) {
                  onRegister();
                } else {
                  onNavigate('provider');
                }
              }}
              title="Join as a Service Provider or Access Provider Portal"
            >
              Become a Service Provider
            </button>
          )}

          {user ? (
            <div
              className={styles.userAvatarChip}
              onClick={() => setDropdownOpen((prev) => !prev)}
              title="Account Menu"
            >
              <div className={styles.avatarCircle}>
                {(user.name ?? user.email ?? 'U').charAt(0).toUpperCase()}
              </div>
              <span className={styles.avatarName}>{user.name ?? 'Account'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>

              {/* User Dropdown */}
              {dropdownOpen && (
                <div
                  className={styles.userDropdown}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownUserName}>{user.name ?? 'Member'}</span>
                    <span className={styles.dropdownUserEmail}>{user.email}</span>
                    <span className={styles.dropdownRoleBadge}>
                      {user.role === 'admin' ? 'Administrator' : user.role === 'provider' ? 'Service Provider' : 'Customer'}
                    </span>
                  </div>

                  {isProviderUser ? (
                    // Service Provider Menu Options
                    <>
                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          handleProviderTabClick('profile');
                        }}
                      >
                        <span>👤</span>
                        <span>My Profile</span>
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          handleProviderTabClick('edit');
                        }}
                      >
                        <span>✏️</span>
                        <span>Edit Profile</span>
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          handleProviderTabClick('service');
                        }}
                      >
                        <span>🛠️</span>
                        <span>My Service</span>
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          handleProviderTabClick('areas');
                        }}
                      >
                        <span>📍</span>
                        <span>My Service Areas</span>
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          handleProviderTabClick('status');
                        }}
                      >
                        <span>⏳</span>
                        <span>Application Status</span>
                      </button>

                      <div className={styles.dropdownDivider} />

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('contact');
                        }}
                      >
                        <span>📞</span>
                        <span>Contact Support</span>
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('terms');
                        }}
                      >
                        <span>📜</span>
                        <span>Terms & Conditions</span>
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('privacy');
                        }}
                      >
                        <span>🔒</span>
                        <span>Privacy Policy</span>
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('about');
                        }}
                      >
                        <span>ℹ️</span>
                        <span>About ServiceFinder</span>
                      </button>
                    </>
                  ) : (
                    // Customer & Admin Menu Options
                    <>
                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          setModalName(user.name || '');
                          setModalTitle(user.adminTitle || (user.role === 'admin' ? 'Platform Super Administrator' : ''));
                          setModalPhone(user.phone || '');
                          setIsEditingModal(false);
                          setProfileModalOpen(true);
                        }}
                      >
                        <span>{user.role === 'admin' ? '🛡️' : '👤'}</span>
                        <span>{user.role === 'admin' ? 'Admin Profile' : 'Customer Profile'}</span>
                      </button>

                      {user.role === 'customer' && (
                        <button
                          type="button"
                          className={styles.dropdownItem}
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate('customer_home');
                          }}
                          style={{ color: '#0284c7', fontWeight: 600 }}
                        >
                          <span>🏠</span>
                          <span>Customer Home</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* STRICT ADMIN CHECK: Only visible if user.role === 'admin' */}
                  {user.role === 'admin' && (
                    <button
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate('admin');
                      }}
                      style={{ color: '#4f46e5', fontWeight: 600 }}
                    >
                      <span>⚡</span>
                      <span>Admin Control Panel</span>
                    </button>
                  )}

                  <div className={styles.dropdownDivider} />

                  <button
                    type="button"
                    className={[styles.dropdownItem, styles.dropdownSignOut].join(' ')}
                    onClick={async () => {
                      setDropdownOpen(false);
                      await logout();
                      setUser(null);
                      onNavigate('home');
                      addToast('Signed out successfully', 'info');
                    }}
                  >
                    <span>🚪</span>
                    <span>{isProviderUser ? 'Account / Logout' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={styles.loginBtn}
              onClick={onSignIn}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Sign In
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            className={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNavLinks} aria-label="Mobile Navigation">
            {isProviderUser ? (
              <>
                <button
                  type="button"
                  className={[styles.mobileNavLink, providerActiveTab === 'profile' ? styles.mobileNavLinkActive : ''].join(' ')}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProviderTabClick('profile');
                  }}
                >
                  👤 My Profile
                </button>
                <button
                  type="button"
                  className={[styles.mobileNavLink, providerActiveTab === 'edit' ? styles.mobileNavLinkActive : ''].join(' ')}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProviderTabClick('edit');
                  }}
                >
                  ✏️ Edit Profile
                </button>
                <button
                  type="button"
                  className={[styles.mobileNavLink, providerActiveTab === 'service' ? styles.mobileNavLinkActive : ''].join(' ')}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProviderTabClick('service');
                  }}
                >
                  🛠️ My Service
                </button>
                <button
                  type="button"
                  className={[styles.mobileNavLink, providerActiveTab === 'areas' ? styles.mobileNavLinkActive : ''].join(' ')}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProviderTabClick('areas');
                  }}
                >
                  📍 My Service Areas
                </button>
                <button
                  type="button"
                  className={[styles.mobileNavLink, providerActiveTab === 'status' ? styles.mobileNavLinkActive : ''].join(' ')}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProviderTabClick('status');
                  }}
                >
                  📋 Application Status
                </button>

                <div style={{ height: '1px', background: '#e2e8f0', margin: '6px 0' }} />

                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('contact');
                  }}
                >
                  📞 Contact Support
                </button>
                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('terms');
                  }}
                >
                  📜 Terms & Conditions
                </button>
                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('privacy');
                  }}
                >
                  🔒 Privacy Policy
                </button>
                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('about');
                  }}
                >
                  ℹ️ About ServiceFinder
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={[styles.mobileNavLink, currentView === 'home' ? styles.mobileNavLinkActive : ''].join(' ')}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                >
                  Overview
                </button>
                {TABS.map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    className={[styles.mobileNavLink, currentView === tab.view ? styles.mobileNavLinkActive : ''].join(' ')}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(tab.view);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
                {user?.role === 'customer' && (
                  <button
                    type="button"
                    className={[styles.mobileNavLink, currentView === 'customer_home' ? styles.mobileNavLinkActive : ''].join(' ')}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('customer_home');
                    }}
                  >
                    🏠 Customer Home
                  </button>
                )}
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    className={[styles.mobileNavLink, currentView === 'admin' ? styles.mobileNavLinkActive : ''].join(' ')}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('admin');
                    }}
                  >
                    ⚡ Admin Control Panel
                  </button>
                )}
              </>
            )}
          </nav>

          {!isProviderUser && (
            <div className={styles.mobileLocationWrap}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <select
                className={styles.locationSelect}
                value={state.selectedArea || ''}
                onChange={(e) => {
                  handleLocationChange(e);
                  setMobileMenuOpen(false);
                }}
                aria-label="Select Location Mobile"
                style={{ width: '100%' }}
              >
                <option value="">Select Mumbai Area</option>
                {MUMBAI_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!user && (
            <div className={styles.mobileActions}>
              <button
                type="button"
                className={styles.mobileBecomeProviderBtn}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onRegister) onRegister();
                  else onNavigate('provider');
                }}
              >
                Become a Service Provider
              </button>
              <button
                type="button"
                className={styles.mobileLoginBtn}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignIn();
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Modal with Direct Profile Editing & Master Admin Tags */}
      {profileModalOpen && user && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{user.role === 'admin' ? '🛡️' : '👤'}</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {user.role === 'admin' ? 'Administrator Profile' : 'My Account Profile'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {isEditingModal ? (
              /* Edit Profile Form inside Modal */
              <form onSubmit={handleSaveModalProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12.5px', color: '#475569' }}>
                  Update your display name, official role tag, and contact details below.
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="e.g. Shani Sharma"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>

                {user.role === 'admin' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      Admin Designation / Title Tag
                    </label>
                    <input
                      type="text"
                      value={modalTitle}
                      onChange={(e) => setModalTitle(e.target.value)}
                      placeholder="e.g. Platform Super Administrator"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={modalPhone}
                    onChange={(e) => setModalPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingModal(false)}
                    disabled={modalSaving}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      background: '#fff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: '#475569',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSaving}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#4f46e5',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
                    }}
                  >
                    {modalSaving ? 'Saving…' : 'Save Changes ✓'}
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: user.role === 'admin' ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : '#0284c7',
                    color: '#fff',
                    fontSize: '22px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: user.role === 'admin' ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
                    flexShrink: 0,
                  }}>
                    {(user.name ?? user.email ?? 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        {user.name ?? (user.role === 'admin' ? 'Administrator' : 'Member')}
                      </h4>
                      {user.role === 'admin' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                          color: '#ffffff',
                          padding: '3px 9px',
                          borderRadius: '999px',
                          boxShadow: '0 2px 5px rgba(79, 70, 229, 0.25)',
                        }}>
                          🛡️ MASTER ADMIN
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}>
                          {user.role === 'provider' ? 'Service Provider' : 'Customer Account'}
                        </span>
                      )}
                    </div>

                    {user.role === 'admin' && (
                      <p style={{ fontSize: '12.5px', color: '#4338ca', fontWeight: 700, margin: '3px 0 0' }}>
                        {user.adminTitle || 'Platform Super Administrator'}
                      </p>
                    )}

                    <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>
                      ✉️ {user.email}
                    </p>
                    {user.phone && (
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                        📞 {user.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '14px 0', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Account Authority:</span>
                    <span style={{ fontWeight: 700, color: user.role === 'admin' ? '#4f46e5' : '#0284c7' }}>
                      {user.role === 'admin' ? '🛡️ Tier-1 Root Administrator' : 'Standard Member'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Operating Region:</span>
                    <span style={{ fontWeight: 600 }}>Mumbai Western Line</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Locality Filter:</span>
                    <span style={{ fontWeight: 600 }}>{state.selectedArea || 'All Western Line'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setModalName(user.name || '');
                      setModalTitle(user.adminTitle || (user.role === 'admin' ? 'Platform Super Administrator' : ''));
                      setModalPhone(user.phone || '');
                      setIsEditingModal(true);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #4f46e5',
                      background: '#ffffff',
                      color: '#4f46e5',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>✏️</span>
                    <span>Edit Profile</span>
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {user.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileModalOpen(false);
                          onNavigate('admin');
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#e0e7ff',
                          color: '#4338ca',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Admin Panel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setProfileModalOpen(false);
                        await logout();
                        setUser(null);
                        onNavigate('home');
                        addToast('Signed out successfully', 'info');
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
