import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Icon from '../../components/icons/Icon';
import {
  useAnalyticsOverview,
  useArticlesOverTime,
  useTeamActivity,
} from '../../hooks/useAnalytics';
import { Badge } from '../../components/ui/Badge';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

export const AnalyticsDashboardPage: React.FC = () => {
  const [range, setRange] = useState<'30d' | '90d' | '1y'>('30d');

  // Queries
  const { data: overview, isLoading: isOverviewLoading } = useAnalyticsOverview();
  const { data: overTimeData, isLoading: isOverTimeLoading } = useArticlesOverTime(range);
  const { data: teamActivityData, isLoading: isTeamActivityLoading } = useTeamActivity(range);

  const timeSeriesPoints = overTimeData?.data || [];
  const teamActivities = teamActivityData?.data || [];

  // Chart Styling Defaults (Dark Theme)
  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#c9a84c',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#a1a1aa',
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#a1a1aa',
          font: { size: 11 },
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  };

  // Line Chart Data: Articles Over Time
  const lineChartData = {
    labels: timeSeriesPoints.map((p) => p.date),
    datasets: [
      {
        label: 'Articles Published',
        data: timeSeriesPoints.map((p) => p.count),
        borderColor: '#c9a84c',
        backgroundColor: 'rgba(201, 168, 76, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#c9a84c',
        pointBorderColor: '#0a0a0a',
        pointHoverRadius: 6,
      },
    ],
  };

  // Bar Chart Data: Tasks by Status
  const taskStatusLabels = ['Pending', 'In Progress', 'In Review', 'Done', 'Overdue'];
  const taskStatusCounts = overview
    ? [
        overview.tasksByStatus.pending,
        overview.tasksByStatus.inProgress,
        overview.tasksByStatus.inReview,
        overview.tasksByStatus.done,
        overview.tasksByStatus.overdue,
      ]
    : [0, 0, 0, 0, 0];

  const tasksBarData = {
    labels: taskStatusLabels,
    datasets: [
      {
        label: 'Task Count',
        data: taskStatusCounts,
        backgroundColor: [
          'rgba(234, 179, 8, 0.7)',  // Pending - Yellow
          'rgba(59, 130, 246, 0.7)',  // In Progress - Blue
          'rgba(168, 85, 247, 0.7)',  // In Review - Purple
          'rgba(34, 197, 94, 0.7)',   // Done - Green
          'rgba(239, 68, 68, 0.7)',   // Overdue - Red
        ],
        borderColor: [
          '#eab308',
          '#3b82f6',
          '#a855f7',
          '#22c55e',
          '#ef4444',
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Bar Chart Data: Team Activity Leaderboard
  const teamChartData = {
    labels: teamActivities.map((a) => a.user.name),
    datasets: [
      {
        label: 'Completed Tasks',
        data: teamActivities.map((a) => a.completedTasksCount),
        backgroundColor: 'rgba(201, 168, 76, 0.75)',
        borderColor: '#c9a84c',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Bar Chart Data: Videos by Stage
  const videoStageLabels = ['Idea', 'Scripting', 'Filming', 'Editing', 'Review', 'Published'];
  const videoStageCounts = overview
    ? [
        overview.videosByStage.idea,
        overview.videosByStage.scripting,
        overview.videosByStage.filming,
        overview.videosByStage.editing,
        overview.videosByStage.review,
        overview.videosByStage.published,
      ]
    : [0, 0, 0, 0, 0, 0];

  const videosBarData = {
    labels: videoStageLabels,
    datasets: [
      {
        label: 'Videos Count',
        data: videoStageCounts,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header & Range Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-2">
            <Icon name="Activity" size={14} />
            <span>SuperAdmin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Comprehensive platform performance, content reach, workflow velocity, and team contributions.
          </p>
        </div>

        {/* Range Selector Controls */}
        <div className="flex items-center bg-surface border border-border p-1 rounded-lg space-x-1 shrink-0">
          {(['30d', '90d', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-150 ${
                range === r
                  ? 'bg-gold text-bg shadow-sm'
                  : 'text-textMuted hover:text-text hover:bg-bg/50'
              }`}
            >
              {r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Published Articles */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-medium">Published Articles</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Icon name="FileText" size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text">
            {isOverviewLoading ? '...' : overview?.totalPublishedArticles || 0}
          </div>
          <div className="text-[11px] text-textMuted">Live on public platform</div>
        </div>

        {/* Total Views */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-medium">Total Article Reads</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
              <Icon name="Eye" size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text">
            {isOverviewLoading
              ? '...'
              : (overview?.totalViews || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-textMuted">Cumulative view impressions</div>
        </div>

        {/* Active Tasks */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-medium">Active Tasks</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Icon name="CheckCircle" size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text">
            {isOverviewLoading ? '...' : overview?.activeTasksCount || 0}
          </div>
          <div className="text-[11px] text-textMuted">Pending, in-progress, or in-review</div>
        </div>

        {/* Published Videos */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-medium">Published Videos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <Icon name="Video" size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text">
            {isOverviewLoading ? '...' : overview?.videosByStage.published || 0}
          </div>
          <div className="text-[11px] text-textMuted">Production board completed</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Articles Published Over Time */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-text flex items-center space-x-2">
                <Icon name="Activity" size={16} className="text-gold" />
                <span>Published Articles Over Time</span>
              </h3>
              <p className="text-[11px] text-textMuted">Publication trend for range ({range})</p>
            </div>
            <Badge variant="gold">{range}</Badge>
          </div>

          <div className="h-64 w-full relative">
            {isOverTimeLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-textMuted">
                Loading chart...
              </div>
            ) : timeSeriesPoints.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-textMuted">
                No article publication data for this time range.
              </div>
            ) : (
              <Line data={lineChartData} options={chartOptionsBase} />
            )}
          </div>
        </div>

        {/* Bar Chart: Team Activity Leaderboard */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-text flex items-center space-x-2">
                <Icon name="Users" size={16} className="text-gold" />
                <span>Team Task Leaderboard</span>
              </h3>
              <p className="text-[11px] text-textMuted">Completed tasks per member ({range})</p>
            </div>
            <Badge variant="gold">{range}</Badge>
          </div>

          <div className="h-64 w-full relative">
            {isTeamActivityLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-textMuted">
                Loading team stats...
              </div>
            ) : teamActivities.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-textMuted">
                No completed tasks recorded in this period.
              </div>
            ) : (
              <Bar data={teamChartData} options={chartOptionsBase} />
            )}
          </div>
        </div>

        {/* Bar Chart: Tasks by Status */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-text flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-gold" />
                <span>Tasks Status Distribution</span>
              </h3>
              <p className="text-[11px] text-textMuted">Current operational workflow status</p>
            </div>
          </div>

          <div className="h-64 w-full relative">
            {isOverviewLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-textMuted">
                Loading task breakdown...
              </div>
            ) : (
              <Bar data={tasksBarData} options={chartOptionsBase} />
            )}
          </div>
        </div>

        {/* Bar Chart: Video Production Pipeline */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-text flex items-center space-x-2">
                <Icon name="Video" size={16} className="text-gold" />
                <span>Video Board Stage Pipeline</span>
              </h3>
              <p className="text-[11px] text-textMuted">Active videos across production stages</p>
            </div>
          </div>

          <div className="h-64 w-full relative">
            {isOverviewLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-textMuted">
                Loading video pipeline...
              </div>
            ) : (
              <Bar data={videosBarData} options={chartOptionsBase} />
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Most Viewed Articles */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-text flex items-center space-x-2">
              <Icon name="Eye" size={16} className="text-gold" />
              <span>Top 5 Most Viewed Articles</span>
            </h3>
            <p className="text-[11px] text-textMuted">Highest performing published apologetics content</p>
          </div>
        </div>

        {isOverviewLoading ? (
          <div className="py-8 text-center text-xs text-textMuted">Loading top content...</div>
        ) : !overview?.topArticles || overview.topArticles.length === 0 ? (
          <div className="py-8 text-center text-xs text-textMuted">No published articles yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-border/60 text-textMuted uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Article Title</th>
                  <th className="py-2.5 px-3">Topic</th>
                  <th className="py-2.5 px-3">Views</th>
                  <th className="py-2.5 px-3">Published Date</th>
                  <th className="py-2.5 px-3 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {overview.topArticles.map((article, idx) => (
                  <tr key={article._id} className="hover:bg-bg/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-gold">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-text max-w-xs truncate">
                      {article.title}
                    </td>
                    <td className="py-3 px-3">
                      {article.topic ? (
                        <Badge variant="gold">{article.topic.name}</Badge>
                      ) : (
                        <span className="text-textMuted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-gold">
                      {article.viewCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-textMuted">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {article.slug ? (
                        <Link
                          to={`/articles/${article.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold hover:underline font-semibold"
                        >
                          View Public Page →
                        </Link>
                      ) : (
                        <span className="text-textMuted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
