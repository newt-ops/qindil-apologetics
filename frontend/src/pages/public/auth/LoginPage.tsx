import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLogin, useGoogleLogin } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui';
import { useToast } from '../../../hooks/useToast';
import Icon from '../../../components/icons/Icon';
import ThemeToggle from '../../../components/shared/ThemeToggle';
import { useThemeStore } from '../../../stores/themeStore';

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
  const { theme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);

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
      toast.success('Authentication verified. Welcome back.');
      navigate(getDestination(res), { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id) return false;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          try {
            const res = await googleLoginMutation.mutateAsync({ idToken: response.credential });
            toast.success('Google authentication verified.');
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
        parent.innerHTML = '';
        window.google.accounts.id.renderButton(parent, {
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          width: '100%',
          shape: 'pill',
          text: 'signin_with',
        });
      }
      return true;
    };

    if (!renderGoogleButton()) {
      const interval = setInterval(() => {
        if (renderGoogleButton()) {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [navigate, googleLoginMutation, toast, theme]);

  const isLoading = loginMutation.isPending || googleLoginMutation.isPending;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#faf8f5] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 px-4 py-12 font-sans transition-colors duration-200 overflow-hidden">
      {/* Theme Switcher in top right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient background glow & radial highlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(179,133,76,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,168,76,0.12),rgba(255,255,255,0))]" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] bg-gold/10 dark:bg-gold/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Card Box */}
        <div className="relative rounded-2xl border border-stone-200/90 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl p-8 shadow-xl shadow-stone-300/40 dark:shadow-2xl dark:shadow-black/80 transition-colors duration-200">
          {/* Top Gold Gradient Trim */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#b3854c] dark:via-[#c9a84c] to-transparent rounded-t-2xl" />

          {/* Brand Header */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block group">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b3854c]/15 via-[#b3854c]/5 to-transparent dark:from-[#c9a84c]/20 dark:via-[#c9a84c]/10 border border-[#b3854c]/25 dark:border-[#c9a84c]/30 shadow-md shadow-[#b3854c]/10 dark:shadow-lg dark:shadow-[#c9a84c]/10 transition-transform duration-300 group-hover:scale-105">
                <Icon name="BookOpen" size={26} className="text-[#b3854c] dark:text-[#c9a84c]" />
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase">
                QINDIL
              </h1>
            </Link>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[#b3854c] dark:text-[#c9a84c]/90">
              Apologetics &amp; Intellectual Research
            </p>
            <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
              Sign in to your member or research workspace
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
                  <Icon name="Mail" size={16} />
                </div>
                <input
                  type="email"
                  placeholder="you@domain.com"
                  {...register('email')}
                  className={`w-full rounded-lg border bg-stone-50/70 dark:bg-zinc-950/70 pl-9 pr-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all focus:outline-none ${
                    errors.email
                      ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                      : 'border-stone-200 dark:border-zinc-800 focus:border-[#b3854c] dark:focus:border-[#c9a84c] focus:ring-1 focus:ring-[#b3854c]/25 dark:focus:ring-[#c9a84c]/30'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                  <Icon name="AlertCircle" size={13} />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#b3854c] hover:text-[#966e3a] dark:text-[#c9a84c] dark:hover:text-[#d8b85c] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
                  <Icon name="Lock" size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full rounded-lg border bg-stone-50/70 dark:bg-zinc-950/70 pl-9 pr-10 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all focus:outline-none ${
                    errors.password
                      ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                      : 'border-stone-200 dark:border-zinc-800 focus:border-[#b3854c] dark:focus:border-[#c9a84c] focus:ring-1 focus:ring-[#b3854c]/25 dark:focus:ring-[#c9a84c]/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                  <Icon name="AlertCircle" size={13} />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full justify-center py-2.5 shadow-lg shadow-gold/10"
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-center">
            <span className="h-px flex-1 bg-stone-200 dark:bg-zinc-800" />
            <span className="px-3 text-[11px] font-medium tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              Or continue with
            </span>
            <span className="h-px flex-1 bg-stone-200 dark:bg-zinc-800" />
          </div>

          {/* Google Sign In Container */}
          <div id="googleBtnContainer" className="flex justify-center min-h-[44px]" />

          {/* Register Link */}
          <p className="mt-6 text-center text-xs text-zinc-600 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#b3854c] hover:text-[#966e3a] dark:text-[#c9a84c] dark:hover:text-[#d8b85c] transition-colors"
            >
              Create an account
            </Link>
          </p>

          {/* Security Badge */}
          <div className="mt-6 pt-5 border-t border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-500">
            <Icon name="Shield" size={13} className="text-[#b3854c]/80 dark:text-[#c9a84c]/70" />
            <span>End-to-end encrypted session</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
