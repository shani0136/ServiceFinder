import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SERVICE_NAMES } from '../constants/services';
import { MUMBAI_LOCATIONS } from '../constants/locations';
import { ProviderCard } from '../components/ui/ProviderCard';
import { ProviderDetailsModal } from '../components/ui/ProviderDetailsModal';
import { GlowButton } from '../components/ui/GlowButton';
import { AiDiagnosisCard } from '../components/AiDiagnosisCard';
import { getApprovedProviders } from '../lib/directoryService';
import { classifyProblem } from '../lib/gemini';
import { useApp } from '../store/appState';
import { OnboardingView } from './views/OnboardingView';
import type { Provider, PublicView, ClassifyResponse } from '../types';

interface ProvidersPageProps {
  onNavigate: (view: PublicView) => void;
  onSignIn: () => void;
}

export const ProvidersPage: React.FC<ProvidersPageProps> = ({ onNavigate, onSignIn }) => {
  const { state, setArea, setProblemText } = useApp();

  const [category, setCategory] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>(state.selectedArea || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiDiagnosis, setAiDiagnosis] = useState<ClassifyResponse | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [allAreaProviders, setAllAreaProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalProvider, setActiveModalProvider] = useState<Provider | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAiDiagnosing, setIsAiDiagnosing] = useState(false);

  // Sync selected location from global store if changed
  useEffect(() => {
    if (state.selectedArea) {
      Promise.resolve().then(() => {
        setSelectedArea((prev) => (prev !== state.selectedArea ? state.selectedArea : prev));
      });
    }
  }, [state.selectedArea]);

  // If a problem text was submitted from hero, classify it and generate AI Solution
  useEffect(() => {
    let isMounted = true;
    if (state.problemText) {
      const pText = state.problemText.trim();
      const directMatch = SERVICE_NAMES.find(
        (s) => pText.toLowerCase() === s.toLowerCase() || pText.toLowerCase() === `${s.toLowerCase()} service`
      );

      if (directMatch) {
        Promise.resolve().then(() => {
          if (isMounted) {
            setCategory(directMatch);
            setSearchQuery('');
          }
        });
      } else if (pText.length > 2) {
        Promise.resolve().then(() => {
          if (isMounted) setIsAiDiagnosing(true);
        });
        classifyProblem(pText)
          .then((res) => {
            if (isMounted) {
              if (res.serviceCategory) {
                setCategory(res.serviceCategory);
              }
              setAiDiagnosis(res);
              setSearchQuery(''); // Never pollute provider name/keyword filter with natural language problem sentence!
              setIsAiDiagnosing(false);
            }
          })
          .catch(() => {
            if (isMounted) setIsAiDiagnosing(false);
          });
      }
    }
    return () => { isMounted = false; };
  }, [state.problemText]);

  // Load approved providers for the specific category & area
  const loadProviders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApprovedProviders(category, selectedArea);
      setProviders(data);
    } catch (err) {
      console.error('Failed to load approved providers:', err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [category, selectedArea]);

  useEffect(() => {
    let isMounted = true;
    getApprovedProviders(category, selectedArea)
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
  }, [category, selectedArea]);

  // Smart fallback: When a specific area is chosen, also query all providers in this category across Western Line
  useEffect(() => {
    let isMounted = true;
    if (category && category !== 'All' && selectedArea && selectedArea !== 'All') {
      getApprovedProviders(category, 'All')
        .then((data) => {
          if (isMounted) {
            // Filter out those that already match selectedArea
            const target = selectedArea.toLowerCase();
            const nearby = data.filter((p) => {
              const inPrimary = p.serviceArea?.toLowerCase() === target;
              const inMulti = p.serviceAreas && p.serviceAreas.some((a) => a.toLowerCase() === target);
              return !inPrimary && !inMulti;
            });
            setAllAreaProviders(nearby);
          }
        })
        .catch(() => {
          if (isMounted) setAllAreaProviders([]);
        });
    } else {
      setAllAreaProviders([]);
    }
    return () => { isMounted = false; };
  }, [category, selectedArea]);

  // Filter with client-side keyword search (name, skills)
  const filtered = providers.filter((p) => {
    if (!p) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = p.name ? p.name.toLowerCase().includes(q) : false;
    const matchBiz = p.businessName ? p.businessName.toLowerCase().includes(q) : false;
    const matchService = p.service ? p.service.toLowerCase().includes(q) : false;
    const matchArea = p.serviceArea ? p.serviceArea.toLowerCase().includes(q) : false;
    const matchSkills = p.skills && Array.isArray(p.skills) ? p.skills.some((s) => s && s.toLowerCase().includes(q)) : false;
    return matchName || matchBiz || matchService || matchArea || matchSkills;
  });

  return (
    <>
      <Navbar
        currentView="providers"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onRegister={() => onNavigate('provider')}
      />

      <main style={{ minHeight: '100dvh', paddingTop: 'clamp(24px, 3.5vw, 40px)', paddingBottom: 'var(--space-20)' }}>
        <div className="container">
          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto var(--space-8)' }}>
            <span style={{
              display: 'inline-block',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
              Local Service Directory · Mumbai
            </span>
            <h1 style={{ fontSize: 'clamp(1.85rem, 4.5vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
              Service Providers
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-base)', marginTop: '8px' }}>
              Connect directly with genuine local technicians along the Western Line corridor. Discuss jobs and arrange service directly.
            </p>
          </div>

          {/* AI Diagnosing Spinner Banner */}
          {isAiDiagnosing && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.95) 0%, rgba(245, 243, 255, 0.98) 100%)',
              border: '1.5px solid rgba(129, 140, 248, 0.4)',
              borderRadius: '20px',
              padding: '18px 24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.1)',
            }}>
              <div style={{ fontSize: '24px' }}>✨</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e1b4b' }}>
                  Gemini AI is diagnosing your problem and preparing solution...
                </div>
                <div style={{ fontSize: '13px', color: '#6366f1', marginTop: '2px' }}>
                  "{state.problemText}"
                </div>
              </div>
            </div>
          )}

          {/* AI Problem Diagnosis & Solution Card */}
          {aiDiagnosis && (
            <AiDiagnosisCard
              diagnosis={aiDiagnosis}
              userQuery={state.problemText}
              stationName={selectedArea}
              onDismiss={() => setAiDiagnosis(null)}
              onViewAllCorridor={() => {
                setSelectedArea('');
                setArea('');
              }}
            />
          )}

          {/* Onboarding View Modal / Inline when requested */}
          {showOnboarding ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
              marginBottom: '32px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Register as a Service Provider</h2>
                <button
                  type="button"
                  onClick={() => setShowOnboarding(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
              <OnboardingView onRegistered={() => { setShowOnboarding(false); loadProviders(); }} />
            </div>
          ) : null}

          {/* Search and Filters Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(24px) saturate(190%)',
            WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--r-2xl)',
            padding: 'clamp(14px, 3vw, 20px)',
            marginBottom: 'var(--space-8)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {/* Keyword Search */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 'var(--r-lg)',
                padding: '10px 14px',
                flex: '2 1 220px',
                minWidth: 'min(100%, 200px)',
                boxSizing: 'border-box',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by provider name or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: 'var(--text-sm)' }}
                />
              </div>

              {/* Mumbai Location Dropdown */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 'var(--r-lg)',
                padding: '10px 14px',
                flex: '1 1 180px',
                minWidth: 'min(100%, 160px)',
                boxSizing: 'border-box',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <select
                  value={selectedArea}
                  onChange={(e) => {
                    setSelectedArea(e.target.value);
                    setArea(e.target.value);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    outline: 'none',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  aria-label="Filter by Mumbai Western Line Area"
                >
                  <option value="">All Mumbai Areas</option>
                  {MUMBAI_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Service Dropdown */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 'var(--r-lg)',
                padding: '10px 14px',
                flex: '1 1 180px',
                minWidth: 'min(100%, 160px)',
                boxSizing: 'border-box',
              }}>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setProblemText(e.target.value !== 'All' ? e.target.value : '');
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    outline: 'none',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  aria-label="Filter by Service"
                >
                  <option value="All">All Services</option>
                  {SERVICE_NAMES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {category !== 'All' && (
                  <span style={{ fontSize: 'var(--text-xs)', background: '#e0e7ff', color: '#4338ca', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                    Service: {category}
                  </span>
                )}
                {selectedArea && (
                  <span style={{ fontSize: 'var(--text-xs)', background: '#f1f5f9', color: '#334155', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                    Area: {selectedArea}
                  </span>
                )}
                {(category !== 'All' || selectedArea) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('All');
                      setSelectedArea('');
                      setArea('');
                      setSearchQuery('');
                      setProblemText('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Clear Filters ✕
                  </button>
                )}
              </div>

              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 500 }}>
                {isAiDiagnosing ? 'Diagnosing with AI…' : loading ? 'Checking directory…' : `${filtered.length} approved local provider${filtered.length === 1 ? '' : 's'} listed`}
              </span>
            </div>
          </div>

          {/* Providers Grid or Authentic Empty State */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
              <p style={{ fontWeight: 600 }}>Searching local directory...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: 'var(--space-5)',
            }}>
              {filtered.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  selectedArea={selectedArea}
                  onViewDetails={(p) => setActiveModalProvider(p)}
                />
              ))}
            </div>
          ) : allAreaProviders.length > 0 ? (
            /* Smart Fallback: Approved specialists serving nearby Western Line corridor */
            <div>
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '20px',
                padding: '20px 24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px' }}>📍</span>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      No {category} providers based strictly inside {selectedArea}
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
                    Showing <strong>{allAreaProviders.length} approved {category} specialist{allAreaProviders.length === 1 ? '' : 's'}</strong> serving nearby Western Line stations who can service {selectedArea}:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedArea('');
                    setArea('');
                  }}
                  style={{
                    background: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  View All Mumbai Western Line ({allAreaProviders.length}) →
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                gap: 'var(--space-5)',
              }}>
                {allAreaProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    selectedArea={selectedArea}
                    onViewDetails={(p) => setActiveModalProvider(p)}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Clean Empty State */
            <div style={{
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1.5px dashed rgba(0, 0, 0, 0.15)',
              borderRadius: 'var(--r-2xl)',
              padding: 'var(--space-12) var(--space-6)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}>
              <div style={{ fontSize: '2.5rem' }}>📍</div>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                No approved providers found in this area.
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', maxWidth: '480px', margin: 0, lineHeight: 1.5 }}>
                {category !== 'All' && selectedArea
                  ? `No approved ${category} providers currently listed strictly in ${selectedArea}.`
                  : 'No approved providers currently match these filters along the Western Line corridor.'}
                {aiDiagnosis && (
                  <span style={{ display: 'block', marginTop: '6px', color: '#4f46e5', fontWeight: 600 }}>
                    Review the AI Root Cause & Solution card above for immediate diagnostic and safety steps.
                  </span>
                )}
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {!state.user && (
                  <GlowButton onClick={() => onNavigate('provider')} size="md">
                    Become a Service Provider →
                  </GlowButton>
                )}
                {category !== 'All' && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('All');
                      setProblemText('');
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--r-full)',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Browse All Services
                  </button>
                )}
                {selectedArea && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArea('');
                      setArea('');
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--r-full)',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Change / Clear Area
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Provider Details Modal */}
      {activeModalProvider && (
        <ProviderDetailsModal
          provider={activeModalProvider}
          selectedArea={selectedArea}
          problemSummary={searchQuery || category}
          onClose={() => setActiveModalProvider(null)}
          onReviewSubmitted={() => {
            loadProviders();
          }}
        />
      )}

      <Footer
        onNavigate={onNavigate}
        onRegister={() => onNavigate('provider')}
      />
    </>
  );
};

export default ProvidersPage;
