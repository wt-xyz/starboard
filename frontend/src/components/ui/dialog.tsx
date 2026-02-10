import type * as React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { Dialog as RadixDialog } from 'radix-ui';
import * as styles from './dialog.css';

function Dialog({ ...props }: React.ComponentProps<typeof RadixDialog.Root>) {
  return <RadixDialog.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof RadixDialog.Trigger>) {
  return <RadixDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof RadixDialog.Close>) {
  return <RadixDialog.Close data-slot="dialog-close" {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof RadixDialog.Portal>) {
  return <RadixDialog.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof RadixDialog.Overlay>) {
  return (
    <RadixDialog.Overlay
      data-slot="dialog-overlay"
      className={clsx(styles.overlay, className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<typeof RadixDialog.Content> & {
  showClose?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <RadixDialog.Content
        data-slot="dialog-content"
        className={clsx(styles.content, className)}
        {...props}
      >
        {children}
        {showClose && (
          <RadixDialog.Close className={styles.close}>
            <Cross2Icon className={styles.icon} />
            <span className={styles.srOnly}>Close</span>
          </RadixDialog.Close>
        )}
      </RadixDialog.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={clsx(styles.header, className)} {...props} />;
}

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-body" className={clsx(styles.body, className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-footer" className={clsx(styles.footer, className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      data-slot="dialog-title"
      className={clsx(styles.title, className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      data-slot="dialog-description"
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
