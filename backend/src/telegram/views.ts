import UserModel from '../models/User.model.js';
import TaskModel from '../models/Task.model.js';
import {
  getMainMenuKeyboard,
  getStatusKeyboard,
  getReaderStatusKeyboard,
  getTasksKeyboard,
  getHelpKeyboard,
  getContactKeyboard,
  getHowToLinkKeyboard,
  getUnlinkConfirmKeyboard,
  getUnlinkedKeyboard,
} from './keyboards.js';
import { renderDashboardByRole } from './templates/index.js';

export interface TelegramViewResult {
  text: string;
  keyboard: any;
}

/**
 * 1. Start / Main Menu View
 * Dispatches to modular role template (superadmin, admin, user, or guest).
 */
export const renderStartView = async (chatIdStr: string): Promise<TelegramViewResult> => {
  const user = await UserModel.findOne({ telegramChatId: chatIdStr }).populate('roles');
  return renderDashboardByRole(user);
};

/**
 * 2. Status & Overview View
 * Dispatches to modular role template with refreshed status.
 */
export const renderStatusView = async (chatIdStr: string): Promise<TelegramViewResult> => {
  const user = await UserModel.findOne({ telegramChatId: chatIdStr }).populate('roles');
  return renderDashboardByRole(user);
};

/**
 * 3. Open Tasks Detailed View
 */
export const renderTasksView = async (chatIdStr: string): Promise<TelegramViewResult> => {
  const user = await UserModel.findOne({ telegramChatId: chatIdStr }).populate('roles');

  if (!user) {
    return {
      text: `⚠️ *Account Not Connected*\n\nPlease link your Qindil account to view your tasks.`,
      keyboard: getHowToLinkKeyboard(),
    };
  }

  const roleNames = Array.isArray(user.roles)
    ? (user.roles as any[]).map((r: any) => (typeof r === 'string' ? r : r.name || ''))
    : [];
  const isAdmin = roleNames.includes('admin') || roleNames.includes('superAdmin');

  // If reader, inform them politely with reader keyboard
  if (!isAdmin) {
    const text =
      `📚 *Qindil Reader Account*\n\n` +
      `Hello *${user.name}*,\n\n` +
      `Task assignments and editorial review workflows are designated for research staff and editorial fellows.\n\n` +
      `As a reader, you have full access to our published research library, bookmarks, and notifications.`;

    return {
      text,
      keyboard: getReaderStatusKeyboard(),
    };
  }

  const openTasks = await TaskModel.find({
    assignedTo: user._id,
    status: { $in: ['pending', 'inProgress', 'inReview'] },
  }).sort({ dueDate: 1 }).limit(8);

  if (openTasks.length === 0) {
    const text =
      `📋 *Your Active Assignments*\n\n` +
      `🎉 *All Caught Up!*\n\n` +
      `You currently have no open or pending tasks assigned to you.\n` +
      `Great job! When team leads assign you a task or research refutation, you will receive an instant notification here.`;

    return {
      text,
      keyboard: getTasksKeyboard(),
    };
  }

  let text = `📋 *Your Active Assignments (${openTasks.length})*\n\n`;

  openTasks.forEach((task, idx) => {
    const typeIcon =
      task.type === 'article' ? '📝' : task.type === 'video' ? '🎬' : '📋';
    
    const statusLabel =
      task.status === 'inProgress' ? '⏳ In Progress' : task.status === 'inReview' ? '📝 In Review' : '📋 Pending';

    const dueStr = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
      : 'Flexible';

    text += `${idx + 1}. ${typeIcon} *${task.title}*\n`;
    text += `   ↳ Status: _${statusLabel}_ | Due: \`${dueStr}\`\n\n`;
  });

  text += `🌐 Tap *Open Board* to update statuses or leave comments.`;

  return {
    text,
    keyboard: getTasksKeyboard(),
  };
};

/**
 * 4. Help & Guide View
 */
