import { Schema, model, Document, Types } from 'mongoose';

export type TaskType = 'article' | 'video' | 'general';
export type TaskStatus = 'pending' | 'inProgress' | 'inReview' | 'done' | 'overdue';

export interface ITask extends Document {
  type: TaskType;
  title: string;
  description?: string;
  assignedTo: Types.ObjectId[];
  createdBy: Types.ObjectId;
  dueDate: Date;
  status: TaskStatus;
  linkedArticle?: Types.ObjectId;
  linkedVideo?: Types.ObjectId;
  calendarEventId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    type: {
      type: String,
      enum: ['article', 'video', 'general'],
      default: 'general',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'inProgress', 'inReview', 'done', 'overdue'],
      default: 'pending',
      required: true,
      index: true,
    },
    linkedArticle: { type: Schema.Types.ObjectId, ref: 'Article' },
    linkedVideo: { type: Schema.Types.ObjectId, ref: 'VideoLog' },
    calendarEventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  },
  {
    timestamps: true,
  }
);

export const TaskModel = model<ITask>('Task', taskSchema);
export default TaskModel;
