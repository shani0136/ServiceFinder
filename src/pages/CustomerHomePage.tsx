import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../store/appState';
import { useVoice } from '../hooks/useVoice';
import { CORE_SERVICES } from '../constants/services';
import { MUMBAI_LOCATIONS } from '../constants/locations';
import { getApprovedProviders } from '../lib/directoryService';
import { classifyProblem } from '../lib/gemini';
import { ProviderCard } from '../components/ui/ProviderCard';
import { ProviderDetailsModal } from '../components/ui/ProviderDetailsModal';
import { AiDiagnosisCard } from '../components/AiDiagnosisCard';
import { Footer } from '../components/layout/Footer';
import type { Provider, PublicView, ClassifyResponse } from '../types';
import logoImg from '../assets/logo.png';
import styles from './CustomerHomePage.module.css';

interface CustomerHomePageProps {
  onNavigate: (view: PublicView) => void;
  onLogout: () => void;
}

export const CustomerHomePage: React.FC<CustomerHomePageProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { state, setArea, setProblemText, addToast } = useApp();
  const user = state.user;

  // Search & Filter State
  const [problemInput, setProblemInput] = useState(state.problemText || '');
  const [selectedArea, setSelectedArea] = useState<string>(state.selectedArea || 'Borivali');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiDiagnosedService, setAiDiagnosedService] = useState<string | null>(null);
  const [aiDiagnosis, setAiDiagnosis] = useState<ClassifyResponse | null>(null);

  // Results State (STRICTLY APPROVED PROVIDERS ONLY)
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalProvider, setActiveModalProvider] = useState<Provider | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice Search Hook
  const { isListening, isSupported, start, stop } = useVoice((transcript: string) => {
    setProblemInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  // Query Approved Providers from Directory & Firestore
  const fetchProviders = useCallback(async (serviceCategory?: string, locationArea?: string) => {
    setLoading(true);
    try {
      const activeService = serviceCategory ?? selectedCategory;
      const activeArea = locationArea ?? selectedArea;
      const data = await getApprovedProviders(activeService, activeArea);
      setProviders(data);
    } catch (err) {
      console.error('[CustomerHome] Error fetching approved providers:', err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedArea]);

  // Initial Load & Filter Changes
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

  // Real-time synchronization across browser tabs
  useEffect(() => {
    const handleDirectoryChange = () => {
      fetchProviders(selectedCategory, selectedArea);
    };

    window.addEventListener('sf_directory_updated', handleDirectoryChange);
    window.addEventListener('storage', handleDirectoryChange);
    return () => {
      window.removeEventListener('sf_directory_updated', handleDirectoryChange);
      window.removeEventListener('storage', handleDirectoryChange);
    };
  }, [fetchProviders, selectedCategory, selectedArea]);

  // Location Change
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextArea = e.target.value;
    setSelectedArea(nextArea);
    setArea(nextArea);
    if (nextArea && nextArea !== 'All') {
      addToast(`Showing specialists in ${nextArea}, Mumbai Western Line`, 'info');
    }
  };

  // Category Chip Selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setAiDiagnosedService(null);
    setAiDiagnosis(null);
  };

  // Problem Search & Gemini AI Intent Classification
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryText = problemInput.trim();
    if (!queryText) {
      addToast('Please describe the problem or choose a trade service below.', 'info');
      textareaRef.current?.focus();
      return;
    }

    setIsDiagnosing(true);
    setProblemText(queryText);

    try {
      // Step 1: Gemini AI classifies customer problem into 1 of the 14 everyday service categories
      const result = await classifyProblem(queryText);
      const diagnosedCat = result.serviceCategory;
      setAiDiagnosis(result);
      setAiDiagnosedService(diagnosedCat);
      setSelectedCategory(diagnosedCat);

      addToast(`Identified trade service: ${diagnosedCat}`, 'success');

      // Step 2: Query approved providers in the selected Mumbai location
      await fetchProviders(diagnosedCat, selectedArea);
    } catch {
      addToast('Showing available local specialists.', 'info');
      await fetchProviders(selectedCategory, selectedArea);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ─── Top Navigation Bar ─── */}
      <header className={styles.topNav}>
        <div className={styles.navContainer}>
          {/* Brand */}
          <button
            type="button"
            className={styles.brandGroup}
            onClick={() => onNavigate('customer_home')}
            aria-label="ServiceFinder Customer Home"
          >
            <img src={logoImg} alt="ServiceFinder" className={styles.brandLogo} />
            <div>
              <span className={styles.brandTitle}>ServiceFinder</span>
              <span className={styles.brandSub}>Mumbai Western Line Directory</span>
            </div>
          </button>

          {/* Controls: Mumbai Location & User Account */}
          <div className={styles.navRight}>
            {/* Quick Link to Public Overview */}
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => onNavigate('home')}
              title="View public overview"
            >
              Public Home
            </button>

            {/* Mumbai Western Line Corridor Selector */}
            <div className={styles.locationPicker} title="Select Mumbai area along Western Line corridor">
              <span>📍</span>
              <select
                className={styles.locationSelect}
                value={selectedArea}
                onChange={handleLocationChange}
                aria-label="Select Mumbai location"
              >
                <option value="All">All Western Line</option>
                {MUMBAI_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* User Chip */}
            <div className={styles.userChip}>
              <div className={styles.avatar}>
                {(user?.name ?? user?.email ?? 'C').charAt(0).toUpperCase()}
              </div>
              <span className={styles.userName}>{user?.name || 'Customer'}</span>
              <span className={styles.roleBadge}>Customer</span>
            </div>

            {/* Logout */}
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={onLogout}
              title="Sign out of ServiceFinder"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Hero Section ─── */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroHeading}>
            Find a trusted local service provider
          </h1>

          <p className={styles.heroSub}>
            Discover verified neighbourhood professionals along Mumbai's Western Line corridor. No middlemen, no booking fees — connect directly via Call or WhatsApp.
          </p>

          {/* ─── AI Problem Search Omnibar ─── */}
          <div className={styles.searchCard}>
            <div className={styles.inputRow}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                rows={2}
                placeholder={'What do you need help with? (e.g. "Bathroom pipe is leaking", "AC cooling nahi kar raha", "Bike not starting", "Switch spark ho raha hai")...'}
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
              />

              {isSupported && (
                <button
                  type="button"
                  className={[styles.voiceBtn, isListening ? styles.voiceBtnActive : ''].join(' ')}
                  onClick={isListening ? stop : start}
                  title={isListening ? 'Stop voice input' : 'Speak problem description'}
                  aria-label="Voice input"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
              )}
            </div>

            <div className={styles.searchControls}>
              <div className={styles.locationInBar}>
                <span>Station:</span>
                <select
                  className={styles.locationSelect}
                  value={selectedArea}
                  onChange={handleLocationChange}
                >
                  <option value="All">All 23 Stations</option>
                  {MUMBAI_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className={styles.findBtn}
                onClick={handleSearch}
                disabled={isDiagnosing || loading}
              >
                {isDiagnosing ? 'Diagnosing Trade…' : 'Find Providers →'}
              </button>
            </div>
          </div>

          {/* AI Diagnosis & Recommended Solution Card */}
          {aiDiagnosis ? (
            <div style={{ marginTop: '20px' }}>
              <AiDiagnosisCard
                diagnosis={aiDiagnosis}
                userQuery={problemInput}
                stationName={selectedArea}
                onDismiss={() => {
                  setAiDiagnosis(null);
                  setAiDiagnosedService(null);
                }}
                onViewAllCorridor={() => {
                  setSelectedArea('All');
                  setArea('All');
                  fetchProviders(selectedCategory, 'All');
                }}
              />
            </div>
          ) : aiDiagnosedService ? (
            <div className={styles.aiDiagnosisBanner}>
              <div>
                ✦ AI Diagnosed Trade: <span className={styles.aiBadge}>{aiDiagnosedService}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAiDiagnosedService(null);
                  setSelectedCategory('All');
                  fetchProviders('All', selectedArea);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear filter
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {/* ─── 14 Everyday Services Horizontal Carousel ─── */}
      <section className={styles.categorySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Common Everyday Services</h2>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Operating along Mumbai Western Line
          </span>
        </div>

        <div className={styles.categoryScroll}>
          <button
            type="button"
            className={[
              styles.categoryChip,
              selectedCategory === 'All' ? styles.categoryChipActive : '',
            ].join(' ')}
            onClick={() => handleCategorySelect('All')}
          >
            <span>✦</span> All Services
          </button>

          {CORE_SERVICES.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                className={[styles.categoryChip, isSelected ? styles.categoryChipActive : ''].join(' ')}
                onClick={() => handleCategorySelect(cat.label)}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Provider Results Main Section ─── */}
      <main className={styles.mainContent}>
        <div className={styles.resultsBar}>
          <h3 className={styles.resultsCount}>
            {loading
              ? 'Searching approved specialists…'
              : `${providers.length} Approved Specialist${providers.length === 1 ? '' : 's'} Listed`}
          </h3>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className={styles.activeFilterPill}>
              Trade: {selectedCategory}
            </span>
            <span className={styles.activeFilterPill}>
              Area: {selectedArea === 'All' ? 'Mumbai Western Line' : `${selectedArea}, Mumbai`}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <p style={{ fontWeight: 600 }}>Loading verified providers…</p>
          </div>
        ) : providers.length > 0 ? (
          /* Provider Grid */
          <div className={styles.providerGrid}>
            {providers.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                problemSummary={problemInput || p.service}
                selectedArea={selectedArea === 'All' ? p.serviceArea : selectedArea}
                onViewDetails={(prov) => setActiveModalProvider(prov)}
              />
            ))}
          </div>
        ) : (
          /* Clean Empty State for Approved Providers */
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📍</div>
            <h4 className={styles.emptyTitle}>No approved providers found in this area.</h4>
            <p className={styles.emptyDesc}>
              No approved {selectedCategory !== 'All' ? selectedCategory : 'service'} providers are currently listed in {selectedArea === 'All' ? 'the selected area' : selectedArea}. All listed professionals undergo phone OTP verification and administrator review.
            </p>
            <div className={styles.emptyCta}>
              <button
                type="button"
                className={styles.btnResetFilters}
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedArea('All');
                  setProblemInput('');
                  setAiDiagnosedService(null);
                  fetchProviders('All', 'All');
                }}
              >
                Show All Western Line
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ─── Provider Details Modal ─── */}
      {activeModalProvider && (
        <ProviderDetailsModal
          provider={activeModalProvider}
          selectedArea={selectedArea === 'All' ? activeModalProvider.serviceArea : selectedArea}
          problemSummary={problemInput || activeModalProvider.service}
          onClose={() => setActiveModalProvider(null)}
          onReviewSubmitted={() => {
            fetchProviders(selectedCategory, selectedArea);
          }}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigate={onNavigate}
        onRegister={() => onNavigate('provider')}
      />
    </div>
  );
};
