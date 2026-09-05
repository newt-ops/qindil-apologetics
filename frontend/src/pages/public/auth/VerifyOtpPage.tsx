import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useVerifyOtp } from '../../../hooks/useAuth';
import { Input, Button } from '../../../components/ui';
import { useToast } from '../../../hooks/useToast';

const verifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const initialEmail = (location.state as any)?.email || '';

  const verifyOtpMutation = useVerifyOtp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: initialEmail,
      otp: '',
    },
  });

  const onSubmit = async (data: VerifyOtpFormData) => {
    try {
      await verifyOtpMutation.mutateAsync(data);
      toast.success('Email verified successfully! You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || 'OTP verification failed. Please try again.';
      toast.error(msg);
    }
  };

  const isLoading = verifyOtpMutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gold">Qindil</h1>
          <p className="mt-2 text-sm text-textMuted">Verify your email address</p>
          <p className="mt-1 text-xs text-textMuted/80">
            Please enter the 6-digit OTP code sent to your email.
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

          <Input
            label="6-Digit OTP Code"
            maxLength={6}
            placeholder="123456"
            className="text-center font-mono text-lg tracking-widest text-gold"
            error={errors.otp?.message}
            {...register('otp')}
          />

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Verify Email
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

export default VerifyOtpPage;
