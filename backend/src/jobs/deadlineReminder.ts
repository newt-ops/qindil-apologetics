import cron from 'node-cron';
import { Markup } from 'telegraf';
import { TaskModel } from '../models/Task.model.js';
import { IUser } from '../models/User.model.js';
import { sendDeadlineReminderEmail } from '../services/email/index.js';
import { notifyUser } from '../telegram/index.js';
import { createNotification } from '../services/notify.js';

/**
 * Executes the daily deadline reminder & status update logic:
 * 1. Sends email & Telegram reminders for tasks due in the next 24 hours.
 * 2. Marks pending/inProgress/inReview tasks past their due date as 'overdue'.
 */
export const runDeadlineReminderCheck = async (): Promise<void> => {
  try {
    console.log('⏰ Running deadline reminder and overdue task check...');
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Remind tasks due in the next 24 hours
    const upcomingTasks = await TaskModel.find({
      dueDate: { $gte: now, $lte: in24Hours },
      status: { $nin: ['done', 'overdue'] },
    }).populate<{ assignedTo: IUser[] }>('assignedTo');

    for (const task of upcomingTasks) {
      if (Array.isArray(task.assignedTo)) {
        for (const user of task.assignedTo) {
          if (user && user.email) {
            // Email reminder
            await sendDeadlineReminderEmail(user.email, task.title, task.dueDate).catch(
              (err) => console.error(`Failed to send deadline email to ${user.email}:`, err)
            );

            // Telegram reminder
            if (user.telegramChatId) {
              const msg = `⏰ *Task Deadline Reminder*\n\nYour task "*${task.title}*" is due in less than 24 hours (${new Date(task.dueDate).toLocaleString()}).\n\nPlease finalize and update your status in your workspace.`;
              await notifyUser(
                user._id,
                msg,
                'Markdown',
                Markup.inlineKeyboard([
                  [Markup.button.url('🌐 Open Workspace', 'https://qindilapologetics.com/admin/workspace')],
                  [Markup.button.callback('📋 View My Tasks', 'my_tasks')],
                ])
              ).catch((err) =>
                console.error(`Failed to send Telegram reminder to ${user._id}:`, err)
              );
            }

            // In-app notification
            await createNotification({
              recipient: user._id as any,
              type: 'task_deadline',
              title: 'Task Deadline Approaching',
              body: `Task "${task.title}" is due within 24 hours.`,
              link: '/admin/tasks',
            }).catch((err) =>
              console.error(`Failed to create in-app notification for ${user._id}:`, err)
            );
          }
        }
      }
    }

    // 2. Mark overdue tasks
    const overdueResult = await TaskModel.updateMany(
      {
        dueDate: { $lt: now },
        status: { $in: ['pending', 'inProgress', 'inReview'] },
      },
      {
        $set: { status: 'overdue' },
      }
    );

    console.log(
      `✅ Deadline check completed. Reminders sent for ${upcomingTasks.length} task(s). Marked ${overdueResult.modifiedCount} task(s) as overdue.`
    );
  } catch (error) {
    console.error('❌ Error running deadline reminder check:', error);
  }
};

/**
 * Initializes the daily cron job (runs every day at 08:00 AM server time).
 */
export const initDeadlineReminderCron = (): void => {
  // Run daily at 08:00 AM
  cron.schedule('0 8 * * *', () => {
    runDeadlineReminderCheck();
  });
  console.log('📅 Deadline reminder cron job scheduled (daily at 08:00 AM).');
};
