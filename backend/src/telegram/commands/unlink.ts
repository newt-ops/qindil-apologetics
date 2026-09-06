import { Context } from 'telegraf';
import { renderUnlinkConfirmView } from '../views.js';

export const handleUnlinkCommand = async (ctx: Context): Promise<void> => {
  try {
    if (!ctx.chat) return;

    const chatIdStr = ctx.chat.id.toString();
    const { text, keyboard } = await renderUnlinkConfirmView(chatIdStr);

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...keyboard,
    });
  } catch (err) {
    console.error('Error handling /unlink command:', err);
    await ctx.reply('❌ An error occurred while preparing account disconnection. Please try again.');
  }
};

export default handleUnlinkCommand;
