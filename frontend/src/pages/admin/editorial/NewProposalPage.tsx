import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useAdminTopics } from '../../../hooks/useTopics';
import { useActiveTopics } from '../../../hooks/usePublicData';
import { useCreateArticleProposal } from '../../../hooks/useArticleProposals';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { toast } from '../../../hooks/useToast';

export const NewProposalPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: adminTopics = [] } = useAdminTopics();
  const { data: publicTopics = [] } = useActiveTopics();
  const topics = adminTopics.length > 0 ? adminTopics : publicTopics;

  const createProposalMutation = useCreateArticleProposal();

  // Form State
  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');
  const [summary, setSummary] = useState('');
  const [proposedDueDate, setProposedDueDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Validation
  const isTitleValid = title.trim().length >= 3;
  const isTopicValid = Boolean(topicId);
  const isSummaryValid = summary.trim().length >= 10;
  const isDueDateValid = Boolean(proposedDueDate);

  const checklistItems = [
    { label: 'Working Title (min 3 chars)', isValid: isTitleValid, required: true },
    { label: 'Apologetics Taxonomy Topic', isValid: isTopicValid, required: false },
    { label: 'Thesis & Research Scope (min 10 chars)', isValid: isSummaryValid, required: true },
    { label: 'Estimated Completion Deadline', isValid: isDueDateValid, required: false },
  ];

  const completedCount = checklistItems.filter((item) => item.isValid).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  const handleDeadlinePreset = (daysToAdd: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    // Format YYYY-MM-DD
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setProposedDueDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTitleValid) {
      setErrorMsg('Please enter a descriptive working title of at least 3 characters.');
      return;
    }
    if (!isSummaryValid) {
      setErrorMsg('Please provide a thesis and research outline of at least 10 characters.');
      return;
    }

    setErrorMsg('');

    try {
      await createProposalMutation.mutateAsync({
        title: title.trim(),
        topic: topicId || undefined,
        summary: summary.trim(),
        proposedDueDate: proposedDueDate || undefined,
      });

      toast.success('🎉 Article proposal successfully submitted to Super Admin!');
      navigate('/admin/articles');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to submit article proposal. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/articles"
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-textMuted hover:text-gold hover:border-gold/50 transition-colors shrink-0"
            title="Back to Articles & Proposals"
          >
            <Icon name="ArrowLeft" size={16} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-gold/15 text-gold border border-gold/30 uppercase tracking-wider">
                Scholarly Initiative
              </span>
              <span className="text-xs text-textMuted font-mono">Article Proposal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight mt-1">
              Propose Apologetics Research Topic
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              Submit a thesis outline and research scope to leadership for review. Approved proposals automatically initialize your article drafting workspace.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/articles')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={createProposalMutation.isPending}
            disabled={!isTitleValid || !isSummaryValid}
            leftIcon={<Icon name="Send" size={14} />}
            className="bg-gold hover:bg-goldHover text-bg font-bold shadow-md"
          >
            Submit Proposal
          </Button>
        </div>
      </div>

      {/* Main Creation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {errorMsg && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-xs text-danger font-semibold flex items-start space-x-3">
              <Icon name="AlertCircle" size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Submission Error</p>
                <p className="mt-0.5 text-danger/90">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Section 1: Title & Category */}
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex items-center space-x-2.5 border-b border-border/80 pb-3">
              <div className="p-2 rounded-lg bg-gold/10 text-gold">
                <Icon name="FileText" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Title &amp; Academic Classification</h3>
                <p className="text-xs text-textMuted">
                  Define a descriptive working title and classify it within our apologetics curriculum.
                </p>
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gold">
                  Working Article Title <span className="text-danger">*</span>
                </label>
                <span className={`text-[10px] font-mono ${title.length > 180 ? 'text-amber-500 font-bold' : 'text-textMuted'}`}>
                  {title.length} / 200 chars
                </span>
              </div>
              <Input
                placeholder="e.g. Epistemic Justification of Prophecy: Re-evaluating Hume's Skepticism"
                value={title}
                maxLength={200}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                autoFocus
              />
              <p className="text-[11px] text-textMuted">
                Be clear, concise, and focused on the intellectual core of your refutation or defense.
              </p>
            </div>

            {/* Topic Taxonomy */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gold">
                Apologetics Research Topic (Discipline)
              </label>
              <Select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                options={[
                  { value: '', label: 'Select a Topic Taxonomy (Optional)...' },
                  ...topics
                    .filter((t: any) => t.isActive !== false)
                    .map((t: any) => ({
                      value: t._id || t.id,
                      label: t.name,
                    })),
                ]}
              />
              <p className="text-[11px] text-textMuted">
                Assigning a topic helps editors organize our catalog and pair you with relevant peer reviewers.
              </p>
            </div>
          </div>

          {/* Section 2: Thesis & Scope */}
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex items-center space-x-2.5 border-b border-border/80 pb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Icon name="BookOpen" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Thesis Statement, Arguments &amp; Scholarly Scope</h3>
                <p className="text-xs text-textMuted">
                  Outline the intellectual objection, central thesis, theological methodology, and references.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gold">
                  Research Thesis &amp; Outline <span className="text-danger">*</span>
                </label>
                <span className={`text-[10px] font-mono ${summary.length > 2700 ? 'text-amber-500 font-bold' : 'text-textMuted'}`}>
                  {summary.length} / 3000 chars · {summary.trim() ? summary.trim().split(/\s+/).length : 0} words
                </span>
              </div>
              <Textarea
                rows={7}
                placeholder={`1. The Core Objection:\nWhat specific argument, secular polemic, or philosophical misunderstanding will this article address?\n\n2. Central Thesis:\nWhat is your primary thesis or logical rebuttal?\n\n3. Methodological Framework:\nQuranic exegesis, classical Kalam, analytical epistemology, empirical data, etc.\n\n4. Primary Literature & Scholarly Sources:\nWhich classical Islamic texts or contemporary academic publications will be cited?`}
                value={summary}
                maxLength={3000}
                onChange={(e) => {
                  setSummary(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
              />
              <p className="text-[11px] text-textMuted leading-relaxed">
                A rigorous, well-defined thesis allows Super Admin to evaluate feasibility quickly and approve your delegation without revision cycles.
              </p>
            </div>
          </div>

          {/* Section 3: Timeline */}
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex items-center space-x-2.5 border-b border-border/80 pb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Icon name="Calendar" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Expected Completion Timeline</h3>
                <p className="text-xs text-textMuted">
                  Specify when you anticipate completing the initial draft for review.
                </p>
              </div>
            </div>

            {/* Completion Timeline */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gold">
                Suggested First Draft Deadline
              </label>
              <Input
                type="date"
                value={proposedDueDate}
                onChange={(e) => setProposedDueDate(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-textMuted mr-1">Timeline Presets:</span>
                <button
                  type="button"
                  onClick={() => handleDeadlinePreset(14)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-border bg-bg hover:border-gold/50 hover:text-gold transition-colors"
                >
                  +2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => handleDeadlinePreset(21)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-border bg-bg hover:border-gold/50 hover:text-gold transition-colors"
                >
                  +3 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => handleDeadlinePreset(30)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-border bg-bg hover:border-gold/50 hover:text-gold transition-colors"
                >
                  +1 Month
                </button>
                <button
                  type="button"
                  onClick={() => handleDeadlinePreset(45)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-border bg-bg hover:border-gold/50 hover:text-gold transition-colors"
                >
                  +6 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => handleDeadlinePreset(60)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-border bg-bg hover:border-gold/50 hover:text-gold transition-colors"
                >
                  +2 Months
                </button>
              </div>
              <p className="text-[11px] text-textMuted">
                Leadership will confirm or calibrate this milestone when approving your proposal.
              </p>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate('/admin/articles')}
            >
              Cancel &amp; Return
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={createProposalMutation.isPending}
              disabled={!isTitleValid || !isSummaryValid}
              leftIcon={<Icon name="Send" size={16} />}
              className="bg-gold hover:bg-goldHover text-bg font-bold shadow-md px-6"
            >
              Submit Proposal to Super Admin
            </Button>
          </div>
        </div>

        {/* Right Sidebar: Guidance & Lifecycle */}
        <div className="space-y-6">
          {/* Submission Readiness Card */}
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                <Icon name="CheckSquare" size={15} />
                Proposal Readiness
              </h4>
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  isTitleValid && isSummaryValid
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gold/15 text-gold border border-gold/30'
                }`}
              >
                {progressPercent}% Ready
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-bg rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progressPercent === 100
                    ? 'bg-emerald-500'
                    : progressPercent >= 60
                    ? 'bg-gold'
                    : 'bg-gold/40'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <ul className="space-y-2.5 text-xs pt-1">
              {checklistItems.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2">
                  <span className="text-textMuted flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-textMuted/40" />
                    <span>{item.label}</span>
                  </span>
                  {item.isValid ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                      <Icon name="Check" size={12} />
                      Complete
                    </span>
                  ) : item.required ? (
                    <span className="text-danger font-semibold text-[10px] uppercase font-mono">
                      Required
                    </span>
                  ) : (
                    <span className="text-textMuted text-[10px] font-mono">Optional</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial Standards Card */}
          <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 space-y-3.5 shadow-sm">
            <h4 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2 border-b border-gold/20 pb-2.5">
              <Icon name="Shield" size={15} />
              Editorial Acceptance Standards
            </h4>
            <div className="space-y-3 text-xs text-text">
              <div className="space-y-1">
                <p className="font-bold text-gold flex items-center gap-1.5">
                  <Icon name="Sparkles" size={13} />
                  Precision of Scope
                </p>
                <p className="text-[11.5px] text-textMuted leading-relaxed">
                  Focus on a specific philosophical objection, misinterpretation, or theological challenge rather than an overly broad topic.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-gold flex items-center gap-1.5">
                  <Icon name="BookOpen" size={13} />
                  Rigorous Sourcing
                </p>
                <p className="text-[11.5px] text-textMuted leading-relaxed">
                  Plan to cite primary Quranic exegesis, authentic Hadith, classical Islamic scholarship, and modern peer-reviewed academic literature.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-gold flex items-center gap-1.5">
                  <Icon name="Scale" size={13} />
                  Apologetics Integrity
                </p>
                <p className="text-[11.5px] text-textMuted leading-relaxed">
                  Refutations should be intellectually charitable, addressing the strongest arguments of skeptics rather than weak strawmen.
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Lifecycle Card */}
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-3.5 shadow-sm">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2.5">
              <Icon name="Activity" size={15} className="text-gold" />
              What Happens Next?
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 rounded-full bg-gold/15 text-gold flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-bold text-text">Leadership Review</p>
                  <p className="text-[11px] text-textMuted leading-snug mt-0.5">
                    Super Admin assesses catalog novelty, peer review alignment, and strategic need.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-bold text-text">Instant Notification</p>
                  <p className="text-[11px] text-textMuted leading-snug mt-0.5">
                    You receive real-time alerts via Web notification bell and Telegram bot.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-bold text-text">Task Delegated &amp; Draft Ready</p>
                  <p className="text-[11px] text-textMuted leading-snug mt-0.5">
                    Upon acceptance, a task is created in your workspace with your title and draft initialized.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProposalPage;
