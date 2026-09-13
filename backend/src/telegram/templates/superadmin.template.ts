import { Markup } from 'telegraf';
import { IUser, UserModel } from '../../models/User.model.js';
import TaskModel from '../../models/Task.model.js';
import ArticleModel from '../../models/Article.model.js';
import { TelegramTemplateResult } from './user.template.js';

/**
 * Super Admin Dashboard Template
 * Full platform executive overview with global metrics and direct operations portal.
 */
export const renderSuperAdminDashboard = async (user: IUser): Promise<TelegramTemplateResult> => {
  const firstName = user.name ? user.name.split(' ')[0] : 'Super Admin';

  // 1. Fetch system-wide platform statistics
  const [
    totalUsers,
    totalArticlesPublished,
    articlesInReview,
    totalOpenTasks,
    myOpenTasks,
  ] = await Promise.all([
    UserModel.countDocuments(),
    ArticleModel.countDocuments({ status: 'published' }),
    ArticleModel.countDocuments({ status: 'inReview' }),
    TaskModel.countDocuments({ status: { $in: ['pending', 'inProgress', 'inReview'] } }),
    TaskModel.countDocuments({ assignedTo: user._id, status: { $in: ['pending', 'inProgress', 'inReview'] } }),
  ]);

  const text =
    `[•] *Qindil Super Administrator Console*\n\n` +
    `Executive Session: *${firstName}*\n\n` +
    `👤 *Identity:* ${user.name}\n` +
    `📧 *Email:* \`${user.email}\`\n` +
    `🛡️ *Authority:* \`SUPER ADMINISTRATOR\`\n\n` +
    `📊 *Platform Vital Signs:*\n` +
    `• Registered Users: *${totalUsers}*\n` +
    `• Published Research: *${totalArticlesPublished} articles*\n` +
    `• Articles Awaiting Review: *${articlesInReview}*\n` +
    `• Total Platform Tasks: *${totalOpenTasks} active*\n` +
    `• Directly Assigned to You: *${myOpenTasks} open*\n\n` +
    `Tap below for administrative shortcuts and portal links:`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url('🏛️ Admin Operations Portal', 'https://qindilapologetics.com/admin'),
    ],
    [
      Markup.button.callback('📋 My Assigned Tasks', 'my_tasks'),
      Markup.button.callback('🔄 Refresh Metrics', 'refresh_status'),
    ],
    [
      Markup.button.url('🌐 Editorial Workspace', 'https://qindilapologetics.com/admin/workspace'),
      Markup.button.url('👥 User Roster', 'https://qindilapologetics.com/admin/users'),
    ],
    [
      Markup.button.callback('❓ Guide & Help', 'nav_help'),
      Markup.button.callback('🔓 Disconnect Account', 'confirm_unlink'),
    ],
  ]);

  return { text, keyboard };
};

export default renderSuperAdminDashboard;
