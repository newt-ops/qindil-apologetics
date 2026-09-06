import { Schema, model, Document, Types } from 'mongoose';

export type VideoType = 'refutation' | 'normal';
export type VideoDestination = 'official' | 'personal';
export type VideoStatus =
  | 'draft'
  | 'inProgress'
  | 'submitted'
  | 'changesRequested'
  | 'approved'
  | 'published'
  | 'posted';

export interface IVideoLog extends Document {
  title: string;
  creator: Types.ObjectId;
  videoType: VideoType;
  destination: VideoDestination;
  targetVideoUrl?: string;
  posterUrl?: string;
  notes?: string;
  status: VideoStatus;
  reviewNotes?: string;
  submittedUrl?: string;
  publishedUrl?: string;
  publishedAt?: Date;
  linkedTaskId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const videoLogSchema = new Schema<IVideoLog>(
  {
    title: { type: String, required: true, trim: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    videoType: {
      type: String,
      enum: ['refutation', 'normal'],
      default: 'normal',
      required: true,
    },
    destination: {
      type: String,
      enum: ['official', 'personal', 'officialAccount', 'personalAccount'],
      default: 'official',
      required: true,
    },
    targetVideoUrl: { type: String, trim: true },
    posterUrl: { type: String, trim: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['draft', 'inProgress', 'submitted', 'changesRequested', 'approved', 'published', 'posted'],
      default: 'inProgress',
      required: true,
      index: true,
    },
    reviewNotes: { type: String },
    submittedUrl: { type: String, trim: true },
    publishedUrl: { type: String, trim: true },
    publishedAt: { type: Date },
    linkedTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  },
  {
    timestamps: true,
  }
);

export const VideoLogModel = model<IVideoLog>('VideoLog', videoLogSchema);
export default VideoLogModel;
