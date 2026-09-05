import { Schema, model, Document } from 'mongoose';

export type ContactMessageStatus = 'new' | 'read' | 'archived';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'read', 'archived'],
      default: 'new',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ContactMessageModel = model<IContactMessage>('ContactMessage', contactMessageSchema);
export default ContactMessageModel;
