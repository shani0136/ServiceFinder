import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { GlowButton } from '../components/ui/GlowButton';
import type { PublicView } from '../types';

interface AboutPageProps {
  onNavigate: (view: PublicView) => void;
  onSignIn: () => void;
}

const FAQS = [
  {
    q: 'How does ServiceFinder review service professionals?',
    a: 'Every provider profile is manually reviewed by our administrative team. Verification badges are awarded only after verifying their trade experience, active contact numbers, and Mumbai service area.',
  },
  {
    q: 'Does ServiceFinder charge a booking fee or take commissions?',
    a: 'No. ServiceFinder is 100% free for residents. We do not inflate visit charges or take middleman cuts from providers. You pay the technician directly for the work completed.',
  },
  {
    q: 'What languages does the AI search support?',
    a: 'You can describe your problem in conversational Hindi, English, Hinglish, or Marathi. The AI accurately parses colloquial expressions like "pipe se leakage ho rahi hai" and identifies the correct trade.',
  },
  {
    q: 'How can I register my business as a provider?',
    a: 'Click "Register as Provider", fill out your basic contact details and trade experience. Once submitted, our verification team approves listings within 2–4 hours.',
  },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onSignIn }) => {
  return (
    <>
      <Navbar
        currentView="about"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onRegister={() => onNavigate('provider')}
      />

      <main style={{ minHeight: '100dvh', paddingTop: 'clamp(24px, 3.5vw, 40px)', paddingBottom: 'var(--space-20)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-12)' }}>
            <span style={{
              display: 'inline-block',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
              About ServiceFinder
            </span>
            <h1 style={{ fontSize: 'clamp(1.85rem, 4.5vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
              Transforming Local Home Services With Trust & Speed
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-lg)', marginTop: '16px', lineHeight: 1.6 }}>
              ServiceFinder is a next-generation local service discovery engine designed to bridge homeowners directly with verified neighborhood trade specialists.
            </p>
          </div>

          {/* 3 Pillars */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-16)',
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              borderRadius: 'var(--r-2xl)',
              padding: 'var(--space-8)',
              boxShadow: '0 8px 30px rgba(31, 38, 135, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🤖</div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Natural Language AI</h3>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginTop: '8px', lineHeight: 1.6 }}>
                No complicated category menus. Just speak or type your household issue naturally. Gemini AI categorizes trades and urgency instantly.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              borderRadius: 'var(--r-2xl)',
              padding: 'var(--space-8)',
              boxShadow: '0 8px 30px rgba(31, 38, 135, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🛡️</div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Manually Reviewed</h3>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginTop: '8px', lineHeight: 1.6 }}>
                We prioritize trust. Active administrator reviews, direct community ratings, and transparent locality matching ensure confidence.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              borderRadius: 'var(--r-2xl)',
              padding: 'var(--space-8)',
              boxShadow: '0 8px 30px rgba(31, 38, 135, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💬</div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Direct WhatsApp & Call</h3>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginTop: '8px', lineHeight: 1.6 }}>
                Connect with the technician directly via WhatsApp or phone. No escrow holds, no delayed callbacks, and zero platform surcharge.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{ maxWidth: '800px', margin: '0 auto var(--space-16)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.85)',
                    borderRadius: 'var(--r-xl)',
                    padding: 'var(--space-5) var(--space-6)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--fg)' }}>
                    {faq.q}
                  </h4>
                  <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginTop: '8px', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(24px) saturate(190%)',
            WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--r-2xl)',
            padding: 'var(--space-10) var(--space-8)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
            boxShadow: '0 16px 40px -10px rgba(31, 38, 135, 0.08), inset 0 1px 1px rgba(255, 255, 255, 1)',
          }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
              Ready to find trusted help in your locality?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', maxWidth: '500px' }}>
              Experience instant matching and direct communication with vetted professionals near you.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <GlowButton onClick={() => onNavigate('home')} size="lg">
                Search Services Now →
              </GlowButton>
              <button
                type="button"
                onClick={() => onNavigate('provider')}
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--r-full)',
                  border: '1.5px solid var(--border-md)',
                  background: 'var(--bg)',
                  fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                }}
              >
                Join as a Professional
              </button>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--r-full)',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#4f46e5',
                }}
              >
                📞 Contact Support
              </button>
            </div>
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
