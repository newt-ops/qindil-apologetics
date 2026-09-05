import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { TaskModel } from '../models/Task.model.js';
import { UserModel } from '../models/User.model.js';
import { ArticleModel } from '../models/Article.model.js';

export const seedTasks = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('📋 Seeding sample tasks for admin workspace...');

    // Find primary admin user (e.g., superadmin@qindilapologetics.com)
    const adminUser = await UserModel.findOne({ email: 'superadmin@qindilapologetics.com' }) || await UserModel.findOne({});

    if (!adminUser) {
      console.warn('⚠️ Admin user not found. Run "npm run seed:demo" first.');
      process.exit(1);
    }

    // Find sample article to link
    const sampleArticle = await ArticleModel.findOne({});

    const now = new Date();
    const dayMs = 1000 * 60 * 60 * 24;

    const sampleTasks = [
      {
        title: 'Overdue Review: Manuscript on Textual Integrity',
        description: 'Perform secondary editorial check on manuscript regarding early codices.',
        type: 'article' as const,
        assignedTo: [adminUser._id],
        createdBy: adminUser._id,
        dueDate: new Date(now.getTime() - dayMs * 3), // 3 days overdue
        status: 'pending' as const,
        linkedArticle: sampleArticle?._id,
      },
      {
        title: 'Peer Review: Refutation of Neo-Atheist Epistemology',
        description: 'Verify philosophical citations in section 3 of the refutation paper.',
        type: 'article' as const,
        assignedTo: [adminUser._id],
        createdBy: adminUser._id,
        dueDate: new Date(now.getTime() + dayMs * 2), // Due in 2 days
        status: 'inProgress' as const,
        linkedArticle: sampleArticle?._id,
      },
      {
        title: 'Draft Video Script: Fine-Tuning Multiverse Models',
        description: 'Write 8-minute video script explaining cosmological fine-tuning.',
        type: 'video' as const,
        assignedTo: [adminUser._id],
        createdBy: adminUser._id,
        dueDate: new Date(now.getTime() + dayMs * 5), // Due in 5 days
        status: 'pending' as const,
      },
      {
        title: 'Finalize Symposium Keynote Abstract',
        description: 'Submit approved abstract to academic committee.',
        type: 'general' as const,
        assignedTo: [adminUser._id],
        createdBy: adminUser._id,
        dueDate: new Date(now.getTime() - dayMs * 1),
        status: 'done' as const,
      },
    ];

    for (const t of sampleTasks) {
      await TaskModel.findOneAndUpdate({ title: t.title }, t, {
        upsert: true,
        new: true,
      });
    }

    console.log('✅ Tasks seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding tasks failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1]?.includes('seedTasks')) {
  seedTasks();
}
