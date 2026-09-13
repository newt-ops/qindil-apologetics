import { Context } from 'telegraf';
import { renderStartView } from '../views.js';
import { linkTelegramAccount } from './link.js';
import { renderDashboardByRole } from '../templates/index.js';

/**
 * /start [TOKEN] Command Handler
 * Supports direct deep linking: clicking "Connect to Telegram" passes the 6-character token via /start <token>.
 */
export const handleStartCommand = async (ctx: Context): Promise<void> => {
  try {
    if (!ctx.chat) return;

    const chatIdStr = ctx.chat.id.toString();

    // 1. Extract payload token from deep link: https://t.me/<bot>?start=<token>
    let token = (ctx as any).payload;
    if (!token && 'text' in (ctx.message || {})) {
      const text = ((ctx.message as any).text || '').trim();
      const parts = text.split(/\s+/);
      if (parts.length > 1 && parts[1]) {
        token = parts[1];
      }
    }

    if (token) {
      // User tapped "Start" via the deep link button!
      const result = await linkTelegramAccount(chatIdStr, token.toUpperCase());

      if (!result.success) {
        await ctx.reply(result.message, { parse_mode: 'Markdown' });
        return;
      }

      await ctx.reply(result.message, { parse_mode: 'Markdown' });

      if (result.user) {
        const { text, keyboard } = await renderDashboardByRole(result.user);
        await ctx.reply(text, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          ...keyboard,
        });
      }
      return;
    }

    // 2. Standard /start command without parameters
    const { text, keyboard } = await renderStartView(chatIdStr);

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...keyboard,
    });
  } catch (err) {
    console.error('Error handling /start command:', err);
    await ctx.reply('❌ An error occurred while starting the bot. Please try again.');
  }
};

export default handleStartCommand;
