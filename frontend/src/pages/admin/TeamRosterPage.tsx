import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import { useTeamMembers } from '../../hooks/useTeam';
import { User } from '../../stores/authStore';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Column } from '../../components/ui/Table';

export const TeamRosterPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [includeUsers, setIncludeUsers] = useState(false);

  const { data, isLoading } = useTeamMembers({
    page,
    limit: 10,
    search,
    role: roleFilter,
    includeUsers,
  });

  const members = data?.data || [];
  const meta = data?.meta;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleIncludeUsersToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeUsers(e.target.checked);
    setPage(1);
  };

  const getPrimaryRole = (user: User): string => {
    if (!user.roles || user.roles.length === 0) return 'user';
    const firstRole = user.roles[0];
    return typeof firstRole === 'string' ? firstRole : firstRole.name;
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Member Name',
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
            <p className="font-bold text-text group-hover:text-gold transition-colors">
              {item.name}
            </p>
            <p className="text-[11px] text-textMuted">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Role',
      sortable: true,
      render: (item) => {
        const role = getPrimaryRole(item);
        const variant = role === 'superAdmin' ? 'gold' : role === 'admin' ? 'info' : 'muted';
        const label = role === 'superAdmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'User';
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
          leftIcon={<Icon name="User" size={14} />}
        >
          Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Users" size={14} />
            <span>Team Roster & Roles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Team Roster Management
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            SuperAdmin central panel to view member profiles, promote admins, and manage team status.
          </p>
        </div>

        {/* Include Public Registrants Toggle */}
        <div className="flex items-center space-x-3 rounded-lg border border-border bg-surface px-4 py-2.5 shadow-sm">
          <label htmlFor="includeUsersToggle" className="flex items-center space-x-2 cursor-pointer select-none text-xs font-semibold text-text">
            <input
              id="includeUsersToggle"
              type="checkbox"
              checked={includeUsers}
              onChange={handleIncludeUsersToggle}
              className="h-4 w-4 rounded border-border text-gold focus:ring-gold accent-gold"
            />
            <span>Include Public Registrants</span>
          </label>
        </div>
      </div>

      {/* FilterBar Controls */}
      <FilterBar onReset={() => { setRoleFilter(''); setSearch(''); setIncludeUsers(false); setPage(1); }}>
        <div className="w-48">
          <Select
            value={roleFilter}
            onChange={handleRoleChange}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'superAdmin', label: 'Super Admin' },
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'User (Public)' },
            ]}
          />
        </div>
      </FilterBar>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={members}
        isLoading={isLoading}
        searchPlaceholder="Search members by name or email..."
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
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
