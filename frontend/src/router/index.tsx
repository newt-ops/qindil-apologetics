import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import HomePage from '../pages/public/HomePage';
import TopicsPage from '../pages/public/TopicsPage';
import ArticlesByTopicPage from '../pages/public/ArticlesByTopicPage';
import ArticlesPage from '../pages/public/ArticlesPage';
import ArticleDetailPage from '../pages/public/ArticleDetailPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import EventsPage from '../pages/public/EventsPage';
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage';
import TermsOfServicePage from '../pages/public/TermsOfServicePage';
import NotFoundPage from '../pages/public/NotFoundPage';
import MiniDashboardPage from '../pages/public/MiniDashboardPage';

import WorkspacePage from '../pages/admin/WorkspacePage';
import TeamRosterPage from '../pages/admin/TeamRosterPage';
import MemberProfilePage from '../pages/admin/MemberProfilePage';
import AllTasksPage from '../pages/admin/AllTasksPage';
import AssignTaskPage from '../pages/admin/AssignTaskPage';
import TaskDetailPage from '../pages/admin/TaskDetailPage';
import CalendarPage from '../pages/admin/CalendarPage';
import TopicsManagementPage from '../pages/admin/TopicsManagementPage';
import ArticlesListPage from '../pages/admin/ArticlesListPage';
import ArticleEditorPage from '../pages/admin/ArticleEditorPage';
import ReviewQueuePage from '../pages/admin/ReviewQueuePage';
import ArticleReviewPage from '../pages/admin/ArticleReviewPage';
import ProductionBoardPage from '../pages/admin/ProductionBoardPage';
import VideoDetailPage from '../pages/admin/VideoDetailPage';
import EventsManagementPage from '../pages/admin/EventsManagementPage';
import AnalyticsDashboardPage from '../pages/admin/AnalyticsDashboardPage';
import ContactInboxPage from '../pages/admin/ContactInboxPage';
import AuditLogPage from '../pages/admin/AuditLogPage';
import SiteSettingsPage from '../pages/admin/SiteSettingsPage';
import LoginPage from '../pages/public/auth/LoginPage';
import RegisterPage from '../pages/public/auth/RegisterPage';
import VerifyOtpPage from '../pages/public/auth/VerifyOtpPage';
import ForgotPasswordPage from '../pages/public/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/public/auth/ResetPasswordPage';
import ProtectedRoute from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages nested inside PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/topics/:slug" element={<ArticlesByTopicPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticleDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
      </Route>

      {/* Standalone Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Member Mini-Dashboard Route (every logged-in user can access) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MiniDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Shell Routes (guarded by requiredRole="admin") */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WorkspacePage />} />
        <Route path="workspace" element={<WorkspacePage />} />
        <Route path="production" element={<ProductionBoardPage />} />
        <Route path="production/:id" element={<VideoDetailPage />} />


        {/* SuperAdmin Only Routes */}
        <Route
          path="team"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <TeamRosterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="team/:id"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <MemberProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tasks"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <AllTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tasks/new"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <AssignTaskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="topics"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <TopicsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="review-queue"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <ReviewQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="articles/review"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <ReviewQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="articles/:id/review"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <ArticleReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="events"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <EventsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <AnalyticsDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="contact-inbox"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <ContactInboxPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="contact"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <ContactInboxPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit-log"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <AuditLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <SiteSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="articles" element={<ArticlesListPage />} />
        <Route path="articles/:id/edit" element={<ArticleEditorPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
