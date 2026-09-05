import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import { useTeamMember, useUpdateMemberRole, useUpdateMemberStatus } from '../../hooks/useTeam';
import { useAuthStore } from '../../stores/authStore';
import { useHasRole } from '../../hooks/useHasRole';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { toast } from '../../hooks/useToast';
import TelegramLinkCard from '../../components/shared/TelegramLinkCard';

export const MemberProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = useHasRole('superAdmin');

  const { data, isLoading, isError } = useTeamMember(id);
  const member = data?.data;

  const updateRoleMutation = useUpdateMemberRole();
  const updateStatusMutation = useUpdateMemberStatus();

  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'superAdmin'>('user');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [targetRoleToApply, setTargetRoleToApply] = useState<'user' | 'admin' | 'superAdmin' | null>(null);

  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Sync selectedRole with member role on data fetch
  useEffect(() => {
    if (member?.roles && member.roles.length > 0) {
      const firstRole = member.roles[0];
      const roleName = typeof firstRole === 'string' ? firstRole : firstRole.name;
      setSelectedRole(roleName as any);
    }
  }, [member]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gold">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-4 font-sans">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <Icon name="AlertCircle" size={24} />
        </div>
        <h3 className="text-lg font-bold text-text">Team Member Not Found</h3>
        <p className="text-xs text-textMuted max-w-sm mx-auto">
          The requested member profile could not be loaded or has been removed.
        </p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/admin/team')}>
          Back to Team Roster
        </Button>
      </div>
    );
  }

  const getPrimaryRole = (): 'user' | 'admin' | 'superAdmin' => {
    if (!member.roles || member.roles.length === 0) return 'user';
    const firstRole = member.roles[0];
    const roleName = typeof firstRole === 'string' ? firstRole : firstRole.name;
    return roleName as any;
  };

  const currentRole = getPrimaryRole();
  const isSelf = currentUser?._id === member._id;

  const handleRoleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'user' | 'admin' | 'superAdmin';
    if (newRole === currentRole) return;
    setTargetRoleToApply(newRole);
    setRoleModalOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!targetRoleToApply || !id) return;
    try {
      await updateRoleMutation.mutateAsync({ id, role: targetRoleToApply });
      setSelectedRole(targetRoleToApply);
      toast.success(`Role updated successfully to "${targetRoleToApply}".`);
      setRoleModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to update role.';
      toast.error(msg);
      setSelectedRole(currentRole);
      setRoleModalOpen(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!id) return;
    const nextStatus = !member.isActive;
    try {
      await updateStatusMutation.mutateAsync({ id, isActive: nextStatus });
      toast.success(`Member status updated to ${nextStatus ? 'Active' : 'Deactivated'}.`);
      setStatusModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to update status.';
      toast.error(msg);
      setStatusModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          to="/admin/team"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-textMuted hover:text-gold transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          <span>Back to Team Roster</span>
        </Link>

        <Badge variant={member.isActive ? 'published' : 'archived'}>
          {member.isActive ? 'Active Account' : 'Deactivated Account'}
        </Badge>
      </div>

      {/* Member Details Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-24 w-24 rounded-full object-cover border-2 border-gold/40 shadow-md shrink-0"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gold/20 font-bold text-gold text-4xl border-2 border-gold/40 shrink-0">
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-extrabold text-text tracking-tight">{member.name}</h1>
                <p className="text-xs font-mono text-textMuted">{member.email}</p>
              </div>

              <Badge variant={currentRole === 'superAdmin' ? 'gold' : currentRole === 'admin' ? 'info' : 'muted'} size="md">
                Role: {currentRole === 'superAdmin' ? 'Super Admin' : currentRole === 'admin' ? 'Admin' : 'User'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/60 pt-4 text-xs">
              <div>
                <span className="text-textMuted block">Auth Provider:</span>
                <span className="font-semibold text-text uppercase font-mono">{member.authProvider}</span>
              </div>

              <div>
                <span className="text-textMuted block">Email Status:</span>
                <span className="font-semibold text-success flex items-center gap-1">
                  <Icon name="CheckCircle" size={12} /> {member.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>

              <div>
                <span className="text-textMuted block">Joined Date:</span>
                <span className="font-mono text-text">
                  {new Date(member.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div>
                <span className="text-textMuted block">Member ID:</span>
                <span className="font-mono text-textMuted/80 text-[11px] truncate block">{member._id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Link Card for Current User Profile */}
      {isSelf && <TelegramLinkCard />}

      {/* Role & Status Operations Card (SuperAdmin Viewers Only) */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Role Promotion / Demotion Card */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-border pb-3">
              <Icon name="Shield" size={18} className="text-gold" />
              <h3 className="text-sm font-bold text-text">Role Management</h3>
            </div>

            {isSelf ? (
              <div className="rounded-lg border border-gold/30 bg-gold/10 p-3.5 text-xs text-gold space-y-1">
                <p className="font-bold">Self-Demotion Disabled</p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  You cannot change your own role to prevent accidental admin lockouts.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Select
                  label="Assign Primary Role"
                  value={selectedRole}
                  onChange={handleRoleSelectChange}
                  options={[
                    { value: 'user', label: 'User (Public Member)' },
                    { value: 'admin', label: 'Admin (Operations Team)' },
                    { value: 'superAdmin', label: 'Super Admin (Full Control)' },
                  ]}
                />
                <p className="text-[11px] text-textMuted leading-relaxed">
                  Changing role takes effect immediately. Demotions from SuperAdmin require at least one other active SuperAdmin account.
                </p>
              </div>
            )}
          </div>

          {/* Account Status Toggle Card */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-border pb-3">
              <Icon name="Activity" size={18} className="text-gold" />
              <h3 className="text-sm font-bold text-text">Account Activation Status</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-textMuted leading-relaxed">
                Deactivating an account prevents the user from logging in or using team features. Past content remains preserved.
              </p>

              {isSelf ? (
                <p className="text-xs font-semibold text-textMuted">Self-deactivation disabled.</p>
              ) : (
                <Button
                  variant={member.isActive ? 'danger' : 'primary'}
                  size="md"
                  onClick={() => setStatusModalOpen(true)}
                  className="w-full"
                >
                  {member.isActive ? 'Deactivate Member' : 'Reactivate Member'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Change ConfirmDialog */}
      <ConfirmDialog
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setSelectedRole(currentRole);
        }}
        onConfirm={handleConfirmRoleChange}
        title="Confirm Role Change"
        description={`Are you sure you want to change ${member.name}'s role from "${currentRole}" to "${targetRoleToApply}"?`}
        confirmText="Update Role"
        variant="warning"
        isLoading={updateRoleMutation.isPending}
      />

      {/* Status Change ConfirmDialog */}
      <ConfirmDialog
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title={member.isActive ? 'Deactivate Member?' : 'Reactivate Member?'}
        description={
          member.isActive
            ? `Deactivating ${member.name} will block their access to Qindil. Are you sure?`
            : `Reactivating ${member.name} will restore their login access. Proceed?`
        }
        confirmText={member.isActive ? 'Deactivate' : 'Reactivate'}
        variant={member.isActive ? 'danger' : 'primary'}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default MemberProfilePage;
