import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import type { PublicView } from '../types';
import styles from './LegalPage.module.css';

interface PrivacyPolicyPageProps {
  onNavigate: (view: PublicView) => void;
  onSignIn: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate, onSignIn }) => {
  return (
    <>
      <Navbar
        currentView="about"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onRegister={() => onNavigate('provider')}
      />

      <div className={styles.pageWrap}>
        <div className={styles.container}>
          {/* Top Navigation */}
          <div className={styles.topNav}>
            <button
              type="button"
              className={styles.backLink}
              onClick={() => onNavigate('home')}
            >
              ← Return to Home
            </button>
            <span className={styles.docPill} style={{ color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
              Data Protection Notice
            </span>
          </div>

          {/* Document Header */}
          <header className={styles.docHeader}>
            <h1 className={styles.docTitle}>Privacy Policy & Data Protection Notice</h1>
            <p className={styles.docSubtitle}>
              This Privacy Policy explains how ServiceFinder collects, uses, stores, and protects personal data in connection with localized household service discovery across the Mumbai Western Railway corridor.
            </p>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Effective Date</span>
                <span className={styles.metaValue}>January 1, 2026</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Last Revised</span>
                <span className={styles.metaValue}>September 2026</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Statutory Compliance</span>
                <span className={styles.metaValue}>DPDPA 2023 & IT Act 2000</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Data Controller</span>
                <span className={styles.metaValue}>ServiceFinder Platform, Mumbai</span>
              </div>
            </div>
          </header>

          {/* Document Card */}
          <article className={styles.docCard}>
            {/* Table of Contents */}
            <nav className={styles.tocBox} aria-label="Table of Contents">
              <h2 className={styles.tocTitle}>Table of Contents</h2>
              <ul className={styles.tocList}>
                <li><a href="#privacy-1" className={styles.tocItem}>1. Introduction & Statutory Framework</a></li>
                <li><a href="#privacy-2" className={styles.tocItem}>2. Categories of Personal Data Collected</a></li>
                <li><a href="#privacy-3" className={styles.tocItem}>3. Lawful Basis & Purposes of Processing</a></li>
                <li><a href="#privacy-4" className={styles.tocItem}>4. Artificial Intelligence & Diagnostic Intent</a></li>
                <li><a href="#privacy-5" className={styles.tocItem}>5. Data Disclosure & Technician Connection</a></li>
                <li><a href="#privacy-6" className={styles.tocItem}>6. Prohibition on Third-Party Sale & Marketing</a></li>
                <li><a href="#privacy-7" className={styles.tocItem}>7. Cloud Storage, Architecture & Encryption</a></li>
                <li><a href="#privacy-8" className={styles.tocItem}>8. Cookies, Local Storage & Session Data</a></li>
                <li><a href="#privacy-9" className={styles.tocItem}>9. Data Retention & Permanent Erasure</a></li>
                <li><a href="#privacy-10" className={styles.tocItem}>10. Data Principal Rights (Your Rights)</a></li>
                <li><a href="#privacy-11" className={styles.tocItem}>11. Grievance Officer & Statutory Contact</a></li>
              </ul>
            </nav>

            <div className={styles.noticeBox} style={{ borderLeftColor: '#059669' }}>
              <strong>Zero Commercial Sale Commitment:</strong> ServiceFinder strictly adheres to a zero third-party monetization policy. We do not sell, rent, or lease your personal information, phone numbers, or residential addresses to telemarketers, lead aggregators, or external advertisers.
            </div>

            {/* Section 1 */}
            <section id="privacy-1" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>1.</span> Introduction & Statutory Framework
              </h2>
              <p className={styles.clauseText}>
                1.1. ServiceFinder operates as a digital directory and service discovery facilitator headquartered in Mumbai, India. This Privacy Policy is formulated in accordance with the Digital Personal Data Protection Act, 2023 ("DPDPA"), the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
              </p>
              <p className={styles.clauseText}>
                1.2. By using the ServiceFinder website, creating a customer or provider profile, or initiating calls to listed technicians, you consent to the processing of your personal data strictly as outlined in this policy.
              </p>
            </section>

            {/* Section 2 */}
            <section id="privacy-2" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>2.</span> Categories of Personal Data Collected
              </h2>
              <p className={styles.clauseText}>
                We collect only the minimum necessary information required to facilitate localized trade matching:
              </p>
              <ul className={styles.subList}>
                <li><strong>Customer Identifiers:</strong> Name, verified telephone number, email address, and designated Western Railway residential station (e.g. Borivali, Andheri, Bandra).</li>
                <li><strong>Service Provider Data:</strong> Full legal name, business title, primary and secondary trade classifications, operating years of experience, telephone number, WhatsApp contact number, profile photo, and submitted proof of trade credentials.</li>
                <li><strong>Technical & Session Logs:</strong> Internet Protocol (IP) address, browser client version, device classification, timestamp logs, and search filter parameters.</li>
                <li><strong>Customer Feedback:</strong> Star ratings, written reviews, and verified service feedback submitted following a service visit.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="privacy-3" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>3.</span> Lawful Basis & Purposes of Processing
              </h2>
              <p className={styles.clauseText}>
                We process your personal data under the lawful grounds of consent and legitimate service fulfillment for the following explicit purposes:
              </p>
              <ul className={styles.subList}>
                <li>Facilitating direct communication (phone calls and WhatsApp messaging) between customers and verified local technicians.</li>
                <li>Securing user authentication, preventing unauthorized access, and authenticating administrative operations.</li>
                <li>Conducting administrative verification of trade applications to ensure directory legitimacy.</li>
                <li>Maintaining authentic community ratings and transparent quality standards.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="privacy-4" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>4.</span> Artificial Intelligence & Diagnostic Intent
              </h2>
              <p className={styles.clauseText}>
                4.1. ServiceFinder integrates Google Gemini AI models to parse unstructured natural language problem descriptions (e.g. "pipe leakage under bathroom sink") submitted via the search interface.
              </p>
              <p className={styles.clauseText}>
                4.2. Natural language problem inputs are processed ephemerally solely to infer the relevant trade category and urgency level. <strong>No customer identity, account credentials, or telephone numbers are transmitted to or stored within third-party AI training pipelines.</strong>
              </p>
            </section>

            {/* Section 5 */}
            <section id="privacy-5" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>5.</span> Data Disclosure & Technician Connection
              </h2>
              <p className={styles.clauseText}>
                5.1. When you click "Call" or "WhatsApp" on a provider's profile, your browser or mobile client directly initiates a telecommunication connection with that specific technician.
              </p>
              <p className={styles.clauseText}>
                5.2. ServiceFinder does not broadcast customer telephone numbers to public bulletin boards or competing service providers. Customer contact details are shared exclusively with the technician explicitly chosen by the resident.
              </p>
            </section>

            {/* Section 6 */}
            <section id="privacy-6" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>6.</span> Prohibition on Third-Party Sale & Marketing
              </h2>
              <p className={styles.clauseText}>
                6.1. ServiceFinder operates under an absolute prohibition against commercial data dissemination:
              </p>
              <ul className={styles.subList}>
                <li>We do NOT sell, rent, monetize, or license personal data to advertising brokers.</li>
                <li>We do NOT execute automated robocalls, unsolicited commercial SMS, or third-party email blasts.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="privacy-7" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>7.</span> Cloud Storage, Architecture & Encryption
              </h2>
              <p className={styles.clauseText}>
                7.1. All platform databases are hosted on enterprise Google Cloud Firestore infrastructure with data centers compliant with ISO 27001, SOC 2, and Indian data localization norms.
              </p>
              <p className={styles.clauseText}>
                7.2. All network transmissions are safeguarded using TLS 1.3 encryption. Internal data storage is encrypted at rest using AES-256 standard encryption.
              </p>
            </section>

            {/* Section 8 */}
            <section id="privacy-8" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>8.</span> Cookies, Local Storage & Session Data
              </h2>
              <p className={styles.clauseText}>
                8.1. We employ lightweight browser storage tokens strictly for operational functionality (session authentication and preferred Western Line station).
              </p>
              <p className={styles.clauseText}>
                8.2. Users may configure or revoke analytical preferences at any time via the "Cookie Preferences 🍪" control in the platform footer.
              </p>
            </section>

            {/* Section 9 */}
            <section id="privacy-9" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>9.</span> Data Retention & Permanent Erasure
              </h2>
              <p className={styles.clauseText}>
                9.1. Personal data is retained only for the duration necessary to maintain active user accounts and satisfy statutory record-keeping requirements under Indian law.
              </p>
              <p className={styles.clauseText}>
                9.2. Upon verified request for account deletion, all associated database records, authentication credentials, and review records are permanently expunged within 30 business days.
              </p>
            </section>

            {/* Section 10 */}
            <section id="privacy-10" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>10.</span> Data Principal Rights (Your Rights)
              </h2>
              <p className={styles.clauseText}>
                Under the Digital Personal Data Protection Act, 2023, data principals are entitled to:
              </p>
              <ul className={styles.subList}>
                <li><strong>Right to Access:</strong> Request a summary of personal data being processed by ServiceFinder.</li>
                <li><strong>Right to Correction:</strong> Request immediate rectification of inaccurate or outdated contact numbers.</li>
                <li><strong>Right to Erasure:</strong> Request permanent removal of personal data and directory profiles.</li>
                <li><strong>Right to Grievance Redressal:</strong> File a formal complaint with the designated Data Protection Officer.</li>
              </ul>
            </section>

            {/* Section 11: Compliance & Data Protection Officer */}
            <section id="privacy-11" className={styles.complianceBox}>
              <h3 className={styles.complianceTitle}>11. Data Protection Officer & Statutory Notice</h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#475569' }}>
                In accordance with the DPDPA 2023 and Rule 5(9) of the Information Technology Rules, 2011, the details of the designated Data Protection Officer are provided below:
              </p>
              <div className={styles.complianceDetails}>
                <div className={styles.complianceItem}>
                  <strong>Designation:</strong> Data Protection & Privacy Grievance Officer<br />
                  <strong>Jurisdiction:</strong> Western Railway Corridor, Mumbai<br />
                  <strong>Entity:</strong> ServiceFinder Compliance Group
                </div>
                <div className={styles.complianceItem}>
                  <strong>Postal Address:</strong> Borivali West, Mumbai, Maharashtra 400092, India<br />
                  <strong>Official Privacy Email:</strong> privacy@servicefinder.in<br />
                  <strong>Statutory Resolution Timeline:</strong> 30 calendar days
                </div>
              </div>
            </section>

            {/* Bottom Info Row */}
            <footer className={styles.docBottom}>
              <span>Document Reference: SF-PRIV-2026-V2</span>
              <div>
                <a href="#top" className={styles.bottomLink} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Back to top ↑
                </a>
              </div>
            </footer>
          </article>
        </div>
      </div>

      <Footer onNavigate={onNavigate} onRegister={() => onNavigate('provider')} />
    </>
  );
};
