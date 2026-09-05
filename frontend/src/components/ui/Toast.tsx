import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, ToastItem } from '../../stores/toastStore';
import Icon from '../icons/Icon';

export const ToastSingle: React.FC<{ item: ToastItem }> = ({ item }) => {
  const removeToast = useToastStore((state) => state.removeToast);

  const typeConfig = {
    success: {
      icon: 'CheckCircle' as const,
      border: 'border-success/40',
      bg: 'bg-surface/95',
      iconColor: 'text-success',
    },
    error: {
      icon: 'AlertCircle' as const,
      border: 'border-danger/40',
      bg: 'bg-surface/95',
      iconColor: 'text-danger',
    },
    info: {
      icon: 'Info' as const,
      border: 'border-gold/40',
      bg: 'bg-surface/95',
      iconColor: 'text-gold',
    },
  };

  const config = typeConfig[item.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 w-full max-w-sm rounded-lg border p-4 shadow-xl backdrop-blur-md ${config.border} ${config.bg}`}
    >
      <div className={`shrink-0 ${config.iconColor}`}>
        <Icon name={config.icon} size={20} />
      </div>

      <p className="flex-1 text-sm font-medium text-text leading-snug">{item.message}</p>

      <button
        onClick={() => removeToast(item.id)}
        className="shrink-0 text-textMuted hover:text-text p-1 transition-colors"
        aria-label="Dismiss toast"
      >
        <Icon name="X" size={16} />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastSingle item={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
