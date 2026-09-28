import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initTelegramBot } from './telegram/index.js';
import { initAllCronJobs } from './jobs/index.js';
import { ArticleModel } from './models/Article.model.js';
import { TaskModel } from './models/Task.model.js';

const syncTaskLifecycleOnStartup = async (): Promise<void> => {
  try {
    const completedArticles = await ArticleModel.find({
      status: { $in: ['approved', 'published'] },
    }).select('_id linkedTaskId');

    for (const art of completedArticles) {
      await TaskModel.updateMany(
        {
          $or: [
            ...(art.linkedTaskId ? [{ _id: art.linkedTaskId }] : []),
            { linkedArticle: art._id },
          ],
          status: { $ne: 'done' },
        },
        { $set: { status: 'done' } }
      );
    }
  } catch (err) {
    console.error('Task lifecycle sync error on startup:', err);
  }
};

const startServer = async () => {
  await connectDB();
  await syncTaskLifecycleOnStartup();
  initTelegramBot();
  initAllCronJobs();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server listening on port ${env.PORT} in [${env.NODE_ENV}] mode`);
  });
};

startServer();

