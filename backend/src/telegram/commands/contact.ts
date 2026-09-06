import { Context } from 'telegraf';
import { renderContactView } from '../views.js';

export const handleContactCommand = async (ctx: Context): Promise<void> => {
  try {
    const { text, keyboard } = await renderContactView();

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...keyboard,
    });
  } catch (err) {
    console.error('Error handling /contact command:', err);
    await ctx.reply('❌ An error occurred while fetching contact information.');
  }
};

export default handleContactCommand;
