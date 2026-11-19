'use client';

import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/lib/useFocusTrap';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Short explanation of what will happen, announced as the dialog's description. */
  description?: ReactNode;
  /** Extra body content (e.g. a summary of what's being deleted, or a typed confirmation). */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. Defaults to true. */
  destructive?: boolean;
  /** Disables the confirm button (e.g. until a typed confirmation matches). */
  confirmDisabled?: boolean;
  /** While true, both buttons are disabled and Esc/backdrop don't dismiss. */
  busy?: boolean;
  busyLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-app replacement for the native confirm dialog on destructive actions, in the
 * same brutalist style as the rest of the UI (and themable for dark mode,
 * unlike the native dialog). An `alertdialog` that traps focus, starts on
 * the safe Cancel action, closes on Esc or a backdrop click, and returns
 * focus to whatever opened it.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  confirmDisabled = false,
  busy = false,
  busyLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Shared trap: focus starts on Cancel (the safe action), Tab stays inside,
  // Escape cancels unless a request is in flight, and focus returns to the
  // opener on close.
  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    initialFocusRef: cancelRef,
    onEscape: onCancel,
    escapeDisabled: busy,
  });

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-ink/70 dark:bg-black/70 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="card-brutal bg-background w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4"
      >
        <h2 id={titleId} className="text-xl font-extrabold text-ink break-words">
          {title}
        </h2>
        {description && (
          <div id={descriptionId} className="text-sm font-medium text-ink/80">
            {description}
          </div>
        )}
        {children}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn-brutal btn-brutal-white"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled || busy}
            className={`btn-brutal ${destructive ? 'btn-brutal-danger' : 'btn-brutal-primary'}`}
          >
            {busy && busyLabel ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
