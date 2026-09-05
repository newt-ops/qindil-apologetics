import { Schema, model, Document, Types } from 'mongoose';

export type VideoBoardStage =
  | 'idea'
  | 'scripting'
  | 'filming'
  | 'editing'
  | 'review'
  | 'published';

export interface IStageHistory {
  stage: VideoBoardStage;
  movedBy: Types.ObjectId;
  movedAt: Date;
}

export interface IVideoLog extends Document {
  title: string;
  category?: Types.ObjectId;
  isRefutation: boolean;
  targetVideoUrl?: string;
  contentCreator: Types.ObjectId;
  editor: Types.ObjectId;
  task?: Types.ObjectId;
  boardStage: VideoBoardStage;
  stageHistory: IStageHistory[];
  posterUrl?: string;
  publishedUrl?: string;
  publishedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const stageHistorySchema = new Schema<IStageHistory>(
  {
    stage: {
      type: String,
      enum: ['idea', 'scripting', 'filming', 'editing', 'review', 'published'],
      required: true,
    },
    movedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    movedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const videoLogSchema = new Schema<IVideoLog>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'VideoCategory', index: true },
    isRefutation: { type: Boolean, default: false },
    targetVideoUrl: { type: String },
    contentCreator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    editor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    task: { type: Schema.Types.ObjectId, ref: 'Task' },
    boardStage: {
      type: String,
      enum: ['idea', 'scripting', 'filming', 'editing', 'review', 'published'],
      default: 'idea',
      required: true,
      index: true,
    },
    stageHistory: [stageHistorySchema],
    posterUrl: { type: String },
    publishedUrl: { type: String },
    publishedAt: { type: Date },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const VideoLogModel = model<IVideoLog>('VideoLog', videoLogSchema);
export default VideoLogModel;
