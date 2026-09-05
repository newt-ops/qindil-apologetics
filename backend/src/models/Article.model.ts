import { Schema, model, Document, Types } from 'mongoose';

export type ArticleStatus =
  | 'draft'
  | 'inReview'
  | 'changesRequested'
  | 'approved'
  | 'published'
  | 'archived';

export interface IArticle extends Document {
  title: string;
  slug?: string;
  topic?: Types.ObjectId;
  author: Types.ObjectId;
  content?: string;
  excerpt?: string;
  coverImageUrl?: string;
  status: ArticleStatus;
  reviewNotes?: string;
  publishedAt?: Date;
  viewCount: number;
  linkedTaskId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true, index: true },
    topic: { type: Schema.Types.ObjectId, ref: 'Topic', index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String },
    excerpt: { type: String },
    coverImageUrl: { type: String },
    status: {
      type: String,
      enum: ['draft', 'inReview', 'changesRequested', 'approved', 'published', 'archived'],
      default: 'draft',
      required: true,
      index: true,
    },
    reviewNotes: { type: String },
    publishedAt: { type: Date, index: true },
    viewCount: { type: Number, default: 0 },
    linkedTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  },
  {
    timestamps: true,
  }
);

// Full-text search index on title and excerpt
articleSchema.index({ title: 'text', excerpt: 'text' });

export const ArticleModel = model<IArticle>('Article', articleSchema);
export default ArticleModel;