export const renderHelpView = async (chatIdStr?: string): Promise<TelegramViewResult> => {
  const text =
    `❓ *Qindil Bot Guide & Interactive Navigation*\n\n` +
    `Qindil Bot keeps you synchronized with platform operations in real-time.\n\n` +
    `*Available Commands & Features:*\n` +
    `• 📊 *Status* — Role information, open task counts, and nearest deadlines\n` +
    `• 📋 *Tasks* — Inspect all active assignments and target dates\n` +
    `• 🔗 *Connect* — Link your Telegram chat ID with code \`/link <code>\`\n` +
    `• 🔓 *Disconnect* — Safely unlink your Telegram account anytime\n` +
    `• 📩 *Contact* — Reach out to the editorial and technical team\n\n` +
    `Use the interactive buttons below for quick one-tap navigation:`;

  return {
    text,
    keyboard: getHelpKeyboard(),
  };
};

/**
 * 5. Contact Team View
 */
export const renderContactView = async (): Promise<TelegramViewResult> => {
  const text =
    `📩 *Contact Qindil Apologetics*\n\n` +
    `Need research assistance, editorial review support, or technical help?\n\n` +
    `🌐 *Public Contact Form:* [qindilapologetics.com/contact](https://qindilapologetics.com/contact)\n` +
    `✉️ *Direct Email:* \`contact@qindilapologetics.com\`\n` +
    `📢 *Ops & Info:* \`info@qindilapologetics.com\`\n\n` +
    `Our team monitors incoming messages and responds promptly.`;

  return {
    text,
    keyboard: getContactKeyboard(),
  };
};

/**
 * 6. How to Link View
 */
export const renderHowToLinkView = async (): Promise<TelegramViewResult> => {
  const text =
    `🔗 *How to Link Your Qindil Account*\n\n` +
    `Connecting your account takes less than 30 seconds:\n\n` +
    `1️⃣ Log in at [qindilapologetics.com](https://qindilapologetics.com)\n` +
    `2️⃣ Navigate to your *Profile* or *Dashboard* page\n` +
    `3️⃣ Click *Connect Telegram* to generate your unique 6-character code\n` +
    `4️⃣ Send the code in this chat as:\n` +
    `   \`/link <code>\`\n\n` +
    `Once linked, you will immediately receive real-time deadline warnings and editorial updates here!`;

  return {
    text,
    keyboard: getHowToLinkKeyboard(),
  };
};

/**
 * 7. Unlink Confirmation Dialog View
 */
export const renderUnlinkConfirmView = async (chatIdStr: string): Promise<TelegramViewResult> => {
  const user = await UserModel.findOne({ telegramChatId: chatIdStr });

  if (!user) {
    return {
      text: `ℹ️ *No Account Connected*\n\nThis Telegram chat is not currently connected to any Qindil account.`,
      keyboard: getMainMenuKeyboard(false),
    };
  }

  const text =
    `⚠️ *Confirm Account Disconnection*\n\n` +
    `Are you sure you want to disconnect Telegram from *${user.name}* (\`${user.email}\`)?\n\n` +
    `If disconnected, you will *no longer receive* instant task assignments, 24h deadline alerts, or editorial notifications in Telegram.\n\n` +
    `You can reconnect anytime from your website profile.`;

  return {
    text,
    keyboard: getUnlinkConfirmKeyboard(),
  };
};

/**
 * 8. Perform Unlink Action
 */
export const performUnlink = async (chatIdStr: string): Promise<TelegramViewResult> => {
  const user = await UserModel.findOne({ telegramChatId: chatIdStr });

  if (!user) {
    return {
      text: `ℹ️ *No Account Connected*\n\nThis Telegram chat is not currently connected to any Qindil account.`,
      keyboard: getMainMenuKeyboard(false),
    };
  }

  user.telegramChatId = undefined;
  user.telegramLinkCode = undefined;
  user.telegramLinkCodeExpiresAt = undefined;
  await user.save();

  const text =
    `🔓 *Account Disconnected*\n\n` +
    `Successfully unlinked Telegram from *${user.name}* (\`${user.email}\`).\n\n` +
    `You have been safely disconnected. Whenever you're ready to reconnect, tap *Connect Account* below!`;

  return {
    text,
    keyboard: getUnlinkedKeyboard(),
  };
};
