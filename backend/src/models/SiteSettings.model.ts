import { Schema, model, Document } from 'mongoose';

export interface ISocialLinks {
  facebook?: string;
  youtube?: string;
  telegram?: string;
  instagram?: string;
  tiktok?: string;
}

export interface ISiteSettings extends Document {
  siteName?: string;
  tagline?: string;
  socialLinks?: ISocialLinks;
  contactEmail?: string;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { type: String, trim: true },
    tagline: { type: String, trim: true },
    socialLinks: {
      facebook: { type: String },
      youtube: { type: String },
      telegram: { type: String },
      instagram: { type: String },
      tiktok: { type: String },
    },
    contactEmail: { type: String, lowercase: true, trim: true },
    maintenanceMode: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const SiteSettingsModel = model<ISiteSettings>('SiteSettings', siteSettingsSchema);
export default SiteSettingsModel;
