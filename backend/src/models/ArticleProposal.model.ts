import { Schema, model, Document, Types } from 'mongoose';

export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export interface IArticleProposal extends Document {
  author: Types.ObjectId;
  title: string;
  topic?: Types.ObjectId;
  summary: string;
  proposedDueDate?: Date;
  status: ProposalStatus;
  adminFeedback?: string;
  assignedTaskId?: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const articleProposalSchema = new Schema<IArticleProposal>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    topic: { type: Schema.Types.ObjectId, ref: 'Topic', index: true },
    summary: { type: String, required: true, trim: true },
    proposedDueDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
      index: true,
    },
    adminFeedback: { type: String, trim: true },
    assignedTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Search index on title and summary
articleProposalSchema.index({ title: 'text', summary: 'text' });

export const ArticleProposalModel = model<IArticleProposal>(
  'ArticleProposal',
  articleProposalSchema
);
export default ArticleProposalModel;
