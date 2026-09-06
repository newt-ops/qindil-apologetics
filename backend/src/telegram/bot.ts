import { Telegraf } from 'telegraf';
import { env } from '../config/env.js';
import { handleStartCommand } from './commands/start.js';
import { handleLinkCommand } from './commands/link.js';
import { handleUnlinkCommand } from './commands/unlink.js';
import { handleStatusCommand } from './commands/status.js';
import { handleHelpCommand } from './commands/help.js';
import { handleContactCommand } from './commands/contact.js';
import { registerBotActions } from './actions.js';

export {
  handleStartCommand,
  handleLinkCommand,
  handleUnlinkCommand,
  handleStatusCommand,
  handleHelpCommand,
  handleContactCommand,
  registerBotActions,
};

export const bot = env.TELEGRAM_BOT_TOKEN ? new Telegraf(env.TELEGRAM_BOT_TOKEN) : null;

/**
 * Register slash command handlers on Telegraf bot instance
 */
export const registerBotCommands = (botInstance: Telegraf): void => {
  botInstance.start(handleStartCommand);
  botInstance.command('link', handleLinkCommand);
  botInstance.command('unlink', handleUnlinkCommand);
  botInstance.command('status', handleStatusCommand);
  botInstance.command('help', handleHelpCommand);
  botInstance.command('contact', handleContactCommand);
};

/**
 * Initialize and launch the Telegram Bot
 */
export const initTelegramBot = async (): Promise<void> => {
  if (!bot) {
    console.log('ℹ️ Telegram bot token not configured. Skipping bot startup.');
    return;
  }

  // Register modular command handlers (/start, /link, /unlink, /status, /help, /contact)
  registerBotCommands(bot);

  // Register interactive inline button action handlers (callbacks & message edits)
  registerBotActions(bot);

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

/**
 * Gracefully stop the Telegram Bot
 */
export const stopTelegramBot = (signal: string = 'SIGINT'): void => {
  if (bot) {
    console.log(`🛑 Stopping Telegram bot (${signal})...`);
    bot.stop(signal);
  }
};

export default bot;
