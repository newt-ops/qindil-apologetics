import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  registerApi,
  verifyOtpApi,
  loginApi,
  googleLoginApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
  getMeApi,
  RegisterPayload,
  VerifyOtpPayload,
  LoginPayload,
  GoogleLoginPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '../api/auth';
import { useAuthStore } from '../stores/authStore';

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterPayload) => registerApi(data),
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: VerifyOtpPayload) => verifyOtpApi(data),
  });
};

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginPayload) => loginApi(data),
    onSuccess: (res) => {
      if (res?.data?.user && res?.data?.accessToken) {
        setAuth(res.data.user, res.data.accessToken);
      }
    },
  });
};

export const useGoogleLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: GoogleLoginPayload) => googleLoginApi(data),
    onSuccess: (res) => {
      if (res?.data?.user && res?.data?.accessToken) {
        setAuth(res.data.user, res.data.accessToken);
      }
    },
  });
};

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordPayload) => forgotPasswordApi(data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => resetPasswordApi(data),
  });
};

export const useMe = (enabled = true) => {
  const setUser = useAuthStore((state) => state.setUser);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const res = await getMeApi();
        if (res?.data?.user) {
          setUser(res.data.user);
        }
        if (res?.data?.permissions) {
          setPermissions(res.data.permissions);
        }
        setIsLoading(false);
        return res.data;
      } catch (err) {
        setIsLoading(false);
        throw err;
      }
    },
    enabled,
    retry: false,
  });
};
