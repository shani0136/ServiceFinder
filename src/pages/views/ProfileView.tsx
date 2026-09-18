import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/appState';
import { useAuth, updateUserProfile } from '../../lib/auth';
import { Pill } from '../../components/ui/Pill';

export const ProfileView: React.FC = () => {
  const { state, setUser, addToast } = useApp();
  const { logout } = useAuth();

  const user = state.user;
  const isAdmin = user?.role === 'admin';

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [adminTitle, setAdminTitle] = useState(user?.adminTitle || (isAdmin ? 'Platform Super Administrator' : 'Verified Resident'));
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || (isAdmin ? 'Mumbai Operations & Dispatch HQ' : 'Mumbai Western Line'));
  const [saving, setSaving] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAdminTitle(user.adminTitle || (isAdmin ? 'Platform Super Administrator' : 'Verified Resident'));
      setPhone(user.phone || '');
      setDepartment(user.department || (isAdmin ? 'Mumbai Operations & Dispatch HQ' : 'Mumbai Western Line'));
    }
  }, [user, isAdmin]);

  const handleCopyUid = () => {
    if (!user?.uid) return;
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    addToast('Account ID copied to clipboard ✓', 'info');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    try {
      const updates = {
        name: name.trim() || 'Administrator',
        adminTitle: adminTitle.trim() || (isAdmin ? 'Platform Super Administrator' : 'Verified Resident'),
        phone: phone.trim() || undefined,
        department: department.trim() || (isAdmin ? 'Mumbai Operations & Dispatch HQ' : undefined),
      };

      await updateUserProfile(user.uid, updates);

      // Update global context state
      setUser({
        ...user,
        ...updates,
      });

      addToast('Profile updated and saved successfully! ✓', 'success');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      addToast('Failed to save profile changes. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.name || (isAdmin ? 'Administrator' : 'Authorized Member');
  const initial = (displayName.charAt(0) || (isAdmin ? 'A' : 'U')).toUpperCase();

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: 'var(--space-6) 0 var(--space-12)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {isAdmin ? (
              <span style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '3px 10px',
                borderRadius: '999px',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                🛡️ MASTER ADMIN
              </span>
            ) : (
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
              }}>
                MEMBER ACCOUNT
              </span>
            )}
            <span style={{ fontSize: '12px', color: '#64748b' }}>• Real-Time Cloud Identity</span>
          </div>

          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--fg)', margin: 0 }}>
            {isAdmin ? 'Administrator Profile & Governance' : 'User Profile & Account'}
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', margin: '4px 0 0' }}>
            {isAdmin
              ? 'Manage your administrator display credentials, operational title, and platform authority.'
              : 'Manage your personal account credentials, preferences, and platform permissions.'}
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{
              background: '#ffffff',
              border: '1.5px solid #4f46e5',
              color: '#4f46e5',
              borderRadius: '10px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(79, 70, 229, 0.1)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>✏️</span>
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Main Card */}
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
        {/* Profile Card Top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: isAdmin
              ? 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)'
              : 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            boxShadow: isAdmin ? '0 8px 16px rgba(79, 70, 229, 0.35)' : 'none',
            flexShrink: 0,
          }}>
            {initial}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--fg)', margin: 0 }}>
                {displayName}
              </h2>
              {isAdmin ? (
                <span style={{
                  background: '#eef2ff',
                  border: '1.5px solid #c7d2fe',
                  color: '#4338ca',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}>
                  🛡️ ADMIN PRIVILEGES
                </span>
              ) : (
                <Pill variant="default" size="sm">
                  {user?.role?.toUpperCase() || 'RESIDENT'}
                </Pill>
              )}
            </div>

            <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
              {user?.adminTitle || (isAdmin ? 'Platform Super Administrator' : 'ServiceFinder Resident')}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--muted)' }}>
              <span>✉️ {user?.email || 'admin@servicefinder.com'}</span>
              {user?.phone && (
                <span>📞 {user.phone}</span>
              )}
              {user?.department && (
                <span>🏢 {user.department}</span>
              )}
            </div>
          </div>
        </div>

        {/* ─── EDIT PROFILE FORM (IF IN EDIT MODE) ─── */}
        {isEditing ? (
          <form
            onSubmit={handleSaveProfile}
            style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                ✏️ Edit Profile Information
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0' }}>
                Update your administrative display name, title tag, and contact coordinates.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Full Name / Display Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    background: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {isAdmin ? 'Admin Designation / Title Tag *' : 'Profile Title'}
                </label>
                <input
                  type="text"
                  value={adminTitle}
                  onChange={(e) => setAdminTitle(e.target.value)}
                  placeholder={isAdmin ? 'e.g. Platform Super Administrator' : 'e.g. Resident'}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Contact Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Department / Headquarters
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Mumbai Operations & Dispatch HQ"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  // Revert changes
                  setName(user?.name || '');
                  setAdminTitle(user?.adminTitle || (isAdmin ? 'Platform Super Administrator' : 'Verified Resident'));
                  setPhone(user?.phone || '');
                  setDepartment(user?.department || (isAdmin ? 'Mumbai Operations & Dispatch HQ' : 'Mumbai Western Line'));
                  setIsEditing(false);
                }}
                disabled={saving}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#475569',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {saving ? 'Saving Changes…' : 'Save Changes ✓'}
              </button>
            </div>
          </form>
        ) : null}

        {/* Credentials & System ID Grid */}
        <div style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: 'var(--space-5) 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-5)',
        }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block', fontWeight: 700 }}>
              ACCOUNT UNIQUE ID
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg)', fontFamily: 'monospace' }}>
                {user?.uid ? `${user.uid.substring(0, 16)}...` : 'N/A'}
              </span>
              <button
                type="button"
                onClick={handleCopyUid}
                title="Copy full UID"
                style={{
                  background: copiedUid ? '#dcfce7' : '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: copiedUid ? '#166534' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {copiedUid ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block', fontWeight: 700 }}>
              PLATFORM STATUS
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--success)', marginTop: '3px', display: 'inline-block' }}>
              ✓ Active & Verified
            </span>
          </div>

          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block', fontWeight: 700 }}>
              SECURITY LEVEL
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: isAdmin ? '#4f46e5' : '#0284c7', marginTop: '3px', display: 'inline-block' }}>
              {isAdmin ? '🛡️ Tier-1 Root Administrator' : 'Standard Member'}
            </span>
          </div>
        </div>

        {/* ─── ADMIN GOVERNANCE & AUTHORITY SECTION ─── */}
        {isAdmin ? (
          <div style={{
            background: '#faf5ff',
            border: '1.5px solid #e9d5ff',
            borderRadius: 'var(--r-xl)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🛡️</span>
              <div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#581c87', margin: 0 }}>
                  Administrative System Authority & Permissions
                </h4>
                <p style={{ fontSize: '12px', color: '#7e22ce', margin: '2px 0 0' }}>
                  Your account holds master authority over Mumbai Western Line operations.
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              marginTop: '4px',
            }}>
              <div style={{ background: '#ffffff', borderRadius: '10px', padding: '10px 14px', border: '1px solid #f3e8ff', fontSize: '12.5px', color: '#3b0764' }}>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>✓ </span>
                <strong>Provider Approvals:</strong> Full authority to approve, suspend, or reject Mumbai tradesmen.
              </div>

              <div style={{ background: '#ffffff', borderRadius: '10px', padding: '10px 14px', border: '1px solid #f3e8ff', fontSize: '12.5px', color: '#3b0764' }}>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>✓ </span>
                <strong>Profile Edit Approvals:</strong> Review and verify trade skill/area updates before publishing.
              </div>

              <div style={{ background: '#ffffff', borderRadius: '10px', padding: '10px 14px', border: '1px solid #f3e8ff', fontSize: '12.5px', color: '#3b0764' }}>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>✓ </span>
                <strong>User Account Control:</strong> Governance over customer and provider accounts.
              </div>

              <div style={{ background: '#ffffff', borderRadius: '10px', padding: '10px 14px', border: '1px solid #f3e8ff', fontSize: '12.5px', color: '#3b0764' }}>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>✓ </span>
                <strong>Emergency & Support:</strong> Direct oversight of citizen callbacks and support inquiries.
              </div>
            </div>
          </div>
        ) : (
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
              You haven't contacted any providers yet. Browse the directory or search on the homepage to find trusted local pros.
            </p>
          </div>
        )}

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Signed in via Google Cloud Identity
          </div>

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
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
