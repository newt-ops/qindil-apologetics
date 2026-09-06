import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { RoleModel } from '../models/Role.model.js';
import { UserModel } from '../models/User.model.js';
import { TopicModel } from '../models/Topic.model.js';
import { ArticleModel } from '../models/Article.model.js';
import { TaskModel } from '../models/Task.model.js';
import { VideoLogModel } from '../models/VideoLog.model.js';
import { EventModel } from '../models/Event.model.js';
import { SiteSettingsModel } from '../models/SiteSettings.model.js';

export const seedDemoData = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('🚀 Starting comprehensive demo data seeding for Qindil v2.0.0...\n');

    // 1. Roles
    const ROLES_SEED = [
      { name: 'superAdmin', permissions: ['*'] },
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
      { name: 'user', permissions: ['profile.view', 'profile.editOwn'] },
    ];

    const rolesMap: Record<string, mongoose.Types.ObjectId> = {};
    for (const rData of ROLES_SEED) {
      const role = await RoleModel.findOneAndUpdate(
        { name: rData.name },
        { name: rData.name, permissions: rData.permissions },
        { upsert: true, new: true, runValidators: true }
      );
      rolesMap[rData.name] = role._id as mongoose.Types.ObjectId;
    }
    console.log('  ✓ Roles verified/seeded (superAdmin, admin, user)');

    // 2. Users
    const defaultPassword = 'DemoPassword123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    const superAdminEmail = 'superadmin@qindilapologetics.com';
    let superAdminUser = await UserModel.findOne({ email: superAdminEmail });
    if (!superAdminUser) {
      superAdminUser = await UserModel.create({
        name: 'SuperAdmin Qindil',
        email: superAdminEmail,
        passwordHash,
        authProvider: 'local',
        emailVerified: true,
        isActive: true,
        roles: [rolesMap.superAdmin],
      });
    }

    const adminEmails = [
      { email: 'admin1@qindilapologetics.com', name: 'الشيخ أحمد الفاضل' },
      { email: 'admin2@qindilapologetics.com', name: 'د. سارة محمود' },
      { email: 'admin3@qindilapologetics.com', name: 'م. يوسف العلي' },
    ];

    const adminUsers: any[] = [];
    for (const adm of adminEmails) {
      let u = await UserModel.findOne({ email: adm.email });
      if (!u) {
        u = await UserModel.create({
          name: adm.name,
          email: adm.email,
          passwordHash,
          authProvider: 'local',
          emailVerified: true,
          isActive: true,
          roles: [rolesMap.admin],
        });
      }
      adminUsers.push(u);
    }
    console.log(`  ✓ Users verified/seeded (1 SuperAdmin: superadmin@qindilapologetics.com, 3 Admins)`);

    // 3. Topics
    const topicsData = [
      {
        name: 'العقيدة الإسلامية',
        slug: 'islamic-creed',
        description: 'أبحاث ودراسات تفصيلية في أصول العقيدة وأركان الإيمان.',
        order: 1,
        isActive: true,
      },
      {
        name: 'رد الشبهات المعاصرة',
        slug: 'refuting-misconceptions',
        description: 'تفنيد علمي وشرعي لأبرز الإشكالات والمشبهات المعاصرة حول الإسلام.',
        order: 2,
        isActive: true,
      },
      {
        name: 'الفلسفة والإلحاد',
        slug: 'philosophy-atheism',
        description: 'نقد الأفكار الفلسفية المادية والإلحادية وتفكيك المنطلقات العلمانية.',
        order: 3,
        isActive: true,
      },
      {
        name: 'الإعجاز العلمي والتاريخي',
        slug: 'scientific-historical-miracles',
        description: 'قراءات منهجية في الدلائل العلمية والتاريخية للنبوة والقرآن.',
        order: 4,
        isActive: true,
      },
      {
        name: 'الفقه والسيرة النبوية',
        slug: 'fiqh-sirah',
        description: 'مقالات حول السيرة العطرة والأحكام الفقهية المتعلقة بقضايا العصر.',
        order: 5,
        isActive: true,
      },
    ];

    const topicDocs: any[] = [];
    for (const t of topicsData) {
      const doc = await TopicModel.findOneAndUpdate(
        { slug: t.slug },
        t,
        { upsert: true, new: true, runValidators: true }
      );
      topicDocs.push(doc);
    }
    console.log(`  ✓ 5 Topics verified/seeded`);

    // 4. Articles (12 Articles across 6 statuses)
    const authorId = adminUsers[0]._id;
    const articlesData = [
      // Drafts (2)
      {
        title: 'مسودة: أدلة وجود الخالق بين البديهة العقلية والبرهان الفلسفي',
        slug: 'draft-arguments-creator-existence',
        topic: topicDocs[0]._id,
        author: authorId,
        excerpt: 'مقدمة في بناء الحجة العقلية الشاملة لإثبات وجود الخالق سبحانه.',
        content: 'هذه المقالة تسلط الضوء على الأدلة العقلية والحسية والفطرية لخلق الكون واستحالة المصادفة...',
        status: 'draft',
      },
      {
        title: 'مسودة: ظاهرة الإلحاد الجديد وخلفياتها النفسية والاجتماعية',
        slug: 'draft-new-atheism-phenomenon',
        topic: topicDocs[2]._id,
        author: authorId,
        excerpt: 'قراءة في التحولات الفكرية والنفسية لدى الشباب المعاصر.',
        content: 'نناقش في هذه المقالة الدوافع النفسية غير المعرفية التي تؤدي إلى تبني الفكر الإلحادي...',
        status: 'draft',
      },
      // In Review (2)
      {
        title: 'تحت المراجعة: تفكيك نظرية المعرفة العلموية وقيودها المنهجية',
        slug: 'inreview-scientism-epistemology',
        topic: topicDocs[2]._id,
        author: authorId,
        excerpt: 'نقد حصر الحقائق بالمنهج التجريبي وبيان خطأ هذا الاختزال.',
        content: 'الشيئية أو العلموية Scientism تنفي كل ما لا يخضع للتجربة، وهذا تناقض ذاتي صارخ...',
        status: 'inReview',
      },
      {
        title: 'تحت المراجعة: دلائل النبوة في حفظ السنة وحكمها',
        slug: 'inreview-prophetic-evidences-sunnah',
        topic: topicDocs[3]._id,
        author: authorId,
        excerpt: 'كيف حفظ المسلمون السنة النبوية بمنهج الإسناد والتوثيق الوحيد في التاريخ.',
        content: 'علم مصطلح الحديث والإسناد يعتبر مفخرة الأمة الإسلامية والتجربة النقدية الأولى في تاريخ البشرية...',
        status: 'inReview',
      },
      // Changes Requested (2)
      {
        title: 'تعديلات مطلوبة: قضايا المرأة في الإسلام والرد على الشبهات الغربية',
        slug: 'changes-women-issues-islam',
        topic: topicDocs[1]._id,
        author: authorId,
        excerpt: 'مراجعة للمفاهيم التكريمية للمرأة وشبهات المساواة المادية.',
        content: 'يحتاج المقال لتضمين استشهادات فقهية أكثر دقة ومراجعة الهوامش التاريخية...',
        status: 'changesRequested',
        reviewNotes: 'يرجى تزويد المقال بالمراجع الحديثة وتعديل الفقرة الثانية.',
      },
      {
        title: 'تعديلات مطلوبة: نقد مبدأ الأخلاق دون إله',
        slug: 'changes-morality-without-god',
        topic: topicDocs[2]._id,
        author: authorId,
        excerpt: 'لماذا يفقد التزام الأخلاق موضوعيته بدون مركزية الخالق.',
        content: 'بدون إله تصبح الأخلاق مجرد ذوق شخصي أو تواضع اجتماعي بلا إلزامية خلقة...',
        status: 'changesRequested',
        reviewNotes: 'يرجى تحسين الصياغة وإعادة بناء الخاتمة بشكل أوضح.',
      },
      // Approved (2)
      {
        title: 'مقروء ومقبول: العدالة الإلهية وحكمة الشرور والآلام في العالم',
        slug: 'approved-divine-justice-problem-of-evil',
        topic: topicDocs[0]._id,
        author: authorId,
        excerpt: 'رؤية إسلامية متكاملة لـ معضلة الشر المعاصرة.',
        content: 'الشرور النسبية في العالم تحمل في طياتها حكماً بالغة واختبارات لتمحيص الإيمان والارتقاء الروحي...',
        status: 'approved',
      },
      {
        title: 'مقروء ومقبول: دراسة نقدية لمفهوم الصدفة والتطور التلقائي',
        slug: 'approved-blind-chance-evolution-critique',
        topic: topicDocs[3]._id,
        author: authorId,
        excerpt: 'التشغيل الرياضي والاحتمالي لاستحالة نشأة الحياة الأولى بالصدفة المحضة.',
        content: 'حساب الاحتمالات لتركيب جزيء بروتين واحد يعجز عن تفسيره أي منطق صدفوي...',
        status: 'approved',
      },
      // Published (2)
      {
        title: 'منشور: الشبهات حول العقوبات والحدود الشرعية بين النظرية والتطبيق',
        slug: 'published-hudud-penal-system-islam',
        topic: topicDocs[1]._id,
        author: authorId,
        excerpt: 'الفلسفة الوقائية للنظام الجنائي في الإسلام ودور الردع والشروط المشددة.',
        content: 'الحدود في التشريع الإسلامي ليست للانتقام بل لحماية مقاصد الشريعة الخمسة وبشروط درء الشبهات...',
        status: 'published',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        viewCount: 1420,
      },
      {
        title: 'منشور: تاريخ الفكر الإلحادي في العالم العربي والتحديات الراهنة',
        slug: 'published-history-atheism-arab-world',
        topic: topicDocs[2]._id,
        author: authorId,
        excerpt: 'استعراض تاريخي للموجات الفكرية المؤثرة في الشرق الأوسط.',
        content: 'تستعرض المقالة المحطات التاريخية لتأثير الأيديولوجيات الغربية الوافدة وكيف تصدى لها علماء الإسلام...',
        status: 'published',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        viewCount: 890,
      },
      // Archived (2)
      {
        title: 'أرشيف: المقاربات العلمية القديمة في علم الكلام',
        slug: 'archived-ancient-kalam-approaches',
        topic: topicDocs[0]._id,
        author: authorId,
        excerpt: 'مستند مؤرشف يوثق أدلة المتكلمين المتقدمين.',
        content: 'تمت أرشفة هذه المقالة نظراً لتحديث البحث بمصطلحات أكثر ملاءمة للخطاب المعاصر...',
        status: 'archived',
      },
      {
        title: 'أرشيف: قراءات قديمة في الفلسفة اليونانية وآثارها',
        slug: 'archived-greek-philosophy-influences',
        topic: topicDocs[2]._id,
        author: authorId,
        excerpt: 'أرشيف أبحاث 2023 الفلسفية.',
        content: 'بحث مؤرشف للمراجعات المنهجية المتقدمة...',
        status: 'archived',
      },
    ];

    for (const art of articlesData) {
      await ArticleModel.findOneAndUpdate(
        { slug: art.slug },
        art,
        { upsert: true, new: true, runValidators: true }
      );
    }
    console.log(`  ✓ 12 Articles seeded (2 per status: draft, inReview, changesRequested, approved, published, archived)`);

    // 5. Tasks + VideoLogs pairs across video production pipeline
    const taskVideoPairs = [
      {
        videoTitle: 'فيديو: إثبات وجود الخالق بدليل الضبط الدقيق للكون',
        taskTitle: 'كتابة سيناريو فيديو الضبط الدقيق',
        taskStatus: 'inProgress',
        videoStatus: 'inProgress' as const,
        videoType: 'normal' as const,
        destination: 'official' as const,
      },
      {
        videoTitle: 'فيديو: الرد على شبهة عدم عدالة توزيع الثروات',
        taskTitle: 'تصوير الحلقة الثالثة من برنامج الردود',
        taskStatus: 'inReview',
        videoStatus: 'submitted' as const,
        videoType: 'refutation' as const,
        destination: 'personal' as const,
        targetVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        submittedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        videoTitle: 'فيديو: هل المنهج التجريبي هو المصدر الوحيد للمعرفة؟',
        taskTitle: 'مونتاج وإخراج فيديو العلموية',
        taskStatus: 'inReview',
        videoStatus: 'approved' as const,
        videoType: 'normal' as const,
        destination: 'personal' as const,
        submittedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        videoTitle: 'فيديو: دلائل النبوة في القرآن والسنة',
        taskTitle: 'نشر ومراجعة التصدير النهائي للبرنامج',
        taskStatus: 'done',
        videoStatus: 'posted' as const,
        videoType: 'refutation' as const,
        destination: 'official' as const,
        targetVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const pair of taskVideoPairs) {
      // Find existing or create Task
      let task = await TaskModel.findOne({ title: pair.taskTitle });
      if (!task) {
        task = await TaskModel.create({
          type: 'video',
          title: pair.taskTitle,
          description: `مهمة مرتبطة بعمل إنتاجي مرئي (${pair.videoType})`,
          assignedTo: [adminUsers[1]._id],
          createdBy: superAdminUser._id,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: pair.taskStatus as any,
          videoType: pair.videoType,
          destination: pair.destination,
          targetVideoUrl: (pair as any).targetVideoUrl,
        });
      }

      // Find existing or create VideoLog
      let video = await VideoLogModel.findOne({ title: pair.videoTitle });
      if (!video) {
        video = await VideoLogModel.create({
          title: pair.videoTitle,
          creator: adminUsers[0]._id,
          videoType: pair.videoType,
          destination: pair.destination,
          targetVideoUrl: (pair as any).targetVideoUrl,
          submittedUrl: (pair as any).submittedUrl,
          publishedUrl: (pair as any).publishedUrl,
          publishedAt: (pair as any).publishedAt,
          status: pair.videoStatus,
          linkedTaskId: task._id,
          notes: `Created via demo seeding`,
        });

        // Link Task back to VideoLog
        task.linkedVideo = video._id as mongoose.Types.ObjectId;
        await task.save();
      }
    }
    console.log(`  ✓ 4 Task & VideoLog pairs seeded across video production pipeline (inProgress, submitted, approved, posted)`);

    // 6. Events (3 events with public and team visibility)
    const eventsData = [
      {
        title: 'ندوة عامة: تحديات الإلحاد في العصر الرقمي',
        description: 'ندوة مفتوحة مع كوكبة من الباحثين والمفكرين للإجابة على التساؤلات الفكرية.',
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 3600 * 1000),
        allDay: false,
        type: 'publicEvent',
        visibility: 'public',
        location: 'قاعة الندوات الرئيسية / البث المباشر عبر يوتيوب',
      },
      {
        title: 'اجتماع الفريق التحريري الدوري',
        description: 'مراجعة خطة النشر للشهر القادم وتقييم المقالات والأبحاث المقترحة.',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 3600 * 1000),
        allDay: false,
        type: 'meeting',
        visibility: 'team',
        location: 'مقر المركز - غرفة الاجتماعات',
      },
      {
        title: 'الموعد النهائي لتسليم السيناريوهات الصوتية',
        description: 'تسليم المسودات النهائية لسلسلة الردود على الشبهات التاريخية.',
        startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        allDay: true,
        type: 'deadline',
        visibility: 'team',
      },
    ];

    for (const ev of eventsData) {
      await EventModel.findOneAndUpdate(
        { title: ev.title },
        ev,
        { upsert: true, new: true, runValidators: true }
      );
    }
    console.log(`  ✓ 3 Events verified/seeded (public & team visibility)`);

    // 7. SiteSettings
    await SiteSettingsModel.findOneAndUpdate(
      {},
      {
        siteName: 'منصة القنديل',
        tagline: 'منصة فكرية وإسلامية متخصصة في تأصيل الإيمان ورد الشبهات',
        contactEmail: 'contact@qindilapologetics.com',
        maintenanceMode: false,
        socialLinks: {
          facebook: 'https://facebook.com/qindilplatform',
          youtube: 'https://youtube.com/@qindilplatform',
          telegram: 'https://t.me/qindilplatform',
          instagram: 'https://instagram.com/qindilplatform',
          tiktok: 'https://tiktok.com/@qindilplatform',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`  ✓ SiteSettings verified/seeded with branding & social links`);

    console.log('\n==================================================');
    console.log('  🎉 DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('  SuperAdmin Email: superadmin@qindilapologetics.com');
    console.log('  SuperAdmin Pass:  DemoPassword123!');
    console.log('  Admin 1 Email:    admin1@qindilapologetics.com');
    console.log('  Admin 2 Email:    admin2@qindilapologetics.com');
    console.log('  Admin 3 Email:    admin3@qindilapologetics.com');
    console.log('  Admins Password:  DemoPassword123!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ Demo data seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1]?.includes('seedDemoData')) {
  seedDemoData();
}
