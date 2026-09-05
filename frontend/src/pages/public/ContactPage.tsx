import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useSubmitContact } from '../../hooks/usePublicData';
import Icon from '../../components/icons/Icon';
import { Input, Textarea, Button } from '../../components/ui';
import { useToast } from '../../hooks/useToast';
import Seo from '../../components/shared/Seo';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactPage() {
  const toast = useToast();
  const submitContactMutation = useSubmitContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const res = await submitContactMutation.mutateAsync(data);
      const msg = res?.data?.message || 'Thank you for reaching out! Your message has been received.';
      toast.success(msg);
      reset();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        'Failed to send contact message. Please try again.';
      toast.error(msg);
    }
  };

  const isLoading = submitContactMutation.isPending;

  return (
    <div className="min-h-screen bg-bg text-text font-sans py-16">
      <Seo
        title="Contact Us"
        description="Get in touch with the Qindil Apologetics research team for academic inquiries, research collaborations, or general questions."
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold">
            <Icon name="Mail" size={14} />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Contact Qindil Team
          </h1>
          <p className="text-sm text-textMuted leading-relaxed">
            We welcome academic inquiries, sincere questions, research collaborations, and feedback.
          </p>
        </div>

        {/* Contact Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-border bg-surface p-6 sm:p-10 shadow-xl max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Your Full Name *"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="you@domain.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Subject (Optional)"
              placeholder="Inquiry / Feedback / Collaboration"
              error={errors.subject?.message}
              {...register('subject')}
            />

            <Textarea
              label="Message *"
              rows={5}
              placeholder="Write your message here..."
              error={errors.message?.message}
              {...register('message')}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<Icon name="Mail" size={16} />}
              className="w-full py-3"
            >
              Send Message
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default ContactPage;
