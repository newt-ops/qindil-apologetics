import { Link } from 'react-router-dom';
import Icon from '../icons/Icon';
import { useSettings } from '../../hooks/useSettings';
import Logo from '../shared/Logo';
import ThemeToggle from '../shared/ThemeToggle';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: settings } = useSettings();

  const siteName = settings?.siteName || 'Qindil';
  const tagline = settings?.tagline || 'Islamic Apologetics & Intellectual Research Platform. Providing clarity and rigorous research.';
  const contactEmail = settings?.contactEmail || 'contact@qindilapologetics.com';

  const socialLinksObj = settings?.socialLinks || {};
  const activeSocials = [
    { name: 'YouTube', icon: 'Video', url: socialLinksObj.youtube },
    { name: 'Telegram', icon: 'Mail', url: socialLinksObj.telegram },
    { name: 'Instagram', icon: 'ExternalLink', url: socialLinksObj.instagram },
    { name: 'Facebook', icon: 'ExternalLink', url: socialLinksObj.facebook },
    { name: 'TikTok', icon: 'ExternalLink', url: socialLinksObj.tiktok },
  ].filter((s) => Boolean(s.url));

  return (
    <footer className="w-full border-t border-border bg-surface text-textMuted font-sans">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <Link to="/" className="flex items-center">
              <Logo variant="full" height={32} />
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-textMuted">
              {tagline}
            </p>
            {contactEmail && (
              <div className="text-xs text-textMuted">
                <span className="text-text font-medium">Contact: </span>
                <a href={`mailto:${contactEmail}`} className="text-gold hover:underline font-mono">
                  {contactEmail}
                </a>
              </div>
            )}
          </div>

          {/* Nav Links Col */}
          <div>
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link to="/" className="transition hover:text-gold">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/topics" className="transition hover:text-gold">
                  Topics
                </Link>
              </li>
              <li>
                <Link to="/events" className="transition hover:text-gold">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition hover:text-gold">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-gold">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition hover:text-gold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition hover:text-gold">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links Col */}
          <div>
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider">Connect</h3>
            {activeSocials.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeSocials.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-surface/80 backdrop-blur-md shadow-apple-sm text-textMuted transition-all hover:border-gold/60 hover:text-gold active:scale-90"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <Icon name={social.icon as any} size={15} />
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-textMuted italic">No social links configured.</p>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-textMuted gap-3">
          <p>© {currentYear} {siteName}. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <ThemeToggle showLabel />
            <span>•</span>
            <Link to="/privacy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
