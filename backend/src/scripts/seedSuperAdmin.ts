import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { UserModel } from '../models/User.model.js';
import { RoleModel } from '../models/Role.model.js';

export const seedSuperAdmin = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('👤 Seeding default SuperAdmin user...');

    const superAdminRole = await RoleModel.findOne({ name: 'superAdmin' });
    if (!superAdminRole) {
      throw new Error('superAdmin role does not exist. Please run "npm run seed:roles" first.');
    }

    const email = 'admin@qindilapologetics.com';
    const password = 'AdminPassword123!';
    const passwordHash = await bcrypt.hash(password, 12);

    let user = await UserModel.findOne({ email });

    if (user) {
      user.passwordHash = passwordHash;
      user.emailVerified = true;
      user.isActive = true;
      if (!user.roles.includes(superAdminRole._id)) {
        user.roles.push(superAdminRole._id);
      }
      await user.save();
      console.log(`  ✓ Updated existing SuperAdmin user <${email}>`);
    } else {
      user = await UserModel.create({
        name: 'Qindil SuperAdmin',
        email,
        passwordHash,
        authProvider: 'local',
        emailVerified: true,
        isActive: true,
        roles: [superAdminRole._id],
      });
      console.log(`  ✓ Created new SuperAdmin user <${email}>`);
    }

    console.log('\n==================================================');
    console.log('  SUPERADMIN CREDENTIALS FOR TESTING:');
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ SuperAdmin seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1]?.includes('seedSuperAdmin')) {
  seedSuperAdmin();
}
