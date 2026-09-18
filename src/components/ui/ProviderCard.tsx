import React from 'react';
import type { Provider, ContactActionPayload } from '../../types';
import { RatingStars } from './RatingStars';
import { Pill } from './Pill';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
import { recordProviderInteraction } from '../../lib/directoryService';
import { usePolymorphicTilt } from '../../hooks/usePolymorphicTilt';
import { useApp } from '../../store/appState';
import styles from './ProviderCard.module.css';

export type { ContactActionPayload };

interface ProviderCardProps {
  provider: Provider;
  problemSummary?: string;
  selectedArea?: string;
  onViewDetails?: (provider: Provider) => void;
  onRate?: (provider: Provider) => void;
  onRequireLogin?: (action: ContactActionPayload) => void;
}

/**
 * Provider card with:
 * - Direct Call (tel:) and direct WhatsApp deep link (protected behind customer login)
 * - Verified badge ONLY if administrator verified
 * - Genuine ratings ONLY if reviews exist ("No reviews yet" or "New Provider" if none)
 * - View Details action
 * - No fake visit charges or booking flows
 */
export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  problemSummary = '',
  selectedArea = '',
  onViewDetails,
  onRequireLogin,
}) => {
  const { state, promptContactLogin } = useApp();
  const cardRef = usePolymorphicTilt<HTMLDivElement>({
    maxTilt: 7,
    scale: 1.015,
    perspective: 950,
    speed: 350,
    glare: true,
  });

  const whatsappUrl = buildWhatsAppUrl(
    provider,
    problemSummary || provider.service,
    selectedArea || provider.serviceArea
  );

  const initial = provider.name.charAt(0).toUpperCase();

  const handleCall = (e: React.MouseEvent) => {
    if (!state.user || state.user.role !== 'customer') {
      e.preventDefault();
      const payload: ContactActionPayload = {
        type: 'call',
        providerName: provider.name,
        phone: provider.phone,
        whatsappUrl,
      };
      if (onRequireLogin) {
        onRequireLogin(payload);
      } else {
        promptContactLogin(payload);
      }
      return;
    }
    recordProviderInteraction(provider.id, 'call').catch(() => {});
  };

  const handleWhatsapp = (e: React.MouseEvent) => {
    if (!state.user || state.user.role !== 'customer') {
      e.preventDefault();
      const payload: ContactActionPayload = {
        type: 'whatsapp',
        providerName: provider.name,
        phone: provider.phone,
        whatsappUrl,
      };
      if (onRequireLogin) {
        onRequireLogin(payload);
      } else {
        promptContactLogin(payload);
      }
      return;
    }
    recordProviderInteraction(provider.id, 'whatsapp').catch(() => {});
  };

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.sheenLayer} aria-hidden="true" />
      <div className={styles.bevelHighlight} aria-hidden="true" />

      {/* Header row */}
      <div className={styles.header}>
        <div className={styles.avatar} aria-hidden="true">{initial}</div>
        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <div>
              <h3 className={styles.name}>{provider.name}</h3>
              {provider.businessName && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block', fontWeight: 500 }}>
                  {provider.businessName}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              {(provider.status === 'approved' || provider.verified) && (
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '2px 7px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                  title="The provider's submitted information and available evidence were manually reviewed by the ServiceFinder administrator."
                >
                  🛡️ Admin Approved
                </span>
              )}
            </div>
          </div>
          <div className={styles.meta}>
            <Pill variant="accent" size="sm">{provider.service}</Pill>
            <span className={styles.dot} aria-hidden="true">·</span>
            <span className={styles.metaText}>
              📍 {provider.serviceAreas?.slice(0, 2).join(', ') || provider.serviceArea}
              {(provider.serviceAreas?.length || 0) > 2 ? ` (+${provider.serviceAreas!.length - 2} more)` : ''}, Mumbai
            </span>
          </div>
        </div>
      </div>

      {/* Stats row: Experience & Genuine Community Rating (NO FAKE CHARGES) */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{provider.experienceYears}y</span>
          <span className={styles.statLabel}>experience</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.stat}>
          {provider.reviewCount > 0 && provider.rating ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RatingStars value={provider.rating} size="sm" showValue />
                <span
                  style={{
                    background: '#fffbeb',
                    color: '#b45309',
                    border: '1px solid #fde68a',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  ⭐ Community Rated
                </span>
              </div>
              <span className={styles.statLabel}>{provider.reviewCount} genuine {provider.reviewCount === 1 ? 'review' : 'reviews'}</span>
            </>
          ) : (
            <>
              <span className={styles.ratingEmpty}>No reviews yet</span>
              <span className={styles.statLabel}>community ratings</span>
            </>
          )}
        </div>
      </div>

      {/* Skills tags */}
      {provider.skills && provider.skills.length > 0 && (
        <div className={styles.skillsRow}>
          {provider.skills.slice(0, 4).map((skill) => (
            <span key={skill} className={styles.skillBadge}>
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {provider.description && (
        <p className={styles.description}>{provider.description}</p>
      )}

      {/* Actions: Call, WhatsApp, View Details */}
      <div className={styles.actions}>
        <a
          href={state.user?.role === 'customer' ? `tel:${provider.phone}` : '#'}
          className={styles.btnCall}
          aria-label={`Call ${provider.name}`}
          onClick={handleCall}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.62 19.79 19.79 0 01.06 2A2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
          </svg>
          Call
        </a>

        <a
          href={state.user?.role === 'customer' ? whatsappUrl : '#'}
          target={state.user?.role === 'customer' ? '_blank' : undefined}
          rel={state.user?.role === 'customer' ? 'noopener noreferrer' : undefined}
          className={styles.btnWhatsapp}
          aria-label={`WhatsApp ${provider.name}`}
          onClick={handleWhatsapp}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>

        {onViewDetails && (
          <button
            type="button"
            className={styles.btnDetails}
            onClick={() => {
              recordProviderInteraction(provider.id, 'view').catch(() => {});
              onViewDetails(provider);
            }}
            aria-label={`View details for ${provider.name}`}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};
