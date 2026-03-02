import { type FC, type ReactNode } from 'react';
import { Dialog } from '@radix-ui/themes';
import * as $ from './ConfirmationDialog.css';

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  loading?: boolean;
};

export const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  loading = false,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className={$.content}>
        <Dialog.Title className={$.title}>{title}</Dialog.Title>
        <Dialog.Description className={$.description}>{description}</Dialog.Description>
        <div className={$.actions}>
          <Dialog.Close>
            <button className={$.cancelButton} disabled={loading}>
              {cancelLabel}
            </button>
          </Dialog.Close>
          <button
            className={variant === 'danger' ? $.dangerButton : $.confirmButton}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
