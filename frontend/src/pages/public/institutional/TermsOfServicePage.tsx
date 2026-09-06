import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import Seo from '../../../components/shared/Seo';

export const TermsOfServicePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('section-1');

  const sections = [
    { id: 'section-1', title: '1. Acceptance of Terms' },
    { id: 'section-2', title: '2. User Accounts & Security' },
    { id: 'section-3', title: '3. Intellectual Property Rights' },
    { id: 'section-4', title: '4. Acceptable Conduct Code' },
    { id: 'section-5', title: '5. Warranties & Disclaimers' },
    { id: 'section-6', title: '6. Modifications & Inquiries' },
  ];

  const highlights = [
    {
      title: 'Academic Citation',
      desc: 'Free citation for scholarly and educational purposes.',
      icon: 'BookOpen',
    },
    {
      title: 'Member Security',
      desc: 'Users are responsible for their login credentials.',
      icon: 'Shield',
    },
    {
      title: 'Civil Discourse',
      desc: 'Harassment and malicious scraping are strictly prohibited.',
      icon: 'Scale',
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
        title="Terms of Service — Platform Governance & Member Agreement"
        description="Read Qindil's Terms of Service governing platform usage, member account responsibilities, and intellectual property rights."
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
            <Icon name="FileText" size={13} />
            <span>Legal Governance Framework</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
            Terms of Service &amp; Usage
          </h1>
          <p className="text-xs text-textMuted font-mono">
            Last Updated: September 5, 2026 · Release v2.0.0
          </p>
        </div>

        {/* Key Highlights Grid */}
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

        {/* Mobile Horizontal Quick Navigation Strip */}
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

            {/* Legal Support Card */}
            <div className="rounded-xl border border-border/80 bg-surface/70 p-4 space-y-2 text-xs">
              <span className="font-bold text-text flex items-center gap-1.5">
                <Icon name="Mail" size={13} className="text-gold" />
                <span>Legal Counsel</span>
              </span>
              <p className="text-textMuted text-[11px] leading-relaxed">
                For copyright infringement notices or licensing inquiries:
              </p>
              <Link
                to="/contact"
                className="inline-block text-gold hover:underline font-semibold text-[11px]"
              >
                Contact Legal Department
              </Link>
            </div>
          </div>

          {/* Terms Text Column (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-8 text-xs sm:text-sm text-textMuted leading-relaxed">
            {/* Section 1 */}
            <section id="section-1" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 01
                </span>
                <span>Acceptance of Terms</span>
              </h2>
              <p>
                By navigating, accessing, or creating an account on Qindil Apologetics (&quot;the Platform&quot;), you agree to be bound by these Terms of Service, all applicable laws, and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 02
                </span>
                <span>User Accounts &amp; Authentication Security</span>
              </h2>
              <p>
                To access specialized platform features (such as article bookmarking, reading history, or editorial workspaces), you may register an account manually or via Google Sign-In:
              </p>
              <div className="rounded-xl border border-border bg-surface p-4 space-y-2 text-xs">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>You must maintain the confidentiality of your credentials.</li>
                  <li>Account access is individual and non-transferable without written consent.</li>
                  <li>Any unauthorized activity conducted under your account must be reported immediately.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 03
                </span>
                <span>Intellectual Property &amp; Scholarly Citation</span>
              </h2>
              <p>
                All research papers, refutations, video logs, and analyses published on Qindil are protected under international copyright conventions:
              </p>
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1 text-xs">
                  <h3 className="font-bold text-text">Scholarly &amp; Educational Citation</h3>
                  <p className="text-[11px] leading-relaxed">
                    Researchers and students may cite excerpts with proper academic attribution to Qindil Apologetics and the original author. Commercial reprinting without written authorization is prohibited.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1 text-xs">
                  <h3 className="font-bold text-text">Platform Trademarks &amp; Identity</h3>
                  <p className="text-[11px] leading-relaxed">
                    The Qindil logo, design aesthetic, and domain assets remain the exclusive intellectual property of the Qindil Apologetics initiative.
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
                <span>Acceptable Conduct Code</span>
              </h2>
              <p>Users and visitors agree strictly not to engage in:</p>
              <div className="rounded-xl border border-border bg-surface p-4 space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <Icon name="Check" size={13} className="text-gold shrink-0 mt-0.5" />
                  <span>Automated denial-of-service, vulnerability scanning, or unauthorized probing.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Check" size={13} className="text-gold shrink-0 mt-0.5" />
                  <span>Bulk scraping of databases or systematic replication of the catalog.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Check" size={13} className="text-gold shrink-0 mt-0.5" />
                  <span>Defamatory, abusive, or malicious messages sent through inquiry forms.</span>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 05
                </span>
                <span>Warranties &amp; Disclaimers</span>
              </h2>
              <p>
                Materials on Qindil are curated for research and intellectual inquiry. While every effort is made to guarantee rigorous sourcing and accuracy, content is provided on an &quot;as is&quot; basis without warranty of any kind.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="scroll-mt-28 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2 border-b border-border pb-2">
                <span className="text-gold font-mono text-xs bg-gold/10 px-2 py-0.5 rounded border border-gold/25">
                  § 06
                </span>
                <span>Modifications &amp; Inquiries</span>
              </h2>
              <p>
                Qindil reserves the right to revise these Terms of Service at any time. Significant revisions will be highlighted in the release notes and version banner.
              </p>
              <p className="text-xs">
                For questions or formal correspondence, reach out via our{' '}
                <Link to="/contact" className="text-gold underline font-semibold">
                  Contact Form
                </Link>{' '}
                or email <code className="bg-surface px-1.5 py-0.5 rounded text-gold font-mono border border-border">legal@qindilapologetics.com</code>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
