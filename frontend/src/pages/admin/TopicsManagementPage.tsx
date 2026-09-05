import React, { useState } from 'react';
import Icon from '../../components/icons/Icon';
import {
  useAdminTopics,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
  useReorderTopics,
} from '../../hooks/useTopics';
import { TopicItem } from '../../api/topic';
import { DataTable } from '../../components/admin/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import FileUpload from '../../components/admin/FileUpload';
import { Column } from '../../components/ui/Table';
import { toast } from '../../hooks/useToast';

export const TopicsManagementPage: React.FC = () => {
  const { data: topics = [], isLoading } = useAdminTopics();

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
        toast.success(`Topic "${name}" updated successfully.`);
      } else {
        await createTopicMutation.mutateAsync({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          coverImageUrl: coverImageUrl || undefined,
        });
        toast.success(`Topic "${name}" created successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to save topic.';
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
        `Topic "${topic.name}" ${!topic.isActive ? 'activated' : 'deactivated'}.`
      );
    } catch (err: any) {
      toast.error('Failed to update topic status.');
    }
  };

  const handleDeactivate = async (topic: TopicItem) => {
    if (!window.confirm(`Are you sure you want to deactivate "${topic.name}"?`)) return;

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
      header: 'Reorder',
      render: (item) => {
        const index = topics.findIndex((t) => t._id === item._id);
        return (
          <div className="flex items-center space-x-1">
            <span className="font-mono text-xs font-bold text-gold/80 w-5 text-center">
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
      header: 'Topic & Slug',
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
            <span className="font-bold text-text hover:text-gold transition-colors block">
              {item.name}
            </span>
            <span className="text-[11px] font-mono text-textMuted block">
              /{item.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <p className="text-xs text-textMuted line-clamp-2 max-w-xs">
          {item.description || 'No description provided.'}
        </p>
      ),
    },
    {
      key: 'articleCount',
      header: 'Articles',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center space-x-1 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-mono font-bold text-gold">
          <Icon name="FileText" size={12} />
          <span>{item.articleCount || 0}</span>
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <button
          type="button"
          onClick={() => handleToggleActive(item)}
          disabled={updateTopicMutation.isPending}
          className="group focus:outline-none"
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
            leftIcon={<Icon name="Edit" size={14} />}
          >
            Edit
          </Button>

          {item.isActive && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeactivate(item)}
              title="Deactivate Topic"
            >
              <Icon name="Trash2" size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Tag" size={14} />
            <span>Taxonomy Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Topics Taxonomy
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            SuperAdmin dashboard to organize, reorder, and manage article topics across the platform.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreateModal}
          leftIcon={<Icon name="Plus" size={16} />}
        >
          Create New Topic
        </Button>
      </div>

      {/* Topics DataTable */}
      <DataTable
        columns={columns}
        data={topics}
        isLoading={isLoading}
        searchPlaceholder="Search topics by name or slug..."
      />

      {/* Create / Edit Topic Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTopic ? 'Edit Topic' : 'Create New Topic'}
          size="md"
        >
          <form onSubmit={handleSaveTopic} className="space-y-4 font-sans">
            <Input
              label="Topic Name"
              placeholder="e.g. Islamic Apologetics & Theology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Custom URL Slug (Optional)"
              placeholder="e.g. theology-apologetics (auto-generated if blank)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />

            <Textarea
              label="Description"
              placeholder="Provide a concise summary of content covered under this topic..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <FileUpload
              label="Topic Cover Image"
              folder="qindil/topics"
              value={coverImageUrl}
              onUploadComplete={(url) => setCoverImageUrl(url)}
            />

            <div className="flex justify-end space-x-2 pt-4 border-t border-border">
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
                {editingTopic ? 'Save Changes' : 'Create Topic'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TopicsManagementPage;
