import React from 'react';
import { useApp } from '../../store/appState';
import logoImg from '../../assets/logo.png';
import styles from './Footer.module.css';
import type { PublicView } from '../../types';

interface FooterProps {
  onNavigate?: (view: PublicView) => void;
  onRegister?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onRegister }) => {
  const { state } = useApp();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* Top Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logo} onClick={() => onNavigate?.('home')} style={{ cursor: 'pointer' }}>
            <img src={logoImg} alt="ServiceFinder Logo" className={styles.logoImg} />
            <span className={styles.logoTitle}>ServiceFinder</span>
          </div>
        </div>

        {/* 4 Columns Grid */}
        <div className={styles.grid}>
          {/* Col 1: Company */}
          <div>
            <h4 className={styles.colTitle}>Company</h4>
            <ul className={styles.linkList}>
              <li>
                <button type="button" className={styles.linkItem} onClick={() => onNavigate?.('about')}>
                  About us
                </button>
              </li>
              <li>
                <button type="button" className={styles.linkItem} onClick={() => onNavigate?.('terms')}>
                  Terms & conditions
                </button>
              </li>
              <li>
                <button type="button" className={styles.linkItem} onClick={() => onNavigate?.('privacy')}>
                  Privacy policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={styles.linkItem}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
                >
                  Cookie Preferences 🍪
                </button>
              </li>
              <li>
                <button type="button" className={styles.linkItem} onClick={() => onNavigate?.('contact')}>
                  Careers & Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: For customers */}
          <div>
            <h4 className={styles.colTitle}>For customers</h4>
            <ul className={styles.linkList}>
              <li>
                <button type="button" className={styles.linkItem} onClick={() => onNavigate?.('providers')}>
                  SF reviews & Directory
                </button>
              </li>
              <li>
                <button type="button" className={styles.linkItem} onClick={() => onNavigate?.('services')}>
                  Categories near you
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={styles.linkItem}
                  onClick={() => onNavigate?.('contact')}
                  style={{ fontWeight: 600, color: '#4f46e5' }}
                >
                  Contact us 📞
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: For professionals (visitors only) */}
          {!state.user && (
            <div>
              <h4 className={styles.colTitle}>For professionals</h4>
              <ul className={styles.linkList}>
                <li>
                  <button
                    type="button"
                    className={styles.linkItem}
                    onClick={() => {
                      if (onRegister) onRegister();
                      else onNavigate?.('provider');
                    }}
                    style={{ fontWeight: 600, color: '#111111' }}
                  >
                    Become a Service Provider
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Col 4: Social links & App download */}
          <div>
            <h4 className={styles.colTitle}>Social links</h4>
            <div className={styles.socialRow}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialCircle} aria-label="X (Twitter)">
                𝕏
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialCircle} aria-label="Facebook">
                f
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialCircle} aria-label="Instagram">
                📸
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialCircle} aria-label="LinkedIn">
                in
              </a>
            </div>

            <div className={styles.appBadges}>
              <a href="#app" className={styles.appBadgeBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.12.65-2.79 1.43-.58.67-.99 1.74-.95 2.8.07 0 .14.01.21.01.88 0 1.9-.62 2.52-1.37z"/>
                </svg>
                <div>
                  <div className={styles.badgeSub}>Download on the</div>
                  <div className={styles.badgeTitle}>App Store</div>
                </div>
              </a>

              <a href="#app" className={styles.appBadgeBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a2.41 2.41 0 0 1-.61-.715V2.529c.174-.294.382-.544.609-.715zm11.237 11.237l2.458 2.458-12.01 6.892 9.552-9.35zm0-2.102L5.294 1.6l12.01 6.893-2.458 2.457zm1.488 1.051l3.52 2.02a1.866 1.866 0 0 1 0 3.243l-3.52 2.02-2.072-2.072 2.072-2.071z"/>
                </svg>
                <div>
                  <div className={styles.badgeSub}>Get it on</div>
                  <div className={styles.badgeTitle}>Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className={styles.bottomRow}>
          <div className={styles.disclaimer}>
            ServiceFinder · Mumbai Western Line Local Service Discovery & Digital Directory. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
