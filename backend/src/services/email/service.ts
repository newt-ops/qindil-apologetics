import { resend, getSenderAddress, OtpPurpose } from './client.js';
import {
  renderEmailLayout,
  renderVerificationEmail,
  renderTaskAssignedEmail,
} from './templates/index.js';

/**
 * Brand HTML Template Wrapper adopting renderEmailLayout for general emails.
 */
const wrapEmailTemplate = (title: string, bodyHtml: string): string => {
  return renderEmailLayout({ title, bodyHtml });
};

// 1. Send OTP Email (Verification or Password Reset) -> Sent from verification@qindilapologetics.com
export const sendOtpEmail = async (
  to: string,
  otp: string,
  purpose: OtpPurpose,
  name?: string
): Promise<void> => {
  const isVerification = purpose === 'verification';
  const subject = isVerification
    ? 'Verify Your Qindil Account'
    : 'Reset Your Qindil Password';

  const html = renderVerificationEmail({
    name,
    otp,
    purpose,
  });

  const sender = getSenderAddress('verification');
  console.log(`[EMAIL SERVICE] Sending OTP to <${to}> for [${purpose}] via [${sender}]: Code = ${otp}`);

  if (resend) {
    try {
      await resend.emails.send({
        from: sender,
        to,
        subject,
        html,
      });
    } catch (err) {
      console.error('❌ Error sending Resend OTP email:', err);
    }
  }
};

// 2. Send Contact Form Auto Reply -> Sent from contact@qindilapologetics.com
export const sendContactAutoReply = async (name: string, email: string): Promise<boolean> => {
  const subject = 'Thank you for reaching out to Qindil Apologetics';
  const bodyHtml = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding-bottom: 20px;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #f5f1ea; letter-spacing: -0.02em;">
            Thank You for Contacting Us
          </h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px; font-size: 15px; line-height: 1.6; color: #a8a29e;">
          Dear <strong style="color: #f5f1ea;">${name}</strong>,
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px; font-size: 14px; line-height: 1.6; color: #a8a29e;">
          We have received your message submitted through the Qindil public contact form. Our research and editorial team will review your inquiry and get back to you as soon as possible.
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px; font-size: 14px; line-height: 1.6; color: #a8a29e;">
          In the meantime, feel free to explore our latest articles and research topics on the platform.
        </td>
      </tr>
      <tr>
        <td style="padding-top: 16px; border-top: 1px solid #262626; font-size: 13px; color: #78716c;">
          Warm regards,<br>
          <strong style="color: #c9a06b;">The Qindil Editorial &amp; Research Team</strong>
        </td>
      </tr>
    </table>
  `;

  const sender = getSenderAddress('contact');
  console.log(`[EMAIL SERVICE] Sending Contact Auto-Reply to ${name} <${email}> via [${sender}]`);

  if (resend) {
    try {
      await resend.emails.send({
        from: sender,
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

// 3. Send Task Assigned Email -> Sent from tasks@qindilapologetics.com
export const sendTaskAssignedEmail = async (
  to: string,
  taskTitle: string,
  assignedByName?: string,
  taskType?: string,
  dueDate?: Date | string,
  actionUrl?: string,
  recipientName?: string
): Promise<void> => {
  const subject = `New Task Assignment: ${taskTitle}`;
  const html = renderTaskAssignedEmail({
    name: recipientName,
    taskTitle,
    taskType,
    dueDate,
    assignedByName,
    actionUrl,
  });

  const sender = getSenderAddress('tasks');
  console.log(`[EMAIL SERVICE] Sending Task Assignment Email to <${to}> via [${sender}]: "${taskTitle}"`);

  if (resend) {
    try {
      await resend.emails.send({
        from: sender,
        to,
        subject,
        html,
      });
    } catch (err) {
      console.error('❌ Error sending Resend task assignment email:', err);
    }
  }
};

// 4. Send 24h Deadline Reminder Email -> Sent from tasks@qindilapologetics.com
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
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding-bottom: 20px;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #eab308; letter-spacing: -0.02em;">
            ⚠️ Upcoming Task Deadline
          </h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px; font-size: 15px; line-height: 1.6; color: #a8a29e;">
          Hello,
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px; font-size: 14px; line-height: 1.6; color: #a8a29e;">
          This is an automated reminder that your assigned task is due within the next 24 hours:
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d; border-left: 4px solid #eab308; border-top: 1px solid #262626; border-right: 1px solid #262626; border-bottom: 1px solid #262626; border-radius: 8px; padding: 20px;">
            <tr>
              <td style="font-weight: 700; font-size: 16px; color: #f5f1ea;">${taskTitle}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #eab308; padding-top: 8px;">⏰ Due Date: <strong>${formattedDate}</strong></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 16px; border-top: 1px solid #262626; font-size: 12px; line-height: 1.5; color: #78716c; text-align: center;">
          Please complete or update the status of this task in your Qindil Workspace.
        </td>
      </tr>
    </table>
  `;

  const sender = getSenderAddress('tasks');
  console.log(`[EMAIL SERVICE] Sending Deadline Reminder Email to <${to}> via [${sender}]: "${taskTitle}"`);

  if (resend) {
    try {
      await resend.emails.send({
        from: sender,
        to,
        subject,
        html: wrapEmailTemplate(subject, bodyHtml),
      });
    } catch (err) {
      console.error('❌ Error sending Resend deadline reminder email:', err);
    }
  }
};

