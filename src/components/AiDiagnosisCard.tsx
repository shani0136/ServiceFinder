import React from 'react';
import type { ClassifyResponse } from '../types';
import styles from './AiDiagnosisCard.module.css';

interface AiDiagnosisCardProps {
  diagnosis: ClassifyResponse;
  userQuery?: string;
  stationName?: string;
  onDismiss?: () => void;
  onViewAllCorridor?: () => void;
}

export const AiDiagnosisCard: React.FC<AiDiagnosisCardProps> = ({
  diagnosis,
  userQuery,
  stationName,
  onDismiss,
  onViewAllCorridor,
}) => {
  const urgencyClass =
    diagnosis.urgency === 'high'
      ? styles.urgencyHigh
      : diagnosis.urgency === 'medium'
      ? styles.urgencyMedium
      : styles.urgencyLow;

  const urgencyLabel =
    diagnosis.urgency === 'high'
      ? '⚠️ Urgent Attention'
      : diagnosis.urgency === 'medium'
      ? '⚡ Recommended Today'
      : 'ℹ️ Routine Repair';

  return (
    <div className={styles.card} role="region" aria-label="AI Problem Diagnosis & Solution">
      {/* Top badges & Dismiss */}
      <div className={styles.topBar}>
        <div className={styles.badgeGroup}>
          <span className={styles.aiHeaderBadge}>
            ✨ Gemini AI Problem Diagnosis
          </span>

          <span className={styles.tradeBadge}>
            🛠️ Recommended Trade: <strong>{diagnosis.serviceCategory}</strong>
          </span>

          {typeof diagnosis.confidence === 'number' && diagnosis.confidence > 0 && (
            <span className={styles.confidenceBadge}>
              {Math.round(diagnosis.confidence * 100)}% Match
            </span>
          )}

          {diagnosis.urgency && (
            <span className={urgencyClass}>
              {urgencyLabel}
            </span>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onDismiss}
            title="Dismiss this diagnosis"
            aria-label="Close AI Diagnosis"
          >
            ✕ Dismiss
          </button>
        )}
      </div>

      {/* Query Understood Section */}
      {(userQuery || diagnosis.problemSummary) && (
        <div className={styles.queryContext}>
          <div className={styles.queryLabel}>Problem Description:</div>
          <div className={styles.queryValue}>
            <span>"{userQuery || diagnosis.problemSummary}"</span>
            {diagnosis.problemSummary && diagnosis.problemSummary !== userQuery && (
              <span className={styles.summaryTag}>
                {diagnosis.problemSummary}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dual Diagnosis & Solution Columns */}
      <div className={styles.grid}>
        {/* Likely Root Cause */}
        <div className={styles.causeBox}>
          <div className={styles.boxHeader}>
            <span className={styles.boxIcon} aria-hidden="true">💡</span>
            <span className={[styles.boxTitle, styles.causeTitle].join(' ')}>
              Likely Problem Cause
            </span>
          </div>
          <p className={styles.boxContent}>
            {diagnosis.likelyCause ||
              `Common electrical or mechanical wear in ${diagnosis.serviceCategory} components requiring professional inspection.`}
          </p>
        </div>

        {/* Suggested Solution & Action */}
        <div className={styles.solutionBox}>
          <div className={styles.boxHeader}>
            <span className={styles.boxIcon} aria-hidden="true">🛠️</span>
            <span className={[styles.boxTitle, styles.solutionTitle].join(' ')}>
              Recommended Solution & Action
            </span>
          </div>
          <p className={styles.boxContent}>
            {diagnosis.suggestedSolution ||
              `Contact an approved ${diagnosis.serviceCategory} specialist to test circuits, dismantle faulty fixtures safely, and replace worn parts.`}
          </p>
        </div>
      </div>

      {/* Bottom context notice */}
      <div className={styles.bottomActionRow}>
        <div className={styles.guidanceNote}>
          <span>👉</span>
          <span>
            {stationName && stationName !== 'All' ? (
              <>Showing approved <span className={styles.guidanceBold}>{diagnosis.serviceCategory}</span> specialists serving <span className={styles.guidanceBold}>{stationName}</span> & nearby Western Line stations.</>
            ) : (
              <>Showing approved <span className={styles.guidanceBold}>{diagnosis.serviceCategory}</span> specialists along Mumbai Western Line.</>
            )}
          </span>
        </div>

        {onViewAllCorridor && stationName && stationName !== 'All' && (
          <button
            type="button"
            onClick={onViewAllCorridor}
            style={{
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            Show All Mumbai Western Line →
          </button>
        )}
      </div>
    </div>
  );
};

export default AiDiagnosisCard;
