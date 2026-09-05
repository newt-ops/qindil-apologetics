import { useToastStore, ToastType } from '../stores/toastStore';

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast('success', message, duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast('error', message, duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast('info', message, duration),
  show: (type: ToastType, message: string, duration?: number) =>
    useToastStore.getState().addToast(type, message, duration),
  dismiss: (id: string) => useToastStore.getState().removeToast(id),
};

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);
  const removeToast = useToastStore((state) => state.removeToast);

  return {
    success: (message: string, duration?: number) => addToast('success', message, duration),
    error: (message: string, duration?: number) => addToast('error', message, duration),
    info: (message: string, duration?: number) => addToast('info', message, duration),
    dismiss: (id: string) => removeToast(id),
  };
};

export default useToast;
