import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  task: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const CommentModel = model<IComment>('Comment', commentSchema);
export default CommentModel;
