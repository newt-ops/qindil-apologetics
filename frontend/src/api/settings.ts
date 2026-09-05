import apiClient from './client';

export interface SocialLinks {
  facebook?: string;
  youtube?: string;
  telegram?: string;
  instagram?: string;
  tiktok?: string;
}

export interface SiteSettings {
  _id: string;
  siteName?: string;
  tagline?: string;
  socialLinks?: SocialLinks;
  contactEmail?: string;
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsPayload {
  siteName?: string;
  tagline?: string;
  contactEmail?: string;
  socialLinks?: SocialLinks;
  maintenanceMode?: boolean;
}

export const getSettingsApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: SiteSettings }>(
    '/settings'
  );
  return response.data;
};

export const updateSettingsApi = async (payload: UpdateSettingsPayload) => {
  const response = await apiClient.patch<{ success: boolean; data: SiteSettings }>(
    '/settings',
    payload
  );
  return response.data;
};
