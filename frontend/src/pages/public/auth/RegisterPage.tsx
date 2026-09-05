import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../../hooks/useAuth';
import { Input, Button } from '../../../components/ui';
import { useToast } from '../../../hooks/useToast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync(data);
      toast.success('Registration successful! Please check your email for verification code.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    }
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gold">Qindil</h1>
          <p className="mt-2 text-sm text-textMuted">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-textMuted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
