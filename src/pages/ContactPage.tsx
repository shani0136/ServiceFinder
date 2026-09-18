import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { GlowButton } from '../components/ui/GlowButton';
import { useApp } from '../store/appState';
import { SERVICE_NAMES } from '../constants/services';
import { MUMBAI_LOCATIONS } from '../constants/locations';
import type { PublicView } from '../types';

interface ContactPageProps {
  onNavigate: (view: PublicView) => void;
  onSignIn: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, onSignIn }) => {
  const { state, addToast } = useApp();
  const user = state.user;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    area: 'Borivali',
    service: 'Electrician',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
    if (state.selectedArea) {
      setFormData((prev) => ({ ...prev, area: state.selectedArea }));
    }
  }, [user, state.selectedArea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      addToast('Please provide your name and phone number.', 'warning');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      addToast('Callback request received! Our Mumbai desk will call you within 15 minutes.', 'success');
    }, 500);
  };

  return (
    <>
      <Navbar
        currentView="contact"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onRegister={() => onNavigate('provider')}
      />

      <main style={{ minHeight: '100dvh', paddingTop: 'clamp(24px, 3.5vw, 40px)', paddingBottom: 'var(--space-20)' }}>
        <div className="container">
          {/* Header Banner */}
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-10)' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: 'var(--text-xs)',
                fontWeight: 800,
                color: '#4f46e5',
                background: '#eef2ff',
                padding: '4px 12px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '10px',
              }}
            >
              Mumbai Western Line Customer Helpdesk
            </span>
            <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', margin: '0 0 14px' }}>
              Contact ServiceFinder Support
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-base)', lineHeight: 1.6, margin: 0 }}>
              Need help finding a vetted technician, resolving a booking query, or registering as a tradesman? Our local Mumbai team is here to assist you.
            </p>
          </div>

          {/* 4 Direct Contact Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: 'var(--space-12)',
            }}
          >
            {/* Helpline */}
            <a
              href="tel:+918423773933"
              style={{
                background: '#ffffff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '18px',
                padding: '20px',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.08)',
                transition: 'all 200ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '28px' }}>📞</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
                  TAP TO CALL
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Instant Call Helpline
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                +91 84237 73933
              </span>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                Direct Mumbai Phone Support →
              </span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/918423773933?text=Hello%20ServiceFinder%20Support%2C%20I%20need%20help%20with%20a%20local%20service%20in%20Mumbai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#ffffff',
                border: '1.5px solid #bbf7d0',
                borderRadius: '18px',
                padding: '20px',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.08)',
                transition: 'all 200ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '28px' }}>💬</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px' }}>
                  WHATSAPP CHAT
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Direct WhatsApp Support
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                +91 84237 73933
              </span>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                Start WhatsApp Conversation →
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:support@servicefinder.in?subject=ServiceFinder%20Customer%20Support%20Request"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e9d5ff',
                borderRadius: '18px',
                padding: '20px',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.08)',
                transition: 'all 200ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '28px' }}>✉️</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#9333ea', background: '#faf5ff', padding: '3px 8px', borderRadius: '6px' }}>
                  EMAIL DESK
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Official Support Email
              </span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                support@servicefinder.in
              </span>
              <span style={{ fontSize: '12px', color: '#9333ea', fontWeight: 600 }}>
                Send In-depth Query →
              </span>
            </a>

            {/* Office Hub */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #fed7aa',
                borderRadius: '18px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '28px' }}>📍</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c', background: '#fff7ed', padding: '3px 8px', borderRadius: '6px' }}>
                  HEADQUARTERS
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Mumbai Operations Hub
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                Borivali West, Mumbai 400092
              </span>
              <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: 600 }}>
                Serving Western Railway Corridor
              </span>
            </div>
          </div>

          {/* Main 2-Column Grid: Form & Info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
              gap: 'var(--space-8)',
              alignItems: 'start',
            }}
          >
            {/* Form Card */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '24px',
                padding: 'clamp(20px, 3.5vw, 32px)',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
              }}
            >
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>✅</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 8px' }}>
                    Request Received, {formData.name}!
                  </h3>
                  <p style={{ color: '#15803d', fontSize: '14px', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 20px' }}>
                    A neighborhood coordinator will connect with you directly at <strong>{formData.phone}</strong> regarding your {formData.service} request in <strong>{formData.area}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '10px',
                      border: '1.5px solid #86efac',
                      background: '#ffffff',
                      color: '#166534',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                      Request Customer Callback / Assistance
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      Provide your trade requirement and an authorized support coordinator will phone you directly.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Mehta"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Contact Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 98201 23456"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Mumbai Western Line Station
                      </label>
                      <select
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13.5px',
                          background: '#ffffff',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                        }}
                      >
                        {MUMBAI_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Service Required
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13.5px',
                          background: '#ffffff',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                        }}
                      >
                        {SERVICE_NAMES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Problem Details / Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Briefly describe your appliance breakdown, electrical repair, or inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <GlowButton type="submit" size="lg" fullWidth disabled={submitting}>
                    {submitting ? 'Submitting Callback Request…' : 'Request Instant Callback 📞'}
                  </GlowButton>
                </form>
              )}
            </div>

            {/* Right Side: Trust & Info Pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Support Operating Timings
                  </h3>
                </div>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 12px' }}>
                  <strong>Regular Desk Hours:</strong> 8:00 AM – 9:00 PM IST (Monday through Sunday).
                </p>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  🚨 <strong>Emergency Repairs:</strong> For critical household issues like short circuits, active pipe bursts, or electrical hazards, our automated directory connects you directly to available night technicians along the Western Line.
                </p>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  Zero Platform Commission Guarantee
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 12px' }}>
                  ServiceFinder charges residents ₹0 to connect with tradesmen. You pay the visiting technician directly via cash or UPI for work performed.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => onNavigate('providers')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    Browse Providers →
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('services')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    View All 14 Categories →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} onRegister={() => onNavigate('provider')} />
    </>
  );
};
