import { Schema, model, Document, Types } from 'mongoose';

export type EventType = 'deadline' | 'meeting' | 'publicEvent' | 'other';
export type EventVisibility = 'public' | 'team';

export interface IEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  type: EventType;
  relatedTask?: Types.ObjectId;
  visibility: EventVisibility;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    allDay: { type: Boolean, default: true },
    type: {
      type: String,
      enum: ['deadline', 'meeting', 'publicEvent', 'other'],
      default: 'meeting',
      required: true,
      index: true,
    },
    relatedTask: { type: Schema.Types.ObjectId, ref: 'Task' },
    visibility: {
      type: String,
      enum: ['public', 'team'],
      default: 'team',
      required: true,
      index: true,
    },
    location: { type: String },
  },
  {
    timestamps: true,
  }
);

export const EventModel = model<IEvent>('Event', eventSchema);
export default EventModel;
