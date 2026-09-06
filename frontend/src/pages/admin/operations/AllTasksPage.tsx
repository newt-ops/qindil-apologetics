import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useAllTasks, useUpdateTaskStatus } from '../../../hooks/useTasks';
import { TaskItem, TaskStatus } from '../../../api/task';
import { DataTable } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Column } from '../../../components/ui/Table';
import { toast } from '../../../hooks/useToast';

export const AllTasksPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Global Query for Overview Metrics
  const { data: globalData } = useAllTasks({ page: 1, limit: 100 });
  const allTasks = globalData?.data || [];

  // Filtered Query for the Table
  const { data, isLoading } = useAllTasks({
    page,
    limit: 15,
    status: statusFilter,
    type: typeFilter,
  });

  const updateStatusMutation = useUpdateTaskStatus();

  const tasks = data?.data || [];
  const meta = data?.meta;

  // Metrics from loaded tasks
  const totalTasks = meta?.total || allTasks.length;
  const overdueCount = allTasks.filter(
    (t) => t.isOverdue || (new Date(t.dueDate) < new Date() && t.status !== 'done')
  ).length;
  const inProgressCount = allTasks.filter((t) => t.status === 'inProgress').length;
  const inReviewCount = allTasks.filter((t) => t.status === 'inReview').length;
  const doneCount = allTasks.filter((t) => t.status === 'done').length;

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: taskId, status: newStatus });
      toast.success(`Task status updated to "${newStatus}".`);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to update task status.';
      toast.error(msg);
    }
  };

  const statusTabs = [
    { value: '', label: 'All Tasks', count: totalTasks },
    { value: 'pending', label: 'Pending' },
    { value: 'inProgress', label: 'In Progress', count: inProgressCount },
    { value: 'inReview', label: 'In Review', count: inReviewCount },
    { value: 'done', label: 'Completed', count: doneCount },
  ];

  const columns: Column<TaskItem>[] = [
    {
      key: 'title',
      header: 'Task Title & Discipline',
      sortable: true,
      render: (item) => (
        <div className="space-y-1 max-w-sm">
          <div className="flex items-center space-x-2">
            <Link
              to={`/admin/tasks/${item._id}`}
              className="font-bold text-text hover:text-gold transition-colors block text-sm leading-snug"
            >
              {item.title}
            </Link>
            <Badge variant="gold" size="sm">
              {item.type}
            </Badge>
          </div>
          {item.description && (
            <p className="text-[11px] text-textMuted line-clamp-1 italic font-serif">
              "{item.description}"
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Assignees',
      render: (item) => (
        <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
          {item.assignedTo && item.assignedTo.length > 0 ? (
            item.assignedTo.map((assignee: any, idx: number) => {
              const name = typeof assignee === 'string' ? 'User' : assignee.name;
              return (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 rounded-full border border-border/80 bg-surface px-2 py-0.5 text-[10px] font-semibold text-text shadow-2xs"
                >
                  <span className="h-3.5 w-3.5 rounded-full bg-gold/20 text-gold flex items-center justify-center text-[9px] font-bold">
                    {name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate max-w-[100px]">{name}</span>
                </span>
              );
            })
          ) : (
            <span className="text-xs text-textMuted">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Deadline',
      sortable: true,
      render: (item) => {
        const dateObj = new Date(item.dueDate);
        const isPast = dateObj < new Date() && item.status !== 'done';
        return (
          <span
            className={`text-xs font-mono font-semibold ${
              isPast || item.isOverdue
                ? 'text-danger flex items-center gap-1 font-bold'
                : 'text-text'
            }`}
          >
            {(isPast || item.isOverdue) && <Icon name="AlertCircle" size={12} />}
            {dateObj.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'linkedResource',
      header: 'Linked Content',
      render: (item) => {
        if (item.linkedArticle) {
          return (
            <Link
              to={`/admin/articles/${item.linkedArticle._id}/edit`}
              className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline font-medium truncate max-w-[150px]"
              title="Open linked article"
            >
              <Icon name="FileText" size={12} />
              <span className="truncate">{item.linkedArticle.title}</span>
            </Link>
          );
        }
        if (item.linkedVideo) {
          return (
            <Link
              to={`/admin/videos/${item.linkedVideo._id}`}
              className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline font-medium truncate max-w-[150px]"
              title="Open video workspace"
            >
              <Icon name="Video" size={12} />
              <span className="truncate">{item.linkedVideo.title}</span>
            </Link>
          );
        }
        return <span className="text-xs text-textMuted">—</span>;
      },
    },
    {
      key: 'quickStatus',
      header: 'Quick Action',
      render: (item) => (
        <select
          value={item.status}
          onChange={(e) => handleStatusChange(item._id, e.target.value as TaskStatus)}
          disabled={updateStatusMutation.isPending}
          className="rounded-md border border-border bg-bg px-2 py-1 text-[11px] font-semibold text-text focus:border-gold focus:outline-none cursor-pointer"
        >
          <option value="pending">Pending</option>
          <option value="inProgress">In Progress</option>
          <option value="inReview">In Review</option>
          <option value="done">Completed</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Activity" size={14} />
            <span>Operations Task Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            All Operations Tasks
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Global administrative registry of article drafting, video production, and scholarly operational tasks.
          </p>
        </div>

        <Link to="/admin/tasks/assign">
          <Button variant="primary" size="md" leftIcon={<Icon name="Plus" size={16} />}>
            Assign New Task
          </Button>
        </Link>
      </div>

      {/* Task Metrics Strip (Prompt 42 density) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Total Tasks */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Total Board Tasks
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Icon name="Folder" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-text">
            {totalTasks}
          </div>
          <div className="mt-0.5 text-[10px] text-textMuted">Operational pipeline</div>
        </div>

        {/* Overdue */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Overdue Tasks
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger/10 text-danger">
              <Icon name="AlertCircle" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-danger">
            {overdueCount}
          </div>
          <div className="mt-0.5 text-[10px] text-danger/80 font-medium">Past designated deadline</div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              In Progress
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Icon name="Activity" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-blue-400">
            {inProgressCount}
          </div>
          <div className="mt-0.5 text-[10px] text-textMuted">Under active execution</div>
        </div>

        {/* In Review */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              In Review
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Icon name="Inbox" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-amber-500">
            {inReviewCount}
          </div>
          <div className="mt-0.5 text-[10px] text-amber-500/80 font-medium">Awaiting evaluation</div>
        </div>

        {/* Completed */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-1 rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Completed
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Icon name="CheckCircle" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-emerald-500">
            {doneCount}
          </div>
          <div className="mt-0.5 text-[10px] text-emerald-500/80 font-medium">Successfully delivered</div>
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80 text-xs">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
                isActive
                  ? 'bg-gold text-bg font-bold shadow-sm'
                  : 'text-textMuted hover:bg-surface hover:text-text'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive ? 'bg-bg/20 text-bg' : 'bg-surface border border-border text-textMuted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-surface border border-border p-3.5 sm:p-4 rounded-xl">
        <Select
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending Acceptance' },
            { value: 'inProgress', label: 'In Progress' },
            { value: 'inReview', label: 'In Review' },
            { value: 'done', label: 'Completed' },
          ]}
        />

        <Select
          label="Filter by Type"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'All Task Types' },
            { value: 'article', label: 'Article Tasks' },
            { value: 'video', label: 'Video Tasks' },
            { value: 'general', label: 'General Operational Tasks' },
          ]}
        />

        <div className="flex items-end">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => {
              setStatusFilter('');
              setTypeFilter('');
              setPage(1);
            }}
            leftIcon={<Icon name="RefreshCw" size={14} />}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        searchPlaceholder="Filter listed operational tasks..."
        pagination={
          meta
            ? {
                page: meta.page,
                totalPages: meta.totalPages,
                total: meta.total,
                onPageChange: (p) => setPage(p),
              }
            : undefined
        }
      />
    </div>
  );
};

export default AllTasksPage;
