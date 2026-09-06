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

export interface TelegramViewResult {
  text: string;
  keyboard: any;
}

/**
 * 1. Start / Main Menu View
 */
export const renderStartView = async (chatIdStr: string): Promise<TelegramViewResult> => {
  const user = await UserModel.findOne({ telegramChatId: chatIdStr }).populate('roles');

  if (!user) {
    const text =
      `👋 *Welcome to Qindil Platform Bot!*\n\n` +
      `Qindil Bot is your personal companion to the *Qindil Apologetics Platform*.\n\n` +
      `⚠️ *Account Not Connected*\n` +
      `To receive instant publication alerts, reading updates, and platform notifications, please link your website account.\n\n` +
      `Click *How to Connect* below for quick step-by-step instructions!`;

    return {
      text,
      keyboard: getMainMenuKeyboard(false),
    };
  }

  const roleNames = Array.isArray(user.roles)
    ? (user.roles as any[]).map((r: any) => (typeof r === 'string' ? r : r.name || ''))
    : [];
  const isAdmin = roleNames.includes('admin') || roleNames.includes('superAdmin');

  const firstName = user.name ? user.name.split(' ')[0] : 'Member';
  const text = isAdmin
    ? `👋 *Welcome back, ${firstName}!*\n\n` +
      `Your Telegram is linked to staff account: *${user.name}* (\`${user.email}\`).\n\n` +
      `Use the interactive menu below to check assignments, view deadlines, or open the Qindil workspace:`
    : `👋 *Welcome back, ${firstName}!*\n\n` +
      `Your Telegram is linked to reader account: *${user.name}* (\`${user.email}\`).\n\n` +
      `Use the menu below to view your reader profile, browse new research articles, or access your saved library:`;

  return {
    text,
    keyboard: getMainMenuKeyboard(true, isAdmin),
  };
};

/**
 * 2. Status & Overview View
 */
export const renderStatusView = async (chatIdStr: string): Promise<TelegramViewResult> => {
  const user = await UserModel.findOne({ telegramChatId: chatIdStr }).populate('roles');

  if (!user) {
    const text =
      `⚠️ *Account Not Connected*\n\n` +
      `Your Telegram chat is not connected to a Qindil account.\n` +
      `Click *How to Connect* to link your account in 30 seconds.`;

    return {
      text,
      keyboard: getHowToLinkKeyboard(),
    };
  }

  const roleNames = Array.isArray(user.roles)
    ? (user.roles as any[]).map((r: any) => (typeof r === 'string' ? r : r.name || ''))
    : [];
  const isAdmin = roleNames.includes('admin') || roleNames.includes('superAdmin');

  // If regular user/reader, return clean reader profile (zero task jargon)
  if (!isAdmin) {
    const text =
      `📊 *Qindil Reader Profile*\n\n` +
      `👤 *Reader:* ${user.name}\n` +
      `📧 *Email:* \`${user.email}\`\n` +
      `🛡️ *Membership:* \`Verified Reader\`\n` +
      `🔔 *Telegram Notifications:* *Active*\n` +
      `📚 *Research Access:* *Full Access to Library & Symposia*\n\n` +
      `🌐 Personal Library: [qindilapologetics.com/dashboard](https://qindilapologetics.com/dashboard)`;

    return {
      text,
      keyboard: getReaderStatusKeyboard(),
    };
  }

  // Admin / SuperAdmin Status View
  const openTasks = await TaskModel.find({
    assignedTo: user._id,
    status: { $in: ['pending', 'inProgress', 'inReview'] },
  }).sort({ dueDate: 1 });

  const openCount = openTasks.length;
  let nextDueStr = 'No pending deadlines';

  if (openCount > 0 && openTasks[0].dueDate) {
    nextDueStr = new Date(openTasks[0].dueDate).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const topTaskTitle = openCount > 0 ? openTasks[0].title : null;
  const isSuperAdmin = roleNames.includes('superAdmin');
  const roleFormatted = isSuperAdmin ? 'SUPER ADMINISTRATOR' : 'EDITORIAL ADMIN';

  const text =
    `📊 *Qindil Operations Status*\n\n` +
    `👤 *Staff:* ${user.name}\n` +
    `📧 *Email:* \`${user.email}\`\n` +
    `🛡️ *Role:* \`${roleFormatted}\`\n` +
    `📋 *Open Tasks:* *${openCount}*\n` +
    `⏰ *Nearest Due Date:* ${nextDueStr}\n` +
    `${topTaskTitle ? `\n📌 *Top Priority:* _${topTaskTitle}_\n` : '\n🎉 *All caught up!* No pending tasks.\n'}\n` +
    `🌐 Direct workspace: [qindilapologetics.com/admin](https://qindilapologetics.com/admin)`;

  return {
    text,
    keyboard: getStatusKeyboard(),
  };
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
