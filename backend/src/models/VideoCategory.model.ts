import { Schema, model, Document } from 'mongoose';

export interface IVideoCategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const videoCategorySchema = new Schema<IVideoCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const VideoCategoryModel = model<IVideoCategory>('VideoCategory', videoCategorySchema);
export default VideoCategoryModel;
