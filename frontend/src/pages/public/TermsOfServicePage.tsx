import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import Seo from '../../components/shared/Seo';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text font-sans py-12">
      <Seo
        title="Terms of Service"
        description="Read Qindil's Terms of Service governing platform usage, member account responsibilities, and intellectual property rights."
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-textMuted hover:text-gold transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Back to Public Home</span>
          </Link>
        </div>

        {/* Page Title & Last Updated Banner */}
        <div className="border-b border-border pb-6 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
            <Icon name="FileText" size={14} />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
            Terms of Service
          </h1>
          <p className="text-xs text-textMuted font-mono">
            Last Updated: September 5, 2026 | Version 2.0.0
          </p>
        </div>

        {/* Notice Card for Legal Review Placeholder */}
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-xs text-textMuted space-y-1">
          <p className="font-bold text-gold flex items-center gap-1.5">
            <Icon name="Info" size={14} />
            Notice to Readers & Legal Reviewers
          </p>
          <p className="leading-relaxed">
            These Terms of Service govern visitor access and member account usage across the Qindil platform. The text below represents structured operational policy copy subject to formal legal team review.
          </p>
        </div>

        {/* Structured Legal Content */}
        <div className="space-y-8 text-sm text-textMuted leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">1.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or creating an account on Qindil (&quot;the Platform&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">2.</span> Account Registration & Security
            </h2>
            <p>
              Users registering an account must provide accurate, complete information. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              <li>Accounts are non-transferable without written administrative consent.</li>
              <li>You must immediately notify administrative staff of any unauthorized account access.</li>
              <li>Accounts found violating security guidelines may be suspended or deactivated.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">3.</span> Acceptable Use Policy
            </h2>
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              <li>Attempting to bypass authentication mechanisms, rate limits, or access controls.</li>
              <li>Automated scraping, bulk extraction, or reverse engineering of platform databases.</li>
              <li>Submitting malicious software, spam, or destructive code to contact or message forms.</li>
              <li>Impersonating team members or misrepresenting administrative affiliations.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">4.</span> Intellectual Property & Content Ownership
            </h2>
            <p>
              All published articles, refutation library entries, video logs, and research materials featured on Qindil are protected under copyright laws.
            </p>
            <div className="rounded-lg border border-border bg-surface p-4 space-y-2 text-xs">
              <p>
                <strong className="text-text">Platform Rights:</strong> Qindil retains full intellectual property ownership over platform code, logos, domain assets, and curated editorial publication rights.
              </p>
              <p>
                <strong className="text-text">Contributor Submissions:</strong> Writers and researchers submitting articles for publication grant Qindil a perpetual, worldwide license to publish, display, and archive the material.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">5.</span> Disclaimers & Limitation of Liability
            </h2>
            <p>
              The platform and all included content are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. Qindil disclaims all warranties, express or implied, including fitness for a particular purpose or non-infringement.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">6.</span> Contact & Governing Terms
            </h2>
            <p className="text-xs">
              If you have questions regarding these Terms of Service, please reach out via our{' '}
              <Link to="/contact" className="text-gold underline font-semibold">
                Contact Page
              </Link>{' '}
              or email <code className="bg-surface px-1.5 py-0.5 rounded text-gold font-mono border border-border">legal@qindilapologetics.com</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
