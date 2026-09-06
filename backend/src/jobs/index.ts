import { initDeadlineReminderCron } from './deadlineReminder.js';
import { initFridaySalawatCron } from './fridaySalawat.js';

export { runDeadlineReminderCheck, initDeadlineReminderCron } from './deadlineReminder.js';
export { sendFridaySalawatBroadcast, initFridaySalawatCron } from './fridaySalawat.js';

/**
 * Initializes all background scheduled cron jobs.
 */
export const initAllCronJobs = (): void => {
  initDeadlineReminderCron();
  initFridaySalawatCron();
};