// 5. Send Article Review Outcome Email -> Sent from tasks@qindilapologetics.com
export const sendArticleReviewOutcomeEmail = async (
  to: string,
  articleTitle: string,
  status: 'approved' | 'changesRequested' | 'published',
  reviewNotes?: string
): Promise<void> => {
  let statusText = 'Reviewed';
  let statusColor = '#c9a06b';

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
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding-bottom: 20px;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #f5f1ea; letter-spacing: -0.02em;">
            Article Review Outcome
          </h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px; font-size: 15px; line-height: 1.6; color: #a8a29e;">
          Hello,
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px; font-size: 14px; line-height: 1.6; color: #a8a29e;">
          Your article draft <strong style="color: #f5f1ea;">"${articleTitle}"</strong> has been reviewed by the editorial team.
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d; border-left: 4px solid ${statusColor}; border-top: 1px solid #262626; border-right: 1px solid #262626; border-bottom: 1px solid #262626; border-radius: 8px; padding: 20px;">
            <tr>
              <td style="font-weight: 700; color: ${statusColor}; font-size: 16px;">Status: ${statusText}</td>
            </tr>
            ${
              reviewNotes
                ? `<tr><td style="font-size: 13px; color: #d4d4d8; padding-top: 10px; font-style: italic;">Notes: "${reviewNotes}"</td></tr>`
                : ''
            }
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 16px; border-top: 1px solid #262626; font-size: 12px; line-height: 1.5; color: #78716c; text-align: center;">
          Log in to Qindil to check status or edit your draft.
        </td>
      </tr>
    </table>
  `;

  const sender = getSenderAddress('tasks');
  console.log(`[EMAIL SERVICE] Sending Article Review Outcome Email to <${to}> via [${sender}]: "${articleTitle}" [${status}]`);

  if (resend) {
    try {
      await resend.emails.send({
        from: sender,
        to,
        subject,
        html: wrapEmailTemplate(subject, bodyHtml),
      });
    } catch (err) {
      console.error('❌ Error sending Resend review outcome email:', err);
    }
  }
};

// 6. Send General Info Email -> Sent from info@qindilapologetics.com
export const sendGeneralInfoEmail = async (
  to: string,
  subject: string,
  contentHtml: string
): Promise<void> => {
  const sender = getSenderAddress('info');
  console.log(`[EMAIL SERVICE] Sending General Info Email to <${to}> via [${sender}]: "${subject}"`);

  if (resend) {
    try {
      await resend.emails.send({
        from: sender,
        to,
        subject,
        html: wrapEmailTemplate(subject, contentHtml),
      });
    } catch (err) {
      console.error('❌ Error sending Resend general info email:', err);
    }
  }
};
