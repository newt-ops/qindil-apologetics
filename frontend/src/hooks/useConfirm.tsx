import React, { useState, useRef, useCallback } from 'react';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export interface ConfirmOptions {
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

/**
 * Promise-based custom hook for sensitive action confirmation modals.
 *
 * Usage:
 * const { confirm, ConfirmModalElement } = useConfirm();
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: 'Delete Item',
 *     description: 'This action cannot be undone.',
 *     confirmText: 'Delete',
 *     variant: 'danger',
 *   });
 *   if (!ok) return;
 *   // Proceed with delete
 * };
 */
export function useConfirm() {
  const [modalState, setModalState] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((val: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModalState(options);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true);
    setModalState(null);
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false);
    setModalState(null);
  }, []);

  const ConfirmModalElement = modalState ? (
    <ConfirmModal
      isOpen={Boolean(modalState)}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={modalState.title}
      description={modalState.description}
      confirmText={modalState.confirmText}
      cancelText={modalState.cancelText}
      variant={modalState.variant}
    />
  ) : null;

  return {
    confirm,
    ConfirmModalElement,
  };
}

export default useConfirm;
