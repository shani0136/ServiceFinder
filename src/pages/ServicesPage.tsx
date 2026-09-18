import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CORE_SERVICES, type ServiceMeta } from '../constants/services';
import { GlowButton } from '../components/ui/GlowButton';
import { usePolymorphicTilt } from '../hooks/usePolymorphicTilt';
import type { PublicView } from '../types';

interface ServicesPageProps {
  onNavigate: (view: PublicView) => void;
  onSignIn: () => void;
  onSelectCategory?: (category: string) => void;
}

const ServiceCardItem: React.FC<{
  item: ServiceMeta;
  onClick: () => void;
}> = ({ item, onClick }) => {
  const cardRef = usePolymorphicTilt<HTMLDivElement>({
    maxTilt: 8,
    scale: 1.025,
    perspective: 900,
    speed: 300,
    glare: true,
  });

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1.5px solid rgba(255, 255, 255, 0.9)',
        borderRadius: '20px',
        padding: '24px',
        cursor: 'pointer',
        boxShadow: '0 8px 30px rgba(31, 38, 135, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: item.color,
          border: '1px solid rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        }}
      >
        {item.emoji}
      </div>

      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
          {item.label}
        </h3>
        <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
          {item.description}
        </p>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#4f46e5', fontSize: '13px', fontWeight: 700 }}>
        <span>View local specialists</span>
        <span>→</span>
      </div>
    </div>
  );
};

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onNavigate,
  onSignIn,
  onSelectCategory,
}) => {
  const [filter, setFilter] = useState('');

  const filtered = CORE_SERVICES.filter(
    (c) =>
      c.label.toLowerCase().includes(filter.toLowerCase()) ||
      c.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <Navbar
        currentView="services"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onRegister={() => onNavigate('provider')}
      />

      <main style={{ minHeight: '100dvh', paddingTop: 'clamp(24px, 3.5vw, 40px)', paddingBottom: 'var(--space-20)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto var(--space-10)' }}>
            <span style={{
              display: 'inline-block',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
              Official Catalogue
            </span>
            <h1 style={{ fontSize: 'clamp(1.85rem, 4.5vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
              Common Everyday Services
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-lg)', marginTop: '12px' }}>
              Select a specialized category below to view registered professionals serving your Mumbai Western Line area.
            </p>

            <div style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              borderRadius: 'var(--r-full)',
              padding: '10px 18px',
              gap: '10px',
              maxWidth: '440px',
              marginInline: 'auto',
              boxShadow: '0 4px 16px rgba(31, 38, 135, 0.04)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Filter services (e.g. AC, plumbing, cleaning)..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  width: '100%',
                  outline: 'none',
                  fontSize: 'var(--text-sm)',
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: 'var(--space-5)',
          }}>
            {filtered.map((service) => (
              <ServiceCardItem
                key={service.label}
                item={service}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(service.label);
                  } else {
                    onNavigate('providers');
                  }
                }}
              />
            ))}
          </div>

          {/* Provider Join Banner */}
          <div style={{
            marginTop: 'var(--space-16)',
            background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
            borderRadius: 'var(--r-2xl)',
            padding: 'var(--space-10) var(--space-8)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-6)',
          }}>
            <div style={{ maxWidth: '540px' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                Are you a local service specialist in Mumbai?
              </h2>
              <p style={{ opacity: 0.9, marginTop: '8px', lineHeight: 1.6, fontSize: 'var(--text-sm)' }}>
                Get discovered by residents in your neighbourhood along the Western Line corridor. No listing charges, zero commission on jobs.
              </p>
            </div>
            <GlowButton
              onClick={() => onNavigate('provider')}
              size="lg"
            >
              List Your Services →
            </GlowButton>
          </div>
        </div>
      </main>

      <Footer
        onNavigate={onNavigate}
        onRegister={() => onNavigate('provider')}
      />
    </>
  );
};

export default ServicesPage;
