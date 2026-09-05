import { Telegraf } from 'telegraf';
import { env } from './env.js';

export const bot = env.TELEGRAM_BOT_TOKEN ? new Telegraf(env.TELEGRAM_BOT_TOKEN) : null;
export default bot;
