import React, { useState } from 'react';
import Icon from '../../components/icons/Icon';
import {
  useContactMessages,
  useContactMessageDetail,
  useArchiveContactMessage,
} from '../../hooks/useContactMessages';
import { ContactMessageItem, ContactMessageStatus } from '../../api/contact';
import { DataTable } from '../../components/admin/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select, { SelectOption } from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { Column } from '../../components/ui/Table';
import { toast } from '../../hooks/useToast';

export const ContactInboxPage: React.FC = () => {
  // Filter Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Message for Detail Modal
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // Queries & Mutations
  const { data: messagesData, isLoading } = useContactMessages({
    search: searchQuery || undefined,
    status: statusFilter || undefined,
  });

  const { data: detailData, isLoading: isDetailLoading } = useContactMessageDetail(
    selectedMessageId || undefined
  );
  const activeMessage = detailData?.message || null;

  const archiveMutation = useArchiveContactMessage();

  const messagesList = messagesData?.items || [];
  const unreadCount = messagesData?.unreadCount || 0;

  const handleArchive = async (message: ContactMessageItem) => {
    try {
      await archiveMutation.mutateAsync(message._id);
      toast.success(`Message from "${message.name}" archived.`);
      if (selectedMessageId === message._id) {
        setSelectedMessageId(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to archive message.');
    }
  };

  const renderStatusBadge = (status: ContactMessageStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span>New</span>
          </span>
        );
      case 'read':
        return <Badge variant="info">Read</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Columns Definition
  const columns: Column<ContactMessageItem>[] = [
    {
      key: 'name',
      header: 'Sender',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-xs border border-gold/30">
            {item.name[0]?.toUpperCase() || 'U'}
          </div>
          <div className="space-y-0.5">
            <div className={`text-xs font-bold ${item.status === 'new' ? 'text-gold font-extrabold' : 'text-text'}`}>
              {item.name}
            </div>
            <div className="text-[11px] text-textMuted font-mono">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject & Snippet',
      sortable: true,
      render: (item) => (
        <div className="space-y-1 max-w-md">
          <div className={`text-xs ${item.status === 'new' ? 'font-extrabold text-text' : 'font-semibold text-textMuted'}`}>
            {item.subject || 'No Subject'}
          </div>
          <p className="text-[11px] text-textMuted line-clamp-1 italic">
            "{item.message}"
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => renderStatusBadge(item.status),
    },
    {
      key: 'createdAt',
      header: 'Received Date',
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
              })}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="Eye" size={14} />}
            onClick={() => setSelectedMessageId(item._id)}
          >
            View
          </Button>

          {item.status !== 'archived' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-textMuted hover:text-gold hover:bg-gold/10"
              onClick={() => handleArchive(item)}
              title="Archive message"
            >
              <Icon name="Archive" size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const statusOptions: SelectOption[] = [
    { value: '', label: 'Active Messages (New & Read)' },
    { value: 'new', label: 'New Unread' },
    { value: 'read', label: 'Read' },
    { value: 'archived', label: 'Archived' },
    { value: 'all', label: 'All Messages' },
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
            Contact Inbox
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Review inquiries, reader feedback, and correspondence submitted through the public website.
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="inline-flex items-center space-x-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-bold text-gold">
            <Icon name="Mail" size={16} />
            <span>{unreadCount} New Unread Message{unreadCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface border border-border p-4 rounded-xl">
        <Input
          placeholder="Search sender, email, subject, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftElement={<Icon name="Search" size={16} className="text-textMuted" />}
        />

        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={messagesList}
        isLoading={isLoading}
        searchPlaceholder="Filter inbox messages..."
      />

      {/* Contact Message Detail Modal */}
      {selectedMessageId && (
        <Modal
          isOpen={Boolean(selectedMessageId)}
          onClose={() => setSelectedMessageId(null)}
          title="Contact Message Details"
          size="lg"
        >
          {isDetailLoading || !activeMessage ? (
            <div className="py-12 text-center text-xs text-textMuted">
              Loading message content...
            </div>
          ) : (
            <div className="space-y-6 font-sans">
              {/* Header Box */}
              <div className="rounded-xl border border-border bg-bg/50 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-sm border border-gold/30">
                      {activeMessage.name[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-text">{activeMessage.name}</h3>
                      <a
                        href={`mailto:${activeMessage.email}`}
                        className="text-xs text-gold hover:underline font-mono"
                      >
                        {activeMessage.email}
                      </a>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStatusBadge(activeMessage.status)}
                    <div className="text-[11px] text-textMuted font-mono mt-1">
                      {new Date(activeMessage.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                </div>

                {activeMessage.subject && (
                  <div className="border-t border-border/50 pt-2 text-xs font-semibold text-text">
                    <span className="text-textMuted font-normal">Subject: </span>
                    {activeMessage.subject}
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">
                  Message Content
                </label>
                <div className="rounded-xl border border-border bg-surface p-4 text-xs sm:text-sm text-text leading-relaxed font-sans whitespace-pre-wrap min-h-[160px]">
                  {activeMessage.message}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(
                    activeMessage.subject || 'Qindil Inquiry'
                  )}`}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-gold hover:underline"
                >
                  <Icon name="Mail" size={14} />
                  <span>Reply via Email Client →</span>
                </a>

                <div className="flex items-center space-x-3">
                  {activeMessage.status !== 'archived' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={archiveMutation.isPending}
                      leftIcon={<Icon name="Archive" size={14} />}
                      onClick={() => handleArchive(activeMessage)}
                    >
                      Archive
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedMessageId(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default ContactInboxPage;
