import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import { useAllTasks, useUpdateTaskStatus } from '../../hooks/useTasks';
import { TaskItem, TaskStatus } from '../../api/task';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Column } from '../../components/ui/Table';
import { toast } from '../../hooks/useToast';

export const AllTasksPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useAllTasks({
    page,
    limit: 10,
    status: statusFilter,
    type: typeFilter,
  });

  const updateStatusMutation = useUpdateTaskStatus();

  const tasks = data?.data || [];
  const meta = data?.meta;

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: taskId, status: newStatus });
      toast.success(`Task status updated to "${newStatus}".`);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to update task status.';
      toast.error(msg);
    }
  };

  const columns: Column<TaskItem>[] = [
    {
      key: 'title',
      header: 'Task Title & Type',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link
              to={`/admin/tasks/${item._id}`}
              className="font-bold text-text hover:text-gold transition-colors"
            >
              {item.title}
            </Link>
            <Badge variant="gold">{item.type}</Badge>
          </div>
          {item.description && (
            <p className="text-[11px] text-textMuted line-clamp-1">{item.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Assignees',
      render: (item) => (
        <div className="flex items-center space-x-1.5">
          {item.assignedTo && item.assignedTo.length > 0 ? (
            item.assignedTo.map((assignee: any, idx: number) => {
              const name = typeof assignee === 'string' ? 'User' : assignee.name;
              return (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full bg-border/40 px-2 py-0.5 text-[10px] font-semibold text-text"
                >
                  {name}
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
      header: 'Due Date',
      sortable: true,
      render: (item) => {
        const dateObj = new Date(item.dueDate);
        const isPast = dateObj < new Date() && item.status !== 'done';
        return (
          <span
            className={`text-xs font-mono font-semibold ${
              isPast || item.isOverdue ? 'text-danger flex items-center gap-1 font-bold' : 'text-text'
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
            <span className="inline-flex items-center gap-1 text-[11px] text-gold font-medium truncate max-w-[150px]">
              <Icon name="FileText" size={12} />
              {item.linkedArticle.title}
            </span>
          );
        }
        if (item.linkedVideo) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] text-gold font-medium truncate max-w-[150px]">
              <Icon name="Video" size={12} />
              {item.linkedVideo.title}
            </span>
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
          className="rounded-md border border-border bg-bg px-2 py-1 text-[11px] font-semibold text-text focus:border-gold focus:outline-none"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Folder" size={14} />
            <span>Task Engine Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            All Operations Tasks
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            SuperAdmin central dashboard to view all assigned tasks across the 32-person team.
          </p>
        </div>

        <Link to="/admin/tasks/new">
          <Button variant="primary" size="md" leftIcon={<Icon name="Plus" size={16} />}>
            Assign New Task
          </Button>
        </Link>
      </div>

      {/* FilterBar */}
      <FilterBar
        onReset={() => {
          setStatusFilter('');
          setTypeFilter('');
          setPage(1);
        }}
      >
        <div className="w-44">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'inProgress', label: 'In Progress' },
              { value: 'inReview', label: 'In Review' },
              { value: 'done', label: 'Completed' },
              { value: 'overdue', label: 'Overdue' },
            ]}
          />
        </div>

        <div className="w-44">
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Task Types' },
              { value: 'article', label: 'Article Tasks' },
              { value: 'video', label: 'Video Tasks' },
              { value: 'general', label: 'General Tasks' },
            ]}
          />
        </div>
      </FilterBar>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        searchPlaceholder="Search tasks..."
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
