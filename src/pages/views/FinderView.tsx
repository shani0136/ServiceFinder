import React, { useState, useRef } from 'react';
import { useApp } from '../../store/appState';
import { useVoice } from '../../hooks/useVoice';
import { MUMBAI_LOCATIONS } from '../../constants/locations';
import { classifyProblem } from '../../lib/gemini';
import { getApprovedProviders } from '../../lib/directoryService';
import { ProviderCard } from '../../components/ui/ProviderCard';
import { ProviderDetailsModal } from '../../components/ui/ProviderDetailsModal';
import { GlowButton } from '../../components/ui/GlowButton';
import { ProviderSkeleton } from '../../components/ui/ProviderSkeleton';
import { AiDiagnosisCard } from '../../components/AiDiagnosisCard';
import type { Provider } from '../../types';
import styles from './FinderView.module.css';

export const FinderView: React.FC = () => {
  const {
    state,
    setProblemText,
    setArea,
    setClassifyResult,
    setProviders,
    setProvidersLoading,
    setView,
    addToast,
  } = useApp();

  const [text, setText] = useState(state.problemText || '');
  const [areaInput, setAreaInput] = useState(state.selectedArea || '');
  const [isClassifying, setIsClassifying] = useState(false);
  const [activeModalProvider, setActiveModalProvider] = useState<Provider | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, isSupported, start, stop } = useVoice((transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      addToast('Please describe your service problem in natural language.', 'info');
      textareaRef.current?.focus();
      return;
    }

    setIsClassifying(true);
    setProvidersLoading(true);
    setProblemText(trimmed);
    if (areaInput) setArea(areaInput);

    try {
      // Step 1: Gemini intent classification
      const res = await classifyProblem(trimmed);
      setClassifyResult(res);

      // Step 2: Query real approved providers from Firestore using AI Service + Selected Location
      const matched = await getApprovedProviders(res.serviceCategory, areaInput);
      setProviders(matched);

      if (res.urgency === 'high') {
        addToast(`Urgent issue diagnosed: ${res.serviceCategory}`, 'warning');
      } else {
        addToast(`Identified service category: ${res.serviceCategory}`, 'success');
      }
    } catch {
      addToast('Classification failed. Showing all available providers.', 'error');
      const fallback = await getApprovedProviders(undefined, areaInput);
      setProviders(fallback);
    } finally {
      setIsClassifying(false);
      setProvidersLoading(false);
    }
  };

  const isEmergency = state.classifyResult?.urgency === 'high';

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <h1 className={styles.title}>✦ AI Smart Service Matcher</h1>
        <p className={styles.subtitle}>
          Describe what needs fixing in your home. Gemini AI diagnoses the appropriate trade category, and ServiceFinder queries approved local specialists in your Mumbai area.
        </p>
      </div>

      {/* Omnibar Card */}
      <div className={styles.searchCard}>
        <div className={styles.inputRow}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'Describe the issue in your own words (e.g. "Bathroom me pipe se pani leak ho raha hai", "AC cooling nahi kar raha", "Washing machine drum vibrating")...'}
            rows={2}
          />
          <button
            type="button"
            className={[styles.micBtn, isListening ? styles.micListening : ''].join(' ')}
            onClick={isListening ? stop : start}
            disabled={!isSupported}
            title={isListening ? 'Stop voice' : 'Voice input (Hindi/English)'}
          >
            {isListening ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.locationField}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <select
              className={styles.locationInput}
              value={areaInput}
              onChange={(e) => {
                setAreaInput(e.target.value);
                setArea(e.target.value);
              }}
              style={{ cursor: 'pointer', fontWeight: 600 }}
              aria-label="Select Mumbai Western Line Area"
            >
              <option value="">All Mumbai Western Line</option>
              {MUMBAI_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <GlowButton
            onClick={handleSearch}
            loading={isClassifying || state.providersLoading}
            size="md"
          >
            {isClassifying ? 'Diagnosing…' : 'Diagnose & Match →'}
          </GlowButton>
        </div>
      </div>

      {/* Emergency alert banner */}
      {isEmergency && (
        <div className={styles.emergencyBanner} role="alert">
          <span>🚨 High Urgency Issue Detected: Direct phone calls are recommended for immediate response.</span>
        </div>
      )}

      {/* AI Diagnosis & Recommended Solution Card */}
      {state.classifyResult && (
        <div style={{ marginTop: '24px' }}>
          <AiDiagnosisCard
            diagnosis={state.classifyResult}
            userQuery={text || state.problemText}
            stationName={areaInput}
            onDismiss={() => setClassifyResult(null)}
            onViewAllCorridor={() => {
              setAreaInput('');
              setArea('');
              getApprovedProviders(state.classifyResult?.serviceCategory, '').then(setProviders);
            }}
          />
        </div>
      )}

      {/* Provider Results */}
      <div className={styles.resultsHeader}>
        <h2 className={styles.resultsCount}>
          {state.providers.length} Approved {state.detectedService || 'Local'} Specialists Listed
        </h2>
      </div>

      {state.providersLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <ProviderSkeleton key={i} />
          ))}
        </div>
      ) : state.providers.length > 0 ? (
        <div className={styles.grid}>
          {state.providers.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              problemSummary={state.classifyResult?.problemSummary || state.problemText}
              selectedArea={areaInput || state.selectedArea}
              onViewDetails={(prov) => setActiveModalProvider(prov)}
            />
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-pure)',
          border: '1.5px dashed var(--border-md)',
          borderRadius: 'var(--r-2xl)',
          padding: 'var(--space-10) var(--space-6)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <div style={{ fontSize: '2.5rem' }}>📍</div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {state.detectedService && areaInput
              ? `No ${state.detectedService} providers are currently listed in ${areaInput}.`
              : 'No service providers found'}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', maxWidth: '440px', margin: 0 }}>
            Try another service or select another Mumbai area along the Western Line. Or be the first professional to join ServiceFinder in this area.
          </p>
          {!state.user && (
            <GlowButton
              onClick={() => setView('onboarding')}
              size="md"
            >
              Become a Service Provider →
            </GlowButton>
          )}
        </div>
      )}

      {/* Provider Details Modal */}
      {activeModalProvider && (
        <ProviderDetailsModal
          provider={activeModalProvider}
          selectedArea={areaInput || state.selectedArea}
          problemSummary={state.classifyResult?.problemSummary || state.problemText}
          onClose={() => setActiveModalProvider(null)}
          onReviewSubmitted={async () => {
            if (state.detectedService) {
              const updated = await getApprovedProviders(state.detectedService, areaInput);
              setProviders(updated);
            }
          }}
        />
      )}
    </div>
  );
};

export default FinderView;
