import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCookieConsent, setCookieConsent, initGA4 } from '../../lib/analytics';
import Icon from '../icons/Icon';

export const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existingConsent = getCookieConsent();
    if (existingConsent === null) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    setCookieConsent('accepted');
    initGA4();
    setVisible(false);
  };

  const handleDecline = () => {
    setCookieConsent('declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 shadow-2xl"
      >
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 text-left">
            <div className="p-2.5 rounded-lg bg-[#c9a84c]/10 text-[#c9a84c] shrink-0 mt-0.5">
              <Icon name="Shield" size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                Privacy & Cookie Consent
              </h4>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                We use cookies and anonymous analytics to understand how readers interact with Qindil, improve our apologetics resource library, and enhance site security. Read our{' '}
                <Link to="/privacy" className="text-[#c9a84c] hover:underline font-semibold">
                  Privacy Policy
                </Link>{' '}
                to learn more.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors w-full sm:w-auto"
            >
              Decline
            </button>

            <button
              onClick={handleAccept}
              className="px-5 py-2 text-xs font-bold text-zinc-950 bg-[#c9a84c] hover:bg-[#d9b85c] rounded-lg transition-colors shadow-md w-full sm:w-auto flex items-center justify-center gap-1.5"
            >
              <Icon name="Check" size={14} />
              Accept Cookies
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
