import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import type { PublicView } from '../types';
import styles from './LegalPage.module.css';

interface TermsPageProps {
  onNavigate: (view: PublicView) => void;
  onSignIn: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate, onSignIn }) => {
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
            <span className={styles.docPill}>Legal Documentation</span>
          </div>

          {/* Document Header */}
          <header className={styles.docHeader}>
            <h1 className={styles.docTitle}>Terms of Service & User Agreement</h1>
            <p className={styles.docSubtitle}>
              These Terms of Service govern access to and use of the ServiceFinder directory platform, digital communication features, and related neighborhood service tools across the Mumbai Western Railway corridor.
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
                <span className={styles.metaLabel}>Territory & Jurisdiction</span>
                <span className={styles.metaValue}>Mumbai, Maharashtra, India</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Applicability</span>
                <span className={styles.metaValue}>All Residents & Service Providers</span>
              </div>
            </div>
          </header>

          {/* Document Card */}
          <article className={styles.docCard}>
            {/* Table of Contents */}
            <nav className={styles.tocBox} aria-label="Table of Contents">
              <h2 className={styles.tocTitle}>Table of Contents</h2>
              <ul className={styles.tocList}>
                <li><a href="#section-1" className={styles.tocItem}>1. Acceptance of Terms</a></li>
                <li><a href="#section-2" className={styles.tocItem}>2. Platform Architecture & Directory Scope</a></li>
                <li><a href="#section-3" className={styles.tocItem}>3. Independent Contractor & Zero-Commission Model</a></li>
                <li><a href="#section-4" className={styles.tocItem}>4. User Eligibility & Account Responsibilities</a></li>
                <li><a href="#section-5" className={styles.tocItem}>5. Verification Standards & Disclaimers</a></li>
                <li><a href="#section-6" className={styles.tocItem}>6. Pricing, Estimates & Direct Settlement</a></li>
                <li><a href="#section-7" className={styles.tocItem}>7. Acceptable Use & Conduct Standards</a></li>
                <li><a href="#section-8" className={styles.tocItem}>8. Intellectual Property Rights</a></li>
                <li><a href="#section-9" className={styles.tocItem}>9. Limitation of Liability</a></li>
                <li><a href="#section-10" className={styles.tocItem}>10. Dispute Resolution & Governing Law</a></li>
                <li><a href="#section-11" className={styles.tocItem}>11. Grievance Redressal & Statutory Notice</a></li>
              </ul>
            </nav>

            <div className={styles.noticeBox}>
              <strong>Important Notice:</strong> Please read these Terms of Service carefully before browsing, contacting service providers, or registering your business on ServiceFinder. By accessing the platform, you acknowledge that you have read, understood, and agreed to be bound by all conditions set forth herein.
            </div>

            {/* Section 1 */}
            <section id="section-1" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>1.</span> Acceptance of Terms
              </h2>
              <p className={styles.clauseText}>
                1.1. This User Agreement is an electronic contract executed under the Indian Contract Act, 1872, the Information Technology Act, 2000, and rules framed thereunder. No physical signature is required.
              </p>
              <p className={styles.clauseText}>
                1.2. If you do not agree to these Terms of Service in their entirety, you must immediately discontinue use of the platform and any associated digital discovery tools.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>2.</span> Platform Architecture & Directory Scope
              </h2>
              <p className={styles.clauseText}>
                2.1. ServiceFinder provides an localized digital directory designed specifically for residential and commercial localities along the 23 suburban stations of the Mumbai Western Railway corridor (from Churchgate to Dahisar).
              </p>
              <p className={styles.clauseText}>
                2.2. The platform enables residents to discover contact information for verified independent service providers across 14 authorized home service trades, including Electricians, Plumbers, Carpenters, Painters, and Home Appliance Technicians.
              </p>
            </section>

            {/* Section 3 */}
            <section id="section-3" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>3.</span> Independent Contractor & Zero-Commission Model
              </h2>
              <p className={styles.clauseText}>
                3.1. <strong>No Agency or Employment Relationship:</strong> ServiceFinder is strictly an information discovery platform. Service providers listed on the platform are independent business operators or self-employed tradesmen. ServiceFinder is not an employer, agent, joint venturer, or contractor for any listed service professional.
              </p>
              <p className={styles.clauseText}>
                3.2. <strong>Zero Platform Commissions:</strong> ServiceFinder does not charge referral fees, commissions, or booking markups. The bilateral agreement for work performance, visit schedules, diagnostic costs, material acquisition, and final compensation exists solely between the customer and the technician.
              </p>
            </section>

            {/* Section 4 */}
            <section id="section-4" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>4.</span> User Eligibility & Account Responsibilities
              </h2>
              <p className={styles.clauseText}>
                4.1. You must be at least 18 years of age and legally competent to enter into binding contracts under Indian law to register an account or request services.
              </p>
              <p className={styles.clauseText}>
                4.2. Users are responsible for maintaining the confidentiality of their credentials and for all activities that occur under their authenticated accounts.
              </p>
              <p className={styles.clauseText}>
                4.3. Users agree to provide truthful, accurate, and current contact details (including working telephone numbers) when communicating with technicians or requesting callbacks.
              </p>
            </section>

            {/* Section 5 */}
            <section id="section-5" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>5.</span> Verification Standards & Disclaimers
              </h2>
              <p className={styles.clauseText}>
                5.1. While ServiceFinder takes reasonable administrative steps to inspect submitted proof of trade experience and verify phone authenticity, the issuance of an "Approved" or "Verified" badge does not constitute an express warranty, guarantee, or endorsement of work quality.
              </p>
              <p className={styles.clauseText}>
                5.2. Customers are advised to independently inspect trade credentials, request upfront written estimates for replacement parts, and ensure basic on-site safety precautions before work commences.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>6.</span> Pricing, Estimates & Direct Settlement
              </h2>
              <p className={styles.clauseText}>
                6.1. Service providers establish their own rates based on the complexity of the repair, market prices of replacement parts, and transit requirements within Mumbai.
              </p>
              <p className={styles.clauseText}>
                6.2. ServiceFinder does not hold escrow funds, collect payments, or process payment transactions on behalf of technicians. All financial transactions are settled directly between customer and technician via cash, UPI, or other mutually agreed methods.
              </p>
            </section>

            {/* Section 7 */}
            <section id="section-7" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>7.</span> Acceptable Use & Conduct Standards
              </h2>
              <p className={styles.clauseText}>
                7.1. Users agree to use the directory solely for lawful household and commercial service inquiries. The following actions are strictly prohibited:
              </p>
              <ul className={styles.subList}>
                <li>Using automated scripts, bots, or scraping tools to harvest telephone numbers or provider data.</li>
                <li>Harassing, abusing, or submitting fraudulent requests to listed professionals.</li>
                <li>Fabricating fraudulent customer reviews or ratings.</li>
                <li>Circumventing platform authentication or attempting unauthorized administrative access.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="section-8" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>8.</span> Intellectual Property Rights
              </h2>
              <p className={styles.clauseText}>
                8.1. All software, user interface designs, logos, typography, visual arrangements, and database compilations on ServiceFinder are the exclusive intellectual property of ServiceFinder and protected under Indian and international copyright laws.
              </p>
            </section>

            {/* Section 9 */}
            <section id="section-9" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>9.</span> Limitation of Liability
              </h2>
              <p className={styles.clauseText}>
                9.1. To the maximum extent permitted by applicable law, ServiceFinder, its directors, employees, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of:
              </p>
              <ul className={styles.subList}>
                <li>Any act, omission, delay, or substandard workmanship by an independent service provider.</li>
                <li>Personal injury, property loss, or damage occurring during on-site trade performance.</li>
                <li>Disputes regarding service pricing, parts durability, or warranty claims between customer and technician.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="section-10" className={styles.clause}>
              <h2 className={styles.clauseTitle}>
                <span className={styles.clauseNumber}>10.</span> Dispute Resolution & Governing Law
              </h2>
              <p className={styles.clauseText}>
                10.1. <strong>Governing Law:</strong> This agreement shall be governed by and interpreted in accordance with the laws of the Republic of India.
              </p>
              <p className={styles.clauseText}>
                10.2. <strong>Exclusive Jurisdiction:</strong> The competent courts located in Mumbai, Maharashtra shall have exclusive jurisdiction over any dispute arising from or related to these Terms.
              </p>
            </section>

            {/* Section 11: Compliance & Grievance Redressal */}
            <section id="section-11" className={styles.complianceBox}>
              <h3 className={styles.complianceTitle}>11. Statutory Grievance Redressal & Legal Notice</h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#475569' }}>
                In compliance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the contact details of the Grievance Officer are set forth below:
              </p>
              <div className={styles.complianceDetails}>
                <div className={styles.complianceItem}>
                  <strong>Designation:</strong> Legal Compliance & Grievance Officer<br />
                  <strong>Department:</strong> Regulatory Affairs, ServiceFinder<br />
                  <strong>Jurisdiction:</strong> Western Railway Corridor, Mumbai
                </div>
                <div className={styles.complianceItem}>
                  <strong>Office Address:</strong> Borivali West, Mumbai, Maharashtra 400092, India<br />
                  <strong>Official Legal Email:</strong> legal@servicefinder.in<br />
                  <strong>Statutory Response Time:</strong> Acknowledged within 48 hours
                </div>
              </div>
            </section>

            {/* Bottom Info Row */}
            <footer className={styles.docBottom}>
              <span>Document Reference: SF-TOS-2026-V2</span>
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
