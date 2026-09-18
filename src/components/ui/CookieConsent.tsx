import React, { useState, useEffect } from 'react';
import styles from './CookieConsent.module.css';

const COOKIE_STORAGE_KEY = 'sf_cookie_preferences';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  personalization: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: true,
  personalization: true,
};

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    try {
      const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    // Safely check if user has already made a choice
    try {
      const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!saved) {
        // Delay showing by 800ms for smooth entry
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback if localStorage is inaccessible
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom event from footer link "Cookie Preferences 🍪"
  useEffect(() => {
    const handleOpenSettings = () => {
      setVisible(true);
      setCustomizing(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const saveAndClose = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore quota or access errors
    }
    setPreferences(prefs);
    setVisible(false);
    setCustomizing(false);
  };

  const handleAcceptAll = () => {
    saveAndClose({ necessary: true, analytics: true, personalization: true });
  };

  const handleEssentialOnly = () => {
    saveAndClose({ necessary: true, analytics: false, personalization: false });
  };

  const handleSaveCustom = () => {
    saveAndClose(preferences);
  };

  if (!visible) return null;

  return (
    <div className={styles.cookieWrapper} role="dialog" aria-labelledby="cookie-title">
      <div className={styles.cookieCard}>
        <div className={styles.cookieHeader}>
          <div className={styles.headerTitle}>
            <span className={styles.cookieIcon} aria-hidden="true">🍪</span>
            <span id="cookie-title">Cookie & Privacy Preferences</span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setVisible(false)}
            aria-label="Close cookie banner"
          >
            ✕
          </button>
        </div>

        <p className={styles.cookieBody}>
          We use cookies and secure storage to enable verified technician matching, save your preferred service location, and optimize trade dispatch speed.
        </p>

        {customizing && (
          <div className={styles.settingsPanel}>
            {/* Essential */}
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Essential Cookies</span>
                <span className={styles.settingDesc}>Required for authentication, security, and trade bookings.</span>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" checked disabled />
                <span className={styles.slider} />
              </label>
            </div>

            {/* Location & Personalization */}
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Location & Matching</span>
                <span className={styles.settingDesc}>Remembers your neighborhood for instant nearest pro suggestions.</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.personalization}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, personalization: e.target.checked }))
                  }
                />
                <span className={styles.slider} />
              </label>
            </div>

            {/* Performance */}
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Analytics & Speed</span>
                <span className={styles.settingDesc}>Helps us evaluate response times and pro availability.</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                  }
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>
        )}

        <div className={styles.actionsRow}>
          {customizing ? (
            <>
              <button type="button" className={styles.acceptBtn} onClick={handleSaveCustom}>
                Save Preferences
              </button>
              <button
                type="button"
                className={styles.necessaryBtn}
                onClick={() => setCustomizing(false)}
              >
                Back
              </button>
            </>
          ) : (
            <>
              <button type="button" className={styles.acceptBtn} onClick={handleAcceptAll}>
                Accept All
              </button>
              <button type="button" className={styles.necessaryBtn} onClick={handleEssentialOnly}>
                Essential Only
              </button>
              <button
                type="button"
                className={styles.customizeBtn}
                onClick={() => setCustomizing(true)}
              >
                Customize
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
