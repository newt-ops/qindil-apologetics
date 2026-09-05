import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initTelegramBot } from './services/telegram.js';
import { initDeadlineReminderCron } from './jobs/deadlineReminder.js';

const startServer = async () => {
  await connectDB();
  initTelegramBot();
  initDeadlineReminderCron();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server listening on port ${env.PORT} in [${env.NODE_ENV}] mode`);
  });
};

startServer();
