import { Context } from 'telegraf';
import UserModel from '../../models/User.model.js';
import { getStatusKeyboard } from '../keyboards.js';

export const handleLinkCommand = async (ctx: Context): Promise<void> => {
  try {
    if (!ctx.chat || !('text' in (ctx.message || {}))) return;

    const messageText = (ctx.message as any).text.trim();
    const parts = messageText.split(/\s+/);
    const code = parts[1] ? parts[1].toUpperCase() : '';

    if (!code) {
      await ctx.reply(
        `⚠️ *Missing Link Code*\n\nPlease provide your 6-character link code generated from your Qindil Profile.\nExample: \`/link A1B2C3\``,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const user = await UserModel.findOne({
      telegramLinkCode: code,
      telegramLinkCodeExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      await ctx.reply(
        `❌ *Invalid or Expired Code*\n\nThe link code you entered is invalid or has expired (codes expire after 10 minutes).\n\nPlease generate a new code from your [Qindil Profile](https://qindilapologetics.com) settings and try again.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    user.telegramChatId = ctx.chat.id.toString();
    user.telegramLinkCode = undefined;
    user.telegramLinkCodeExpiresAt = undefined;
    await user.save();

    await ctx.reply(
      `✨ *Account Linked Successfully!*\n\n` +
      `Welcome aboard, *${user.name}* (\`${user.email}\`)!\n` +
      `Your Telegram account is now connected to Qindil. You will receive real-time task assignments, review outcomes, and deadline alerts right here.\n\n` +
      `Tap below to explore your current assignments! 🚀`,
      {
        parse_mode: 'Markdown',
        ...getStatusKeyboard(),
      }
    );
  } catch (err) {
    console.error('Error handling /link command:', err);
    await ctx.reply('❌ An error occurred while linking your account. Please try again.');
  }
};

export default handleLinkCommand;
