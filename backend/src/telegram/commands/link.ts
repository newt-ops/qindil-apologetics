import { Context } from 'telegraf';
import UserModel, { IUser } from '../../models/User.model.js';
import { renderDashboardByRole } from '../templates/index.js';

export interface LinkResult {
  success: boolean;
  message: string;
  user?: IUser;
}

/**
 * Core Account Linking Service with Strict Mutual Exclusivity
 */
export const linkTelegramAccount = async (chatIdStr: string, code: string): Promise<LinkResult> => {
  const cleanCode = code.trim().toUpperCase();

  // Check 1: Is this Telegram chat already linked to a Qindil account?
  const existingChatUser = await UserModel.findOne({ telegramChatId: chatIdStr }).populate('roles');
  if (existingChatUser) {
    return {
      success: false,
      message:
        `⚠️ *Already Connected*\n\n` +
        `This Telegram account is already linked to *${existingChatUser.name}* (\`${existingChatUser.email}\`).\n\n` +
        `A single Telegram chat cannot be connected to multiple accounts simultaneously.\n` +
        `To link a different account, please send /unlink first to disconnect your current profile.`,
      user: existingChatUser,
    };
  }

  // Check 2: Verify the 6-character link code
  const targetUser = await UserModel.findOne({
    telegramLinkCode: cleanCode,
    telegramLinkCodeExpiresAt: { $gt: new Date() },
  }).populate('roles');

  if (!targetUser) {
    return {
      success: false,
      message:
        `❌ *Invalid or Expired Code*\n\n` +
        `The link code you entered is invalid or has expired (codes expire after 10 minutes).\n\n` +
        `Please generate a new code from your [Qindil Profile](https://qindilapologetics.com) and try again.`,
    };
  }

  // Check 3: Is the target Qindil account already connected to a different Telegram chat?
  if (targetUser.telegramChatId && targetUser.telegramChatId !== chatIdStr) {
    return {
      success: false,
      message:
        `⚠️ *Account Already Connected*\n\n` +
        `The Qindil account *${targetUser.name}* (\`${targetUser.email}\`) is already connected to another Telegram account.\n\n` +
        `To link it to this Telegram chat, please disconnect it first from your website dashboard or by sending /unlink from your other Telegram device.`,
    };
  }

  // Both sides are clear: link the account
  targetUser.telegramChatId = chatIdStr;
  targetUser.telegramLinkCode = undefined;
  targetUser.telegramLinkCodeExpiresAt = undefined;
  await targetUser.save();

  return {
    success: true,
    message:
      `✨ *Account Linked Successfully!*\n\n` +
      `Welcome aboard, *${targetUser.name}* (\`${targetUser.email}\`)!\n` +
      `Your Telegram account is now securely synchronized with Qindil.`,
    user: targetUser,
  };
};

/**
 * /link <CODE> Slash Command Handler
 */
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

    const chatIdStr = ctx.chat.id.toString();
    const result = await linkTelegramAccount(chatIdStr, code);

    if (!result.success) {
      await ctx.reply(result.message, { parse_mode: 'Markdown' });
      return;
    }

    // Success! Show confirmation and then display the role-specific dashboard
    await ctx.reply(result.message, { parse_mode: 'Markdown' });

    if (result.user) {
      const { text, keyboard } = await renderDashboardByRole(result.user);
      await ctx.reply(text, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        ...keyboard,
      });
    }
  } catch (err) {
    console.error('Error handling /link command:', err);
    await ctx.reply('❌ An error occurred while linking your account. Please try again.');
  }
};

export default handleLinkCommand;
