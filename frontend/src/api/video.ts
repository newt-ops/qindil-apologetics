import apiClient from './client';
import { User } from '../stores/authStore';

export type VideoBoardStage =
  | 'idea'
  | 'scripting'
  | 'filming'
  | 'editing'
  | 'review'
  | 'published';

export interface StageHistoryItem {
  stage: VideoBoardStage;
  movedBy: User | string;
  movedAt: string;
}

export interface VideoCategoryItem {
  _id: string;
  name: string;
  slug: string;
}

export interface VideoTaskItem {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: string;
}

export interface VideoLogItem {
  _id: string;
  title: string;
  category?: VideoCategoryItem | string;
  isRefutation: boolean;
  targetVideoUrl?: string;
  contentCreator: User | string;
  editor: User | string;
  task?: VideoTaskItem | string;
  boardStage: VideoBoardStage;
  stageHistory: StageHistoryItem[];
  posterUrl?: string;
  publishedUrl?: string;
  publishedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateVideoDetailsPayload {
  posterUrl?: string;
  publishedUrl?: string;
  notes?: string;
}

export const getBoardApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: VideoLogItem[] }>(
    '/videos/board'
  );
  return response.data;
};

export const getVideoByIdApi = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: VideoLogItem }>(
    `/videos/${id}`
  );
  return response.data;
};

export const moveStageApi = async (id: string, stage: VideoBoardStage) => {
  const response = await apiClient.patch<{ success: boolean; data: VideoLogItem }>(
    `/videos/${id}/stage`,
    { stage }
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
