import React, { useState } from 'react';
import { useApp } from '../../store/appState';
import { useVoice } from '../../hooks/useVoice';
import { useAuth } from '../../lib/auth';
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
      window.dispatchEvent(new CustomEvent('sf_provider_portal_nav', { detail: { tab } }));
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
                    </>
                  ) : (
                    // Customer & Admin Menu Options
                    <>
                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                      >
                        <span>👤</span>
                        <span>Customer Profile</span>
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

      {/* Profile Modal */}
      {profileModalOpen && user && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
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
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>My Account</h3>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#111',
                color: '#fff',
                fontSize: '22px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {(user.name ?? user.email ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px' }}>{user.name ?? 'Member'}</h4>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{user.email}</p>
                <span style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  marginTop: '6px',
                }}>
                  {user.role === 'admin' ? 'Administrator' : user.role === 'provider' ? 'Service Provider' : 'Customer Account'}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '14px 0', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#777' }}>Operating Region:</span>
                <span style={{ fontWeight: 600 }}>Mumbai Western Line</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#777' }}>Selected Locality:</span>
                <span style={{ fontWeight: 600 }}>{state.selectedArea || 'All Western Line'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
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
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
