import React, { useState } from 'react';
import Icon from '../../../components/icons/Icon';
import {
  useAdminTopics,
  useCreateTopic,
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
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Modal } from '../../../components/ui/Modal';
import FileUpload from '../../../components/admin/FileUpload';
import { Column } from '../../../components/ui/Table';
import { toast } from '../../../hooks/useToast';

export const TopicsManagementPage: React.FC = () => {
  const { data: topics = [], isLoading } = useAdminTopics();
  const { confirm, ConfirmModalElement } = useConfirm();

  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();
  const deleteTopicMutation = useDeleteTopic();
  const reorderTopicsMutation = useReorderTopics();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  // Metrics
  const totalTopics = topics.length;
  const activeTopics = topics.filter((t) => t.isActive).length;
  const totalArticles = topics.reduce((sum, t) => sum + (t.articleCount || 0), 0);

  const handleOpenCreateModal = () => {
    setEditingTopic(null);
    setName('');
    setSlug('');
    setDescription('');
    setCoverImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (topic: TopicItem) => {
    setEditingTopic(topic);
    setName(topic.name);
    setSlug(topic.slug);
    setDescription(topic.description || '');
    setCoverImageUrl(topic.coverImageUrl || '');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingTopic && !slug) {
      // Auto-suggest slug for new topic
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(autoSlug);
    }
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Topic name is required.');
      return;
    }

    try {
      if (editingTopic) {
        await updateTopicMutation.mutateAsync({
          id: editingTopic._id,
          data: {
            name: name.trim(),
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            coverImageUrl: coverImageUrl || undefined,
          },
        });
        toast.success(`Discipline "${name}" updated successfully.`);
      } else {
        await createTopicMutation.mutateAsync({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          coverImageUrl: coverImageUrl || undefined,
        });
        toast.success(`Discipline "${name}" created successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to save topic.';
      toast.error(msg);
    }
  };

  const handleToggleActive = async (topic: TopicItem) => {
    try {
      await updateTopicMutation.mutateAsync({
        id: topic._id,
        data: { isActive: !topic.isActive },
      });
      toast.success(
        `Discipline "${topic.name}" ${!topic.isActive ? 'activated' : 'deactivated'}.`
      );
    } catch (err: any) {
      toast.error('Failed to update topic status.');
    }
  };

  const handleDeactivateTopic = async (topic: TopicItem) => {
    const ok = await confirm({
      title: 'Confirm Discipline Deactivation',
      description: `Are you sure you want to deactivate "${topic.name}"? It will be hidden from the public topics catalog.`,
      confirmText: 'Deactivate',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      await deleteTopicMutation.mutateAsync(topic._id);
      toast.success(`Discipline "${topic.name}" deactivated.`);
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
      toast.success('Discipline order updated.');
    } catch (err: any) {
      toast.error('Failed to reorder topics.');
    }
  };

  const columns: Column<TopicItem>[] = [
    {
      key: 'order',
      header: 'Order',
      render: (item) => {
        const index = topics.findIndex((t) => t._id === item._id);
        return (
          <div className="flex items-center space-x-1">
            <span className="font-mono text-xs font-bold text-gold/90 w-5 text-center">
              {index >= 0 ? index + 1 : 1}
            </span>
            <div className="flex flex-col space-y-0.5">
              <button
                type="button"
                disabled={index <= 0 || reorderTopicsMutation.isPending}
                onClick={() => handleMoveOrder(index, 'up')}
                className="p-1 rounded bg-bg text-textMuted hover:text-gold border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Up"
              >
                <Icon name="ChevronUp" size={12} />
              </button>
              <button
                type="button"
                disabled={
                  index < 0 || index === topics.length - 1 || reorderTopicsMutation.isPending
                }
                onClick={() => handleMoveOrder(index, 'down')}
                className="p-1 rounded bg-bg text-textMuted hover:text-gold border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Down"
              >
                <Icon name="ChevronDown" size={12} />
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Discipline & Path',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-3">
          {item.coverImageUrl ? (
            <img
              src={item.coverImageUrl}
              alt={item.name}
              className="h-10 w-10 rounded-lg object-cover border border-gold/30 shrink-0 bg-bg"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold text-xs shrink-0">
              <Icon name="Tag" size={18} />
            </div>
          )}
          <div>
            <span className="font-bold text-text hover:text-gold transition-colors block text-sm">
              {item.name}
            </span>
            <span className="text-[11px] font-mono text-textMuted block">
              /topics/{item.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Scope & Description',
      render: (item) => (
        <p className="text-xs text-textMuted line-clamp-2 max-w-sm leading-relaxed">
          {item.description || 'No description cataloged.'}
        </p>
      ),
    },
    {
      key: 'articleCount',
      header: 'Papers',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-mono font-bold text-gold">
          <Icon name="FileText" size={12} />
          <span>{item.articleCount || 0}</span>
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Catalog Status',
      sortable: true,
      render: (item) => (
        <button
          type="button"
          onClick={() => handleToggleActive(item)}
          disabled={updateTopicMutation.isPending}
          className="group focus:outline-none"
          title="Click to toggle active status"
        >
          {item.isActive ? (
            <Badge variant="published" className="group-hover:opacity-80 transition-opacity">
              Active
            </Badge>
          ) : (
            <Badge variant="archived" className="group-hover:opacity-80 transition-opacity">
              Inactive
            </Badge>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenEditModal(item)}
            leftIcon={<Icon name="Edit" size={13} />}
          >
            Edit
          </Button>

          {item.isActive && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeactivateTopic(item)}
              title="Deactivate Discipline"
            >
              <Icon name="Trash2" size={13} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <AdminPageHeader
        discipline="Taxonomy Management"
        title="Research Disciplines"
        subtitle="SuperAdmin dashboard to organize, reorder, curate, and catalog research disciplines across Qindil."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
            leftIcon={<Icon name="Plus" size={16} />}
          >
            New Discipline
          </Button>
        }
      />

      {/* Metrics Strip (Prompt 42 compliant) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <AdminStatCard
          label="Active Disciplines"
          value={activeTopics}
          helperText="Publicly accessible in catalog"
          icon="CheckCircle"
          variant="success"
          isLoading={isLoading}
        />
        <AdminStatCard
          label="Total Disciplines"
          value={totalTopics}
          helperText="Taxonomy catalog entries"
          icon="Tag"
          variant="gold"
          isLoading={isLoading}
        />
        <AdminStatCard
          label="Cataloged Papers"
          value={totalArticles}
          helperText="Articles across all disciplines"
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
        searchPlaceholder="Search disciplines by name or slug..."
      />

      {/* Create / Edit Topic Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTopic ? 'Edit Research Discipline' : 'Create New Discipline'}
          size="md"
        >
          <form onSubmit={handleSaveTopic} className="space-y-4 font-sans">
            <Input
              label="Discipline Name *"
              placeholder="e.g. Rational Theology & Apologetics"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />

            <Input
              label="Custom URL Slug (Optional)"
              placeholder="e.g. rational-theology (auto-generated if left blank)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              helperText="Forms the URL path: /topics/[slug]"
            />

            <Textarea
              label="Discipline Scope & Overview"
              placeholder="Provide a concise scholarly summary of content covered under this discipline..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <FileUpload
              label="Discipline Cover Banner"
              folder="qindil/topics"
              value={coverImageUrl}
              onUploadComplete={(url) => setCoverImageUrl(url)}
            />

            <div className="flex justify-end space-x-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={
                  createTopicMutation.isPending || updateTopicMutation.isPending
                }
              >
                {editingTopic ? 'Save Changes' : 'Create Discipline'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Sensitive Confirmation Dialog */}
      {ConfirmModalElement}
    </div>
  );
};

export default TopicsManagementPage;
