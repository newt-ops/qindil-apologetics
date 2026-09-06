import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useTeamMembers } from '../../../hooks/useTeam';
import { User } from '../../../stores/authStore';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Column } from '../../../components/ui/Table';

export const TeamRosterPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [includeUsers, setIncludeUsers] = useState(false);

  // Global Query for Overview Stats
  const { data: globalData } = useTeamMembers({
    page: 1,
    limit: 100,
    includeUsers: true,
  });
  const allMembers = globalData?.data || [];

  // Filtered Query for the Table
  const { data, isLoading } = useTeamMembers({
    page,
    limit: 15,
    search,
    role: roleFilter,
    includeUsers,
  });

  const members = data?.data || [];
  const meta = data?.meta;

  const getPrimaryRole = (user: User): string => {
    if (!user.roles || user.roles.length === 0) return 'user';
    const firstRole = user.roles[0];
    return typeof firstRole === 'string' ? firstRole : firstRole.name;
  };

  // Metrics
  const staffCount = allMembers.filter((m) => {
    const r = getPrimaryRole(m);
    return r === 'superAdmin' || r === 'admin';
  }).length;
  const superAdminCount = allMembers.filter((m) => getPrimaryRole(m) === 'superAdmin').length;
  const adminCount = allMembers.filter((m) => getPrimaryRole(m) === 'admin').length;
  const activeCount = allMembers.filter((m) => m.isActive).length;

  const roleTabs = [
    { value: '', label: 'Team Staff', count: staffCount, incUsers: false },
    { value: 'superAdmin', label: 'Super Admins', count: superAdminCount, incUsers: false },
    { value: 'admin', label: 'Operations Admins', count: adminCount, incUsers: false },
    { value: '', label: 'All Registered Accounts', count: allMembers.length, incUsers: true },
  ];

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Scholar / Member Name',
      sortable: true,
      render: (item) => (
        <div
          onClick={() => navigate(`/admin/team/${item._id}`)}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          {item.avatarUrl ? (
            <img
              src={item.avatarUrl}
              alt={item.name}
              className="h-9 w-9 rounded-full object-cover border border-gold/40 shrink-0"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 font-bold text-gold text-sm shrink-0">
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-text group-hover:text-gold transition-colors text-sm">
              {item.name}
            </p>
            <p className="text-[11px] text-textMuted font-mono">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Assigned Role',
      sortable: true,
      render: (item) => {
        const role = getPrimaryRole(item);
        const variant = role === 'superAdmin' ? 'gold' : role === 'admin' ? 'inReview' : 'muted';
        const label = role === 'superAdmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Public Member';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <Badge variant={item.isActive ? 'published' : 'archived'}>
          {item.isActive ? 'Active' : 'Deactivated'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined Date',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-mono text-textMuted">
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/admin/team/${item._id}`)}
          leftIcon={<Icon name="User" size={13} />}
        >
          Inspect Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Users" size={14} />
            <span>Personnel &amp; Roles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Team Roster Management
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            SuperAdmin central dashboard to inspect member credentials, manage RBAC privileges, and monitor operational status.
          </p>
        </div>

        {/* Include Public Registrants Checkbox */}
        <div className="flex items-center space-x-3 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm self-start sm:self-auto">
          <label
            htmlFor="includeUsersToggle"
            className="flex items-center space-x-2 cursor-pointer select-none text-xs font-semibold text-text"
          >
            <input
              id="includeUsersToggle"
              type="checkbox"
              checked={includeUsers}
              onChange={(e) => {
                setIncludeUsers(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-border text-gold focus:ring-gold accent-gold"
            />
            <span>Include Public Members</span>
          </label>
        </div>
      </div>

      {/* Team Metrics Strip (Prompt 42 density) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Staff */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Team Staff
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Icon name="Users" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-text">
            {staffCount}
          </div>
          <div className="mt-0.5 text-[10px] text-textMuted">Administrators &amp; scholars</div>
        </div>

        {/* Super Admins */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Super Admins
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Icon name="Shield" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-gold">
            {superAdminCount}
          </div>
          <div className="mt-0.5 text-[10px] text-gold/80 font-medium">Full access tier</div>
        </div>

        {/* Operations Admins */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Operations Admins
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Icon name="User" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-blue-400">
            {adminCount}
          </div>
          <div className="mt-0.5 text-[10px] text-textMuted">Content &amp; task managers</div>
        </div>

        {/* Active Accounts */}
        <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Active Status
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Icon name="CheckCircle" size={14} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black font-mono text-emerald-500">
            {activeCount}
          </div>
          <div className="mt-0.5 text-[10px] text-emerald-500/80 font-medium">Verified active</div>
        </div>
      </div>

      {/* Quick Role Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80 text-xs">
        {roleTabs.map((tab, idx) => {
          const isActive = roleFilter === tab.value && includeUsers === tab.incUsers;
          return (
            <button
              key={idx}
              onClick={() => {
                setRoleFilter(tab.value);
                setIncludeUsers(tab.incUsers);
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

      {/* Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface border border-border p-3.5 sm:p-4 rounded-xl">
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Search team members by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text placeholder:text-textMuted focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'superAdmin', label: 'Super Admin' },
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'Public Member' },
            ]}
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={members}
        isLoading={isLoading}
        searchPlaceholder="Filter listed personnel..."
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

export default TeamRosterPage;
