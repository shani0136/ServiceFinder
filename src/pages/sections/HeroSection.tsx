import React, { useState, useRef, useEffect } from 'react';
import { useVoice } from '../../hooks/useVoice';
import { useApp } from '../../store/appState';
import { MUMBAI_LOCATIONS } from '../../constants/locations';
import { GlowButton } from '../../components/ui/GlowButton';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  onSearch: (problem: string, area?: string) => void;
  searching?: boolean;
}

const QUICK_TAGS = [
  { label: '💧 Leaking Tap', text: 'Bathroom tap or pipe is leaking water' },
  { label: '⚡ Short Circuit', text: 'Power switch spark or short circuit issue' },
  { label: '❄️ AC Servicing', text: 'AC not cooling and needs general servicing' },
  { label: '🚪 Door Lock Fix', text: 'Door lock jammed or wooden door alignment' },
  { label: '🎨 Room Painting', text: 'Interior wall touch up and repainting' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, searching = false }) => {
  const { state, setArea, setProblemText } = useApp();
  const [localText, setLocalText] = useState(state.problemText || '');
  const [localArea, setLocalArea] = useState(state.selectedArea || '');
  const [inputError, setInputError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, isSupported, error: voiceError, start, stop } = useVoice((transcript: string) => {
    setLocalText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    setInputError('');
  });

  useEffect(() => {
    if (state.selectedArea && !localArea) {
      Promise.resolve().then(() => {
        setLocalArea(state.selectedArea);
      });
    }
  }, [state.selectedArea, localArea]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    if (inputError) setInputError('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = localText.trim();
    if (!trimmed) {
      setInputError('Please describe the service you need or choose a category below.');
      textareaRef.current?.focus();
      return;
    }
    if (trimmed.length < 3) {
      setInputError('Please enter a slightly more detailed description.');
      return;
    }

    setProblemText(trimmed);
    if (localArea) setArea(localArea);
    onSearch(trimmed, localArea);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectQuickTag = (tagText: string) => {
    setLocalText(tagText);
    setInputError('');
    textareaRef.current?.focus();
  };

  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.bgGlow} aria-hidden="true" />
      <div className={styles.bgDots} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          ✦ Mumbai Western Line Local Discovery
        </div>

        <h1 id="hero-heading" className={styles.headline}>
          Find trusted local services<br />
          <span className={styles.headlineAccent}>near you.</span>
        </h1>

        <p className={styles.subtext}>
          Discover local service professionals in your Mumbai area and connect with them directly.
          Describe your problem naturally in English, Hindi, or Hinglish.
        </p>

        {/* Dual-input Omnibar */}
        <div className={styles.omnibar} role="search">
          <div className={styles.problemFieldWrap}>
            <label htmlFor="problem-input" className="sr-only">
              Describe your service problem
            </label>
            <textarea
              ref={textareaRef}
              id="problem-input"
              className={styles.textarea}
              value={localText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={'What do you need help with?\n"Bathroom me pipe se pani leak ho raha hai..."'}
              rows={3}
              maxLength={500}
              aria-describedby={inputError ? 'search-error' : undefined}
              aria-invalid={!!inputError}
              disabled={searching}
            />

            {/* Mic button */}
            <button
              className={[styles.micBtn, isListening ? styles.listening : ''].join(' ')}
              onClick={isListening ? stop : start}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              aria-pressed={isListening}
              type="button"
              disabled={!isSupported || searching}
              title={!isSupported ? 'Voice input not supported in this browser' : 'Voice search'}
            >
              {isListening ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>

            {isListening && (
              <div className={styles.listeningBadge} role="status" aria-live="polite">
                <span className={styles.listeningDot} aria-hidden="true" />
                Listening…
              </div>
            )}
          </div>

          {/* Bottom row: Mumbai Location Dropdown + Submit CTA */}
          <div className={styles.barBottom}>
            <div className={styles.locationField}>
              <span className={styles.locationIcon} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <select
                className={styles.locationInput}
                value={localArea}
                onChange={(e) => {
                  setLocalArea(e.target.value);
                  setArea(e.target.value);
                }}
                aria-label="Select Mumbai Area"
                style={{ cursor: 'pointer', background: 'transparent' }}
              >
                <option value="">Select Mumbai Area</option>
                {MUMBAI_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className={styles.ctaWrap}>
              <GlowButton
                id="find-service-btn"
                onClick={handleSubmit}
                loading={searching}
                size="md"
                aria-label="Find local service providers"
              >
                {searching ? 'Finding…' : 'Find Service →'}
              </GlowButton>
            </div>
          </div>
        </div>

        {/* Quick search suggestions */}
        <div className={styles.quickTags} aria-label="Quick search suggestions">
          <span className={styles.tagLabel}>Common issues:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              className={styles.tagBtn}
              onClick={() => handleSelectQuickTag(tag.text)}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {(inputError || voiceError) && (
          <p id="search-error" className={styles.error} role="alert">
            {inputError || voiceError}
          </p>
        )}

        {/* Trust signals */}
        <div className={styles.trustRow} aria-label="Trust indicators">
          {[
            { icon: '✓', text: 'Manually Reviewed Local Pros' },
            { icon: '⭐', text: 'Genuine Community Reviews' },
            { icon: '⚡', text: 'Direct WhatsApp & Call' },
            { icon: '🛡️', text: 'Zero Commissions' },
          ].map(({ icon, text }) => (
            <span key={text} className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">{icon}</span>
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
