import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  authProvider: 'local' | 'google' | 'both';
  avatarUrl?: string;
  roles: Types.ObjectId[];
  isActive: boolean;
  telegramChatId?: string;
  telegramLinkCode?: string;
  telegramLinkCodeExpiresAt?: Date;
  emailVerified: boolean;
  otpHash?: string;
  otpExpiresAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, index: true },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'both'],
      default: 'local',
      required: true,
    },
    avatarUrl: { type: String },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    isActive: { type: Boolean, default: true },
    telegramChatId: { type: String },
    telegramLinkCode: { type: String, sparse: true, index: true },
    telegramLinkCodeExpiresAt: { type: Date },
    emailVerified: { type: Boolean, default: false },
    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUser>('User', userSchema);
export default UserModel;
