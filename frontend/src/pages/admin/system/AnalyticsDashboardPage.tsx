import React, { useState, useMemo } from 'react';
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
import Icon from '../../../components/icons/Icon';
import {
  useAnalyticsOverview,
  useArticlesOverTime,
  useTeamActivity,
} from '../../../hooks/useAnalytics';
import { AdminPageHeader, AdminStatCard } from '../../../components/admin';
import { Badge } from '../../../components/ui/Badge';
import { useThemeStore } from '../../../stores/themeStore';

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
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Queries
  const { data: overview, isLoading: isOverviewLoading } = useAnalyticsOverview();
  const { data: overTimeData, isLoading: isOverTimeLoading } = useArticlesOverTime(range);
  const { data: teamActivityData, isLoading: isTeamActivityLoading } = useTeamActivity(range);

  const timeSeriesPoints = overTimeData?.data || [];
  const teamActivities = teamActivityData?.data || [];

  // Dynamic Theme-Aware Chart Options
  const chartOptionsBase = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          titleColor: isDark ? '#f4f4f5' : '#09090b',
          bodyColor: '#c9a84c',
          borderColor: isDark ? '#27272a' : '#e4e4e7',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: {
            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
          },
          ticks: {
            color: isDark ? '#a1a1aa' : '#71717a',
            font: { size: 11 },
          },
        },
        y: {
          grid: {
            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
          },
          ticks: {
            color: isDark ? '#a1a1aa' : '#71717a',
            font: { size: 11 },
            precision: 0,
          },
          beginAtZero: true,
        },
      },
    }),
    [isDark]
  );

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
        pointBorderColor: isDark ? '#0a0a0a' : '#ffffff',
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
          'rgba(234, 179, 8, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: ['#eab308', '#3b82f6', '#a855f7', '#22c55e', '#ef4444'],
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
    <div className="space-y-6 font-sans pb-16">
      {/* Page Header & Range Selector */}
      <AdminPageHeader
        discipline="Platform Governance"
        title="Analytics & Intelligence"
        subtitle="System performance telemetry, article readership metrics, and operational throughput."
        actions={
          <div className="flex items-center bg-surface border border-border p-1 rounded-xl space-x-1 shrink-0">
            {(['30d', '90d', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                  range === r
                    ? 'bg-gold text-bg shadow-sm'
                    : 'text-textMuted hover:text-text hover:bg-bg/50'
                }`}
              >
                {r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        }
      />

      {/* Top Metric Cards (Prompt 42 Density: 2-col on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <AdminStatCard
          label="Published Articles"
          value={overview?.totalPublishedArticles || 0}
          helperText="Cataloged on platform"
          icon="FileText"
          variant="gold"
          isLoading={isOverviewLoading}
        />
        <AdminStatCard
          label="Total Readership"
          value={(overview?.totalViews || 0).toLocaleString()}
          helperText="Cumulative impressions"
          icon="Eye"
          variant="info"
          isLoading={isOverviewLoading}
        />
        <AdminStatCard
          label="Active Pipeline"
          value={overview?.activeTasksCount || 0}
          helperText="Pending, progress, or review"
          icon="CheckCircle"
          variant="warning"
          isLoading={isOverviewLoading}
        />
        <AdminStatCard
          label="Video Productions"
          value={overview?.videosByStage?.published || 0}
          helperText="Live digital media"
          icon="Video"
          variant="success"
          isLoading={isOverviewLoading}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Articles Published Over Time */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 flex flex-col shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-text flex items-center space-x-2">
                <Icon name="Activity" size={16} className="text-gold" />
                <span>Published Research Papers Over Time</span>
              </h3>
              <p className="text-[11px] text-textMuted">Publication trend for range ({range})</p>
            </div>
            <Badge variant="gold">{range}</Badge>
          </div>

          <div className="h-64 w-full relative">
            {isOverTimeLoading ? (
              <div className="h-full flex items-center justify-center text-gold">
                <span className="text-xs">Loading publication timeline...</span>
              </div>
            ) : timeSeriesPoints.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-textMuted">
                No publication records for this date window.
              </div>
            ) : (
              <Line data={lineChartData} options={chartOptionsBase} />
            )}
          </div>
        </div>

        {/* Bar Chart: Operations Tasks by Status */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 flex flex-col shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-text flex items-center space-x-2">
                <Icon name="Folder" size={16} className="text-gold" />
                <span>Task Board Distribution</span>
              </h3>
              <p className="text-[11px] text-textMuted">Current operational workflow stages</p>
            </div>
          </div>

          <div className="h-64 w-full relative">
            {isOverviewLoading ? (
              <div className="h-full flex items-center justify-center text-gold">
                <span className="text-xs">Loading task telemetry...</span>
              </div>
            ) : (
              <Bar data={tasksBarData} options={chartOptionsBase} />
            )}
          </div>
        </div>

        {/* Bar Chart: Video Production Stages */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 flex flex-col shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-text flex items-center space-x-2">
                <Icon name="Video" size={16} className="text-gold" />
                <span>Video Production Velocity</span>
              </h3>
              <p className="text-[11px] text-textMuted">Active stages across the video board</p>
            </div>
          </div>

          <div className="h-64 w-full relative">
            {isOverviewLoading ? (
              <div className="h-full flex items-center justify-center text-gold">
                <span className="text-xs">Loading video telemetry...</span>
              </div>
            ) : (
              <Bar data={videosBarData} options={chartOptionsBase} />
            )}
          </div>
        </div>

        {/* Bar Chart: Team Activity Leaderboard */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 flex flex-col shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-text flex items-center space-x-2">
                <Icon name="Users" size={16} className="text-gold" />
                <span>Scholar Contributions</span>
              </h3>
              <p className="text-[11px] text-textMuted">Completed assignments by scholar ({range})</p>
            </div>
            <Badge variant="gold">{range}</Badge>
          </div>

          <div className="h-64 w-full relative">
            {isTeamActivityLoading ? (
              <div className="h-full flex items-center justify-center text-gold">
                <span className="text-xs">Loading contributor data...</span>
              </div>
            ) : teamActivities.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-textMuted">
                No activity records in this time interval.
              </div>
            ) : (
              <Bar data={teamChartData} options={chartOptionsBase} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
