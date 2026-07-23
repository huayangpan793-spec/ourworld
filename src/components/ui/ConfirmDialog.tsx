'use client';

import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-deep-400 text-sm leading-relaxed mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" size="md" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={variant} size="md" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
