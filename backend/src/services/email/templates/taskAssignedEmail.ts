import { renderEmailLayout } from './layout.js';

export interface TaskAssignedEmailOptions {
  name?: string;
  taskTitle: string;
  taskType?: string;
  dueDate?: Date | string;
  assignedByName?: string;
  actionUrl?: string;
}

/**
 * Renders a mobile-friendly task assignment notification email.
 */
export const renderTaskAssignedEmail = ({
  name,
  taskTitle,
  taskType = 'Operations Task',
  dueDate,
  assignedByName,
  actionUrl = 'https://qindilapologetics.com/admin/workspace',
}: TaskAssignedEmailOptions): string => {
  const title = `New Assignment: ${taskTitle}`;
  const preheader = `You have been assigned a new task: "${taskTitle}". View and accept your assignment.`;
  const recipientName = name ? name.split(' ')[0] : 'Team Member';

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Flexible / Ongoing';

  const bodyHtml = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding-bottom: 20px;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #f5f1ea; letter-spacing: -0.02em;">
            New Task Assignment
          </h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px; font-size: 15px; line-height: 1.6; color: #a8a29e;">
          Hello <strong style="color: #f5f1ea;">${recipientName}</strong>,
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px; font-size: 14px; line-height: 1.6; color: #a8a29e;">
          You have been assigned a new task on the Qindil operations board${
            assignedByName ? ` by <strong style="color: #f5f1ea;">${assignedByName}</strong>` : ''
          }:
        </td>
      </tr>

      <!-- Task Card Box -->
      <tr>
        <td style="padding-bottom: 28px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d0d0d; border-left: 4px solid #c9a06b; border-top: 1px solid #262626; border-right: 1px solid #262626; border-bottom: 1px solid #262626; border-radius: 8px; padding: 20px;">
            <tr>
              <td style="padding-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 700; color: #c9a06b; text-transform: uppercase; letter-spacing: 1px;">
                  ${taskType}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 12px; font-size: 17px; font-weight: 700; color: #f5f1ea; line-height: 1.4;">
                ${taskTitle}
              </td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #78716c; border-top: 1px solid #1f1f1f; padding-top: 10px;">
                📅 Target Due Date: <strong style="color: #a8a29e;">${formattedDueDate}</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Action Button -->
      <tr>
        <td align="center" style="padding-bottom: 24px;">
          <table border="0" cellpadding="0" cellspacing="0" class="mobile-button" style="margin: 0 auto;">
            <tr>
              <td align="center" style="background-color: #c9a06b; border-radius: 10px; padding: 14px 28px;">
                <a href="${actionUrl}" target="_blank" style="font-size: 14px; font-weight: 700; color: #0a0a0a; text-decoration: none; display: inline-block; font-family: 'Inter', sans-serif;">
                  View &amp; Accept Task &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Subtext -->
      <tr>
        <td style="padding-top: 16px; border-top: 1px solid #262626; font-size: 12px; line-height: 1.5; color: #78716c; text-align: center;">
          Log in to your Qindil Workspace to review full guidelines, upload attachments, or communicate with team leads.
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
