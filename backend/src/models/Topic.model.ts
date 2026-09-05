import { Schema, model, Document } from 'mongoose';

export interface ITopic extends Document {
  name: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String },
    coverImageUrl: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const TopicModel = model<ITopic>('Topic', topicSchema);
export default TopicModel;
