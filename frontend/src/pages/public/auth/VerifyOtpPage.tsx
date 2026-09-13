import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVerifyOtp, useForgotPassword } from '../../../hooks/useAuth';
import { useAuthStore } from '../../../stores/authStore';
import { Button } from '../../../components/ui';
import { useToast } from '../../../hooks/useToast';
import Icon from '../../../components/icons/Icon';
import ThemeToggle from '../../../components/shared/ThemeToggle';

const verifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain digits only'),
});

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const initialEmail = (location.state as any)?.email || '';

  const [cooldown, setCooldown] = useState<number>(initialEmail ? 60 : 0);

  const verifyOtpMutation = useVerifyOtp();
  const resendMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: initialEmail,
      otp: '',
    },
  });

  const currentEmail = watch('email');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !currentEmail) return;
    try {
      await resendMutation.mutateAsync({ email: currentEmail });
      toast.success('A new verification code has been dispatched.');
      setCooldown(60);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || 'Failed to dispatch verification code. Please try again.';
      toast.error(msg);
    }
  };

  const onSubmit = async (data: VerifyOtpFormData) => {
    try {
      const res = await verifyOtpMutation.mutateAsync(data);
      if (res?.data?.user && res?.data?.accessToken) {
        setAuth(res.data.user, res.data.accessToken);
        toast.success('Registration completed! Welcome to your dashboard.');
        navigate('/dashboard', { replace: true });
      } else {
        toast.success('Identity verified successfully. You can now access your account.');
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || 'Verification failed. Please verify the code and try again.';
      toast.error(msg);
    }
  };

  const isLoading = verifyOtpMutation.isPending;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#faf8f5] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 px-4 py-12 font-sans transition-colors duration-200 overflow-hidden">
      {/* Theme Switcher in top right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Background Ambient Glows */}
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
                <Icon name="Key" size={26} className="text-[#b3854c] dark:text-[#c9a84c]" />
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase">
                QINDIL
              </h1>
            </Link>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[#b3854c] dark:text-[#c9a84c]/90">
              Identity Verification
            </p>
            <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
              Enter the 6-digit authentication code sent to your email
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

            {/* OTP Code Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resendMutation.isPending || !currentEmail}
                  className="flex items-center gap-1 text-xs text-[#b3854c] hover:text-[#966e3a] dark:text-[#c9a84c] dark:hover:text-[#d8b85c] disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon
                    name="RefreshCw"
                    size={12}
                    className={resendMutation.isPending ? 'animate-spin' : ''}
                  />
                  <span>
                    {cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : resendMutation.isPending
                      ? 'Dispatching...'
                      : 'Resend code'}
                  </span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="000000"
                  {...register('otp')}
                  className={`w-full rounded-lg border bg-stone-50/70 dark:bg-zinc-950/70 py-3 text-center font-mono text-2xl font-bold tracking-[0.4em] text-[#b3854c] dark:text-[#c9a84c] placeholder:text-stone-300 dark:placeholder:text-zinc-700 transition-all focus:outline-none ${
                    errors.otp
                      ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                      : 'border-stone-200 dark:border-zinc-800 focus:border-[#b3854c] dark:focus:border-[#c9a84c] focus:ring-1 focus:ring-[#b3854c]/25 dark:focus:ring-[#c9a84c]/30'
                  }`}
                />
              </div>
              {errors.otp && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                  <Icon name="AlertCircle" size={13} />
                  <span>{errors.otp.message}</span>
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
                Verify &amp; Proceed
              </Button>
            </div>
          </form>

          {/* Navigation Links */}
          <div className="mt-6 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              <Icon name="ArrowLeft" size={14} />
              <span>Back to sign in</span>
            </Link>

            <Link
              to="/register"
              className="font-medium text-[#b3854c] hover:text-[#966e3a] dark:text-[#c9a84c] dark:hover:text-[#d8b85c] transition-colors"
            >
              Need new account?
            </Link>
          </div>

          {/* Security Badge */}
          <div className="mt-6 pt-5 border-t border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-500">
            <Icon name="Shield" size={13} className="text-[#b3854c]/80 dark:text-[#c9a84c]/70" />
            <span>Secure cryptographically verified protocol</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyOtpPage;
