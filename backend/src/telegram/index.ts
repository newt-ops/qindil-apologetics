export * from './bot.js';
export * from './notifications.js';
export * from './keyboards.js';
export * from './views.js';
export * from './actions.js';

import bot, { initTelegramBot, stopTelegramBot, registerBotCommands } from './bot.js';
import notifications from './notifications.js';

export default {
  bot,
  initTelegramBot,
  stopTelegramBot,
  registerBotCommands,
  ...notifications,
};
