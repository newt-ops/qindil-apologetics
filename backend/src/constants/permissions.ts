export const PERMISSIONS = [
  // SuperAdmin wildcard
  '*',

  // Article permissions
  'article.create',
  'article.editOwn',
  'article.submitForReview',
  'article.review',
  'article.requestChanges',
  'article.approve',
  'article.publish',
  'article.delete',

  // Video permissions
  'video.create',
  'video.editOwn',
  'video.edit',
  'video.moveStage',
  'video.delete',

  // Task permissions
  'task.create',
  'task.assign',
  'task.edit',
  'task.delete',

  // System & Role management permissions
  'user.view',
  'user.manage',
  'role.manage',
  'analytics.view',
  'settings.manage',

  // User self profile permissions
  'profile.view',
  'profile.editOwn',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
