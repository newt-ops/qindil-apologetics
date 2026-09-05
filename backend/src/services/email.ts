import { resend } from '../config/resend.js';
import { env } from '../config/env.js';

export type OtpPurpose = 'verification' | 'password_reset';

const getFromEmail = () => {
  return env.RESEND_FROM_EMAIL || 'Qindil Platform <notifications@qindilapologetics.com>';
};

// Brand HTML Template Wrapper
const wrapEmailTemplate = (title: string, bodyHtml: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #121212; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; }
    .header { background-color: #18181b; padding: 24px; text-align: center; border-bottom: 1px solid #27272a; }
    .header h1 { color: #c9a84c; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; line-height: 1.6; font-size: 15px; color: #d4d4d8; }
    .content h2 { color: #f4f4f5; font-size: 18px; margin-top: 0; margin-bottom: 16px; }
    .otp-code { display: inline-block; background-color: #18181b; border: 1px solid #c9a84c; color: #c9a84c; font-size: 28px; font-weight: bold; font-family: monospace; letter-spacing: 6px; padding: 12px 24px; border-radius: 8px; margin: 20px 0; }
    .btn { display: inline-block; background-color: #c9a84c; color: #0a0a0a; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; margin-top: 16px; }
    .footer { background-color: #09090b; padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>QINDIL</h1>
    </div>
    <div class="content">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Qindil Apologetics Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// 1. Send OTP Email (Verification or Password Reset)
export const sendOtpEmail = async (
  to: string,
  otp: string,
  purpose: OtpPurpose
): Promise<void> => {
  const isVerification = purpose === 'verification';
  const subject = isVerification
    ? 'Verify Your Qindil Account'
    : 'Reset Your Qindil Password';

  const bodyHtml = `
    <h2>${isVerification ? 'Account Verification' : 'Password Reset Request'}</h2>
    <p>Hello,</p>
    <p>Your one-time security code is provided below. This code will expire in <strong>10 minutes</strong>.</p>
    <div style="text-align: center;">
      <div class="otp-code">${otp}</div>
    </div>
    <p style="font-size: 13px; color: #a1a1aa;">If you did not request this code, please ignore this email or contact security if you have concerns.</p>
  `;

  console.log(`[EMAIL SERVICE] Sending OTP to <${to}> for [${purpose}]: Code = ${otp}`);

  if (resend) {
    try {
      await resend.emails.send({
        from: getFromEmail(),
        to,
        subject,
        html: wrapEmailTemplate(subject, bodyHtml),
      });
    } catch (err) {
      console.error('❌ Error sending Resend OTP email:', err);
    }
  }
};

// 2. Send Contact Form Auto Reply
export const sendContactAutoReply = async (name: string, email: string): Promise<boolean> => {
  const subject = 'Thank you for reaching out to Qindil';
  const bodyHtml = `
    <h2>Thank You for Contacting Us</h2>
    <p>Dear ${name},</p>
    <p>We have received your message submitted through the Qindil public contact form. Our research and editorial team will review your inquiry and get back to you as soon as possible.</p>
    <p>In the meantime, feel free to explore our latest articles and topics on the platform.</p>
    <p style="margin-top: 24px;">Warm regards,<br><strong style="color: #c9a84c;">The Qindil Team</strong></p>
  `;

  console.log(`[EMAIL SERVICE] Sending Contact Auto-Reply to ${name} <${email}>`);

  if (resend) {
    try {
      await resend.emails.send({
        from: getFromEmail(),
        to: email,
        subject,
        html: wrapEmailTemplate(subject, bodyHtml),
      });
    } catch (err) {
      console.error('❌ Error sending Resend contact auto-reply:', err);
    }
  }

  return true;
};

// 3. Send Task Assigned Email
export const sendTaskAssignedEmail = async (
  to: string,
  taskTitle: string,
  assignedByName?: string
): Promise<void> => {
  const subject = `New Task Assignment: ${taskTitle}`;
  const bodyHtml = `
    <h2>New Task Assigned</h2>
    <p>Hello,</p>
    <p>You have been assigned a new task on the Qindil operations board${assignedByName ? ` by <strong>${assignedByName}</strong>` : ''}:</p>
    <div style="background-color: #18181b; padding: 16px; border-left: 4px solid #c9a84c; border-radius: 4px; margin: 16px 0; font-weight: bold; color: #f4f4f5;">
      ${taskTitle}
    </div>
    <p>Please log in to your Qindil Workspace to view details and update task status.</p>
  `;

  console.log(`[EMAIL SERVICE] Sending Task Assignment Email to <${to}>: "${taskTitle}"`);

  if (resend) {
    try {
      await resend.emails.send({
        from: getFromEmail(),
        to,
        subject,
        html: wrapEmailTemplate(subject, bodyHtml),
      });
    } catch (err) {
      console.error('❌ Error sending Resend task assignment email:', err);
    }
  }
};

// 4. Send 24h Deadline Reminder Email
export const sendDeadlineReminderEmail = async (
  to: string,
  taskTitle: string,
  dueDate: Date
): Promise<void> => {
  const formattedDate = new Date(dueDate).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const subject = `Reminder: Task "${taskTitle}" is due in 24 hours`;
  const bodyHtml = `
    <h2 style="color: #eab308;">Upcoming Task Deadline</h2>
    <p>Hello,</p>
    <p>This is a reminder that your assigned task is due within the next 24 hours:</p>
    <div style="background-color: #18181b; padding: 16px; border-left: 4px solid #eab308; border-radius: 4px; margin: 16px 0;">
      <div style="font-weight: bold; font-size: 16px; color: #f4f4f5;">${taskTitle}</div>
      <div style="font-size: 13px; color: #a1a1aa; margin-top: 4px;">Due Date: ${formattedDate}</div>
    </div>
    <p>Please complete or update the status of this task in your Qindil Workspace.</p>
  `;

  console.log(`[EMAIL SERVICE] Sending Deadline Reminder Email to <${to}>: "${taskTitle}"`);

  if (resend) {
    try {
      await resend.emails.send({
        from: getFromEmail(),
        to,
        subject,
        html: wrapEmailTemplate(subject, bodyHtml),
      });
    } catch (err) {
      console.error('❌ Error sending Resend deadline reminder email:', err);
    }
  }
};

// 5. Send Article Review Outcome Email
export const sendArticleReviewOutcomeEmail = async (
  to: string,
  articleTitle: string,
  status: 'approved' | 'changesRequested' | 'published',
  reviewNotes?: string
): Promise<void> => {
  let statusText = 'Reviewed';
  let statusColor = '#c9a84c';

  if (status === 'approved') {
    statusText = 'Approved';
    statusColor = '#22c55e';
  } else if (status === 'changesRequested') {
    statusText = 'Changes Requested';
    statusColor = '#ef4444';
  } else if (status === 'published') {
    statusText = 'Published';
    statusColor = '#3b82f6';
  }

  const subject = `Article Review Update: "${articleTitle}" - ${statusText}`;
  const bodyHtml = `
    <h2>Article Review Outcome</h2>
    <p>Hello,</p>
    <p>Your article draft <strong>"${articleTitle}"</strong> has been reviewed by the editorial team.</p>
    <div style="background-color: #18181b; padding: 16px; border-left: 4px solid ${statusColor}; border-radius: 4px; margin: 16px 0;">
      <div style="font-weight: bold; color: ${statusColor}; font-size: 16px;">Status: ${statusText}</div>
      ${
        reviewNotes
          ? `<div style="font-size: 13px; color: #d4d4d8; margin-top: 8px; font-style: italic;">Notes: "${reviewNotes}"</div>`
          : ''
      }
    </div>
    <p>Log in to Qindil to check status or edit your draft.</p>
  `;

  console.log(`[EMAIL SERVICE] Sending Article Review Outcome Email to <${to}>: "${articleTitle}" [${status}]`);

  if (resend) {
    try {
      await resend.emails.send({
        from: getFromEmail(),
        to,
        subject,
        html: wrapEmailTemplate(subject, bodyHtml),
      });
    } catch (err) {
      console.error('❌ Error sending Resend review outcome email:', err);
    }
  }
};
