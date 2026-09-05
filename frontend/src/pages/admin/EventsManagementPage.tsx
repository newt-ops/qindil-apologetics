import React, { useState } from 'react';
import Icon from '../../components/icons/Icon';
import {
  useEventsAdmin,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '../../hooks/useEvents';
import { CalendarEventItem, EventType, EventVisibility } from '../../api/event';
import { DataTable } from '../../components/admin/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select, { SelectOption } from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import { Column } from '../../components/ui/Table';
import { toast } from '../../hooks/useToast';

const toDateTimeLocalString = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const EventsManagementPage: React.FC = () => {
  // Filter Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventItem | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [type, setType] = useState<EventType>('meeting');
  const [visibility, setVisibility] = useState<EventVisibility>('team');
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<CalendarEventItem | null>(null);

  // Queries & Mutations
  const { data: eventsData, isLoading } = useEventsAdmin({
    search: searchQuery || undefined,
    type: typeFilter || undefined,
    visibility: visibilityFilter || undefined,
  });

  const eventsList = eventsData?.items || [];

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    
    // Default start date to today 09:00 AM
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    setStartDate(toDateTimeLocalString(now.toISOString()));
    setEndDate('');
    setAllDay(true);
    setType('meeting');
    setVisibility('team');
    setLocation('');
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (event: CalendarEventItem) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setStartDate(toDateTimeLocalString(event.startDate));
    setEndDate(toDateTimeLocalString(event.endDate));
    setAllDay(event.allDay);
    setType(event.type);
    setVisibility(event.visibility);
    setLocation(event.location || '');
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 2) {
      setFormError('Event title must be at least 2 characters long.');
      return;
    }
    if (!startDate) {
      setFormError('Start date is required.');
      return;
    }

    if (endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setFormError('End date must be greater than or equal to start date.');
      return;
    }

    setFormError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        allDay,
        type,
        visibility,
        location: location.trim() || undefined,
      };

      if (editingEvent) {
        await updateMutation.mutateAsync({ id: editingEvent._id, payload });
        toast.success(`Event "${title}" updated successfully.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Event "${title}" created successfully.`);
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data?.error?.message || 'Failed to save event.';
      setFormError(message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.relatedTask) {
      toast.error('Task-linked events cannot be deleted directly.');
      setDeleteTarget(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(`Event "${deleteTarget.title}" deleted successfully.`);
      setDeleteTarget(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to delete event.';
      toast.error(msg);
    }
  };

  // Helper for Type Badges
  const renderTypeBadge = (t: EventType) => {
    switch (t) {
      case 'publicEvent':
        return <Badge variant="gold">Public Event</Badge>;
      case 'deadline':
        return <Badge variant="danger">Deadline</Badge>;
      case 'meeting':
        return <Badge variant="info">Meeting</Badge>;
      default:
        return <Badge variant="secondary">Other</Badge>;
    }
  };

  // Helper for Visibility Badges
  const renderVisibilityBadge = (v: EventVisibility) => {
    return v === 'public' ? (
      <span className="inline-flex items-center space-x-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">
        <Icon name="Globe" size={12} />
        <span>Public</span>
      </span>
    ) : (
      <span className="inline-flex items-center space-x-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-textMuted">
        <Icon name="Lock" size={12} />
        <span>Team Only</span>
      </span>
    );
  };

  // Columns definition
  const columns: Column<CalendarEventItem>[] = [
    {
      key: 'title',
      header: 'Event Title & Details',
      sortable: true,
      render: (item) => (
        <div className="space-y-1 max-w-sm">
          <div className="font-bold text-text text-sm flex items-center space-x-2">
            <span>{item.title}</span>
            {item.relatedTask && (
              <span className="shrink-0 rounded bg-info/10 border border-info/30 px-1.5 py-0.5 text-[9px] font-semibold text-info">
                Task Linked
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-[11px] text-textMuted line-clamp-1 italic">
              {item.description}
            </p>
          )}
          {item.location && (
            <div className="flex items-center space-x-1 text-[11px] text-gold/80">
              <Icon name="MapPin" size={12} />
              <span>{item.location}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (item) => renderTypeBadge(item.type),
    },
    {
      key: 'visibility',
      header: 'Visibility',
      sortable: true,
      render: (item) => renderVisibilityBadge(item.visibility),
    },
    {
      key: 'startDate',
      header: 'Date & Time',
      sortable: true,
      render: (item) => {
        const start = new Date(item.startDate);
        const end = item.endDate ? new Date(item.endDate) : null;

        return (
          <div className="space-y-0.5 font-mono text-xs text-textMuted">
            <div className="font-semibold text-text">
              {start.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="text-[10px]">
              {item.allDay ? (
                <span className="text-gold font-sans font-medium">All Day</span>
              ) : (
                `${start.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}${
                  end
                    ? ` - ${end.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : ''
                }`
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        const isTaskLinked = Boolean(item.relatedTask);

        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="Edit" size={14} />}
              onClick={() => handleOpenEditModal(item)}
            >
              Edit
            </Button>

            {isTaskLinked ? (
              <span
                className="text-[10px] text-textMuted/60 italic cursor-not-allowed select-none px-2 py-1 bg-surface border border-border/50 rounded"
                title="Task-linked events cannot be deleted directly."
              >
                Task Managed
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger/10 hover:text-danger"
                onClick={() => setDeleteTarget(item)}
                title="Delete event"
              >
                <Icon name="Trash2" size={14} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const typeOptions: SelectOption[] = [
    { value: '', label: 'All Event Types' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'publicEvent', label: 'Public Event' },
    { value: 'other', label: 'Other' },
  ];

  const visibilityOptions: SelectOption[] = [
    { value: '', label: 'All Visibilities' },
    { value: 'public', label: 'Public Platform' },
    { value: 'team', label: 'Internal Team Only' },
  ];

  const formTypeOptions: SelectOption[] = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'publicEvent', label: 'Public Event' },
    { value: 'other', label: 'Other' },
  ];

  const formVisibilityOptions: SelectOption[] = [
    { value: 'team', label: 'Internal Team Only (Admin Calendar)' },
    { value: 'public', label: 'Public Platform (Shows on Public Events)' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Shield" size={14} />
            <span>SuperAdmin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Events Management
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Create public events for the platform website or schedule internal team calendar events.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Icon name="Plus" size={16} />}
          onClick={handleOpenCreateModal}
        >
          New Event
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface border border-border p-4 rounded-xl">
        <Input
          placeholder="Search title, description, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftElement={<Icon name="Search" size={16} className="text-textMuted" />}
        />

        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        />

        <Select
          options={visibilityOptions}
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
        />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={eventsList}
        isLoading={isLoading}
        searchPlaceholder="Filter listed events..."
      />

      {/* Create / Edit Form Modal */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={editingEvent ? 'Edit Event' : 'Create New Event'}
          size="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
            {formError && (
              <div className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-xs font-semibold text-danger flex items-center space-x-2">
                <Icon name="AlertTriangle" size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <Input
              label="Event Title"
              placeholder="e.g., Annual Islamic Thought Conference 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Event Type"
                options={formTypeOptions}
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
              />

              <Select
                label="Visibility Scope"
                options={formVisibilityOptions}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as EventVisibility)}
              />
            </div>

            <div className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                id="allDayCheckbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-bg text-gold focus:ring-gold"
              />
              <label htmlFor="allDayCheckbox" className="text-xs font-medium text-text select-none cursor-pointer">
                All-Day Event
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />

              <Input
                label="End Date & Time (Optional)"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Input
              label="Location / Link (Optional)"
              placeholder="e.g., Main Auditorium, Cairo / Zoom Meeting URL"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Textarea
              label="Description (Optional)"
              placeholder="Detailed schedule or agenda points..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-end space-x-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsFormModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={createMutation.isPending || updateMutation.isPending}
                leftIcon={<Icon name="Check" size={14} />}
              >
                {editingEvent ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Confirm Event Deletion"
          size="sm"
        >
          <div className="space-y-4 font-sans">
            <div className="flex items-center space-x-3 text-danger bg-danger/10 p-3 rounded-lg border border-danger/30 text-xs">
              <Icon name="AlertTriangle" size={20} className="shrink-0" />
              <span>
                This action cannot be undone. Event "<strong>{deleteTarget.title}</strong>" will be permanently deleted.
              </span>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={handleDeleteConfirm}
                leftIcon={<Icon name="Trash2" size={14} />}
              >
                Delete Event
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventsManagementPage;
