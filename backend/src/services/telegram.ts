import { Types } from 'mongoose';
import { bot } from '../config/telegram.js';
import { env } from '../config/env.js';
import UserModel from '../models/User.model.js';

// Send Telegram notification to a specific user by userId
export const notifyUser = async (userId: string | Types.ObjectId, text: string): Promise<void> => {
  try {
    if (!bot) {
      console.log(`[TELEGRAM SERVICE] (No bot instance) User notification <${userId}>: ${text}`);
      return;
    }

    const user = await UserModel.findById(userId).select('name telegramChatId');
    if (!user || !user.telegramChatId) {
      console.log(`[TELEGRAM SERVICE] User <${userId}> has no linked Telegram account. Skipping.`);
      return;
    }

    await bot.telegram.sendMessage(user.telegramChatId, text, { parse_mode: 'HTML' });
    console.log(`[TELEGRAM SERVICE] ✅ Sent message to user <${user.name}> (Chat ID: ${user.telegramChatId})`);
  } catch (err) {
    console.error(`❌ Error in Telegram notifyUser for <${userId}>:`, err);
  }
};

// Send Telegram Task Assignment Notification
export const sendTelegramTaskNotification = async (
  userId: string | Types.ObjectId,
  taskTitle: string
): Promise<void> => {
  const message = `📋 <b>New Task Assigned</b>\n\nYou have been assigned a new task: <b>${taskTitle}</b>.\nPlease check your Qindil Workspace for details.`;
  await notifyUser(userId, message);
};

// Send Telegram notification to public/admin notification channel
export const notifyChannel = async (text: string): Promise<void> => {
  try {
    if (!bot || !env.TELEGRAM_NOTIFY_CHANNEL_ID) {
      console.log(`[TELEGRAM SERVICE] (No channel config) Channel notification: ${text}`);
      return;
    }

    await bot.telegram.sendMessage(env.TELEGRAM_NOTIFY_CHANNEL_ID, text, { parse_mode: 'HTML' });
    console.log(`[TELEGRAM SERVICE] ✅ Sent notification to Telegram channel ${env.TELEGRAM_NOTIFY_CHANNEL_ID}`);
  } catch (err) {
    console.error('❌ Error in Telegram notifyChannel:', err);
  }
};

// Register Telegram Bot Command Handlers & Launch
export const initTelegramBot = async (): Promise<void> => {
  if (!bot) {
    console.log('ℹ️ Telegram bot token not configured. Skipping bot startup.');
    return;
  }

  // /start command
  bot.start((ctx) => {
    ctx.reply(
      '👋 Welcome to Qindil Bot!\n\nTo link your Qindil account, generate a 6-character link code in your profile dashboard and send:\n`/link <CODE>`',
      { parse_mode: 'Markdown' }
    );
  });

  // /link <code> command handler
  bot.command('link', async (ctx) => {
    try {
      const messageText = ctx.message.text.trim();
      const parts = messageText.split(/\s+/);
      const code = parts[1] ? parts[1].toUpperCase() : '';

      if (!code) {
        return ctx.reply('⚠️ Please provide your 6-character link code.\nExample: `/link A1B2C3`', {
          parse_mode: 'Markdown',
        });
      }

      const user = await UserModel.findOne({
        telegramLinkCode: code,
        telegramLinkCodeExpiresAt: { $gt: new Date() },
      });

      if (!user) {
        return ctx.reply(
          '❌ Invalid or expired link code. Please generate a new code from your Qindil profile settings.'
        );
      }

      user.telegramChatId = ctx.chat.id.toString();
      user.telegramLinkCode = undefined;
      user.telegramLinkCodeExpiresAt = undefined;
      await user.save();

      return ctx.reply(
        `✅ <b>Account Linked Successfully!</b>\n\nYour Telegram account is now linked to Qindil user: <b>${user.name}</b> (${user.email}). You will receive task assignments, review updates, and deadline reminders here.`,
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      console.error('Error handling /link command:', err);
      return ctx.reply('❌ An error occurred while linking your account. Please try again.');
    }
  });

  // /unlink command handler
  bot.command('unlink', async (ctx) => {
    try {
      const chatIdStr = ctx.chat.id.toString();
      const user = await UserModel.findOne({ telegramChatId: chatIdStr });

      if (!user) {
        return ctx.reply('ℹ️ No Qindil account is currently linked to this Telegram chat.');
      }

      user.telegramChatId = undefined;
      await user.save();

      return ctx.reply(`✅ Successfully unlinked Telegram from Qindil account: <b>${user.name}</b>.`, {
        parse_mode: 'HTML',
      });
    } catch (err) {
      console.error('Error handling /unlink command:', err);
      return ctx.reply('❌ An error occurred while unlinking your account.');
    }
  });

  bot.catch((err, ctx) => {
    console.error(`❌ Telegraf error for ${ctx.updateType}:`, err);
  });

  try {
    await bot.launch();
    console.log('🤖 Telegram Bot launched successfully');
  } catch (err) {
    console.error('❌ Failed to launch Telegram Bot:', err);
  }
};

export default {
  notifyUser,
  notifyChannel,
  initTelegramBot,
};
