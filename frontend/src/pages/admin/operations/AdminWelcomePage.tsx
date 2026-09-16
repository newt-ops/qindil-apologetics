import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useAuthStore } from '../../../stores/authStore';
import { useHasRole } from '../../../hooks/useHasRole';
import { useMyTasks } from '../../../hooks/useTasks';
import { useReviewQueue } from '../../../hooks/useArticles';
import { useTeamMembers } from '../../../hooks/useTeam';
import { Badge } from '../../../components/ui/Badge';
import { AdminStatCard } from '../../../components/admin';

export const AdminWelcomePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = useHasRole('superAdmin');

  const navigate = useNavigate();

  // Live operational data
  const { tasks: myTasks, overdueTasks } = useMyTasks();
  const { data: reviewQueue = [] } = useReviewQueue();
  const { data: teamData } = useTeamMembers({ limit: 100, includeUsers: false });
  const teamMembers = teamData?.data || [];

  // Greeting based on local time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-gold/30 bg-gradient-to-r from-surface via-surface to-gold/10 p-6 sm:p-8 shadow-lg relative overflow-hidden">
        {/* Subtle background ambient gold halo */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
              <Icon name="Shield" size={14} />
              <span>Qindil Operations Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
              {greeting}, <span className="text-gold">{user?.name || 'Scholar'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-textMuted max-w-xl leading-relaxed">
              Central operational nexus for scholarly authoring, apologetics peer review, production workflows, and team coordination.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:items-end gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="md">
                {isSuperAdmin ? 'Super Administrator' : 'Operations Admin'}
              </Badge>
            </div>
            <span className="text-xs font-mono text-textMuted">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Operational Overview Cards (Prompt 42: Compact 4-column responsive grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminStatCard
          label="My Active Tasks"
          value={myTasks.length}
          helperText={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : 'Assigned to you'}
          icon="Folder"
          variant={overdueTasks.length > 0 ? 'danger' : 'gold'}
          onClick={() => navigate('/admin/workspace')}
        />
        <AdminStatCard
          label="Review Queue"
          value={reviewQueue.length}
          helperText="Pending review"
          icon="Inbox"
          variant="warning"
          onClick={() => navigate('/admin/review-queue')}
        />
        <AdminStatCard
          label="Team Roster"
          value={teamMembers.length}
          helperText="Scholarly personnel"
          icon="Users"
          variant="info"
          onClick={() => navigate('/admin/team')}
        />
        <AdminStatCard
          label="Operations Calendar"
          value="Schedule"
          helperText="Deadlines & syncs"
          icon="Calendar"
          variant="default"
          onClick={() => navigate('/admin/calendar')}
        />
      </div>

      {/* Fast Command Actions & Shortcuts */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-text flex items-center gap-2 uppercase tracking-wider text-gold">
            <Icon name="Compass" size={16} />
            <span>Operational Shortcuts</span>
          </h3>
          <span className="text-xs text-textMuted">Quick Access</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Action 1: Assign Task */}
          {isSuperAdmin && (
            <Link
              to="/admin/tasks/assign"
              className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
            >
              <div className="h-8 w-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <Icon name="Plus" size={16} />
              </div>
              <div>
                <p className="font-bold text-text group-hover:text-gold transition-colors">
                  Assign New Task
                </p>
                <p className="text-[11px] text-textMuted">Delegate article, video, or general tasks</p>
              </div>
            </Link>
          )}

          {/* Action 2: Write Article */}
          <Link
            to="/admin/articles/mine"
            className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="h-8 w-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
              <Icon name="FileText" size={16} />
            </div>
            <div>
              <p className="font-bold text-text group-hover:text-gold transition-colors">
                Authoring Workspace
              </p>
              <p className="text-[11px] text-textMuted">Write, draft, and submit research papers</p>
            </div>
          </Link>

          {/* Action 3: All Tasks Board */}
          <Link
            to="/admin/tasks"
            className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="h-8 w-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
              <Icon name="Activity" size={16} />
            </div>
            <div>
              <p className="font-bold text-text group-hover:text-gold transition-colors">
                All Operations Tasks
              </p>
              <p className="text-[11px] text-textMuted">Inspect all team task workflows and statuses</p>
            </div>
          </Link>

          {/* Action 4: Public Site Navigation (No target="_blank") */}
          <Link
            to="/"
            className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Icon name="Globe" size={16} />
            </div>
            <div>
              <p className="font-bold text-text group-hover:text-emerald-500 transition-colors">
                Public Catalog &amp; Site
              </p>
              <p className="text-[11px] text-textMuted">Return to public portal and library</p>
            </div>
          </Link>

          {/* Action 5: Member Dashboard */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Icon name="User" size={16} />
            </div>
            <div>
              <p className="font-bold text-text group-hover:text-purple-400 transition-colors">
                Member Mini Dashboard
              </p>
              <p className="text-[11px] text-textMuted">View personal bookmarks &amp; reading history</p>
            </div>
          </Link>

          {/* Action 6: Research Topics */}
          {isSuperAdmin && (
            <Link
              to="/admin/topics"
              className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-bg/50 hover:border-gold/50 hover:bg-gold/5 transition-all group"
            >
              <div className="h-8 w-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <Icon name="Tag" size={16} />
              </div>
              <div>
                <p className="font-bold text-text group-hover:text-gold transition-colors">
                  Topics Taxonomy
                </p>
                <p className="text-[11px] text-textMuted">Organize and curate research disciplines</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWelcomePage;
