import { renderEmailLayout } from './layout.js';

export interface VerificationEmailOptions {
  name?: string;
  otp: string;
  purpose?: 'verification' | 'password_reset';
}

/**
 * Renders a mobile-friendly, high-contrast security OTP verification email.
 */
export const renderVerificationEmail = ({
  name,
  otp,
  purpose = 'verification',
}: VerificationEmailOptions): string => {
  const isVerification = purpose === 'verification';
  const title = isVerification ? 'Verify Your Qindil Account' : 'Reset Your Qindil Password';
  const preheader = `Your security code is ${otp}. Valid for 10 minutes.`;

  const recipientName = name ? name.split(' ')[0] : 'User';

  const bodyHtml = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding-bottom: 20px;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #f5f1ea; letter-spacing: -0.02em;">
            ${isVerification ? 'Account Verification Code' : 'Password Reset Request'}
          </h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px; font-size: 15px; line-height: 1.6; color: #a8a29e;">
          Hello <strong style="color: #f5f1ea;">${recipientName}</strong>,
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px; font-size: 14px; line-height: 1.6; color: #a8a29e;">
          ${
            isVerification
              ? 'Thank you for registering with Qindil. Please enter the 6-digit security verification code below to confirm your account:'
              : 'We received a request to reset your Qindil account password. Use the security code below to authorize your password change:'
          }
        </td>
      </tr>

      <!-- OTP Display Box -->
      <tr>
        <td align="center" style="padding-bottom: 24px;">
          <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td class="otp-display" align="center" style="background-color: #0d0d0d; border: 1.5px solid #c9a06b; border-radius: 12px; padding: 16px 32px; color: #c9a06b; font-family: 'JetBrains Mono', 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; text-shadow: 0 0 10px rgba(201, 160, 107, 0.2);">
                ${otp}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Expiration Note -->
      <tr>
        <td align="center" style="padding-bottom: 24px;">
          <span style="display: inline-block; background-color: rgba(22, 163, 74, 0.1); border: 1px solid rgba(22, 163, 74, 0.3); color: #4ade80; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px;">
            ⏱️ Expiration: Valid for 10 minutes only
          </span>
        </td>
      </tr>

      <!-- Security Notice -->
      <tr>
        <td style="padding-top: 16px; border-top: 1px solid #262626; font-size: 12px; line-height: 1.5; color: #78716c;">
          If you did not request this security code, no action is required. Your account remains safe and secure.
        </td>
      </tr>
    </table>
  `;

  return renderEmailLayout({
    title,
    preheader,
    bodyHtml,
  });
};
