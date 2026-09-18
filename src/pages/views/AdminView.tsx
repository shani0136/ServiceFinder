import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/appState';
import {
  getAllProvidersForAdmin,
  updateProviderStatus,
  deleteProviderForAdmin,
  getAllUsersForAdmin,
  deleteUserForAdmin,
  approveProviderProfileEdit,
  rejectProviderProfileEdit,
  getAllCallbackRequestsForAdmin,
  updateCallbackRequestStatus,
  deleteCallbackRequestForAdmin,
} from '../../lib/directoryService';
import { MUMBAI_LOCATIONS } from '../../constants/locations';
import type { Provider, ProviderStatus, AppUser, CallbackRequest, CallbackRequestStatus } from '../../types';
import styles from './AdminView.module.css';

export const AdminView: React.FC = () => {
  const { addToast } = useApp();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingProvider, setReviewingProvider] = useState<Provider | null>(null);

  // Main Section Tab: 'providers' | 'users' | 'callbacks'
  const [activeSection, setActiveSection] = useState<'providers' | 'users' | 'callbacks'>('providers');

  // Provider Queue Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended' | 'edits'>('pending');
  const [selectedStation, setSelectedStation] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User Directory Filter
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'customer' | 'provider' | 'admin'>('all');
  const [userSearch, setUserSearch] = useState<string>('');

  // Callbacks & Support Inquiries Filter
  const [callbackFilter, setCallbackFilter] = useState<'all' | 'pending' | 'provider' | 'customer' | 'resolved'>('all');
  const [callbackStation, setCallbackStation] = useState<string>('All');
  const [callbackSearch, setCallbackSearch] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [provList, userList, callbackList] = await Promise.all([
        getAllProvidersForAdmin(),
        getAllUsersForAdmin(),
        getAllCallbackRequestsForAdmin(),
      ]);
      setProviders(provList);
      setUsers(userList);
      setCallbacks(callbackList);
    } catch (err) {
      console.error('[AdminView] Failed to load admin directory data:', err);
      addToast('Failed to load full admin data from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleCallbacksUpdated = () => {
      getAllCallbackRequestsForAdmin().then(setCallbacks).catch(() => {});
    };
    window.addEventListener('sf_callbacks_updated', handleCallbacksUpdated);
    return () => window.removeEventListener('sf_callbacks_updated', handleCallbacksUpdated);
  }, []);

  const handleRefresh = async () => {
    await loadData();
    addToast('Admin registry refreshed ✓', 'info');
  };

  // Metrics calculation
  const approvedCount = providers.filter((p) => p.status === 'approved').length;
  const pendingCount = providers.filter((p) => p.status === 'pending').length;
  const suspendedCount = providers.filter((p) => p.status === 'suspended').length;
  const rejectedCount = providers.filter((p) => p.status === 'rejected').length;
  const editsPendingCount = providers.filter((p) => p.editPending && p.pendingUpdates).length;

  const pendingCallbacksCount = callbacks.filter((c) => c.status === 'pending').length;
  const providerCallbacksCount = callbacks.filter((c) => c.role === 'provider').length;
  const customerCallbacksCount = callbacks.filter((c) => c.role === 'customer').length;
  const resolvedCallbacksCount = callbacks.filter((c) => c.status === 'resolved').length;

  const customerCount = users.filter((u) => u.role === 'customer').length;
  const totalUsersCount = users.length > 0 ? users.length : providers.length + customerCount;

  const metrics = [
    {
      label: 'Active Approved Pros',
      value: approvedCount,
      icon: '✓',
      badgeText: `${approvedCount} live in directory`,
      badgeColor: '#16a34a',
    },
    {
      label: 'Pending Approvals',
      value: pendingCount,
      icon: '⏳',
      badgeText: pendingCount > 0 ? 'Requires action' : 'Queue clear',
      badgeColor: pendingCount > 0 ? '#d97706' : '#64748b',
    },
    {
      label: 'Profile Edit Requests',
      value: editsPendingCount,
      icon: '📝',
      badgeText: editsPendingCount > 0 ? 'Action required' : 'No pending edits',
      badgeColor: editsPendingCount > 0 ? '#2563eb' : '#64748b',
    },
    {
      label: 'Support & Callbacks',
      value: pendingCallbacksCount,
      icon: '📞',
      badgeText: pendingCallbacksCount > 0 ? `${pendingCallbacksCount} pending calls` : 'All answered',
      badgeColor: pendingCallbacksCount > 0 ? '#dc2626' : '#16a34a',
    },
    {
      label: 'Total Platform Accounts',
      value: totalUsersCount,
      icon: '📋',
      badgeText: `${providers.length} pros · ${customerCount} customers`,
      badgeColor: '#4f46e5',
    },
  ];

  const handleUpdateCallbackStatus = async (id: string, status: CallbackRequestStatus) => {
    try {
      await updateCallbackRequestStatus(id, status);
      setCallbacks((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, resolvedAt: status === 'resolved' ? new Date().toISOString() : c.resolvedAt } : c))
      );
      addToast(`Callback status updated to ${status.toUpperCase()} ✓`, 'success');
    } catch {
      addToast('Failed to update callback status', 'error');
    }
  };

  const handleDeleteCallback = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the callback inquiry from "${name}"?`)) return;
    try {
      await deleteCallbackRequestForAdmin(id);
      setCallbacks((prev) => prev.filter((c) => c.id !== id));
      addToast('Callback request deleted', 'info');
    } catch {
      addToast('Failed to delete callback request', 'error');
    }
  };

  const handleStatusChange = async (id: string, newStatus: ProviderStatus) => {
    try {
      const verified = newStatus === 'approved';
      await updateProviderStatus(id, newStatus, verified);
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id || p.uid === id ? { ...p, status: newStatus, verified } : p
        )
      );
      if (reviewingProvider?.id === id || reviewingProvider?.uid === id) {
        setReviewingProvider((prev) => (prev ? { ...prev, status: newStatus, verified } : null));
      }
      addToast(
        `Provider status updated to: ${newStatus.toUpperCase()}`,
        newStatus === 'approved' ? 'success' : 'info'
      );
    } catch {
      addToast('Failed to update provider status.', 'error');
    }
  };

  const handleApproveEdit = async (id: string, name: string) => {
    try {
      await approveProviderProfileEdit(id);
      await loadData();
      if (reviewingProvider?.id === id || reviewingProvider?.uid === id) {
        const provs = await getAllProvidersForAdmin();
        const found = provs.find((p) => p.id === id || p.uid === id);
        setReviewingProvider(found || null);
      }
      addToast(`Profile edit for "${name}" approved and published to live directory! ✓`, 'success');
    } catch {
      addToast('Failed to approve profile edit.', 'error');
    }
  };

  const handleRejectEdit = async (id: string, name: string) => {
    try {
      await rejectProviderProfileEdit(id);
      await loadData();
      if (reviewingProvider?.id === id || reviewingProvider?.uid === id) {
        const provs = await getAllProvidersForAdmin();
        const found = provs.find((p) => p.id === id || p.uid === id);
        setReviewingProvider(found || null);
      }
      addToast(`Profile edit for "${name}" was rejected.`, 'info');
    } catch {
      addToast('Failed to reject profile edit.', 'error');
    }
  };

  const handleDeleteProvider = async (id: string, name: string, uid?: string, email?: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the profile of "${name}"?`)) {
      return;
    }
    try {
      await deleteProviderForAdmin(id, uid, email);
      setProviders((prev) => prev.filter((p) =>
        p.id !== id &&
        p.uid !== id &&
        (!uid || (p.id !== uid && p.uid !== uid)) &&
        (!email || p.email !== email)
      ));
      if (reviewingProvider?.id === id || reviewingProvider?.uid === id) {
        setReviewingProvider(null);
      }
      addToast(`Provider "${name}" permanently removed.`, 'info');
    } catch {
      addToast('Failed to delete provider record.', 'error');
    }
  };

  const handleDeleteUser = async (uid: string, emailOrName: string) => {
    if (!window.confirm(`Delete user account "${emailOrName}"?`)) {
      return;
    }
    try {
      await deleteUserForAdmin(uid);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      addToast(`User record removed.`, 'info');
    } catch {
      addToast('Failed to delete user record.', 'error');
    }
  };

  // Filtered providers
  const filteredProviders = providers.filter((p) => {
    if (statusFilter === 'edits') {
      if (!p.editPending || !p.pendingUpdates) return false;
    } else if (statusFilter !== 'all' && (p.status || 'pending') !== statusFilter) {
      return false;
    }
    if (selectedStation !== 'All') {
      const matchPrimary = p.serviceArea?.toLowerCase() === selectedStation.toLowerCase();
      const matchAreas = p.serviceAreas?.some((a) => a.toLowerCase() === selectedStation.toLowerCase());
      if (!matchPrimary && !matchAreas) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchService = p.service?.toLowerCase().includes(q);
      const matchEmail = p.email?.toLowerCase().includes(q);
      const matchPhone = p.phone?.toLowerCase().includes(q);
      const matchArea = p.serviceArea?.toLowerCase().includes(q);
      if (!matchName && !matchService && !matchEmail && !matchPhone && !matchArea) {
        return false;
      }
    }
    return true;
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) {
      return false;
    }
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchUid = u.uid?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchUid && !matchPhone) {
        return false;
      }
    }
    return true;
  });

  // Filtered callbacks & support inquiries
  const filteredCallbacks = callbacks.filter((item) => {
    if (callbackFilter === 'pending' && item.status !== 'pending') return false;
    if (callbackFilter === 'provider' && item.role !== 'provider') return false;
    if (callbackFilter === 'customer' && item.role !== 'customer') return false;
    if (callbackFilter === 'resolved' && item.status !== 'resolved') return false;

    if (callbackStation !== 'All' && item.area !== callbackStation) return false;

    if (callbackSearch.trim()) {
      const q = callbackSearch.toLowerCase().trim();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchPhone = item.phone?.toLowerCase().includes(q);
      const matchService = item.service?.toLowerCase().includes(q);
      const matchArea = item.area?.toLowerCase().includes(q);
      const matchTopic = item.inquiryTopic?.toLowerCase().includes(q) ?? false;
      const matchMsg = item.message?.toLowerCase().includes(q) ?? false;
      if (!matchName && !matchPhone && !matchService && !matchArea && !matchTopic && !matchMsg) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className={styles.view}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f46e5', background: '#eef2ff', padding: '3px 10px', borderRadius: '999px' }}>
              Admin Operations Center
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>• Real-Time Cloud Directory</span>
          </div>
          <h1 className={styles.title}>ServiceFinder Control Center</h1>
          <p className={styles.subtitle}>
            Inspect service provider credentials, approve neighborhood trades, and manage platform registrations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#1e293b',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <span>Refresh All Data</span>
            <span>↻</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        {metrics.map((m) => (
          <div key={m.label} className={styles.metricCard}>
            <div className={styles.metricIcon}>{m.icon}</div>
            <div className={styles.metricInfo}>
              <span className={styles.metricVal}>{m.value}</span>
              <span className={styles.metricLabel}>{m.label}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: m.badgeColor, marginTop: '2px' }}>
                {m.badgeText}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Auxiliary Status Pill Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', padding: '0 4px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Platform Summary:</span>
        <span style={{ fontSize: '12px', background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '8px', fontWeight: 700 }}>
          ⏳ {pendingCount} Pending Approvals
        </span>
        {editsPendingCount > 0 && (
          <span
            onClick={() => { setActiveSection('providers'); setStatusFilter('edits'); }}
            style={{ fontSize: '12px', background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', border: '1px solid #bfdbfe' }}
          >
            📝 {editsPendingCount} Profile Edit Requests (Action Required)
          </span>
        )}
        {pendingCallbacksCount > 0 && (
          <span
            onClick={() => { setActiveSection('callbacks'); setCallbackFilter('pending'); }}
            style={{ fontSize: '12px', background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', border: '1px solid #fecaca' }}
          >
            📞 {pendingCallbacksCount} Pending Calls (Action Needed)
          </span>
        )}
        <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '8px', fontWeight: 700 }}>
          ✓ {approvedCount} Active Approved
        </span>
        <span style={{ fontSize: '12px', background: '#f3e8ff', color: '#6b21a8', padding: '3px 10px', borderRadius: '8px', fontWeight: 700 }}>
          ⛔ {suspendedCount} Suspended
        </span>
        <span style={{ fontSize: '12px', background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: '8px', fontWeight: 700 }}>
          ✕ {rejectedCount} Rejected
        </span>
      </div>

      {/* Section Switcher (Providers vs Users vs Callbacks) */}
      <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '5px', borderRadius: '12px', width: 'fit-content' }}>
        <button
          type="button"
          onClick={() => setActiveSection('providers')}
          style={{
            padding: '8px 18px',
            borderRadius: '9px',
            border: 'none',
            background: activeSection === 'providers' ? '#ffffff' : 'transparent',
            color: activeSection === 'providers' ? '#0f172a' : '#64748b',
            fontWeight: activeSection === 'providers' ? 800 : 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: activeSection === 'providers' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🛠️ Service Provider Queue</span>
          <span style={{ background: activeSection === 'providers' ? '#4f46e5' : '#cbd5e1', color: '#ffffff', padding: '1px 7px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
            {providers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('users')}
          style={{
            padding: '8px 18px',
            borderRadius: '9px',
            border: 'none',
            background: activeSection === 'users' ? '#ffffff' : 'transparent',
            color: activeSection === 'users' ? '#0f172a' : '#64748b',
            fontWeight: activeSection === 'users' ? 800 : 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: activeSection === 'users' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>👥 Registered Users & Customers</span>
          <span style={{ background: activeSection === 'users' ? '#4f46e5' : '#cbd5e1', color: '#ffffff', padding: '1px 7px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('callbacks')}
          style={{
            padding: '8px 18px',
            borderRadius: '9px',
            border: 'none',
            background: activeSection === 'callbacks' ? '#ffffff' : 'transparent',
            color: activeSection === 'callbacks' ? '#0f172a' : '#64748b',
            fontWeight: activeSection === 'callbacks' ? 800 : 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: activeSection === 'callbacks' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📞 Support & Callbacks</span>
          <span
            style={{
              background: pendingCallbacksCount > 0 ? '#ef4444' : activeSection === 'callbacks' ? '#4f46e5' : '#cbd5e1',
              color: '#ffffff',
              padding: '1px 7px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {pendingCallbacksCount > 0 ? `${pendingCallbacksCount} New` : callbacks.length}
          </span>
        </button>
      </div>

      {/* ─── SECTION 1: PROVIDERS MANAGEMENT TABLE ─── */}
      {activeSection === 'providers' && (
        <div className={styles.tableCard}>
          {/* Header Row with Filter Controls */}
          <div className={styles.tableHeaderRow}>
            <div>
              <h2 className={styles.tableTitle}>Provider Registry & Verification Queue</h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Only manually approved providers are returned in public customer queries across Mumbai.
              </span>
            </div>
          </div>

          {/* Status Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', padding: '14px 24px 10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'pending', label: 'Pending Approvals', count: pendingCount, color: '#d97706' },
              { id: 'edits', label: 'Profile Edit Requests 📝', count: editsPendingCount, color: '#2563eb' },
              { id: 'approved', label: 'Approved Providers', count: approvedCount, color: '#16a34a' },
              { id: 'suspended', label: 'Suspended', count: suspendedCount, color: '#9333ea' },
              { id: 'rejected', label: 'Rejected', count: rejectedCount, color: '#dc2626' },
              { id: 'all', label: 'All Registered Pros', count: providers.length, color: '#4f46e5' },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as 'all' | 'pending' | 'approved' | 'rejected' | 'suspended' | 'edits')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: isActive ? `2px solid ${tab.color}` : '1px solid #e2e8f0',
                    background: isActive ? '#ffffff' : '#f8fafc',
                    color: isActive ? tab.color : '#64748b',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      background: isActive ? tab.color : '#cbd5e1',
                      color: '#ffffff',
                      borderRadius: '999px',
                      padding: '1px 7px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Area Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', padding: '0 24px 16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Search by provider name, trade, phone, email, or station…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ width: '200px' }}>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value="All">All Western Line Stations</option>
                {MUMBAI_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc} Station
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Wrap */}
          <div className={styles.tableWrap}>
            {loading ? (
              <p style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                Loading provider registrations from live Firestore…
              </p>
            ) : providers.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                  No service providers registered yet.
                </p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                  New applications submitted by trade specialists will automatically appear in this review queue.
                </p>
              </div>
            ) : filteredProviders.length === 0 ? (
              <p style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                No providers match the current filters (status: <strong>{statusFilter}</strong>, station: <strong>{selectedStation}</strong>).
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Provider Name & ID</th>
                    <th className={styles.th}>Contact Phone & WhatsApp</th>
                    <th className={styles.th}>Trade & Experience</th>
                    <th className={styles.th}>Mumbai Area</th>
                    <th className={styles.th}>Submitted Proof</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((p) => {
                    const status = p.status || 'pending';
                    const proof = p.workProof || p.submittedProof;
                    const initial = p.name ? p.name.charAt(0).toUpperCase() : 'P';
                    const appliedDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent';

                    return (
                      <tr key={p.id} className={styles.tr}>
                        {/* Provider Details */}
                        <td className={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: p.profileImage ? `url(${p.profileImage}) center/cover` : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '15px',
                                flexShrink: 0,
                              }}
                            >
                              {!p.profileImage && initial}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                              {p.email && (
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {p.email}
                                </div>
                              )}
                              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>
                                Applied: {appliedDate}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className={styles.td}>
                          <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>
                            <a href={`tel:${p.phone}`} style={{ color: '#1e293b', textDecoration: 'none' }}>
                              📞 {p.phone}
                            </a>
                          </div>
                          {p.whatsapp && (
                            <div style={{ fontSize: '11px', marginTop: '2px' }}>
                              <a
                                href={`https://wa.me/91${p.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}
                              >
                                💬 WhatsApp
                              </a>
                            </div>
                          )}
                        </td>

                        {/* Trade & Experience */}
                        <td className={styles.td}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.service || p.primaryService || 'General Trade'}</div>
                          {p.editPending && p.pendingUpdates?.service && p.pendingUpdates.service !== p.service && (
                            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 800, background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 6px', borderRadius: '4px', marginTop: '3px', display: 'inline-block' }}>
                              ➔ Edit to: <strong>{p.pendingUpdates.service}</strong>
                            </div>
                          )}
                          <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 600, marginTop: '2px' }}>
                            {p.experienceYears || 1} yrs experience
                            {p.editPending && p.pendingUpdates?.experienceYears !== undefined && p.pendingUpdates.experienceYears !== p.experienceYears && (
                              <span style={{ color: '#059669', marginLeft: '4px' }}>
                                (➔ {p.pendingUpdates.experienceYears} yrs)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className={styles.td}>
                          <div style={{ fontSize: '12px', color: '#334155', maxWidth: '160px' }}>
                            📍 {p.serviceAreas?.slice(0, 2).join(', ') || p.serviceArea || 'Mumbai'}
                            {(p.serviceAreas?.length || 0) > 2 ? ` (+${p.serviceAreas!.length - 2} more)` : ''}
                          </div>
                        </td>

                        {/* Submitted Proof */}
                        <td className={styles.td}>
                          {proof ? (
                            <div style={{ maxWidth: '140px' }}>
                              <span
                                style={{
                                  background: '#e0e7ff',
                                  color: '#3730a3',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  display: 'inline-block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '130px',
                                }}
                                title={proof}
                              >
                                📄 {proof}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>None provided</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <span
                              className={[
                                styles.badge,
                                status === 'approved'
                                  ? styles.badgeApproved
                                  : status === 'pending'
                                  ? styles.badgePending
                                  : status === 'suspended'
                                  ? styles.badgePending
                                  : styles.badgeRejected,
                              ].join(' ')}
                              style={{
                                background:
                                  status === 'approved'
                                    ? '#dcfce7'
                                    : status === 'pending'
                                    ? '#fef3c7'
                                    : status === 'suspended'
                                    ? '#f3e8ff'
                                    : '#fee2e2',
                                color:
                                  status === 'approved'
                                    ? '#166534'
                                    : status === 'pending'
                                    ? '#92400e'
                                    : status === 'suspended'
                                    ? '#6b21a8'
                                    : '#991b1b',
                              }}
                            >
                              {status.toUpperCase()}
                            </span>
                            {p.editPending && p.pendingUpdates && (
                              <span
                                style={{
                                  background: '#dbeafe',
                                  color: '#1e40af',
                                  padding: '2px 7px',
                                  borderRadius: '999px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  border: '1px solid #93c5fd',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                EDIT PENDING 📝
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className={styles.td} style={{ textAlign: 'right' }}>
                          <div className={styles.actionsCell} style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => setReviewingProvider(p)}
                              style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                borderRadius: '6px',
                                padding: '5px 9px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                              title="Inspect full details & proof"
                            >
                              VIEW 🔍
                            </button>

                            {p.editPending && p.pendingUpdates && (
                              <button
                                type="button"
                                onClick={() => handleApproveEdit(p.id, p.name)}
                                style={{
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  border: 'none',
                                  color: '#ffffff',
                                  borderRadius: '6px',
                                  padding: '5px 9px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                                }}
                                title="Confirm and publish edited trade profile to live directory"
                              >
                                CONFIRM EDIT ✓
                              </button>
                            )}

                            {status !== 'approved' && (
                              <button
                                type="button"
                                className={styles.btnApprove}
                                onClick={() => handleStatusChange(p.id, 'approved')}
                                title="Approve and publish to directory"
                              >
                                APPROVE
                              </button>
                            )}

                            {status === 'approved' && (
                              <button
                                type="button"
                                className={styles.btnReject}
                                style={{ background: '#d97706', borderColor: '#b45309', color: '#ffffff' }}
                                onClick={() => handleStatusChange(p.id, 'suspended')}
                                title="Temporarily suspend directory listing"
                              >
                                SUSPEND
                              </button>
                            )}

                            {status !== 'rejected' && (
                              <button
                                type="button"
                                className={styles.btnReject}
                                onClick={() => handleStatusChange(p.id, 'rejected')}
                                title="Reject application"
                              >
                                REJECT
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteProvider(p.id, p.name, p.uid, p.email)}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#94a3b8',
                                borderRadius: '6px',
                                padding: '5px 8px',
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                              title="Delete provider record"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─── SECTION 2: USERS & CUSTOMERS DIRECTORY TABLE ─── */}
      {activeSection === 'users' && (
        <div className={styles.tableCard}>
          <div className={styles.tableHeaderRow}>
            <div>
              <h2 className={styles.tableTitle}>Registered Accounts & Member Directory</h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                All customer, provider, and administrator accounts registered on ServiceFinder.
              </span>
            </div>
          </div>

          {/* Role Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', padding: '14px 24px 10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: 'All Platform Accounts', count: users.length, color: '#4f46e5' },
              { id: 'customer', label: 'Customers', count: users.filter((u) => u.role === 'customer').length, color: '#2563eb' },
              { id: 'provider', label: 'Providers', count: users.filter((u) => u.role === 'provider').length, color: '#059669' },
              { id: 'admin', label: 'Administrators', count: users.filter((u) => u.role === 'admin').length, color: '#7c3aed' },
            ].map((tab) => {
              const isActive = userRoleFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setUserRoleFilter(tab.id as 'all' | 'customer' | 'provider' | 'admin')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: isActive ? `2px solid ${tab.color}` : '1px solid #e2e8f0',
                    background: isActive ? '#ffffff' : '#f8fafc',
                    color: isActive ? tab.color : '#64748b',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      background: isActive ? tab.color : '#cbd5e1',
                      color: '#ffffff',
                      borderRadius: '999px',
                      padding: '1px 7px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ padding: '0 24px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <input
              type="text"
              placeholder="Search user accounts by name, email, phone, or UID…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '450px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Users Table */}
          <div className={styles.tableWrap}>
            {loading ? (
              <p style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                Loading user accounts…
              </p>
            ) : filteredUsers.length === 0 ? (
              <p style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                No user accounts found matching this filter.
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Member Name</th>
                    <th className={styles.th}>Email Address</th>
                    <th className={styles.th}>Account Role</th>
                    <th className={styles.th}>Contact Phone</th>
                    <th className={styles.th}>Registered Date</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isAdm = u.role === 'admin';
                    const isProv = u.role === 'provider';
                    const roleColor = isAdm ? '#7c3aed' : isProv ? '#059669' : '#2563eb';
                    const roleBg = isAdm ? '#f5f3ff' : isProv ? '#ecfdf5' : '#eff6ff';
                    const initial = u.name ? u.name.charAt(0).toUpperCase() : u.email ? u.email.charAt(0).toUpperCase() : 'U';

                    return (
                      <tr key={u.uid} className={styles.tr}>
                        <td className={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: u.photoURL ? `url(${u.photoURL}) center/cover` : isAdm ? '#4f46e5' : '#e2e8f0',
                                color: isAdm ? '#ffffff' : '#1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '14px',
                                flexShrink: 0,
                              }}
                            >
                              {!u.photoURL && initial}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                {u.name || 'Registered Member'}
                              </div>
                              <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                UID: {u.uid.slice(0, 12)}…
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className={styles.td}>
                          <div style={{ fontSize: '13px', color: '#1e293b' }}>
                            {u.email || 'No email provided'}
                          </div>
                        </td>

                        <td className={styles.td}>
                          <span
                            style={{
                              background: roleBg,
                              color: roleColor,
                              padding: '3px 9px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className={styles.td}>
                          <span style={{ fontSize: '12px', color: '#475569' }}>
                            {u.phone ? `📞 ${u.phone}` : '—'}
                          </span>
                        </td>

                        <td className={styles.td}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                          </span>
                        </td>

                        <td className={styles.td} style={{ textAlign: 'right' }}>
                          {!isAdm && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.uid, u.email || u.name || u.uid)}
                              style={{
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                color: '#991b1b',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                              title="Delete user record"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─── SECTION 3: CALLBACK & SUPPORT INQUIRIES DESK ─── */}
      {activeSection === 'callbacks' && (
        <div className={styles.tableCard}>
          {/* Header Row with Filter Controls */}
          <div className={styles.tableHeaderRow}>
            <div>
              <h2 className={styles.tableTitle}>Support & Callback Inquiries Desk 📞</h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Review, manage, and call back service providers and customers requesting assistance along the Western Railway Line.
              </span>
            </div>
          </div>

          {/* Status Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', padding: '14px 24px 10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: 'All Inquiries', count: callbacks.length, color: '#4f46e5' },
              { id: 'pending', label: 'Pending Calls ⏳', count: pendingCallbacksCount, color: '#dc2626' },
              { id: 'provider', label: 'Provider Support Calls ⚡', count: providerCallbacksCount, color: '#7c3aed' },
              { id: 'customer', label: 'Customer Callbacks 👤', count: customerCallbacksCount, color: '#2563eb' },
              { id: 'resolved', label: 'Resolved ✅', count: resolvedCallbacksCount, color: '#16a34a' },
            ].map((tab) => {
              const isActive = callbackFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCallbackFilter(tab.id as any)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: isActive ? `2px solid ${tab.color}` : '1px solid #e2e8f0',
                    background: isActive ? '#ffffff' : '#f8fafc',
                    color: isActive ? tab.color : '#64748b',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      background: isActive ? tab.color : '#cbd5e1',
                      color: '#ffffff',
                      borderRadius: '999px',
                      padding: '1px 7px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Station Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', padding: '0 24px 16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Search by name, phone, trade, station, topic, or message notes…"
                value={callbackSearch}
                onChange={(e) => setCallbackSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ width: '200px' }}>
              <select
                value={callbackStation}
                onChange={(e) => setCallbackStation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="All">All Western Line Stations</option>
                {MUMBAI_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Content */}
          <div className={styles.tableWrapper}>
            {filteredCallbacks.length === 0 ? (
              <div className={styles.emptyState}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>📞</span>
                <p style={{ fontWeight: 600, margin: 0 }}>
                  No callback or support inquiries match the current filter.
                </p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Contact / User</th>
                    <th className={styles.th}>Phone & Direct Action</th>
                    <th className={styles.th}>Station & Trade</th>
                    <th className={styles.th}>Inquiry Topic / Message</th>
                    <th className={styles.th}>Received</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCallbacks.map((item) => {
                    const isProv = item.role === 'provider';
                    const isPending = item.status === 'pending';
                    const isInProgress = item.status === 'in_progress';
                    const isResolved = item.status === 'resolved';

                    const cleanPhone = item.phone.replace(/[^0-9]/g, '');
                    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                    const whatsappMsg = encodeURIComponent(
                      `Hello ${item.name}, this is ServiceFinder Operations regarding your ${item.service} callback request for ${item.area}. How may we assist you?`
                    );

                    return (
                      <tr
                        key={item.id}
                        className={styles.tr}
                        style={{
                          background: isPending ? '#fffdf5' : undefined,
                        }}
                      >
                        {/* Name & Role */}
                        <td className={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>
                                {item.name}
                              </div>
                              <span
                                style={{
                                  display: 'inline-block',
                                  marginTop: '3px',
                                  background: isProv ? '#ede9fe' : '#e0f2fe',
                                  color: isProv ? '#6d28d9' : '#0369a1',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                }}
                              >
                                {isProv ? '⚡ PROVIDER' : '👤 CUSTOMER'}
                              </span>
                              {item.email && (
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                  {item.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone & Direct Call/WhatsApp */}
                        <td className={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <a
                              href={`tel:${item.phone}`}
                              style={{
                                fontSize: '13px',
                                fontWeight: 800,
                                color: '#2563eb',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span>📞</span>
                              <span>{item.phone}</span>
                            </a>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                              <a
                                href={`tel:${item.phone}`}
                                style={{
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                }}
                                title="Call directly"
                              >
                                📞 Call
                              </a>
                              <a
                                href={`https://wa.me/${fullPhone}?text=${whatsappMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  color: '#15803d',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                }}
                                title="Chat on WhatsApp"
                              >
                                💬 WhatsApp
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Station & Trade */}
                        <td className={styles.td}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                            📍 {item.area}
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                            🔧 {item.service}
                          </div>
                        </td>

                        {/* Topic / Message */}
                        <td className={styles.td} style={{ maxWidth: '280px' }}>
                          {item.inquiryTopic && (
                            <div
                              style={{
                                display: 'inline-block',
                                background: '#f1f5f9',
                                color: '#334155',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                marginBottom: '4px',
                              }}
                            >
                              📌 {item.inquiryTopic}
                            </div>
                          )}
                          {item.message ? (
                            <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
                              "{item.message}"
                            </div>
                          ) : (
                            <div style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                              No additional notes provided.
                            </div>
                          )}
                        </td>

                        {/* Received At */}
                        <td className={styles.td}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {item.createdAt ? new Date(item.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className={styles.td}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 9px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background: isPending ? '#fef3c7' : isInProgress ? '#dbeafe' : isResolved ? '#dcfce7' : '#f1f5f9',
                              color: isPending ? '#92400e' : isInProgress ? '#1e40af' : isResolved ? '#166534' : '#475569',
                            }}
                          >
                            <span>{isPending ? '⏳' : isInProgress ? '🔄' : isResolved ? '✓' : '✕'}</span>
                            <span>{item.status.replace('_', ' ')}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className={styles.td} style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleUpdateCallbackStatus(item.id, 'in_progress')}
                                style={{
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title="Mark as being handled"
                              >
                                🔄 In Progress
                              </button>
                            )}

                            {!isResolved ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateCallbackStatus(item.id, 'resolved')}
                                style={{
                                  background: '#dcfce7',
                                  border: '1px solid #86efac',
                                  color: '#166534',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title="Mark as resolved / completed"
                              >
                                ✓ Resolved
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateCallbackStatus(item.id, 'pending')}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#475569',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title="Re-open request"
                              >
                                ⏳ Re-open
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteCallback(item.id, item.name)}
                              style={{
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                color: '#991b1b',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                              title="Delete request"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─── Provider Application Review Modal ─── */}
      {reviewingProvider && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setReviewingProvider(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setReviewingProvider(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              ✕
            </button>

            {/* Header with Photo & Status */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: reviewingProvider.profileImage ? `url(${reviewingProvider.profileImage}) center/cover` : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '24px',
                  flexShrink: 0,
                  border: '2px solid #e2e8f0',
                }}
              >
                {!reviewingProvider.profileImage && (reviewingProvider.name ? reviewingProvider.name.charAt(0).toUpperCase() : '🛠️')}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {reviewingProvider.name}
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: reviewingProvider.status === 'approved' ? '#dcfce7' : reviewingProvider.status === 'pending' ? '#fef3c7' : '#fee2e2',
                      color: reviewingProvider.status === 'approved' ? '#166534' : reviewingProvider.status === 'pending' ? '#92400e' : '#991b1b',
                    }}
                  >
                    {reviewingProvider.status?.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 700, marginTop: '2px' }}>
                  {reviewingProvider.service || reviewingProvider.primaryService} • {reviewingProvider.experienceYears} Years Experience
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Application ID: {reviewingProvider.id}
                </div>
              </div>
            </div>

            {/* Pending Profile Edit Confirmation Card */}
            {reviewingProvider.editPending && reviewingProvider.pendingUpdates && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '2px solid #22c55e',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  marginBottom: '20px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.12)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>📝</span>
                    <strong style={{ fontSize: '15px', color: '#166534' }}>
                      Profile Edit Request Awaiting Admin Confirmation
                    </strong>
                  </div>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '999px', fontWeight: 800, border: '1px solid #86efac' }}>
                    EDIT PENDING
                  </span>
                </div>

                <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                  The provider submitted changes to their professional listing. Review the proposed details below and click <strong>"CONFIRM & PUBLISH EDIT"</strong> to update the live public directory.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', fontSize: '13px' }}>
                  {/* Profession / Trade */}
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <span style={{ color: '#64748b', fontWeight: 700, fontSize: '11px', display: 'block', marginBottom: '4px' }}>TRADE / PROFESSION:</span>
                    <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{reviewingProvider.service || reviewingProvider.primaryService}</span>
                    <span style={{ margin: '0 8px', color: '#16a34a', fontWeight: 800 }}>➔</span>
                    <strong style={{ color: '#15803d', fontSize: '14px' }}>{reviewingProvider.pendingUpdates.service}</strong>
                  </div>

                  {/* Experience */}
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <span style={{ color: '#64748b', fontWeight: 700, fontSize: '11px', display: 'block', marginBottom: '4px' }}>EXPERIENCE:</span>
                    <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{reviewingProvider.experienceYears} yrs</span>
                    <span style={{ margin: '0 8px', color: '#16a34a', fontWeight: 800 }}>➔</span>
                    <strong style={{ color: '#15803d', fontSize: '14px' }}>{reviewingProvider.pendingUpdates.experienceYears} yrs</strong>
                  </div>

                  {/* Skills */}
                  {reviewingProvider.pendingUpdates.skills && reviewingProvider.pendingUpdates.skills.length > 0 && (
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0', gridColumn: '1 / -1' }}>
                      <span style={{ color: '#64748b', fontWeight: 700, fontSize: '11px', display: 'block', marginBottom: '6px' }}>NEW REQUESTED SKILLS:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {reviewingProvider.pendingUpdates.skills.map((s) => (
                          <span key={s} style={{ background: '#dcfce7', color: '#166534', fontWeight: 700, padding: '3px 9px', borderRadius: '6px', fontSize: '12px' }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Areas */}
                  {reviewingProvider.pendingUpdates.serviceAreas && reviewingProvider.pendingUpdates.serviceAreas.length > 0 && (
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0', gridColumn: '1 / -1' }}>
                      <span style={{ color: '#64748b', fontWeight: 700, fontSize: '11px', display: 'block', marginBottom: '4px' }}>NEW SERVICE STATIONS:</span>
                      <strong style={{ color: '#0f172a' }}>📍 {reviewingProvider.pendingUpdates.serviceAreas.join(', ')}</strong>
                    </div>
                  )}

                  {/* Work Proof */}
                  {(reviewingProvider.pendingUpdates.workProof || reviewingProvider.pendingUpdates.submittedProof) && (
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0', gridColumn: '1 / -1' }}>
                      <span style={{ color: '#64748b', fontWeight: 700, fontSize: '11px', display: 'block', marginBottom: '4px' }}>UPDATED TRADE PROOF:</span>
                      <div style={{ wordBreak: 'break-all', fontWeight: 600, color: '#1e293b' }}>
                        📄 {reviewingProvider.pendingUpdates.workProof || reviewingProvider.pendingUpdates.submittedProof}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {reviewingProvider.pendingUpdates.description && (
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0', gridColumn: '1 / -1' }}>
                      <span style={{ color: '#64748b', fontWeight: 700, fontSize: '11px', display: 'block', marginBottom: '4px' }}>UPDATED DESCRIPTION:</span>
                      <p style={{ margin: 0, color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{reviewingProvider.pendingUpdates.description}"
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleApproveEdit(reviewingProvider.id, reviewingProvider.name);
                    }}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '11px 18px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 3px 8px rgba(22, 163, 74, 0.3)',
                    }}
                  >
                    ✓ CONFIRM & PUBLISH EDIT
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleRejectEdit(reviewingProvider.id, reviewingProvider.name);
                    }}
                    style={{
                      background: '#ffffff',
                      color: '#dc2626',
                      border: '1.5px solid #fca5a5',
                      borderRadius: '10px',
                      padding: '11px 18px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✕ REJECT EDIT
                  </button>
                </div>
              </div>
            )}

            {/* Admin Manual Review Notice */}
            <div
              style={{
                background: '#fffdf5',
                border: '1.5px solid #fde68a',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '12px',
                color: '#92400e',
                lineHeight: 1.5,
              }}
            >
              <strong>🛡️ Admin Review Directive:</strong> Inspect the submitted trade experience, phone contact, and proof credentials. Approved providers will be displayed immediately to customers searching on the Western Line.
            </div>

            {/* Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>CONTACT PHONE</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>📞 {reviewingProvider.phone}</span>
                <div style={{ marginTop: '4px' }}>
                  <a href={`tel:${reviewingProvider.phone}`} style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 700 }}>
                    Call Provider ↗
                  </a>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>WHATSAPP NUMBER</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>💬 {reviewingProvider.whatsapp || reviewingProvider.phone}</span>
                <div style={{ marginTop: '4px' }}>
                  <a
                    href={`https://wa.me/91${(reviewingProvider.whatsapp || reviewingProvider.phone).replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}
                  >
                    Open Chat ↗
                  </a>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>EMAIL ADDRESS</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>✉️ {reviewingProvider.email || 'None on file'}</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>SKILLS & SPECIALTIES</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {reviewingProvider.skills && reviewingProvider.skills.length > 0 ? (
                    reviewingProvider.skills.map((s) => (
                      <span key={s} style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                        {s}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>General trade skills</span>
                  )}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>MUMBAI SERVICE STATIONS</span>
                <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  📍 {reviewingProvider.serviceAreas?.join(', ') || reviewingProvider.serviceArea || 'Western Line, Mumbai'}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>SUBMITTED TRADE PROOF</span>
                {reviewingProvider.workProof || reviewingProvider.submittedProof ? (
                  <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600, wordBreak: 'break-all' }}>
                    📄 {reviewingProvider.workProof || reviewingProvider.submittedProof}
                    {((reviewingProvider.workProof || reviewingProvider.submittedProof)?.startsWith('http')) && (
                      <div style={{ marginTop: '6px' }}>
                        <a
                          href={reviewingProvider.workProof || reviewingProvider.submittedProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#4f46e5',
                            fontSize: '12px',
                            fontWeight: 700,
                            textDecoration: 'underline',
                          }}
                        >
                          Open Submitted Link ↗
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                    No certificate or document URL submitted.
                  </span>
                )}
              </div>

              {reviewingProvider.description && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>DESCRIPTION</span>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                    "{reviewingProvider.description}"
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons: APPROVE, PENDING, SUSPEND, REJECT, DELETE */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={async () => {
                  await handleStatusChange(reviewingProvider.id, 'approved');
                  setReviewingProvider(null);
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 3px 8px rgba(22, 163, 74, 0.3)',
                }}
              >
                ✓ APPROVE TO DIRECTORY
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleStatusChange(reviewingProvider.id, 'pending');
                  setReviewingProvider(null);
                }}
                style={{
                  background: '#f8fafc',
                  color: '#d97706',
                  border: '1.5px solid #fde68a',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ⏳ PENDING
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleStatusChange(reviewingProvider.id, 'suspended');
                  setReviewingProvider(null);
                }}
                style={{
                  background: '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ⛔ SUSPEND
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleStatusChange(reviewingProvider.id, 'rejected');
                  setReviewingProvider(null);
                }}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ✕ REJECT
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleDeleteProvider(
                    reviewingProvider.id,
                    reviewingProvider.name,
                    reviewingProvider.uid,
                    reviewingProvider.email
                  );
                }}
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🗑️ DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
