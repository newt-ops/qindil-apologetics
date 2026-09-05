import apiClient from './client';

export interface SignedMediaResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export const getMediaUploadSignatureApi = async (folder = 'qindil/uploads') => {
  const response = await apiClient.post<{ success: boolean; data: SignedMediaResponse }>(
    '/media/sign',
    { folder }
  );
  return response.data;
};
