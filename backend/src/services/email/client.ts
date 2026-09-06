import { resend } from '../../config/resend.js';
import { env } from '../../config/env.js';

export type OtpPurpose = 'verification' | 'password_reset';
export type EmailPurpose = 'verification' | 'tasks' | 'contact' | 'info';

/**
 * Returns the purpose-matched sender identity per Prompt 51 & Master §13
 */
export const getSenderAddress = (purpose: EmailPurpose): string => {
  switch (purpose) {
    case 'verification':
      return env.RESEND_VERIFICATION_EMAIL || 'Qindil Verification <verification@qindilapologetics.com>';
    case 'tasks':
      return env.RESEND_TASKS_EMAIL || 'Qindil Ops <tasks@qindilapologetics.com>';
    case 'contact':
      return env.RESEND_CONTACT_EMAIL || 'Qindil Team <contact@qindilapologetics.com>';
    case 'info':
    default:
      return (
        env.RESEND_INFO_EMAIL ||
        env.RESEND_FROM_EMAIL ||
        'Qindil Apologetics <info@qindilapologetics.com>'
      );
  }
};

export { resend };
