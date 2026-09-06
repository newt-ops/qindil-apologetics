import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initTelegramBot } from './telegram/index.js';
import { initAllCronJobs } from './jobs/index.js';

const startServer = async () => {
  await connectDB();
  initTelegramBot();
  initAllCronJobs();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server listening on port ${env.PORT} in [${env.NODE_ENV}] mode`);
  });
};

startServer();
