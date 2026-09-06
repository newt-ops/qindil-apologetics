import { Context } from 'telegraf';
import { renderHelpView } from '../views.js';

export const handleHelpCommand = async (ctx: Context): Promise<void> => {
  try {
    const chatIdStr = ctx.chat?.id.toString();
    const { text, keyboard } = await renderHelpView(chatIdStr);

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...keyboard,
    });
  } catch (err) {
    console.error('Error handling /help command:', err);
    await ctx.reply('❌ An error occurred while opening the help menu.');
  }
};

export default handleHelpCommand;
