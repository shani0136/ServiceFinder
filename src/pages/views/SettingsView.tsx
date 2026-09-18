import React, { useState } from 'react';
import { useApp } from '../../store/appState';
import { GlowButton } from '../../components/ui/GlowButton';

export const SettingsView: React.FC = () => {
  const { state, setArea, addToast } = useApp();
  const [defaultCity, setDefaultCity] = useState(state.selectedArea || 'Mumbai');
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [directWhatsapp, setDirectWhatsapp] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setArea(defaultCity);
    addToast('Settings and preferences saved successfully', 'success');
  };

  const handleClearCache = () => {
    localStorage.removeItem('sf_custom_providers');
    localStorage.removeItem('sf_demo_session');
    addToast('Local search and demo cache cleared', 'info');
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--space-6) 0 var(--space-12)' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--fg)' }}>
          Preferences & Settings
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
          Configure your default search location, contact options, and privacy controls.
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
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--fg-secondary)',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              Default City / Area
            </label>
            <input
              type="text"
              value={defaultCity}
              onChange={(e) => setDefaultCity(e.target.value)}
              placeholder="e.g. Mumbai, Bangalore, Pune"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg)',
                border: '1.5px solid var(--border-md)',
                borderRadius: 'var(--r-lg)',
                fontSize: 'var(--text-sm)',
                color: 'var(--fg)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={allowNotifications}
                onChange={(e) => setAllowNotifications(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              Enable instant response notifications for pending provider queries
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={directWhatsapp}
                onChange={(e) => setDirectWhatsapp(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              Prioritize 1-Click WhatsApp messages with auto-filled problem details
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
            <GlowButton type="submit" size="md">
              Save Preferences
            </GlowButton>
          </div>
        </form>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}>
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Reset Demo & Local Data</h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Clears local session storage and any locally added test providers.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearCache}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--border-md)',
              background: 'var(--bg)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--fg-secondary)',
              cursor: 'pointer',
            }}
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
};
