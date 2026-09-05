import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import { useMyArticles } from '../../hooks/useArticles';
import { ArticleItem } from '../../api/article';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Column } from '../../components/ui/Table';

export const MyArticlesPage: React.FC = () => {
  const { data: articles = [], isLoading } = useMyArticles();

  const columns: Column<ArticleItem>[] = [
    {
      key: 'title',
      header: 'Article Title & Excerpt',
      sortable: true,
      render: (item) => (
        <div className="space-y-1 max-w-md">
          <Link
            to={`/admin/articles/${item._id}/edit`}
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
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'viewCount',
      header: 'Views',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-textMuted">
          <Icon name="Eye" size={14} className="text-gold" />
          <span>{item.viewCount || 0}</span>
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-mono text-textMuted">
          {new Date(item.updatedAt).toLocaleDateString(undefined, {
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
        <Link to={`/admin/articles/${item._id}/edit`}>
          <Button variant="secondary" size="sm" leftIcon={<Icon name="Edit" size={14} />}>
            Edit Article
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
            <Icon name="FileText" size={14} />
            <span>Author Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            My Articles
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Author dashboard to write, edit, and track review status of your apologetics articles.
          </p>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={articles}
        isLoading={isLoading}
        searchPlaceholder="Search your articles..."
      />
    </div>
  );
};

export default MyArticlesPage;
