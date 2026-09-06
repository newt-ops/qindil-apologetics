import apiClient from './client';
import { User } from '../stores/authStore';

export type VideoType = 'refutation' | 'normal';
export type VideoDestination = 'official' | 'personal';
export type VideoStatus =
  | 'draft'
  | 'inProgress'
  | 'submitted'
  | 'changesRequested'
  | 'approved'
  | 'published'
  | 'posted';

export interface VideoLogItem {
  _id: string;
  title: string;
  creator: User | string;
  videoType: VideoType;
  destination: VideoDestination;
  targetVideoUrl?: string;
  posterUrl?: string;
  notes?: string;
  status: VideoStatus;
  reviewNotes?: string;
  submittedUrl?: string;
  publishedUrl?: string;
  publishedAt?: string;
  linkedTaskId?: any;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateVideoDetailsPayload {
  posterUrl?: string;
  notes?: string;
  submittedUrl?: string;
  targetVideoUrl?: string;
  destination?: VideoDestination;
  videoType?: VideoType;
}

export interface SubmitVideoPayload {
  submittedUrl?: string;
}

export interface ReviewVideoPayload {
  decision: 'approve' | 'requestChanges';
  reviewNotes?: string;
}

export interface PostVideoPayload {
  publishedUrl: string;
}

export const getVideoByIdApi = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: VideoLogItem }>(
    `/videos/${id}`
  );
  return response.data;
};

export const acceptVideoTaskApi = async (id: string) => {
  const response = await apiClient.patch<{ success: boolean; data: VideoLogItem }>(
    `/videos/${id}/accept`
  );
  return response.data;
};

export const updateVideoDetailsApi = async (
  id: string,
  data: UpdateVideoDetailsPayload
) => {
  const response = await apiClient.patch<{ success: boolean; data: VideoLogItem }>(
    `/videos/${id}`,
    data
  );
  return response.data;
};

export const submitVideoTaskApi = async (
  id: string,
  data?: SubmitVideoPayload
) => {
  const response = await apiClient.patch<{ success: boolean; data: VideoLogItem }>(
    `/videos/${id}/submit`,
    data
  );
  return response.data;
};

export const reviewVideoTaskApi = async (
  id: string,
  data: ReviewVideoPayload
) => {
  const response = await apiClient.patch<{ success: boolean; data: VideoLogItem }>(
    `/videos/${id}/review`,
    data
  );
  return response.data;
};

export const postVideoTaskApi = async (
  id: string,
  data: PostVideoPayload
) => {
  const response = await apiClient.patch<{ success: boolean; data: VideoLogItem }>(
    `/videos/${id}/post`,
    data
  );
  return response.data;
};

