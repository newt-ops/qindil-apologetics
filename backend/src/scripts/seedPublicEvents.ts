import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { EventModel } from '../models/Event.model.js';

export const seedPublicEvents = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('📅 Seeding sample events (public & team)...');

    const now = new Date();
    const day = 1000 * 60 * 60 * 24;

    const eventsData = [
      {
        title: 'Qindil Annual Apologetics Symposium 2026',
        description: 'Keynote lectures on cosmological arguments, textual history of the Quran, and modern bioethics.',
        startDate: new Date(now.getTime() + day * 5),
        endDate: new Date(now.getTime() + day * 5 + 1000 * 60 * 60 * 4),
        allDay: false,
        type: 'publicEvent' as const,
        visibility: 'public' as const,
        location: 'Main Conference Center & Online Live Stream',
      },
      {
        title: 'Public Webinar: Deconstructing Moral Relativism',
        description: 'An open interactive academic webinar discussing objective moral ontology and secular humanism.',
        startDate: new Date(now.getTime() + day * 14),
        endDate: new Date(now.getTime() + day * 14 + 1000 * 60 * 60 * 2),
        allDay: false,
        type: 'publicEvent' as const,
        visibility: 'public' as const,
        location: 'Zoom / YouTube Live',
      },
      {
        title: 'Internal Team Content Strategy Meeting',
        description: 'Private team planning meeting for Q4 article publishing pipeline.',
        startDate: new Date(now.getTime() + day * 2),
        allDay: false,
        type: 'meeting' as const,
        visibility: 'team' as const,
        location: 'Internal Team Discord',
      },
    ];

    for (const e of eventsData) {
      await EventModel.findOneAndUpdate({ title: e.title }, e, {
        upsert: true,
        new: true,
      });
    }

    console.log('✅ Events seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding events failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1]?.includes('seedPublicEvents')) {
  seedPublicEvents();
}
