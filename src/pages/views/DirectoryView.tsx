import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../store/appState';
import { SERVICE_NAMES } from '../../constants/services';
import { MUMBAI_LOCATIONS } from '../../constants/locations';
import { ProviderCard } from '../../components/ui/ProviderCard';
import { ProviderDetailsModal } from '../../components/ui/ProviderDetailsModal';
import { GlowButton } from '../../components/ui/GlowButton';
import { getApprovedProviders } from '../../lib/directoryService';
import type { Provider } from '../../types';
import styles from './DirectoryView.module.css';

export const DirectoryView: React.FC = () => {
  const { state, setView, setArea } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>(state.selectedArea || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProvider, setModalProvider] = useState<Provider | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApprovedProviders(selectedCategory, selectedArea);
      setProviders(data);
    } catch (err) {
      console.error('Failed to load directory providers:', err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedArea]);

  useEffect(() => {
    let isMounted = true;
    getApprovedProviders(selectedCategory, selectedArea)
      .then((data) => {
        if (isMounted) {
          setProviders(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProviders([]);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [selectedCategory, selectedArea]);

  const filteredProviders = providers.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.businessName && p.businessName.toLowerCase().includes(q)) ||
      p.service.toLowerCase().includes(q) ||
      p.serviceArea.toLowerCase().includes(q) ||
      p.skills?.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <h1 className={styles.title}>Service Directory</h1>
        <p className={styles.subtitle}>
          Browse approved neighbourhood professionals across the Mumbai Western Line corridor. Connect directly via call or WhatsApp.
        </p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by trade, specialist name, or skill (e.g. Electrician, pipe, lock)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.cityInputWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <select
              className={styles.cityInput}
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setArea(e.target.value);
              }}
              style={{ cursor: 'pointer', fontWeight: 600 }}
              aria-label="Select Mumbai Location"
            >
              <option value="">All Mumbai Western Line</option>
              {MUMBAI_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category horizontal scroll */}
        <div className={styles.categoriesScroll}>
          <button
            type="button"
            className={[
              styles.categoryChip,
              selectedCategory === 'All' ? styles.categoryChipActive : '',
            ].join(' ')}
            onClick={() => setSelectedCategory('All')}
          >
            ✦ All Categories
          </button>
          {SERVICE_NAMES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={[
                styles.categoryChip,
                selectedCategory === cat ? styles.categoryChipActive : '',
              ].join(' ')}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Controls info row */}
        <div className={styles.controlsRow}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Operating strictly along Mumbai Western Line corridor
            </span>
          </div>

          <span className={styles.countLabel}>
            Showing {filteredProviders.length} approved provider{filteredProviders.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Providers Grid or Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p style={{ fontWeight: 600 }}>Loading verified providers…</p>
        </div>
      ) : filteredProviders.length > 0 ? (
        <div className={styles.grid}>
          {filteredProviders.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              selectedArea={selectedArea}
              onViewDetails={(prov) => setModalProvider(prov)}
            />
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-pure)',
          border: '1.5px dashed var(--border-md)',
          borderRadius: 'var(--r-2xl)',
          padding: 'var(--space-12) var(--space-6)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <div style={{ fontSize: '2.5rem' }}>📍</div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {selectedCategory !== 'All' && selectedArea
              ? `No ${selectedCategory} providers are currently listed in ${selectedArea}.`
              : 'No service providers found'}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', maxWidth: '440px', margin: 0 }}>
            Try another service or select another Mumbai area. Or be the first professional to join ServiceFinder in this area.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedArea('');
                setSelectedCategory('All');
                setArea('');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--border-md)',
                background: 'var(--bg)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
              }}
            >
              Reset Filters
            </button>
            {!state.user && (
              <GlowButton
                onClick={() => setView('onboarding')}
                size="sm"
              >
                Become a Service Provider →
              </GlowButton>
            )}
          </div>
        </div>
      )}

      {/* Provider Details Modal */}
      {modalProvider && (
        <ProviderDetailsModal
          provider={modalProvider}
          selectedArea={selectedArea}
          onClose={() => setModalProvider(null)}
          onReviewSubmitted={() => fetchProviders()}
        />
      )}
    </div>
  );
};

export default DirectoryView;
