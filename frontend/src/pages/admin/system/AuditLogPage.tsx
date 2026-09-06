import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import { useAuditLog } from '../../../hooks/useAuditLog';
import { useTeamMembers } from '../../../hooks/useTeam';
import { AuditLogItem } from '../../../api/audit';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select, { SelectOption } from '../../../components/ui/Select';
import Modal from '../../../components/ui/Modal';
import { Column } from '../../../components/ui/Table';
import { toast } from '../../../hooks/useToast';

const formatActionLabel = (action: string): string => {
  const map: Record<string, string> = {
    'article.createDraft': 'Created Article Draft',
    'article.update': 'Updated Article',
    'article.submitForReview': 'Submitted Article for Review',
    'article.requestChanges': 'Requested Article Changes',
    'article.approve': 'Approved Article',
    'article.publish': 'Published Article',
    'article.deleteDraft': 'Deleted Article Draft',
    'task.assign': 'Assigned Task',
    'task.updateStatus': 'Updated Task Status',
    'topic.create': 'Created Topic',
    'topic.update': 'Updated Topic',
    'topic.deactivate': 'Deactivated Topic',
    'topic.reorder': 'Reordered Topics',
    'event.create': 'Created Event',
    'event.update': 'Updated Event',
    'event.delete': 'Deleted Event',
    'video.create': 'Created Video Log',
    'video.update': 'Updated Video Log',
    'video.acceptTask': 'Accepted Video Task',
    'video.updateDetails': 'Updated Video Workspace',
    'video.submitTask': 'Submitted Video for Review',
    'video.review.approve': 'Approved Video Task',
    'video.review.requestChanges': 'Requested Changes on Video',
    'video.postTask': 'Published Video Live',
    'team.updateRole': 'Updated User Roles',
    'team.deactivate': 'Deactivated Member',
    'contactMessage.read': 'Read Contact Message',
    'contactMessage.archive': 'Archived Contact Message',
  };

  if (map[action]) return map[action];

  // Fallback prettifier: e.g. "foo.bar_baz" -> "Foo Bar Baz"
  return action
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const getTargetLink = (item: AuditLogItem): string | null => {
  const target = item.targetModel || item.targetType;
  if (!target) return null;

  switch (target) {
    case 'Article':
      return item.targetId ? `/admin/articles` : '/admin/articles';
    case 'Task':
      return item.targetId ? `/admin/tasks/${item.targetId}` : '/admin/tasks';
    case 'VideoLog':
      return item.targetId ? `/admin/videos/${item.targetId}` : '/admin/tasks';
    case 'User':
      return item.targetId ? `/admin/team/${item.targetId}` : '/admin/team';
    case 'Topic':
      return '/admin/topics';
    case 'Event':
      return '/admin/events';
    case 'ContactMessage':
      return '/admin/contact-inbox';
    default:
      return null;
  }
};

export const AuditLogPage: React.FC = () => {
  // Filter Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');

  // Selected Log for Inspection Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Queries
  const { data: auditData, isLoading } = useAuditLog({
    search: searchQuery || undefined,
    action: actionFilter || undefined,
    targetType: targetTypeFilter || undefined,
    actor: actorFilter || undefined,
  });

  const { data: teamResponse } = useTeamMembers();
  const teamMembers = teamResponse?.data || [];

  const logsList = auditData?.items || [];
  const availableActions = auditData?.availableActions || [];
  const availableTargetModels = auditData?.availableTargetModels || [];

  // Define Columns
  const columns: Column<AuditLogItem>[] = [
    {
      key: 'actor',
      header: 'Actor',
      sortable: true,
      render: (item) => {
        const actor = item.actor;
        return (
          <div className="flex items-center space-x-3">
            {actor?.avatarUrl ? (
              <img
                src={actor.avatarUrl}
                alt={actor.name}
                className="h-8 w-8 rounded-full border border-gold/30 object-cover shrink-0"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-xs border border-gold/30">
                {actor?.name ? actor.name[0].toUpperCase() : 'S'}
              </div>
            )}
            <div className="space-y-0.5 max-w-[140px] truncate">
              <div className="text-xs font-bold text-text truncate">{actor?.name || 'System / Admin'}</div>
              <div className="text-[10px] text-textMuted font-mono truncate">{actor?.email || '—'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'Action Performed',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <Badge variant="gold">{formatActionLabel(item.action)}</Badge>
          <div className="text-[10px] font-mono text-textMuted/70">{item.action}</div>
        </div>
      ),
    },
    {
      key: 'targetModel',
      header: 'Target Resource',
      sortable: true,
      render: (item) => {
        const target = item.targetModel || item.targetType || '—';
        const link = getTargetLink(item);

        return (
          <div className="space-y-1">
            <span className="inline-flex items-center space-x-1 rounded border border-border bg-bg px-2 py-0.5 text-[11px] font-mono text-textMuted">
              <span>{target}</span>
            </span>
            {link && (
              <div>
                <Link
                  to={link}
                  className="text-[10px] text-gold hover:underline font-semibold flex items-center space-x-1"
                >
                  <span>View Resource</span>
                  <Icon name="ExternalLink" size={10} />
                </Link>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'details',
      header: 'Summary Details',
      render: (item) => {
        const payload = item.details || item.metadata || {};
        const keys = Object.keys(payload);

        if (keys.length === 0) {
          return <span className="text-xs text-textMuted italic">—</span>;
        }

        const summary = keys
          .slice(0, 3)
          .map((k) => `${k}: ${typeof payload[k] === 'object' ? '...' : payload[k]}`)
          .join(' | ');

        return (
          <span
            className="text-xs font-mono text-textMuted line-clamp-1 max-w-xs"
            title={JSON.stringify(payload, null, 2)}
          >
            {summary}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (item) => {
        const date = new Date(item.createdAt);
        return (
          <div className="space-y-0.5 font-mono text-xs text-textMuted">
            <div className="font-semibold text-text">
              {date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="text-[10px]">
              {date.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Inspect',
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-textMuted hover:text-gold"
          onClick={() => setSelectedLog(item)}
          title="Inspect action details"
        >
          <Icon name="Code" size={14} />
        </Button>
      ),
    },
  ];

  const actionOptions: SelectOption[] = [
    { value: '', label: 'All Actions' },
    ...availableActions.map((a) => ({ value: a, label: `${formatActionLabel(a)} (${a})` })),
  ];

  const targetModelOptions: SelectOption[] = [
    { value: '', label: 'All Target Resources' },
    ...availableTargetModels.map((m) => ({ value: m, label: m })),
  ];

  const actorOptions: SelectOption[] = [
    { value: '', label: 'All Team Members' },
    ...teamMembers.map((m) => ({ value: m._id, label: `${m.name} (${m.email})` })),
  ];

  const totalEvents = logsList.length;
  const editorialCount = useMemo(
    () =>
      logsList.filter(
        (l) => l.action.startsWith('article.') || l.action.startsWith('topic.')
      ).length,
    [logsList]
  );
  const taskCount = useMemo(
    () =>
      logsList.filter(
        (l) => l.action.startsWith('task.') || l.action.startsWith('video.')
      ).length,
    [logsList]
  );
  const governanceCount = useMemo(
    () =>
      logsList.filter(
        (l) =>
          !l.action.startsWith('article.') &&
          !l.action.startsWith('topic.') &&
          !l.action.startsWith('task.') &&
          !l.action.startsWith('video.')
      ).length,
    [logsList]
  );

  const resourceTabs = [
    { label: 'All Models', value: '' },
    { label: 'Articles', value: 'Article' },
    { label: 'Tasks', value: 'Task' },
    { label: 'Video Logs', value: 'VideoLog' },
    { label: 'Scholars', value: 'User' },
    { label: 'Topics', value: 'Topic' },
    { label: 'Events', value: 'Event' },
    { label: 'Messages', value: 'ContactMessage' },
  ];

  const handleCopyPayload = (payload: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast.success('Audit log payload copied to clipboard.');
    } catch {
      toast.error('Unable to copy to clipboard.');
    }
  };

  const emptyState = (
    <div className="py-12 text-center font-sans space-y-3">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/20">
        <Icon name="Shield" size={24} />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-text">No Audit Records Found</h3>
        <p className="text-xs text-textMuted max-w-sm mx-auto">
          {searchQuery || actionFilter || targetTypeFilter || actorFilter
            ? 'No security or administrative events match your active filter criteria.'
            : 'The system audit trail is currently empty. Administrative actions will be recorded here chronologically.'}
        </p>
      </div>
      {(searchQuery || actionFilter || targetTypeFilter || actorFilter) && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSearchQuery('');
            setActionFilter('');
            setTargetTypeFilter('');
            setActorFilter('');
          }}
        >
          Reset All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Shield" size={14} />
            <span>SuperAdmin Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            System Audit Log & Activity Feed
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Chronological audit trail of all security changes, content lifecycle transitions, and administrative actions.
          </p>
        </div>
      </div>

      {/* 4-Pillar Governance KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Recorded</span>
            <Icon name="Activity" size={15} className="text-gold" />
          </div>
          <div className="text-2xl font-extrabold text-text tracking-tight font-mono">{totalEvents}</div>
          <p className="text-[10px] text-textMuted">Cumulative events</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Editorial Actions</span>
            <Icon name="FileText" size={15} className="text-info" />
          </div>
          <div className="text-2xl font-extrabold text-info tracking-tight font-mono">{editorialCount}</div>
          <p className="text-[10px] text-textMuted">Articles & topics</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Task Operations</span>
            <Icon name="CheckSquare" size={15} className="text-gold" />
          </div>
          <div className="text-2xl font-extrabold text-gold tracking-tight font-mono">{taskCount}</div>
          <p className="text-[10px] text-textMuted">Tasks & video logs</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Governance</span>
            <Icon name="Shield" size={15} className="text-success" />
          </div>
          <div className="text-2xl font-extrabold text-success tracking-tight font-mono">{governanceCount}</div>
          <p className="text-[10px] text-textMuted">Access & settings</p>
        </div>
      </div>

      {/* 1-Touch Target Resource Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {resourceTabs.map((tab) => {
          const isActive = targetTypeFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setTargetTypeFilter(tab.value)}
              className={`inline-flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-gold text-bg font-bold shadow-sm'
                  : 'bg-surface border border-border text-textMuted hover:border-gold/50 hover:text-text'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface border border-border p-4 rounded-xl">
        <Input
          placeholder="Search action or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftElement={<Icon name="Search" size={16} className="text-textMuted" />}
        />

        <Select
          options={actionOptions}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        />

        <Select
          options={targetModelOptions}
          value={targetTypeFilter}
          onChange={(e) => setTargetTypeFilter(e.target.value)}
        />

        <Select
          options={actorOptions}
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
        />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={logsList}
        isLoading={isLoading}
        emptyState={emptyState}
        searchPlaceholder="Filter audit records..."
      />

      {/* Inspect Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title="Audit Log Entry Details"
          size="md"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-2 gap-3 bg-bg/50 border border-border p-3 rounded-lg">
              <div>
                <span className="text-textMuted block text-[10px] uppercase font-bold">Action</span>
                <span className="font-bold text-gold">{formatActionLabel(selectedLog.action)}</span>
                <span className="text-textMuted font-mono block text-[10px]">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase font-bold">Timestamp</span>
                <span className="font-mono text-text">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase font-bold">Actor</span>
                <span className="font-bold text-text">{selectedLog.actor?.name || 'System'}</span>
                <span className="text-textMuted font-mono block text-[10px]">
                  {selectedLog.actor?.email || '—'}
                </span>
              </div>
              <div>
                <span className="text-textMuted block text-[10px] uppercase font-bold">Target Resource</span>
                <span className="font-mono text-text">
                  {selectedLog.targetModel || selectedLog.targetType || '—'}
                </span>
                {selectedLog.targetId && (
                  <span className="text-textMuted font-mono block text-[10px] truncate">
                    ID: {String(selectedLog.targetId)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-textMuted font-bold uppercase text-[10px] tracking-wider">
                  Action Details & Metadata
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Icon name="Copy" size={12} />}
                  onClick={() =>
                    handleCopyPayload(selectedLog.details || selectedLog.metadata || {})
                  }
                  className="text-textMuted hover:text-gold text-[11px] h-6 px-2"
                >
                  Copy JSON
                </Button>
              </div>
              <pre className="p-3 bg-surface border border-border rounded-lg font-mono text-[11px] text-gold/90 overflow-x-auto max-h-64 whitespace-pre-wrap">
                {JSON.stringify(selectedLog.details || selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              {getTargetLink(selectedLog) ? (
                <Link
                  to={getTargetLink(selectedLog)!}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-gold hover:underline"
                  onClick={() => setSelectedLog(null)}
                >
                  <span>Open Target Resource</span>
                  <Icon name="ExternalLink" size={13} />
                </Link>
              ) : (
                <span />
              )}
              <Button variant="primary" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditLogPage;
