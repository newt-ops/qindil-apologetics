import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useResetPassword } from '../../../hooks/useAuth';
import { Input, Button } from '../../../components/ui';
import { useToast } from '../../../hooks/useToast';

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const initialEmail = (location.state as any)?.email || '';

  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      otp: '',
      newPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync(data);
      toast.success('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || 'Password reset failed. Please try again.';
      toast.error(msg);
    }
  };

  const isLoading = resetPasswordMutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gold">Qindil</h1>
          <p className="mt-2 text-sm text-textMuted">Set new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="6-Digit OTP Code"
            maxLength={6}
            placeholder="123456"
            className="text-center font-mono text-lg tracking-widest text-gold"
            error={errors.otp?.message}
            {...register('otp')}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Reset Password
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-textMuted">
          Back to{' '}
          <Link to="/login" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
