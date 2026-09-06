import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import Seo from '../../../components/shared/Seo';

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('section-1');

  const sections = [
    { id: 'section-1', title: '1. Information We Collect' },
    { id: 'section-2', title: '2. Operational Usage of Data' },
    { id: 'section-3', title: '3. Cookies & Consent Analytics' },
    { id: 'section-4', title: '4. Infrastructure Processors' },
    { id: 'section-5', title: '5. Rights to Access & Erasure' },
    { id: 'section-6', title: '6. Data Retention & Security' },
  ];

  const highlights = [
    {
      title: 'Zero Ad Tracking',
      desc: 'We never sell data or deploy advertising trackers.',
      icon: 'Shield',
    },
    {
      title: 'Encrypted Security',
      desc: 'Industry-standard encryption & secure session cookies.',
      icon: 'Lock',
    },
    {
      title: 'Right to Erasure',
      desc: 'Request full account and record deletion anytime.',
      icon: 'User',
    },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen bg-bg text-text font-sans py-6 sm:py-16 selection:bg-gold/20 selection:text-gold transition-colors duration-200 overflow-hidden">
      <Seo
        title="Privacy Policy — Data Protection & Privacy Rights"
        description="Read Qindil's Privacy Policy regarding data collection, cookies, security protocols, and user privacy rights."
      />

      {/* Ambient background glow & radial highlights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(179,133,76,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,168,76,0.1),rgba(0,0,0,0))]" />

      <div className="relative mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-textMuted hover:text-gold transition-colors"
          >
            <Icon name="ArrowLeft" size={14} />
            <span>Return to Public Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-border pb-6 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/25">
            <Icon name="Shield" size={13} />
            <span>Institutional Legal Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
            Privacy Policy &amp; Data Ethics
          </h1>
          <p className="text-xs text-textMuted font-mono">
            Last Updated: September 5, 2026 · Release v2.0.0
          </p>
        </div>

        {/* Key Highlights Grid - Prompt 42: Compact 3-col or mobile scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 space-y-1.5 shadow-sm"
            >
              <div className="flex items-center space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Icon name={h.icon as any} size={14} />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-text">{h.title}</h2>
              </div>
              <p className="text-[11px] text-textMuted leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile Horizontal Quick Navigation Strip - Prompt 42 */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 border-b border-border text-xs scrollbar-none">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition shrink-0 ${
                activeSection === s.id
                  ? 'bg-gold text-bg font-bold shadow-sm'
                  : 'bg-surface border border-border text-textMuted'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Main Content Layout: Sticky TOC on Desktop + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Table of Contents (4 cols) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <div className="rounded-xl border border-border bg-surface p-5 space-y-3 shadow-md">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gold">
                Table of Contents
              </h2>
              <nav className="space-y-1.5 text-xs">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition font-medium flex items-center justify-between ${
                      activeSection === s.id
                        ? 'bg-gold/15 text-gold font-bold border border-gold/30'
                        : 'text-textMuted hover:text-text hover:bg-bg'
                    }`}
                  >
                    <span>{s.title}</span>
                    <Icon name="ChevronRight" size={12} />
                  </button>
                ))}
              </nav>
            </div>

            {/* DPO Contact Card */}
            <div className="rounded-xl border border-border/80 bg-surface/70 p-4 space-y-2 text-xs">
              <span className="font-bold text-text flex items-center gap-1.5">
                <Icon name="Mail" size={13} className="text-gold" />
                <span>Privacy Inquiries</span>
              </span>
              <p className="text-textMuted text-[11px] leading-relaxed">
                Direct questions regarding our data practices to our Data Protection Officers.
              </p>
              <Link
                to="/contact"
                className="inline-block text-gold hover:underline font-semibold text-[11px]"
              >
                Submit Data Privacy Ticket
              </Link>
            </div>
          </div>

          {/* Policy Text Column (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-8 text-xs sm:text-sm text-textMuted leading-relaxed">
            {/* Section 1 */}
            <section id="section-1" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 01
                </span>
                <span>Information We Collect</span>
              </h2>
              <p>
                Qindil Apologetics (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) collects limited, purposeful information strictly necessary to provide scholarly publications, user authentication, and interactive editorial workflows.
              </p>
              <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                <ul className="space-y-2 text-xs">
                  <li>
                    <strong className="text-text">Account Credentials:</strong> Full name, email address, cryptographically salted and hashed password, and avatar photo provided via manual registration or Google Single Sign-On (SSO).
                  </li>
                  <li>
                    <strong className="text-text">Public Contact Submissions:</strong> Sender name, verified email address, chosen inquiry topic, and message content submitted through our public portal.
                  </li>
                  <li>
                    <strong className="text-text">Administrative Security Logs:</strong> IP address, browser user-agent, session timestamps, and audit event logs for administrative access governance.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 02
                </span>
                <span>Operational Usage of Data</span>
              </h2>
              <p>We process collected data exclusively for legitimate operational purposes:</p>
              <div className="rounded-xl border border-border bg-surface p-4 space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <Icon name="Check" size={13} className="text-gold shrink-0 mt-0.5" />
                  <span>Authenticate reader sessions and enforce role-based access control.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Check" size={13} className="text-gold shrink-0 mt-0.5" />
                  <span>Respond directly to academic inquiries, paper submissions, and feedback.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Check" size={13} className="text-gold shrink-0 mt-0.5" />
                  <span>Dispatch critical transactional alerts (verification codes, security notifications).</span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Check" size={13} className="text-gold shrink-0 mt-0.5" />
                  <span>Protect platform integrity and prevent unauthorized access or system misuse.</span>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 03
                </span>
                <span>Cookies &amp; Consent Analytics</span>
              </h2>
              <p>
                We use strictly essential HTTP cookies to maintain authenticated sessions and optional privacy-focused analytics:
              </p>
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1 text-xs">
                  <h3 className="font-bold text-text">Essential Security Cookies</h3>
                  <p className="text-[11px] leading-relaxed">
                    Cryptographically secured session authentication cookies required to maintain session status. These cannot be disabled as the system cannot authenticate users without them.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1 text-xs">
                  <h3 className="font-bold text-text">Aggregated Analytics (Optional)</h3>
                  <p className="text-[11px] leading-relaxed">
                    We only load analytical measurement scripts if you explicitly provide consent via our Cookie Consent banner. All IP addresses are anonymized.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 04
                </span>
                <span>Third-Party Infrastructure Processors</span>
              </h2>
              <p>
                We do not sell, rent, or trade your personal information. We partner with established enterprise infrastructure providers operating under strict confidentiality and data protection agreements:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-surface p-3 space-y-1 text-xs">
                  <strong className="text-text">Cloud Media Storage:</strong>
                  <p className="text-[11px]">Avatar storage and dynamic media optimization.</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3 space-y-1 text-xs">
                  <strong className="text-text">Transactional Email Services:</strong>
                  <p className="text-[11px]">Secure notification delivery and verification codes.</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3 space-y-1 text-xs">
                  <strong className="text-text">Identity Authentication:</strong>
                  <p className="text-[11px]">Secure OAuth single sign-on authentication.</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3 space-y-1 text-xs">
                  <strong className="text-text">Encrypted Database Persistence:</strong>
                  <p className="text-[11px]">Enterprise database storage with automated disaster recovery.</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 05
                </span>
                <span>Rights to Access, Portability &amp; Erasure</span>
              </h2>
              <p>
                All registered members and public contributors have the unconditional right to access, inspect, export, or permanently erase their personal data from our active systems.
              </p>
              <p className="text-xs">
                To submit an official data request, submit an inquiry via our{' '}
                <Link to="/contact" className="text-gold underline font-semibold">
                  Contact Form
                </Link>{' '}
                or reach our privacy team at <code className="bg-surface px-1.5 py-0.5 rounded text-gold font-mono border border-border">privacy@qindilapologetics.com</code>.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 06
                </span>
                <span>Data Retention &amp; Cryptographic Security</span>
              </h2>
              <p>
                We retain account data only for as long as your profile remains active. In the event of account deactivation or deletion, personal identifiable records are expunged within 30 calendar days, preserving only anonymized audit log events required for system integrity.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
