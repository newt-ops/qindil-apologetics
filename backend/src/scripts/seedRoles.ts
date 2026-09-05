import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { RoleModel } from '../models/Role.model.js';

const ROLES_SEED = [
  {
    name: 'superAdmin',
    permissions: ['*'],
  },
  {
    name: 'admin',
    permissions: [
      'article.create',
      'article.editOwn',
      'article.submitForReview',
      'article.review',
      'article.requestChanges',
      'article.approve',
      'article.publish',
      'article.delete',
      'video.create',
      'video.editOwn',
      'video.edit',
      'video.moveStage',
      'video.delete',
      'task.create',
      'task.assign',
      'task.edit',
      'task.delete',
      'user.view',
      'user.manage',
      'role.manage',
      'analytics.view',
      'settings.manage',
    ],
  },
  {
    name: 'user',
    permissions: ['profile.view', 'profile.editOwn'],
  },
];

export const seedRoles = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('🌱 Seeding roles and permissions...');

    // Remove any legacy roles not in ROLES_SEED
    const validRoleNames = ROLES_SEED.map((r) => r.name);
    await RoleModel.deleteMany({ name: { $nin: validRoleNames } });

    for (const roleData of ROLES_SEED) {
      const role = await RoleModel.findOneAndUpdate(
        { name: roleData.name },
        { name: roleData.name, permissions: roleData.permissions },
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`  ✓ Role [${role.name}] seeded with ${role.permissions.length} permissions`);
    }

    console.log('✅ Roles seeded successfully!');
  } catch (error) {
    console.error('❌ Role seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1]?.includes('seedRoles')) {
  seedRoles();
}
