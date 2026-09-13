import { Markup } from 'telegraf';
import { TelegramTemplateResult } from './user.template.js';

/**
 * Guest / Unlinked User Welcome Template
 */
export const renderGuestDashboard = async (): Promise<TelegramTemplateResult> => {
  const text =
    `👋 *Welcome to the Qindil Apologetics Platform Bot*\n\n` +
    `Qindil Bot is your real-time notification bridge to our Islamic research library and editorial workspace.\n\n` +
    `⚠️ *Account Not Connected*\n` +
    `To receive immediate symposium publication alerts, reading updates, or staff task notifications, please link your website account.\n\n` +
    `*How to connect:*\n` +
    `1. Log into your account at [qindilapologetics.com](https://qindilapologetics.com)\n` +
    `2. Visit your Profile / Dashboard\n` +
    `3. Click *Connect Telegram* to launch instant verification!`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('🔗 How to Connect', 'how_to_link'),
      Markup.button.url('🌐 Open Platform', 'https://qindilapologetics.com'),
    ],
    [
      Markup.button.callback('❓ Help & Commands', 'nav_help'),
      Markup.button.callback('📩 Contact Team', 'nav_contact'),
    ],
  ]);

  return { text, keyboard };
};

export default renderGuestDashboard;
