export interface EmailLayoutOptions {
  title: string;
  preheader?: string;
  bodyHtml: string;
}

/**
 * Shared email layout wrapper producing mobile-friendly, table-based HTML
 * rendering consistently across all major email clients (Gmail, Outlook, Apple Mail).
 */
export const renderEmailLayout = ({ title, preheader, bodyHtml }: EmailLayoutOptions): string => {
  const currentYear = new Date().getFullYear();
  const preheaderText = preheader || title;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
  <style type="text/css">
    /* Client-specific Resets */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0a0a0a; color: #f5f1ea; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    /* Mobile responsive media query */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding-left: 12px !important; padding-right: 12px !important; }
      .content-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-button { width: 100% !important; text-align: center !important; }
      .otp-display { font-size: 26px !important; letter-spacing: 6px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; color: #f5f1ea;">
  <!-- Hidden Preheader Text -->
  <div style="display: none; font-size: 1px; color: #0a0a0a; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheaderText}
  </div>

  <!-- Outer Background Table -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0a0a; width: 100%;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        
        <!-- Main Email Container (Max 600px) -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #141414; border: 1px solid #262626; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Gold Accent Header Bar -->
          <tr>
            <td style="background-color: #c9a06b; height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding: 28px 24px 20px 24px; background-color: #141414; border-bottom: 1px solid #262626;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <!-- Brand Emblem / Logo -->
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: rgba(201, 160, 107, 0.12); border: 1px solid rgba(201, 160, 107, 0.3); border-radius: 12px; padding: 10px 16px;">
                          <span style="font-size: 20px; font-weight: 900; color: #c9a06b; font-family: 'Inter', sans-serif; letter-spacing: 2px;">QINDIL</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 8px;">
                    <span style="font-size: 11px; font-weight: 600; color: #a8a29e; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Inter', sans-serif;">Apologetics & Research Platform</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content Area -->
          <tr>
            <td class="content-padding" style="padding: 32px 32px; background-color: #141414;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0d0d0d; border-top: 1px solid #262626; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 12px; color: #78716c; line-height: 1.6; font-family: 'Inter', sans-serif;">
                    <p style="margin: 0 0 6px 0; font-weight: 500; color: #a8a29e;">
                      Qindil Apologetics • Islamic Apologetics & Intellectual Research
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 11px;">
                      This message was sent automatically from an unmonitored notification system.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #57534e;">
                      © ${currentYear} Qindil Platform. All rights reserved. | <a href="https://qindilapologetics.com" style="color: #c9a06b; text-decoration: none;">qindilapologetics.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Container -->

      </td>
    </tr>
  </table>
  <!-- End Outer Table -->
</body>
</html>`;
};
