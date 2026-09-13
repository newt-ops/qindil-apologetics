import { Markup } from 'telegraf';
import { IUser } from '../../models/User.model.js';
import TaskModel from '../../models/Task.model.js';
import ArticleModel from '../../models/Article.model.js';
import { TelegramTemplateResult } from './user.template.js';

/**
 * Editorial Admin Dashboard Template
 * Tailored for researchers, authors, and editors managing tasks and reviews.
 */
export const renderAdminDashboard = async (user: IUser): Promise<TelegramTemplateResult> => {
  const firstName = user.name ? user.name.split(' ')[0] : 'Staff';

  // 1. Fetch assigned open tasks
  const openTasks = await TaskModel.find({
    assignedTo: user._id,
    status: { $in: ['pending', 'inProgress', 'inReview'] },
  }).sort({ dueDate: 1 });

  const openCount = openTasks.length;
  let nextDueStr = 'None pending';

  if (openCount > 0 && openTasks[0].dueDate) {
    nextDueStr = new Date(openTasks[0].dueDate).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  // 2. Fetch pending review articles across the editorial desk
  const pendingReviewCount = await ArticleModel.countDocuments({ status: 'inReview' });

  const topTaskTitle = openCount > 0 ? openTasks[0].title : null;

  const text =
    `[•] *Qindil Editorial Operations*\n\n` +
    `Welcome, *${firstName}*!\n\n` +
    `👤 *Staff:* ${user.name}\n` +
    `📧 *Email:* \`${user.email}\`\n` +
    `🛡️ *Role:* \`Editorial Admin / Fellow\`\n` +
    `📋 *Assigned Tasks:* *${openCount} open*\n` +
    `⏰ *Next Due Date:* \`${nextDueStr}\`\n` +
    `📝 *Articles in Review:* *${pendingReviewCount} queue*\n` +
    `${topTaskTitle ? `\n📌 *Top Priority:* _${topTaskTitle}_\n` : '\n🎉 *Queue is clear!* No pending tasks.\n'}\n` +
    `Use the interactive controls below to inspect tasks or open the web workspace:`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('📋 View My Tasks', 'my_tasks'),
      Markup.button.callback('🔄 Refresh Status', 'refresh_status'),
    ],
    [
      Markup.button.url('🌐 Open Workspace', 'https://qindilapologetics.com/admin/workspace'),
      Markup.button.url('📝 Review Queue', 'https://qindilapologetics.com/admin/articles'),
    ],
    [
      Markup.button.callback('❓ Guide & Help', 'nav_help'),
      Markup.button.callback('📩 Contact Support', 'nav_contact'),
    ],
    [
      Markup.button.callback('🔓 Disconnect Account', 'confirm_unlink'),
    ],
  ]);

  return { text, keyboard };
};

export default renderAdminDashboard;
