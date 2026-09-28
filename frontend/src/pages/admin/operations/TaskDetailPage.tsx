import React from 'react';
import { useHasRole } from '../../../hooks/useHasRole';
import SuperAdminTaskDetailPage from './SuperAdminTaskDetailPage';
import ScholarTaskDetailPage from './ScholarTaskDetailPage';

export const TaskDetailPage: React.FC = () => {
  const isSuperAdmin = useHasRole('superAdmin');

  if (isSuperAdmin) {
    return <SuperAdminTaskDetailPage />;
  }

  return <ScholarTaskDetailPage />;
};

export default TaskDetailPage;
