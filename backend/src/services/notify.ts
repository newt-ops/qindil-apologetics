import { Types } from 'mongoose';
import { NotificationModel, INotification } from '../models/Notification.model.js';

export interface CreateNotificationParams {
  recipient: string | Types.ObjectId;
  type: string;
  title: string;
  body?: string;
  link?: string;
}

/**
 * Shared helper to create a Notification document in MongoDB.
 * Called by task assignments, review pipeline, comments, system alerts, etc.
 */
export const createNotification = async (
  params: CreateNotificationParams
): Promise<INotification> => {
  const { recipient, type, title, body, link } = params;

  const notification = await NotificationModel.create({
    recipient: typeof recipient === 'string' ? new Types.ObjectId(recipient) : recipient,
    type,
    title,
    body,
    link,
    read: false,
  });

  return notification;
};

export default createNotification;
