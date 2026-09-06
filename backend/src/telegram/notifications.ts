import { Types } from 'mongoose';
import { Markup } from 'telegraf';
import { bot } from './bot.js';
import { env } from '../config/env.js';
import UserModel from '../models/User.model.js';

/**
 * Send Telegram notification to a specific user by userId
 */
export const notifyUser = async (
  userId: string | Types.ObjectId,
  text: string,
  parseMode: 'Markdown' | 'HTML' = 'Markdown',
  extra?: any
): Promise<void> => {
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

    await bot.telegram.sendMessage(user.telegramChatId, text, {
      parse_mode: parseMode,
      disable_web_page_preview: true,
      ...extra,
    });
    console.log(`[TELEGRAM SERVICE] ✅ Sent Telegram message to user <${user.name}> (Chat ID: ${user.telegramChatId})`);
  } catch (err) {
    console.error(`❌ Error in Telegram notifyUser for <${userId}>:`, err);
  }
};

/**
 * Send Telegram Role Change Notification (Promotions & Demotions)
 */
export const sendTelegramRoleChangeNotification = async (
  userId: string | Types.ObjectId,
  previousRole: string,
  newRole: string
): Promise<void> => {
  const user = await UserModel.findById(userId).select('name');
  const userName = user ? user.name : 'Team Member';

  const prevLower = (previousRole || '').toLowerCase();
  const newLower = (newRole || '').toLowerCase();

  let message = '';

  if ((prevLower === 'user' || prevLower === 'member') && newLower === 'admin') {
    message =
      `🎉 *Congratulations, ${userName}!*\n\n` +
      `We're thrilled to officially welcome you to the *Qindil Operations Team* as an *Admin*! 🌟\n\n` +
      `Your dedication to Islamic apologetics and research has earned the team's trust. As an Admin, you now have access to manage research topics, assign workflow tasks, and collaborate directly on platform operations.\n\n` +
      `Thank you for your service and leadership! 🚀`;
  } else if (prevLower === 'admin' && newLower === 'superadmin') {
    message =
      `👑 *Major Milestone: You've Been Appointed Super Admin!*\n\n` +
      `Dear *${userName}*,\n\n` +
      `On behalf of platform leadership, we are honored to promote you to *Super Admin* of Qindil Apologetics! 🌌🏆\n\n` +
      `This position recognizes your outstanding stewardship, wisdom, and core contributions to our mission. You now hold full administrative authorization across team rosters, security policies, and publishing workflows.\n\n` +
      `May Allah grant you success and barakah in this responsibility! 🤲✨`;
  } else if (
    (prevLower === 'superadmin' && (newLower === 'admin' || newLower === 'user')) ||
    (prevLower === 'admin' && newLower === 'user')
  ) {
    message =
      `ℹ️ *Account Role Update*\n\n` +
      `Hello *${userName}*,\n\n` +
      `This is a respectful notification that your Qindil account role has been updated from *${previousRole}* to *${newRole}*.\n\n` +
      `Your contributions to our platform remain greatly appreciated. If you have any questions, please reach out to platform leads.`;
  } else {
    message =
      `🔔 *Qindil Account Role Updated*\n\n` +
      `Hello *${userName}*, your account role has been updated to *${newRole}*.\n\n` +
      `Log in to [qindilapologetics.com](https://qindilapologetics.com) to view your updated permissions.`;
  }

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('📊 View Account Status', 'nav_status'),
      Markup.button.url('🌐 Open Platform', 'https://qindilapologetics.com'),
    ],
  ]);

  await notifyUser(userId, message, 'Markdown', keyboard);
};

/**
 * Send Telegram Task Assignment Notification
 */
export const sendTelegramTaskNotification = async (
  userId: string | Types.ObjectId,
  taskTitle: string,
  taskType: string = 'general',
  dueDate?: Date | string
): Promise<void> => {
  const user = await UserModel.findById(userId).select('name');
  const userName = user ? user.name.split(' ')[0] : 'Member';

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Flexible / Ongoing';

  const typeDisplay =
    taskType === 'article'
      ? 'Article Task 📝'
      : taskType === 'video'
      ? 'Video Task 🎬'
      : 'Operations Task 📋';

  const message =
    `📋 *New Task Assignment*\n\n` +
    `Hello *${userName}*, you have been assigned a new task:\n\n` +
    `📌 *Title:* *${taskTitle}*\n` +
    `🏷️ *Type:* \`${typeDisplay}\`\n` +
    `📅 *Due Date:* ${formattedDueDate}\n\n` +
    `⚠️ *Note:* Please review and accept this assignment in your workspace before commencing work.`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url('🌐 Open Workspace', 'https://qindilapologetics.com/admin/workspace'),
      Markup.button.callback('📋 My Open Tasks', 'my_tasks'),
    ],
    [
      Markup.button.callback('📊 Account Status', 'nav_status'),
    ],
  ]);

  await notifyUser(userId, message, 'Markdown', keyboard);
};

