import { Markup } from 'telegraf';
import { IUser } from '../../models/User.model.js';

export interface TelegramTemplateResult {
  text: string;
  keyboard: any;
}

/**
 * User / Reader Dashboard Template
 * Streamlined for readers with library access and reading status.
 */
export const renderUserDashboard = async (user: IUser): Promise<TelegramTemplateResult> => {
  const firstName = user.name ? user.name.split(' ')[0] : 'Reader';

  const text =
    `[•] *Qindil Reader Portal*\n\n` +
    `Welcome back, *${firstName}*!\n\n` +
    `👤 *Reader:* ${user.name}\n` +
    `📧 *Email:* \`${user.email}\`\n` +
    `🛡️ *Status:* \`Verified Member\`\n` +
    `🔔 *Notifications:* *Synchronized*\n` +
    `📚 *Library Access:* *Full Access*\n\n` +
    `You are connected to Qindil Apologetics. You will receive immediate notifications when new symposium papers, research articles, or announcements are published.`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url('📚 Explore Library', 'https://qindilapologetics.com/articles'),
      Markup.button.url('👤 Reader Dashboard', 'https://qindilapologetics.com/dashboard'),
    ],
    [
      Markup.button.callback('🔄 Refresh Status', 'refresh_status'),
      Markup.button.callback('❓ Guide & Help', 'nav_help'),
    ],
    [
      Markup.button.callback('🔓 Disconnect Account', 'confirm_unlink'),
    ],
  ]);

  return { text, keyboard };
};

export default renderUserDashboard;
