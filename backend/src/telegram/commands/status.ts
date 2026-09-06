import { Context } from 'telegraf';
import { renderStatusView } from '../views.js';

export const handleStatusCommand = async (ctx: Context): Promise<void> => {
  try {
    if (!ctx.chat) return;

    const chatIdStr = ctx.chat.id.toString();
    const { text, keyboard } = await renderStatusView(chatIdStr);

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...keyboard,
    });
  } catch (err) {
    console.error('Error handling /status command:', err);
    await ctx.reply('❌ An error occurred while retrieving your status. Please try again.');
  }
};

export default handleStatusCommand;
