import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import { useReviewQueue } from '../../hooks/useArticles';
import { ArticleItem } from '../../api/article';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Column } from '../../components/ui/Table';

export const ReviewQueuePage: React.FC = () => {
  const { data: articles = [], isLoading } = useReviewQueue();

  const columns: Column<ArticleItem>[] = [
    {
      key: 'title',
      header: 'Article Title & Excerpt',
      sortable: true,
      render: (item) => (
        <div className="space-y-1 max-w-md">
          <Link
            to={`/admin/articles/${item._id}/review`}
            className="font-bold text-text hover:text-gold transition-colors block text-sm"
          >
            {item.title}
          </Link>
          {item.excerpt && (
            <p className="text-[11px] text-textMuted line-clamp-1 italic font-serif">
              "{item.excerpt}"
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'topic',
      header: 'Topic',
      render: (item) => {
        const topicName = typeof item.topic === 'object' && item.topic ? item.topic.name : '—';
        return topicName !== '—' ? (
          <Badge variant="gold">{topicName}</Badge>
        ) : (
          <span className="text-xs text-textMuted">—</span>
        );
      },
    },
    {
      key: 'author',
      header: 'Author',
      render: (item) => {
        const authorObj = typeof item.author === 'object' ? item.author : null;
        return (
          <div className="flex items-center space-x-2 text-xs">
            {authorObj?.avatarUrl ? (
              <img
                src={authorObj.avatarUrl}
                alt={authorObj.name}
                className="h-6 w-6 rounded-full border border-gold/30 object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-[10px]">
                {authorObj?.name ? authorObj.name[0].toUpperCase() : 'A'}
              </div>
            )}
            <span className="font-medium text-text">{authorObj?.name || 'Unknown Author'}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-mono text-textMuted">
          {new Date(item.updatedAt || item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item) => (
        <Link to={`/admin/articles/${item._id}/review`}>
          <Button variant="primary" size="sm" leftIcon={<Icon name="Eye" size={14} />}>
            Review Article
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Shield" size={14} />
            <span>SuperAdmin Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Review submitted articles, request modifications, or approve and publish to the live site.
          </p>
        </div>
      </div>

      {/* Queue Stats Banner */}
      <div className="rounded-lg border border-gold/20 bg-gold/5 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold font-bold">
            <Icon name="Inbox" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text">Pending Submissions</h4>
            <p className="text-xs text-textMuted">Articles awaiting SuperAdmin editorial review</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold font-mono text-gold">{articles.length}</span>
          <span className="text-xs text-textMuted block">items</span>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={articles}
        isLoading={isLoading}
        searchPlaceholder="Search review queue..."
      />
    </div>
  );
};

export default ReviewQueuePage;
