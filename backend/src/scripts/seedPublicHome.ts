import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { TopicModel } from '../models/Topic.model.js';
import { ArticleModel } from '../models/Article.model.js';
import { UserModel } from '../models/User.model.js';

export const seedPublicHome = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('🌱 Seeding public topics and featured articles...');

    let adminUser = await UserModel.findOne({ email: 'superadmin@qindilapologetics.com' });
    if (!adminUser) {
      adminUser = await UserModel.findOne({});
    }
    if (!adminUser) {
      throw new Error('No user found in DB. Run npm run seed:admin first.');
    }

    // Seed Topics
    const topicsData = [
      {
        name: 'Existence of God & Theology',
        slug: 'theology-existence-of-god',
        description: 'Philosophical, cosmological, and teleological arguments for the existence of the Creator.',
        order: 1,
        isActive: true,
      },
      {
        name: 'Qur’an & Divine Preservation',
        slug: 'quran-preservation-textual-history',
        description: 'Studies on the textual integrity, oral transmission, and miraculous nature of the Holy Qur’an.',
        order: 2,
        isActive: true,
      },
      {
        name: 'Prophethood & Seerah',
        slug: 'prophethood-seerah-evidences',
        description: 'Historical evidences for the prophethood of Muhammad (ﷺ) and moral philosophy of Islam.',
        order: 3,
        isActive: true,
      },
      {
        name: 'Moral Philosophy & Ethics',
        slug: 'moral-philosophy-ethics',
        description: 'Examining secular humanism, moral relativism, and the objective divine command theory.',
        order: 4,
        isActive: true,
      },
    ];

    const seededTopics = [];
    for (const t of topicsData) {
      const topicDoc = await TopicModel.findOneAndUpdate({ slug: t.slug }, t, {
        upsert: true,
        new: true,
      });
      seededTopics.push(topicDoc);
    }
    console.log(`  ✓ Seeded ${seededTopics.length} public topics`);

    // Seed Articles
    const articlesData = [
      {
        title: 'The Cosmological Argument and Fine-Tuning of the Universe',
        slug: 'cosmological-argument-fine-tuning',
        topic: seededTopics[0]._id,
        author: adminUser._id,
        excerpt: 'An in-depth examination of modern cosmology, entropy, and why physical constants necessitate an intelligent, necessary transcendent Cause.',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Article body...' }] }] }),
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        viewCount: 1420,
      },
      {
        title: 'Oral Preservation and Textual Transmission of the Holy Qur’an',
        slug: 'oral-preservation-quranic-manuscripts',
        topic: seededTopics[1]._id,
        author: adminUser._id,
        excerpt: 'Deconstructing orientalist critiques through early manuscript evidence and the unbroken chain of mass-oral transmission (Tawatur).',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Article body...' }] }] }),
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        viewCount: 980,
      },
      {
        title: 'Prophetic Character and Historical Credibility of the Seerah',
        slug: 'prophetic-character-historical-credibility',
        topic: seededTopics[2]._id,
        author: adminUser._id,
        excerpt: 'How historical methodology and psychological analysis establish the truthfulness and sincerity of the Prophet Muhammad (ﷺ).',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Article body...' }] }] }),
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
        viewCount: 2150,
      },
      {
        title: 'Objective Morality vs Secular Humanism: The Grounding Problem',
        slug: 'objective-morality-secular-humanism',
        topic: seededTopics[3]._id,
        author: adminUser._id,
        excerpt: 'Why subjective materialism fails to ground objective moral duties, and why moral ontology points directly to Divine Revelation.',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Article body...' }] }] }),
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 days ago
        viewCount: 1730,
      },
    ];

    for (const a of articlesData) {
      await ArticleModel.findOneAndUpdate({ slug: a.slug }, a, {
        upsert: true,
        new: true,
      });
    }
    console.log(`  ✓ Seeded ${articlesData.length} published featured articles`);

    console.log('✅ Public Home data seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding public home data failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1]?.includes('seedPublicHome')) {
  seedPublicHome();
}
