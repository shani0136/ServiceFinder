import React, { useState, useEffect } from 'react';
import type { Provider, Review, ContactActionPayload } from '../../types';
import { RatingStars } from './RatingStars';
import { Pill } from './Pill';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
import { getProviderReviews, submitProviderReview, recordProviderInteraction } from '../../lib/directoryService';
import { useApp } from '../../store/appState';

interface ProviderDetailsModalProps {
  provider: Provider | null;
  onClose: () => void;
  problemSummary?: string;
  selectedArea?: string;
  onReviewSubmitted?: (updatedProviderId: string) => void;
  onRequireLogin?: (action: ContactActionPayload) => void;
}

export const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({
  provider,
  onClose,
  problemSummary = '',
  selectedArea = '',
  onReviewSubmitted,
  onRequireLogin,
}) => {
  const { state, addToast, promptContactLogin } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review submission state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!provider) return;
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) setLoadingReviews(true);
    });
    getProviderReviews(provider.id)
      .then((data) => {
        if (!ignore) setReviews(data);
      })
      .finally(() => {
        if (!ignore) setLoadingReviews(false);
      });
    return () => {
      ignore = true;
    };
  }, [provider]);

  if (!provider) return null;

  const displayName = provider.name || provider.businessName || 'Service Professional';
  const whatsappUrl = buildWhatsAppUrl(
    provider,
    problemSummary || provider.service || '',
    selectedArea || provider.serviceArea || ''
  );

  const initial = (displayName.charAt(0) || 'P').toUpperCase();

  const handleCallClick = (e: React.MouseEvent) => {
    if (!state.user || state.user.role !== 'customer') {
      e.preventDefault();
      const payload: ContactActionPayload = {
        type: 'call',
        providerName: displayName,
        phone: provider.phone || '',
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

  const handleWhatsappClick = (e: React.MouseEvent) => {
    if (!state.user || state.user.role !== 'customer') {
      e.preventDefault();
      const payload: ContactActionPayload = {
        type: 'whatsapp',
        providerName: displayName,
        phone: provider.phone || '',
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user) {
      addToast('Please sign in as a customer to submit a genuine review.', 'info');
      return;
    }
    if (state.user.role === 'provider') {
      addToast('Service providers are not permitted to submit community reviews.', 'warning');
      return;
    }
    if (!comment.trim()) {
      addToast('Please write a brief comment describing your experience.', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      const created = await submitProviderReview({
        providerId: provider.id,
        userId: state.user.uid,
        userName: state.user.name || 'Resident',
        rating,
        comment: comment.trim(),
      });
      setReviews((prev) => [created, ...prev]);
      setComment('');
      addToast('Thank you! Your genuine review has been recorded.', 'success');
      if (onReviewSubmitted) onReviewSubmitted(provider.id);
    } catch {
      addToast('Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: 'min(90dvh, 850px)',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          padding: 'clamp(18px, 4vw, 28px)',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
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
          aria-label="Close details"
        >
          ✕
        </button>

        {/* Header with Avatar & Name */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {(provider.photoURL || provider.profileImage) ? (
              <img
                src={provider.photoURL || provider.profileImage}
                alt={displayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              initial
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {displayName}
              </h2>
              {(provider.status === 'approved' || provider.verified) && (
                <span style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                  🛡️ Admin Approved
                </span>
              )}
              {provider.reviewCount > 0 && provider.rating ? (
                <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                  ⭐ Community Rated
                </span>
              ) : null}
            </div>
            {provider.businessName && (
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                {provider.businessName}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <Pill variant="accent" size="sm">{provider.service}</Pill>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                📍 {provider.serviceAreas?.join(', ') || provider.serviceArea}, Mumbai
              </span>
            </div>
          </div>
        </div>

        {/* Verification Meaning Notice */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', marginBottom: '18px', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
          <strong style={{ color: '#1e293b' }}>About Verification: </strong>
          "Admin Approved" means the provider's submitted information, service trade, and available evidence were manually reviewed and approved by the ServiceFinder administrator.
        </div>

        {/* Experience & Community Ratings bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              {provider.experienceYears} Years
            </span>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Local Experience
            </span>
          </div>
          <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }} />
          <div style={{ textAlign: 'center' }}>
            {provider.reviewCount > 0 && provider.rating ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <RatingStars value={provider.rating} size="sm" showValue />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {provider.reviewCount} genuine {provider.reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', fontStyle: 'italic' }}>
                  No reviews yet
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Community ratings
                </span>
              </div>
            )}
          </div>
        </div>

        {/* About & Skills */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '8px' }}>
            About Professional
          </h4>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#334155', margin: 0 }}>
            {provider.description || `Specialist ${provider.service} serving residents in ${provider.serviceArea} and nearby Mumbai Western Line areas.`}
          </p>

          {provider.skills && provider.skills.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {provider.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      fontSize: '12px',
                      background: '#eef2ff',
                      color: '#4338ca',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Direct Contact Actions (Customer Discovery Only) */}
        {state.user?.role === 'provider' ? (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#64748b',
            fontWeight: 600,
          }}>
            👁️ Profile Preview Mode · Call and WhatsApp contact actions are active for customers only.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <a
              href={state.user?.role === 'customer' ? `tel:${provider.phone}` : '#'}
              onClick={handleCallClick}
              style={{
                flex: 1,
                minWidth: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#0f172a',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.62 19.79 19.79 0 01.06 2A2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
              </svg>
              {state.user?.role === 'customer' ? `Call ${provider.phone}` : 'Call Provider'}
            </a>

            <a
              href={state.user?.role === 'customer' ? whatsappUrl : '#'}
              target={state.user?.role === 'customer' ? '_blank' : undefined}
              rel={state.user?.role === 'customer' ? 'noopener noreferrer' : undefined}
              onClick={handleWhatsappClick}
              style={{
                flex: 1,
                minWidth: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#25D366',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {state.user?.role === 'customer' ? 'Chat on WhatsApp' : 'WhatsApp Provider'}
            </a>
          </div>
        )}

        {/* Genuine Community Reviews Section */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
            Community Reviews & Feedback
          </h4>

          {/* Review submission form */}
          {state.user ? (
            <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
                Used this service provider? Share genuine feedback:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Rating:</span>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#ffffff',
                    maxWidth: '100%',
                  }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 - Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ 4 - Good</option>
                  <option value={3}>⭐⭐⭐ 3 - Average</option>
                  <option value={2}>⭐⭐ 2 - Poor</option>
                  <option value={1}>⭐ 1 - Terrible</option>
                </select>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a brief honest review of the service..."
                rows={3}
                required
                style={{
                  width: '100%',
                  minHeight: '72px',
                  maxHeight: '200px',
                  resize: 'vertical',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  display: 'block',
                }}
              />
              <button
                type="submit"
                disabled={submittingReview}
                style={{
                  marginTop: '8px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#4f46e5',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: submittingReview ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingReview ? 'Submitting…' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  Used this service provider?
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Please sign in to leave a genuine rating & review.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const payload: ContactActionPayload = {
                    type: 'review',
                    providerName: provider.name,
                    phone: provider.phone,
                    whatsappUrl,
                  };
                  if (onRequireLogin) {
                    onRequireLogin(payload);
                  } else {
                    promptContactLogin(payload);
                  }
                }}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)',
                }}
              >
                Sign In to Review →
              </button>
            </div>
          )}

          {/* Existing reviews list */}
          {loadingReviews ? (
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Loading genuine reviews…</p>
          ) : reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '10px',
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                      {rev.userName}
                    </span>
                    <RatingStars value={rev.rating} size="sm" />
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0', lineHeight: 1.4 }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
              No reviews yet. Be the first to leave a review after contacting this provider.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
