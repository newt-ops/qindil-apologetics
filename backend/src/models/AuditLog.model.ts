import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  actor: Types.ObjectId;
  action: string;
  targetType?: string;
  targetModel?: string;
  targetId?: Types.ObjectId;
  metadata?: Record<string, any>;
  details?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, index: true },
    targetModel: { type: String, index: true },
    targetId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
    details: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const AuditLogModel = model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLogModel;
