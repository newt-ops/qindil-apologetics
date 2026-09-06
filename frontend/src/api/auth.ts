import apiClient from './client';
import { User } from '../stores/authStore';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleLoginPayload {
  idToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthResponseData {
  accessToken: string;
  user: User;
}

export interface TelegramCodeResponse {
  linkCode: string;
  expiresAt: string;
  botUsername: string;
}

export const registerApi = async (data: RegisterPayload) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export const verifyOtpApi = async (data: VerifyOtpPayload) => {
  const response = await apiClient.post('/auth/verify-otp', data);
  return response.data;
};

export const loginApi = async (data: LoginPayload) => {
  const response = await apiClient.post<{ success: boolean; data: AuthResponseData }>('/auth/login', data);
  return response.data;
};

export const googleLoginApi = async (data: GoogleLoginPayload) => {
  const response = await apiClient.post<{ success: boolean; data: AuthResponseData }>('/auth/google', data);
  return response.data;
};

export const logoutApi = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const forgotPasswordApi = async (data: ForgotPasswordPayload) => {
  const response = await apiClient.post('/auth/forgot-password', data);
  return response.data;
};

export const resetPasswordApi = async (data: ResetPasswordPayload) => {
  const response = await apiClient.post('/auth/reset-password', data);
  return response.data;
};

export const getMeApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: { user: User; permissions: string[] } }>('/auth/me');
  return response.data;
};

export const generateTelegramCodeAuthApi = async () => {
  const response = await apiClient.post<{ success: boolean; data: TelegramCodeResponse }>('/auth/telegram/code');
  return response.data;
};
