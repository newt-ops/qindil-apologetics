import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useForgotPassword } from '../../../hooks/useAuth';
import { Input, Button } from '../../../components/ui';
import { useToast } from '../../../hooks/useToast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      toast.success('An OTP code has been sent to your email.');
      setTimeout(() => navigate('/reset-password', { state: { email: data.email } }), 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || 'Failed to send OTP. Please try again.';
      toast.error(msg);
    }
  };

  const isLoading = forgotPasswordMutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gold">Qindil</h1>
          <p className="mt-2 text-sm text-textMuted">Reset your password</p>
          <p className="mt-1 text-xs text-textMuted/80">
            Enter your email to receive a password reset OTP code.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Send OTP
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-textMuted">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
