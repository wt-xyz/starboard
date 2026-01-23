import * as React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { Dialog } from 'radix-ui';
import * as styles from './sheet.css';

function Sheet({ ...props }: React.ComponentProps<typeof Dialog.Root>) {
  return <Dialog.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof Dialog.Trigger>) {
  return <Dialog.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof Dialog.Close>) {
  return <Dialog.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof Dialog.Portal>) {
  return <Dialog.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof Dialog.Overlay>) {
  return (
    <Dialog.Overlay
      data-slot="sheet-overlay"
      className={clsx(styles.overlay, className)}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof Dialog.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  const contentClass = React.useMemo(() => {
    switch (side) {
      case 'right':
        return styles.contentRight;
      case 'left':
        return styles.contentLeft;
      case 'top':
        return styles.contentTop;
      case 'bottom':
        return styles.contentBottom;
      default:
        return styles.contentRight;
    }
  }, [side]);

  return (
    <SheetPortal>
      <SheetOverlay />
      <Dialog.Content
        data-slot="sheet-content"
        className={clsx(contentClass, className)}
        {...props}
      >
        {children}
        <Dialog.Close className={styles.close}>
          <Cross2Icon className={styles.icon} />
          <span className={styles.srOnly}>Close</span>
        </Dialog.Close>
      </Dialog.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-header" className={clsx(styles.header, className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-footer" className={clsx(styles.footer, className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof Dialog.Title>) {
  return (
    <Dialog.Title data-slot="sheet-title" className={clsx(styles.title, className)} {...props} />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      data-slot="sheet-description"
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
