import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useSubmitContact } from '../../../hooks/usePublicData';
import Icon from '../../../components/icons/Icon';
import { Button } from '../../../components/ui';
import { useToast } from '../../../hooks/useToast';
import Seo from '../../../components/shared/Seo';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  topic: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactPage() {
  const toast = useToast();
  const submitContactMutation = useSubmitContact();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

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
      const fullSubject = data.topic ? `[${data.topic}] ${data.subject || 'Inquiry'}` : data.subject;
      const res = await submitContactMutation.mutateAsync({
        name: data.name,
        email: data.email,
        subject: fullSubject,
        message: data.message,
      });
      const msg =
        res?.data?.message || 'Thank you for reaching out! Your message has been received by our fellows.';
      toast.success(msg);
      setSubmittedSuccess(true);
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
    <div className="relative min-h-screen bg-bg text-text font-sans py-6 sm:py-16 selection:bg-gold/20 selection:text-gold transition-colors duration-200 overflow-hidden">
      <Seo
        title="Contact Us — Academic Inquiries & Research Inquiries"
        description="Get in touch with the Qindil Apologetics research team for academic inquiries, research collaborations, or general questions."
      />

      {/* Ambient background glow & radial highlights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(179,133,76,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,168,76,0.12),rgba(0,0,0,0))]" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] bg-gold/10 dark:bg-gold/5 blur-[130px] rounded-full" />

      <div className="relative mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-[11px] sm:text-xs font-semibold text-gold">
            <Icon name="Mail" size={13} />
            <span>Communication &amp; Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
            Connect With the Qindil Team
          </h1>
          <p className="text-xs sm:text-sm text-textMuted leading-relaxed max-w-lg mx-auto">
            We welcome academic inquiries, sincere questions, research collaborations, and intellectual discourse.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Institutional Channels (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Direct Channel Cards */}
            <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-md space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gold">
                Inquiry Channels
              </h2>

              <div className="space-y-3.5">
                <div className="flex items-start space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold border border-gold/20 shrink-0 mt-0.5">
                    <Icon name="BookOpen" size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-text">Academic &amp; Research</h3>
                    <p className="text-[11px] text-textMuted leading-relaxed">
                      Questions regarding paper publications, citations, or theoretical refutations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold border border-gold/20 shrink-0 mt-0.5">
                    <Icon name="Mic" size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-text">Speaking &amp; Media</h3>
                    <p className="text-[11px] text-textMuted leading-relaxed">
                      Panel discussions, podcast appearances, and academic symposium invitations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold border border-gold/20 shrink-0 mt-0.5">
                    <Icon name="Send" size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-text">Community Telegram</h3>
                    <p className="text-[11px] text-textMuted leading-relaxed">
                      Follow our official publications and daily insights via the Qindil channel.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SLA / Commitment Badge */}
            <div className="rounded-xl border border-border/80 bg-surface/60 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-text">
                <Icon name="Clock" size={14} className="text-gold" />
                <span>Response Commitment</span>
              </div>
              <p className="text-[11px] text-textMuted leading-relaxed">
                Our resident research fellows review inquiries periodically. You can typically expect a response within <strong className="text-text">48 business hours</strong>.
              </p>
            </div>

            {/* Respectful Discourse Note */}
            <div className="rounded-xl border border-gold/25 bg-gold/5 p-4 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-gold">
                <Icon name="Shield" size={14} />
                <span>Civil &amp; Academic Protocol</span>
              </div>
              <p className="text-[11px] text-textMuted leading-relaxed">
                Qindil upholds rigorous standards of intellectual honesty and respectful dialogue. Sincere critiques and queries are answered with evidence and primary sources.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form Card (7 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-7 rounded-xl sm:rounded-2xl border border-border bg-surface p-4 sm:p-8 shadow-xl"
          >
            {submittedSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success border border-success/30">
                  <Icon name="CheckCircle" size={28} />
                </div>
                <h3 className="text-lg font-bold text-text">Message Delivered Successfully</h3>
                <p className="text-xs sm:text-sm text-textMuted max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. Our editorial and research team has received your message and will review it promptly.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setSubmittedSuccess(false)}
                  className="mt-2 text-xs"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h2 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
                  <Icon name="Edit" size={14} className="text-gold" />
                  <span>Send a Direct Inquiry</span>
                </h2>

                {/* Topic Selector */}
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">
                    Inquiry Nature
                  </label>
                  <select
                    {...register('topic')}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text focus:border-gold focus:outline-none transition"
                  >
                    <option value="General Academic Inquiry">General Academic Inquiry</option>
                    <option value="Research & Paper Submission">Research &amp; Paper Submission</option>
                    <option value="Theological / Philosophical Question">Theological / Philosophical Question</option>
                    <option value="Media & Speaking Request">Media &amp; Speaking Request</option>
                    <option value="Platform Feedback / Bug Report">Platform Feedback / Bug Report</option>
                  </select>
                </div>

                {/* Name & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-textMuted mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-textMuted">
                        <Icon name="User" size={14} />
                      </div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        {...register('name')}
                        className={`w-full rounded-lg border bg-bg pl-8 pr-3 py-2 text-xs text-text placeholder:text-textMuted/60 focus:outline-none transition ${
                          errors.name ? 'border-danger focus:border-danger' : 'border-border focus:border-gold'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-[11px] text-danger">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-textMuted mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-textMuted">
                        <Icon name="Mail" size={14} />
                      </div>
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        {...register('email')}
                        className={`w-full rounded-lg border bg-bg pl-8 pr-3 py-2 text-xs text-text placeholder:text-textMuted/60 focus:outline-none transition ${
                          errors.email ? 'border-danger focus:border-danger' : 'border-border focus:border-gold'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-[11px] text-danger">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">
                    Subject Line (Optional)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-textMuted">
                      <Icon name="Tag" size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="Brief summary of your inquiry"
                      {...register('subject')}
                      className="w-full rounded-lg border border-border bg-bg pl-8 pr-3 py-2 text-xs text-text placeholder:text-textMuted/60 focus:border-gold focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">
                    Message Content *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Provide detailed context, citations, or background for your inquiry..."
                    {...register('message')}
                    className={`w-full rounded-lg border bg-bg p-3 text-xs text-text placeholder:text-textMuted/60 focus:outline-none transition resize-none ${
                      errors.message ? 'border-danger focus:border-danger' : 'border-border focus:border-gold'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-[11px] text-danger">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  leftIcon={<Icon name="Send" size={14} />}
                  className="w-full py-2.5 text-xs sm:text-sm font-bold"
                >
                  {isLoading ? 'Dispatching Message...' : 'Submit Inquiry'}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
