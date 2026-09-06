import { Telegraf, Context } from 'telegraf';
import {
  renderStartView,
  renderStatusView,
  renderTasksView,
  renderHelpView,
  renderContactView,
  renderHowToLinkView,
  renderUnlinkConfirmView,
  performUnlink,
} from './views.js';

/**
 * Safely edit message text ignoring Telegram API's "message is not modified" rejection.
 */
const safeEditMessage = async (
  ctx: Context,
  text: string,
  extra: any
): Promise<void> => {
  try {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...extra,
    });
  } catch (err: any) {
    // If the content & markup didn't change, Telegram throws "message is not modified"
    if (err?.description?.includes('message is not modified')) {
      return;
    }
    console.error('❌ Error editing Telegram message via callback query:', err);
  }
};

/**
 * Register all callback query action handlers on the Telegraf bot instance.
 */
export const registerBotActions = (bot: Telegraf): void => {
  // 1. Navigation: Main Menu
  bot.action('nav_main', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const chatIdStr = ctx.chat?.id.toString() || '';
      const { text, keyboard } = await renderStartView(chatIdStr);
      await safeEditMessage(ctx, text, keyboard);
    } catch (err) {
      console.error('Error in nav_main action:', err);
    }
  });

  // 2. Navigation: Status Overview
  bot.action('nav_status', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const chatIdStr = ctx.chat?.id.toString() || '';
      const { text, keyboard } = await renderStatusView(chatIdStr);
      await safeEditMessage(ctx, text, keyboard);
    } catch (err) {
      console.error('Error in nav_status action:', err);
    }
  });

  // 3. Action: Refresh Status with Toast Feedback
  bot.action('refresh_status', async (ctx) => {
    try {
      await ctx.answerCbQuery('Status Refreshed! 🔄');
      const chatIdStr = ctx.chat?.id.toString() || '';
      const { text, keyboard } = await renderStatusView(chatIdStr);
      await safeEditMessage(ctx, text, keyboard);
    } catch (err) {
      console.error('Error in refresh_status action:', err);
    }
  });

  // 4. Navigation: My Tasks View
  bot.action('my_tasks', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const chatIdStr = ctx.chat?.id.toString() || '';
      const { text, keyboard } = await renderTasksView(chatIdStr);
      await safeEditMessage(ctx, text, keyboard);
    } catch (err) {
      console.error('Error in my_tasks action:', err);
    }
  });

  // 5. Action: Refresh Tasks with Toast Feedback
  bot.action('refresh_tasks', async (ctx) => {
    try {
      await ctx.answerCbQuery('Tasks Refreshed! 📋');
      const chatIdStr = ctx.chat?.id.toString() || '';
      const { text, keyboard } = await renderTasksView(chatIdStr);
      await safeEditMessage(ctx, text, keyboard);
    } catch (err) {
      console.error('Error in refresh_tasks action:', err);
    }
  });

  // 6. Navigation: Help & Guide
  bot.action('nav_help', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const chatIdStr = ctx.chat?.id.toString() || '';
      const { text, keyboard } = await renderHelpView(chatIdStr);
      await safeEditMessage(ctx, text, keyboard);
    } catch (err) {
      console.error('Error in nav_help action:', err);
    }
  });

  // 7. Navigation: Contact
  bot.action('nav_contact', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const { text, keyboard } = await renderContactView();
      await safeEditMessage(ctx, text, keyboard);
    } catch (err) {
      console.error('Error in nav_contact action:', err);
    }
  });

  // 8. Navigation: How to Link Instructions
  bot.action('how_to_link', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const { text, keyboard } = await renderHowToLinkView();
      await safeEditMessage(ctx, text, keyboard);
    } catch (err) {
      console.error('Error in how_to_link action:', err);
    }
  });

  // 9. Action: Confirm Unlink Dialog
  bot.action('confirm_unlink', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const chatIdStr = ctx.chat?.id.toString() || '';
      const { text, keyboard } = await renderUnlinkConfirmView(chatIdStr);
      await safeEditMessage(ctx, text, keyboard);
    } catch (err) {
      console.error('Error in confirm_unlink action:', err);
    }
  });

  // 10. Action: Execute Unlink
  bot.action('do_unlink', async (ctx) => {
    try {
      await ctx.answerCbQuery('Account Disconnected 🔓');
      const chatIdStr = ctx.chat?.id.toString() || '';
      const { text, keyboard } = await performUnlink(chatIdStr);
      await safeEditMessage(ctx, text, keyboard);
    } catch (err) {
      console.error('Error in do_unlink action:', err);
    }
  });
};
