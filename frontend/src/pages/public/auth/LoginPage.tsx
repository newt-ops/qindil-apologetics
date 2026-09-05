import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogin, useGoogleLogin } from '../../../hooks/useAuth';
import { Input, Button } from '../../../components/ui';
import { useToast } from '../../../hooks/useToast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

declare global {
  interface Window {
    google?: any;
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const getDestination = (res: any) => {
    const defaultFrom = (location.state as any)?.from?.pathname;
    if (defaultFrom && defaultFrom !== '/login' && defaultFrom !== '/') {
      return defaultFrom;
    }
    const user = res?.data?.user;
    const roles = user?.roles || [];
    const isAdmin = roles.some(
      (r: any) =>
        r === 'admin' ||
        r === 'superAdmin' ||
        (typeof r === 'object' && (r.name === 'admin' || r.name === 'superAdmin'))
    );
    return isAdmin ? '/admin' : '/dashboard';
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await loginMutation.mutateAsync(data);
      toast.success('Welcome back!');
      navigate(getDestination(res), { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && googleClientId) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          try {
            const res = await googleLoginMutation.mutateAsync({ idToken: response.credential });
            toast.success('Google login successful!');
            navigate(getDestination(res), { replace: true });
          } catch (err: any) {
            const msg =
              err?.response?.data?.error?.message || 'Google sign-in failed. Please try again.';
            toast.error(msg);
          }
        },
      });

      const parent = document.getElementById('googleBtnContainer');
      if (parent) {
        window.google.accounts.id.renderButton(parent, {
          theme: 'dark',
          size: 'large',
          width: '100%',
        });
      }
    }
  }, [navigate, googleLoginMutation, toast]);

  const isLoading = loginMutation.isPending || googleLoginMutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gold">Qindil</h1>
          <p className="mt-2 text-sm text-textMuted">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-textMuted">
                Password
              </span>
              <Link to="/forgot-password" className="text-xs text-gold hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="my-6 flex items-center justify-center">
          <span className="h-px flex-1 bg-border" />
          <span className="px-3 text-xs text-textMuted uppercase">OR</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div id="googleBtnContainer" className="flex justify-center" />

        <p className="mt-6 text-center text-xs text-textMuted">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-gold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
