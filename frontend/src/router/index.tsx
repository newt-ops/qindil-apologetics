import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import { useHasRole } from '../hooks/useHasRole';
import { UniversalPageSkeleton } from '../components/ui/Skeleton';

// Lazy-loaded Public Pages
const HomePage = lazy(() => import('../pages/public/home/HomePage'));
const TopicsPage = lazy(() => import('../pages/public/catalog/TopicsPage'));
const ArticlesByTopicPage = lazy(() => import('../pages/public/catalog/ArticlesByTopicPage'));
const ArticlesPage = lazy(() => import('../pages/public/catalog/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('../pages/public/catalog/ArticleDetailPage'));
const AboutPage = lazy(() => import('../pages/public/institutional/AboutPage'));
const ContactPage = lazy(() => import('../pages/public/institutional/ContactPage'));
const EventsPage = lazy(() => import('../pages/public/institutional/EventsPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/public/institutional/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('../pages/public/institutional/TermsOfServicePage'));
const NotFoundPage = lazy(() => import('../pages/public/institutional/NotFoundPage'));
const MiniDashboardPage = lazy(() => import('../pages/public/member/MiniDashboardPage'));
const LoginPage = lazy(() => import('../pages/public/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/public/auth/RegisterPage'));
const VerifyOtpPage = lazy(() => import('../pages/public/auth/VerifyOtpPage'));
const ForgotPasswordPage = lazy(() => import('../pages/public/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/public/auth/ResetPasswordPage'));

// Lazy-loaded Admin Pages
const AdminWelcomePage = lazy(() => import('../pages/admin/operations/AdminWelcomePage'));
const WorkspacePage = lazy(() => import('../pages/admin/operations/WorkspacePage'));
const TeamRosterPage = lazy(() => import('../pages/admin/operations/TeamRosterPage'));
const MemberProfilePage = lazy(() => import('../pages/admin/operations/MemberProfilePage'));
const AllTasksPage = lazy(() => import('../pages/admin/operations/AllTasksPage'));
const MyTasksPage = lazy(() => import('../pages/admin/operations/MyTasksPage'));
const AssignTaskPage = lazy(() => import('../pages/admin/operations/AssignTaskPage'));
const TaskDetailPage = lazy(() => import('../pages/admin/operations/TaskDetailPage'));
const CalendarPage = lazy(() => import('../pages/admin/operations/CalendarPage'));
const TopicsManagementPage = lazy(() => import('../pages/admin/editorial/TopicsManagementPage'));
const TopicFormPage = lazy(() => import('../pages/admin/editorial/TopicFormPage'));
const ArticlesListPage = lazy(() => import('../pages/admin/editorial/ArticlesListPage'));
const MyArticlesPage = lazy(() => import('../pages/admin/editorial/MyArticlesPage'));
const ArticleEditorPage = lazy(() => import('../pages/admin/editorial/ArticleEditorPage'));
const NewProposalPage = lazy(() => import('../pages/admin/editorial/NewProposalPage'));
const SuperAdminArticleDetailPage = lazy(() => import('../pages/admin/editorial/SuperAdminArticleDetailPage'));
const ReviewQueuePage = lazy(() => import('../pages/admin/editorial/ReviewQueuePage'));
const VideoTaskDetailPage = lazy(() => import('../pages/admin/video/VideoTaskDetailPage'));
const EventsManagementPage = lazy(() => import('../pages/admin/system/EventsManagementPage'));
const AnalyticsDashboardPage = lazy(() => import('../pages/admin/system/AnalyticsDashboardPage'));
const ContactInboxPage = lazy(() => import('../pages/admin/system/ContactInboxPage'));
const AuditLogPage = lazy(() => import('../pages/admin/system/AuditLogPage'));
const SiteSettingsPage = lazy(() => import('../pages/admin/system/SiteSettingsPage'));

function AdminDashboardIndex() {
  const isSuperAdmin = useHasRole('superAdmin');
  if (isSuperAdmin) {
    return <AdminWelcomePage />;
  }
  return <WorkspacePage />;
}

function AdminArticlesIndex() {
  const isSuperAdmin = useHasRole('superAdmin');
  if (isSuperAdmin) {
    return <ArticlesListPage />;
  }
  return <MyArticlesPage />;
}

function AdminTasksIndex() {
  const isSuperAdmin = useHasRole('superAdmin');
  if (isSuperAdmin) {
    return <AllTasksPage />;
  }
  return <MyTasksPage />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<UniversalPageSkeleton />}>
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

        {/* Member Profile & Personal Library (integrated with main web) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MiniDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Standalone Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin Shell Routes (guarded by requiredRole="admin") */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardIndex />} />
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
          path="topics/new"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <TopicFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="topics/:id/edit"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <TopicFormPage />
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
            <ProtectedRoute requiredRole="admin">
              <ContactInboxPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="contact"
          element={
            <ProtectedRoute requiredRole="admin">
              <ContactInboxPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit-log"
          element={
            <ProtectedRoute requiredRole="admin">
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

        <Route path="tasks" element={<AdminTasksIndex />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="articles" element={<AdminArticlesIndex />} />
        <Route
          path="articles/review"
          element={
            <ProtectedRoute requiredRole="superAdmin">
              <ReviewQueuePage />
            </ProtectedRoute>
          }
        />
        <Route path="articles/proposals/new" element={<NewProposalPage />} />
        <Route path="proposals/new" element={<NewProposalPage />} />
        <Route path="articles/:id" element={<SuperAdminArticleDetailPage />} />
        <Route path="articles/:id/edit" element={<ArticleEditorPage />} />
        <Route path="videos/:id" element={<VideoTaskDetailPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
