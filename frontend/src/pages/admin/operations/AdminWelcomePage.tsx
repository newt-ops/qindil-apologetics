import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useAuthStore } from '../../../stores/authStore';
import { useAllTasks } from '../../../hooks/useTasks';
import { useReviewQueue } from '../../../hooks/useArticles';
import { useTeamMembers } from '../../../hooks/useTeam';
import { AdminStatCard, AdminPageSkeleton, StatusBadge } from '../../../components/admin';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export const AdminWelcomePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();

  // Team-wide live operational data (Super Admin oversight)
  const { data: allTasksData, isLoading: isLoadingTasks } = useAllTasks({ limit: 100 });
  const { data: reviewQueue = [], isLoading: isLoadingQueue } = useReviewQueue();
  const { data: teamData, isLoading: isLoadingTeam } = useTeamMembers({ limit: 100, includeUsers: false });

  // Guard against flashing 0s - show skeleton until operational metrics load
  if ((isLoadingTasks || isLoadingTeam || isLoadingQueue) && !allTasksData && !teamData) {
    return <AdminPageSkeleton variant="dashboard" />;
  }

  const allTasks = allTasksData?.data || [];
  const totalTeamTasks = allTasksData?.meta?.total || allTasks.length;
  const overdueTeamTasks = allTasks.filter(
    (t) => t.isOverdue || (new Date(t.dueDate) < new Date() && t.status !== 'done' && t.status !== 'approved')
  );
  const inProgressTeamTasks = allTasks.filter((t) => t.status === 'inProgress');
  const pendingTeamTasks = allTasks.filter((t) => t.status === 'pending');
  const teamMembers = teamData?.data || [];

  // Greeting based on local time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Clean Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            {greeting}, <span className="text-gold">{user?.name || 'Admin'}</span>
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Team management, task delegation &amp; operational oversight
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-xs font-semibold text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Super Administrator
          </span>
        </div>
      </div>

      {/* Pending Tasks Awareness Alert Banner */}
      {pendingTeamTasks.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-sm">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Icon name="Clock" size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-text">
                {pendingTeamTasks.length} Task Delegation{pendingTeamTasks.length > 1 ? 's' : ''} Awaiting Acceptance
              </h4>
              <p className="text-[11px] text-textMuted mt-0.5">
                Assigned team members have been notified via Telegram bot and email. The article/video drafts will initialize once accepted.
              </p>
            </div>
          </div>
          <Link to="/admin/tasks" className="shrink-0">
            <Button variant="secondary" size="sm" rightIcon={<Icon name="ArrowRight" size={14} />}>
              Inspect Tasks
            </Button>
          </Link>
        </div>
      )}

      {/* Team-Wide Operational Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminStatCard
          label="Team Tasks"
          value={totalTeamTasks}
          helperText={
            overdueTeamTasks.length > 0
              ? `${overdueTeamTasks.length} overdue across team`
              : pendingTeamTasks.length > 0
              ? `${pendingTeamTasks.length} awaiting acceptance`
              : `${inProgressTeamTasks.length} in progress`
          }
          icon="CheckSquare"
          variant={overdueTeamTasks.length > 0 ? 'danger' : pendingTeamTasks.length > 0 ? 'warning' : 'gold'}
          onClick={() => navigate('/admin/tasks')}
        />
        <AdminStatCard
          label="Review Queue"
          value={reviewQueue.length}
          helperText={reviewQueue.length > 0 ? 'Awaiting editorial approval' : 'Queue all clear'}
          icon="Eye"
          variant={reviewQueue.length > 0 ? 'warning' : 'gold'}
          onClick={() => navigate('/admin/review-queue')}
        />
        <AdminStatCard
          label="Team Roster"
          value={teamMembers.length}
          helperText="Scholarly personnel & researchers"
          icon="Users"
          variant="info"
          onClick={() => navigate('/admin/team')}
        />
        <AdminStatCard
          label="Operations Calendar"
          value="Overview"
          helperText="Deadlines & scheduled events"
          icon="Calendar"
          variant="default"
          onClick={() => navigate('/admin/calendar')}
        />
      </div>

      {/* Recent Operational Tasks & Assignments Pipeline */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={16} className="text-gold" />
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">
              Recent Task Assignments &amp; Pipeline
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gold/15 text-gold border border-gold/30">
              {allTasks.length} Total
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/admin/tasks/assign">
              <Button variant="primary" size="sm" leftIcon={<Icon name="Plus" size={13} />}>
                Assign Task
              </Button>
            </Link>
            <Link to="/admin/tasks">
              <Button variant="secondary" size="sm" rightIcon={<Icon name="ArrowRight" size={13} />}>
                View All
              </Button>
            </Link>
          </div>
        </div>

        {allTasks.length === 0 ? (
          <div className="p-8 text-center text-textMuted text-xs">
            <Icon name="Folder" size={28} className="mx-auto text-textMuted/40 mb-2" />
            <p className="font-semibold">No operational tasks assigned yet.</p>
            <p className="text-[11px] mt-1">Delegate your first article, video, or research task to the team.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {allTasks.slice(0, 5).map((task) => {
              const isOverdue = task.isOverdue || (new Date(task.dueDate) < new Date() && task.status !== 'done' && task.status !== 'approved');
              const isPending = task.status === 'pending';

              return (
                <div
                  key={task._id}
                  onClick={() => navigate(`/admin/tasks/${task._id}`)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-gold/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start sm:items-center space-x-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPending
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : isOverdue
                          ? 'bg-danger/10 text-danger border-danger/30'
                          : 'bg-gold/10 text-gold border-gold/30'
                      }`}
                    >
                      <Icon name={task.type === 'video' ? 'Video' : 'FileText'} size={16} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs sm:text-sm font-bold text-text group-hover:text-gold transition-colors truncate">
                          {task.title}
                        </h4>
                        <Badge variant="gold" size="sm">
                          {task.type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-textMuted mt-0.5">
                        {task.assignedTo && task.assignedTo.length > 0 && (
                          <span className="flex items-center gap-1 truncate">
                            <Icon name="User" size={11} className="text-gold shrink-0" />
                            <span>
                              {task.assignedTo
                                .map((a: any) => (typeof a === 'string' ? 'Member' : a.name || a.email))
                                .join(', ')}
                            </span>
                          </span>
                        )}
                        <span className="font-mono text-[10.5px]">
                          Due: {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <StatusBadge status={task.status} />
                    <span className="inline-flex items-center space-x-1 text-gold font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect</span>
                      <Icon name="ArrowRight" size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fast Administrative Actions & Shortcuts */}
      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-sm font-bold text-text flex items-center gap-2 uppercase tracking-wider text-gold">
            <Icon name="Compass" size={16} />
            <span>Team Management &amp; Oversight</span>
          </h3>
          <span className="text-xs text-textMuted">Admin Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Action 1: Assign Task */}
          <Link
            to="/admin/tasks/assign"
            className="flex items-center space-x-3 p-3 rounded-lg border border-border/80 bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="h-8 w-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
              <Icon name="Plus" size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-text group-hover:text-gold transition-colors truncate">
                Assign Task to Team
              </p>
              <p className="text-[11px] text-textMuted truncate">Delegate article, video, or research tasks</p>
            </div>
          </Link>

          {/* Action 2: Review Queue */}
          <Link
            to="/admin/review-queue"
            className="flex items-center space-x-3 p-3 rounded-lg border border-border/80 bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
              <Icon name="Eye" size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-text group-hover:text-amber-500 transition-colors truncate">
                Review Queue ({reviewQueue.length})
              </p>
              <p className="text-[11px] text-textMuted truncate">Evaluate and approve submissions from authors</p>
            </div>
          </Link>

          {/* Action 3: Team Roster & Members */}
          <Link
            to="/admin/team"
            className="flex items-center space-x-3 p-3 rounded-lg border border-border/80 bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <Icon name="Users" size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-text group-hover:text-blue-400 transition-colors truncate">
                Manage Team Roster
              </p>
              <p className="text-[11px] text-textMuted truncate">Manage scholars, roles, and profiles</p>
            </div>
          </Link>

          {/* Action 4: All Operations Tasks */}
          <Link
            to="/admin/tasks"
            className="flex items-center space-x-3 p-3 rounded-lg border border-border/80 bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="h-8 w-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
              <Icon name="CheckSquare" size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-text group-hover:text-gold transition-colors truncate">
                All Team Tasks Pipeline
              </p>
              <p className="text-[11px] text-textMuted truncate">Monitor progress across all assignees</p>
            </div>
          </Link>

          {/* Action 5: Topics Taxonomy */}
          <Link
            to="/admin/topics"
            className="flex items-center space-x-3 p-3 rounded-lg border border-border/80 bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="h-8 w-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
              <Icon name="Tag" size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-text group-hover:text-gold transition-colors truncate">
                Topics Taxonomy
              </p>
              <p className="text-[11px] text-textMuted truncate">Organize research topics &amp; tags</p>
            </div>
          </Link>

          {/* Action 6: Security Audit Log */}
          <Link
            to="/admin/audit-log"
            className="flex items-center space-x-3 p-3 rounded-lg border border-border/80 bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
              <Icon name="Shield" size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-text group-hover:text-emerald-400 transition-colors truncate">
                Security Audit Log
              </p>
              <p className="text-[11px] text-textMuted truncate">Inspect platform audit trails and actions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminWelcomePage;

