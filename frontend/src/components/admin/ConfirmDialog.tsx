import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Icon from '../icons/Icon';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone. Please confirm to proceed.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const iconConfig = {
    danger: { name: 'AlertCircle' as const, color: 'text-danger bg-danger/10 border-danger/30' },
    warning: { name: 'AlertCircle' as const, color: 'text-gold bg-gold/10 border-gold/30' },
    primary: { name: 'Info' as const, color: 'text-gold bg-gold/10 border-gold/30' },
  };

  const currentIcon = iconConfig[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-apple-sm ${currentIcon.color}`}
          >
            <Icon name={currentIcon.name} size={22} />
          </div>

          <div className="space-y-1.5 flex-1">
            <h4 className="text-base sm:text-lg font-bold text-text tracking-tight">{title}</h4>
            <p className="text-xs text-textMuted leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>

          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
