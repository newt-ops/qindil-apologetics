import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import Seo from '../../components/shared/Seo';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text font-sans py-12">
      <Seo
        title="Privacy Policy"
        description="Read Qindil's Privacy Policy regarding data collection, cookies, and user privacy rights."
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
            <Icon name="Shield" size={14} />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
            Privacy Policy
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
            This document outlines Qindil&apos;s data collection, cookie usage, and privacy practices. The text below serves as structured operational policy copy subject to formal legal team review.
          </p>
        </div>

        {/* Structured Legal Content */}
        <div className="space-y-8 text-sm text-textMuted leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">1.</span> Information We Collect
            </h2>
            <p>
              Qindil (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) collects limited personal and technical information to provide, maintain, and secure our Islamic apologetics research platform and workspace.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              <li>
                <strong className="text-text">Account Information:</strong> Name, email address, password hash (encrypted via bcrypt), and avatar URL provided upon user registration or Google Single Sign-On (SSO).
              </li>
              <li>
                <strong className="text-text">Contact Form Data:</strong> Name, email address, message topic, and inquiry content submitted through our public contact portal.
              </li>
              <li>
                <strong className="text-text">Technical & Usage Logs:</strong> IP address, user agent, login timestamps, and system audit logs for administrative security and access control.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">2.</span> How We Use Your Data
            </h2>
            <p>We process collected data exclusively for explicit operational purposes:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              <li>To authenticate user sessions and enforce role-based access control (RBAC).</li>
              <li>To respond to user inquiries and contact form submissions.</li>
              <li>To dispatch system notifications, task assignment alerts, and deadline reminders.</li>
              <li>To audit administrative actions and prevent unauthorized system activity.</li>
              <li>To aggregate anonymous usage analytics for content optimization.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">3.</span> Cookies & Analytics Preferences
            </h2>
            <p>
              We utilize essential HTTP cookies and optional analytical scripts to enhance reader experience:
            </p>
            <div className="rounded-lg border border-border bg-surface p-4 space-y-2 text-xs">
              <p>
                <strong className="text-text">Essential Cookies:</strong> Secure HttpOnly JWT refresh tokens required for session maintenance and login state.
              </p>
              <p>
                <strong className="text-text">Google Analytics 4 (GA4):</strong> Optional web measurement tools that process aggregated traffic metrics. GA4 scripts execute <em>only if you explicitly grant consent</em> via our Cookie Consent banner.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">4.</span> Third-Party Service Processors
            </h2>
            <p>
              We do not sell, rent, or trade your personal information. We engage trusted third-party infrastructure providers who process data strictly under confidentiality agreements:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              <li><strong className="text-text">Cloudinary:</strong> Image upload, storage, and dynamic asset transformation.</li>
              <li><strong className="text-text">Resend:</strong> Transactional email delivery and automated notification services.</li>
              <li><strong className="text-text">Google Identity Services:</strong> Secure OAuth 2.0 authentication.</li>
              <li><strong className="text-text">MongoDB Cloud:</strong> Encrypted document database storage.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="text-gold font-mono">5.</span> Data Rights & Requests
            </h2>
            <p>
              Registered users and public visitors have the right to request access, correction, or deletion of their personal data stored within our systems.
            </p>
            <p className="text-xs">
              To submit a data access or erasure request, please contact our team via the{' '}
              <Link to="/contact" className="text-gold underline font-semibold">
                Contact Form
              </Link>{' '}
              or email directly to <code className="bg-surface px-1.5 py-0.5 rounded text-gold font-mono border border-border">privacy@qindilapologetics.com</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