/**
 * Send Telegram Task/Article Progress & Outcome Notification
 */
export const sendTelegramTaskProgressNotification = async (
  userId: string | Types.ObjectId,
  title: string,
  eventType: 'changes_requested' | 'approved' | 'published',
  notes?: string
): Promise<void> => {
  const user = await UserModel.findById(userId).select('name');
  const userName = user ? user.name.split(' ')[0] : 'Member';

  let message = '';
  let keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url('🌐 View Workspace', 'https://qindilapologetics.com/admin/workspace'),
      Markup.button.callback('📊 My Status', 'nav_status'),
    ],
  ]);

  if (eventType === 'changes_requested') {
    message =
      `📝 *Action Required: Changes Requested*\n\n` +
      `Hello *${userName}*,\n` +
      `Review notes for your draft *"${title}"*:\n` +
      `_"${notes || 'Please check workspace review comments for details.'}"_\n\n` +
      `Please review and update your submission in your workspace.`;
  } else if (eventType === 'approved') {
    message =
      `✅ *Draft Approved!*\n\n` +
      `Great news, *${userName}*! Your draft *"${title}"* has been approved by the editorial team and queued for final publication. 🚀`;
  } else if (eventType === 'published') {
    message =
      `🎉 *Article Published Live!*\n\n` +
      `Congratulations, *${userName}*! Your article *"${title}"* is now published live on Qindil Apologetics! 🌟`;

    keyboard = Markup.inlineKeyboard([
      [
        Markup.button.url('🌐 View Live Platform', 'https://qindilapologetics.com'),
        Markup.button.callback('📊 My Status', 'nav_status'),
      ],
    ]);
  }

  if (message) {
    await notifyUser(userId, message, 'Markdown', keyboard);
  }
};

/**
 * Send Telegram notification to official channel and return message_id
 */
export const sendChannelMessage = async (
  text: string,
  parseMode: 'Markdown' | 'HTML' = 'Markdown'
): Promise<number | null> => {
  try {
    const channelId = env.TELEGRAM_OFFICIAL_CHANNEL_ID || env.TELEGRAM_NOTIFY_CHANNEL_ID;

    if (!bot || !channelId) {
      console.log(`[TELEGRAM SERVICE] (No channel config) Channel notification: ${text}`);
      return null;
    }

    const sent = await bot.telegram.sendMessage(channelId, text, { parse_mode: parseMode });
    console.log(`[TELEGRAM SERVICE] ✅ Sent message ${sent.message_id} to Telegram channel ${channelId}`);
    return sent.message_id;
  } catch (err) {
    console.error('❌ Error in Telegram sendChannelMessage:', err);
    return null;
  }
};

/**
 * Delete a message from the Telegram channel by messageId
 */
export const deleteChannelMessage = async (
  messageId: number,
  channelIdInput?: string
): Promise<boolean> => {
  try {
    const channelId = channelIdInput || env.TELEGRAM_OFFICIAL_CHANNEL_ID || env.TELEGRAM_NOTIFY_CHANNEL_ID;

    if (!bot || !channelId) {
      console.log(`[TELEGRAM SERVICE] (No channel config) Skipping delete for message ${messageId}`);
      return false;
    }

    await bot.telegram.deleteMessage(channelId, messageId);
    console.log(`[TELEGRAM SERVICE] 🗑️ Deleted message ${messageId} from channel ${channelId}`);
    return true;
  } catch (err) {
    console.error(`❌ Error deleting message ${messageId} from channel:`, err);
    return false;
  }
};

/**
 * Send Telegram notification to public/admin notification channel
 */
export const notifyChannel = async (
  text: string,
  parseMode: 'Markdown' | 'HTML' = 'Markdown'
): Promise<void> => {
  await sendChannelMessage(text, parseMode);
};

export default {
  notifyUser,
  sendTelegramRoleChangeNotification,
  sendTelegramTaskNotification,
  sendTelegramTaskProgressNotification,
  sendChannelMessage,
  deleteChannelMessage,
  notifyChannel,
};
