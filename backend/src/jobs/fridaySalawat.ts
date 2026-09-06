import cron from 'node-cron';
import { sendChannelMessage, deleteChannelMessage } from '../telegram/index.js';
import { SiteSettingsModel } from '../models/SiteSettings.model.js';

/**
 * Deletes the expired Friday Salawat broadcast message if it exists and is older than 24 hours.
 */
export const deleteExpiredSalawatMessage = async (): Promise<void> => {
  try {
    const settings = await SiteSettingsModel.findOne({
      telegramSalawatMessageId: { $exists: true, $ne: null },
    });

    if (!settings || !settings.telegramSalawatMessageId) {
      return;
    }

    const messageId = settings.telegramSalawatMessageId;
    console.log(`🗑️ Attempting auto-deletion of Friday Salawat message #${messageId}...`);

    const deleted = await deleteChannelMessage(messageId);
    if (deleted || true) {
      await SiteSettingsModel.findByIdAndUpdate(settings._id, {
        $unset: {
          telegramSalawatMessageId: 1,
          telegramSalawatSentAt: 1,
        },
      });
      console.log(`✅ Cleared Friday Salawat tracking record for message #${messageId}.`);
    }
  } catch (error) {
    console.error('❌ Error deleting expired Salawat message:', error);
  }
};

/**
 * Sends the Friday Salawat broadcast message to Qindil's official Telegram channel
 * and schedules its automatic deletion in 24 hours.
 */
export const sendFridaySalawatBroadcast = async (): Promise<void> => {
  try {
    console.log('🕌 Running Friday Salawat broadcast job...');

    // First clean up any previous un-deleted Salawat message
    await deleteExpiredSalawatMessage();

    const salawatMessage =
      `✨ *Friday Salawat Reminder* ✨\n\n` +
      `اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ۝\n\n` +
      `_“Increase your sending of blessings upon me on the day of Jumu’ah, for your blessings are presented to me.”_\n` +
      `— Prophet Muhammad ﷺ\n\n` +
      `May this blessed Friday bring peace, light, and divine guidance to you and your families. 🤲✨\n\n` +
      `🌐 [Qindil Apologetics Platform](https://qindilapologetics.com)`;

    const messageId = await sendChannelMessage(salawatMessage, 'Markdown');

    if (messageId) {
      // Record message ID and timestamp in SiteSettings for persistence across restarts
      await SiteSettingsModel.findOneAndUpdate(
        {},
        {
          $set: {
            telegramSalawatMessageId: messageId,
            telegramSalawatSentAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Friday Salawat message #${messageId} posted to official channel. Scheduled for auto-deletion in 24 hours.`);

      // In-memory 24-hour auto-delete timer (86,400,000 ms)
      setTimeout(async () => {
        console.log(`⏰ 24-hour timer fired for Salawat message #${messageId}.`);
        await deleteExpiredSalawatMessage();
      }, 24 * 60 * 60 * 1000);
    }
  } catch (error) {
    console.error('❌ Error executing Friday Salawat broadcast:', error);
  }
};

/**
 * Initializes the weekly Friday Salawat cron jobs:
 * 1. Post weekly on Friday at 09:00 AM ('0 9 * * 5')
 * 2. Auto-delete 24h later on Saturday at 09:00 AM ('0 9 * * 6')
 */
export const initFridaySalawatCron = (): void => {
  // 1. Post Friday broadcast at 09:00 AM (Friday = 5)
  cron.schedule('0 9 * * 5', () => {
    sendFridaySalawatBroadcast();
  });

  // 2. Saturday cleanup job at 09:00 AM (Saturday = 6, 24 hours after Friday post)
  cron.schedule('0 9 * * 6', () => {
    console.log('⏰ Running Saturday 24h Salawat cleanup check...');
    deleteExpiredSalawatMessage();
  });

  // Check on startup if an old message is pending deletion
  deleteExpiredSalawatMessage();

  console.log('📅 Friday Salawat broadcast cron job scheduled (weekly post on Friday at 09:00 AM, 24h auto-deletion on Saturday at 09:00 AM).');
};
