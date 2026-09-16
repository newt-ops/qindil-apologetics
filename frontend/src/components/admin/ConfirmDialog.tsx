import React from 'react';
import ConfirmModal, { ConfirmModalProps } from '../ui/ConfirmModal';
export { useConfirm } from '../../hooks/useConfirm';

export type ConfirmDialogProps = ConfirmModalProps;

/**
 * ConfirmDialog adapter forwarding directly to unified Apple-style ConfirmModal.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  return <ConfirmModal {...props} />;
};

export default ConfirmDialog;
