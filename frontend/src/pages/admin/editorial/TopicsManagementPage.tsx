import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import {
  useAdminTopics,
  useUpdateTopic,
  useDeleteTopic,
  useReorderTopics,
} from '../../../hooks/useTopics';
import { TopicItem } from '../../../api/topic';
import { DataTable } from '../../../components/admin/DataTable';
import { AdminPageHeader, AdminStatCard } from '../../../components/admin';
import { useConfirm } from '../../../hooks/useConfirm';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Column } from '../../../components/ui/Table';
import { AdminPageSkeleton } from '../../../components/ui/Skeleton';
import { toast } from '../../../hooks/useToast';

export const TopicsManagementPage: React.FC = () => {
  const { data: topics = [], isLoading } = useAdminTopics();
  const { confirm, ConfirmModalElement } = useConfirm();

  const updateTopicMutation = useUpdateTopic();
  const deleteTopicMutation = useDeleteTopic();
  const reorderTopicsMutation = useReorderTopics();

  // Guard against flashing empty 0 stats - show skeleton until topics are loaded
  if (isLoading && (!topics || topics.length === 0)) {
    return <AdminPageSkeleton variant="table" />;
  }

  // Metrics
  const totalTopics = topics.length;
  const activeTopics = topics.filter((t) => t.isActive).length;
  const totalArticles = topics.reduce((sum, t) => sum + (t.articleCount || 0), 0);

  const handleToggleActive = async (topic: TopicItem) => {
    try {
      await updateTopicMutation.mutateAsync({
        id: topic._id,
        data: { isActive: !topic.isActive },
      });
      toast.success(
        `Topic "${topic.name}" ${!topic.isActive ? 'activated' : 'deactivated'}.`
      );
    } catch (err: any) {
      toast.error('Failed to update topic status.');
    }
  };

  const handleDeactivateTopic = async (topic: TopicItem) => {
    const ok = await confirm({
      title: 'Confirm Topic Deactivation',
      description: `Are you sure you want to deactivate "${topic.name}"? It will be hidden from the public topics catalog.`,
      confirmText: 'Deactivate',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      await deleteTopicMutation.mutateAsync(topic._id);
      toast.success(`Topic "${topic.name}" deactivated.`);
    } catch (err: any) {
      toast.error('Failed to deactivate topic.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topics.length) return;

    const reordered = [...topics];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orderedIds = reordered.map((t) => t._id);

    try {
      await reorderTopicsMutation.mutateAsync(orderedIds);
      toast.success('Topic order updated.');
    } catch (err: any) {
      toast.error('Failed to reorder topics.');
    }
  };

  const columns: Column<TopicItem>[] = [
    {
      key: 'order',
      header: 'Order',
      width: '75px',
      render: (item) => {
        const index = topics.findIndex((t) => t._id === item._id);
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-gold/90 w-4 text-center">
              {index >= 0 ? index + 1 : 1}
            </span>
            <div className="inline-flex items-center rounded border border-border/80 bg-bg/60 p-0.5">
              <button
                type="button"
                disabled={index <= 0 || reorderTopicsMutation.isPending}
                onClick={() => handleMoveOrder(index, 'up')}
                className="p-0.5 text-textMuted hover:text-gold disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                title="Move Up"
              >
                <Icon name="ChevronUp" size={11} />
              </button>
              <button
                type="button"
                disabled={
                  index < 0 || index === topics.length - 1 || reorderTopicsMutation.isPending
                }
                onClick={() => handleMoveOrder(index, 'down')}
                className="p-0.5 text-textMuted hover:text-gold disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                title="Move Down"
              >
                <Icon name="ChevronDown" size={11} />
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Topic & Path',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2.5 min-w-0">
          {item.coverImageUrl ? (
            <img
              src={item.coverImageUrl}
              alt={item.name}
              className="h-7 w-7 rounded-lg object-cover border border-border/80 shrink-0 shadow-2xs"
            />
          ) : (
            <div className="h-7 w-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold text-xs shrink-0">
              {item.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <Link
              to={`/admin/topics/${item._id}/edit`}
              className="font-medium text-xs sm:text-[13px] text-text hover:text-gold transition-colors truncate block"
            >
              {item.name}
            </Link>
            <div className="text-[10px] font-mono text-textMuted truncate">/topics/{item.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'articleCount',
      header: 'Articles',
      sortable: true,
      width: '100px',
      render: (item) => (
        <span className="inline-flex items-center space-x-1 font-mono text-xs text-textMuted">
          <Icon name="FileText" size={12} className="text-gold" />
          <span className="font-semibold text-text">{item.articleCount || 0}</span>
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Visibility',
      width: '120px',
      render: (item) => (
        <Badge variant={item.isActive ? 'gold' : 'default'} size="sm">
          {item.isActive ? 'Active Public' : 'Hidden'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-1">
          <Link
            to={`/admin/topics/${item._id}/edit`}
            className="p-1 rounded-md text-textMuted hover:text-gold hover:bg-gold/10 transition-colors"
            title="Edit Topic (Full Page)"
          >
            <Icon name="Edit" size={13} />
          </Link>

          <button
            type="button"
            onClick={() => handleToggleActive(item)}
            title={item.isActive ? 'Hide Topic' : 'Publish Topic'}
            className={`p-1 rounded-md transition-colors ${
              item.isActive
                ? 'text-amber-500/80 hover:text-amber-500 hover:bg-amber-500/10'
                : 'text-emerald-500/80 hover:text-emerald-500 hover:bg-emerald-500/10'
            }`}
          >
            <Icon name={item.isActive ? 'EyeOff' : 'Eye'} size={13} />
          </button>

          {item.isActive && (
            <button
              type="button"
              onClick={() => handleDeactivateTopic(item)}
              title="Deactivate Topic"
              className="p-1 rounded-md text-textMuted hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <Icon name="Trash2" size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <AdminPageHeader
        title="Topics Management"
        subtitle="SuperAdmin dashboard to organize, reorder, curate, and catalog research topics across Qindil."
        actions={
          <Link to="/admin/topics/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Icon name="Plus" size={16} />}
              className="shadow-md"
            >
              Create Topic
            </Button>
          </Link>
        }
      />

      {/* Metrics Strip (Prompt 42 compliant) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <AdminStatCard
          label="Active Topics"
          value={activeTopics}
          helperText="Publicly accessible in catalog"
          icon="CheckCircle"
          variant="success"
          isLoading={isLoading}
        />
        <AdminStatCard
          label="Total Topics"
          value={totalTopics}
          helperText="Taxonomy catalog entries"
          icon="Tag"
          variant="gold"
          isLoading={isLoading}
        />
        <AdminStatCard
          label="Cataloged Papers"
          value={totalArticles}
          helperText="Articles across all topics"
          icon="FileText"
          variant="info"
          isLoading={isLoading}
        />
      </div>

      {/* Topics DataTable */}
      <DataTable
        columns={columns}
        data={topics}
        isLoading={isLoading}
        searchPlaceholder="Search topics by name or slug..."
      />

      {/* Sensitive Confirmation Dialog */}
      {ConfirmModalElement}
    </div>
  );
};

export default TopicsManagementPage;
