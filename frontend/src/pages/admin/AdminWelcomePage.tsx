import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import { useAuthStore } from '../../stores/authStore';
import { useHasRole } from '../../hooks/useHasRole';
import { Badge } from '../../components/ui';

export const AdminWelcomePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = useHasRole('superAdmin');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-gold/30 bg-gradient-to-r from-surface via-surface to-gold/10 p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
              <Icon name="Shield" size={14} />
              <span>Qindil Team Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
              Welcome back, <span className="text-gold">{user?.name || 'Administrator'}</span>
            </h1>
            <p className="text-sm text-textMuted max-w-xl leading-relaxed">
              This is the centralized workspace for Qindil team members. Manage research content, production pipelines, events, and site settings.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-2">
            <Badge variant="gold" size="md">
              Role: {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </Badge>
            <span className="text-xs font-mono text-textMuted">
              ID: {user?._id?.substring(0, 10)}...
            </span>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-gold">
            <Icon name="FileText" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider text-textMuted">Tasks</span>
          </div>
          <p className="text-2xl font-black text-text">Workspace</p>
          <p className="text-xs text-textMuted">Team dashboard & assigned tasks</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-gold">
            <Icon name="Activity" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider text-textMuted">Pipeline</span>
          </div>
          <p className="text-2xl font-black text-text">Production</p>
          <p className="text-xs text-textMuted">Article draft to publish workflow</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-gold">
            <Icon name="Users" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider text-textMuted">Roster</span>
          </div>
          <p className="text-2xl font-black text-text">32 Members</p>
          <p className="text-xs text-textMuted">Apologetics research team</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-gold">
            <Icon name="Shield" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider text-textMuted">System</span>
          </div>
          <p className="text-2xl font-black text-success">Active</p>
          <p className="text-xs text-textMuted">Security & RBAC operational</p>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <h3 className="text-base font-bold text-text flex items-center gap-2">
          <Icon name="Compass" size={18} className="text-gold" />
          <span>Quick Actions</span>
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center space-x-2 rounded-md border border-border bg-bg px-4 py-2 text-xs font-semibold text-text hover:border-gold/50 transition"
          >
            <Icon name="ExternalLink" size={14} />
            <span>View Public Site</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 rounded-md border border-border bg-bg px-4 py-2 text-xs font-semibold text-text hover:border-gold/50 transition"
          >
            <Icon name="User" size={14} />
            <span>My Reader Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminWelcomePage;
