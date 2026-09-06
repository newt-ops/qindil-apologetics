import { Context } from 'telegraf';
import { renderStartView } from '../views.js';

export const handleStartCommand = async (ctx: Context): Promise<void> => {
  try {
    if (!ctx.chat) return;

    const chatIdStr = ctx.chat.id.toString();
    const { text, keyboard } = await renderStartView(chatIdStr);

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...keyboard,
    });
  } catch (err) {
    console.error('Error handling /start command:', err);
    await ctx.reply('❌ An error occurred while starting the bot. Please try again.');
  }
};

export default handleStartCommand;
