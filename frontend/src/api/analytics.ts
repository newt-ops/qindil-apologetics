import apiClient from './client';

export interface TopArticleItem {
  _id: string;
  title: string;
  slug?: string;
  viewCount: number;
  publishedAt?: string;
  topic?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export interface AnalyticsOverview {
  totalPublishedArticles: number;
  totalViews: number;
  activeTasksCount: number;
  articlesByStatus: {
    draft: number;
    inReview: number;
    changesRequested: number;
    approved: number;
    published: number;
    archived: number;
  };
  videosByStage: {
    idea: number;
    scripting: number;
    filming: number;
    editing: number;
    review: number;
    published: number;
  };
  tasksByStatus: {
    pending: number;
    inProgress: number;
    inReview: number;
    done: number;
    overdue: number;
  };
  topArticles: TopArticleItem[];
}

export interface ArticleTimeSeriesPoint {
  date: string;
  count: number;
}

export interface ArticlesOverTimeResponse {
  range: string;
  data: ArticleTimeSeriesPoint[];
}

export interface TeamMemberActivityItem {
  user: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  completedTasksCount: number;
}

export interface TeamActivityResponse {
  range: string;
  data: TeamMemberActivityItem[];
}

export const getAnalyticsOverviewApi = async () => {
  const response = await apiClient.get<{ success: boolean; data: AnalyticsOverview }>(
    '/analytics/overview'
  );
  return response.data;
};

export const getArticlesOverTimeApi = async (range: string = '30d') => {
  const response = await apiClient.get<{ success: boolean; data: ArticlesOverTimeResponse }>(
    `/analytics/articles-over-time?range=${range}`
  );
  return response.data;
};

export const getTeamActivityApi = async (range: string = '30d') => {
  const response = await apiClient.get<{ success: boolean; data: TeamActivityResponse }>(
    `/analytics/team-activity?range=${range}`
  );
  return response.data;
};
