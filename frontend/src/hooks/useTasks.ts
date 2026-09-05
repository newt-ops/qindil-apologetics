import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyTasksApi,
  getTaskByIdApi,
  assignTaskApi,
  listAllTasksApi,
  updateTaskStatusApi,
  TaskItem,
  AssignTaskPayload,
  ListTasksParams,
  TaskStatus,
} from '../api/task';
import { useAuthStore } from '../stores/authStore';

export const useMyTasks = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: ['tasks', 'mine'],
    queryFn: async () => {
      const res = await getMyTasksApi();
      return res.data || [];
    },
    enabled: isAuthenticated,
  });

  const tasks: TaskItem[] = query.data || [];

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Overdue tasks: past dueDate and status not done
  const overdueTasks = tasks.filter((t) => {
    const isPast = new Date(t.dueDate) < now;
    return (t.isOverdue || (isPast && t.status !== 'done')) && t.status !== 'done';
  });

  // Due soon tasks: dueDate within next 7 days, not overdue, and not done
  const dueSoonTasks = tasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    const isOverdue = dueDate < now && t.status !== 'done';
    return !isOverdue && dueDate <= sevenDaysFromNow && t.status !== 'done';
  });

  // In progress tasks: explicitly status === 'inProgress'
  const inProgressTasks = tasks.filter((t) => t.status === 'inProgress');

  // Done tasks: status === 'done'
  const completedTasks = tasks.filter((t) => t.status === 'done');

  return {
    tasks,
    overdueTasks,
    dueSoonTasks,
    inProgressTasks,
    completedTasks,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useAllTasks = (params?: ListTasksParams) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['tasks', 'all', params],
    queryFn: () => listAllTasksApi(params),
    enabled: isAuthenticated,
  });
};

export const useTaskDetail = (id?: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: async () => {
      const res = await getTaskByIdApi(id!);
      return res.data;
    },
    enabled: isAuthenticated && Boolean(id),
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignTaskPayload) => assignTaskApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTaskStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export default useMyTasks;
