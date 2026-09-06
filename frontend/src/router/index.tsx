import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
// Public Pages
import {
  HomePage,
  TopicsPage,
  ArticlesByTopicPage,
  ArticlesPage,
  ArticleDetailPage,
  AboutPage,
  ContactPage,
  EventsPage,
  PrivacyPolicyPage,
  TermsOfServicePage,
  NotFoundPage,
  MiniDashboardPage,
  LoginPage,
  RegisterPage,
  VerifyOtpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '../pages/public';

// Admin Operations, Editorial, Video & System Pages
import {
  WorkspacePage,
  TeamRosterPage,
  MemberProfilePage,
  AllTasksPage,
  AssignTaskPage,
  TaskDetailPage,
  CalendarPage,
  TopicsManagementPage,
  ArticlesListPage,
  ArticleEditorPage,
  ReviewQueuePage,
  VideoTaskDetailPage,
  EventsManagementPage,
  AnalyticsDashboardPage,
  ContactInboxPage,
  AuditLogPage,
  SiteSettingsPage,
} from '../pages/admin';

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
          path="tasks/assign"
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
              <ReviewQueuePage />
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
        <Route
          path="articles/review"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <ReviewQueuePage />
            </ProtectedRoute>
          }
        />
        <Route path="articles/:id/edit" element={<ArticleEditorPage />} />
        <Route path="videos/:id" element={<VideoTaskDetailPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
