'use client';

import { type RefObject, useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

export interface UseFocusTrapOptions {
  /** Whether the trap is active (i.e. the dialog is open). */
  active: boolean;
  /** Element whose descendants form the focusable region. */
  containerRef: RefObject<HTMLElement | null>;
  /** Element to focus when the trap activates. Falls back to the first focusable. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Called on Escape. */
  onEscape?: () => void;
  /** While true, Escape is ignored (e.g. a request is in flight). */
  escapeDisabled?: boolean;
}

/**
 * Moves focus into a dialog when it opens, keeps Tab/Shift+Tab inside it, and
 * returns focus to whatever was focused before it opened. Shared between the
 * destructive ConfirmDialog and the ShareModal so both behave consistently
 * for keyboard users.
 *
 * Callbacks are read through a ref so a parent re-render never tears down and
 * re-captures the trap (which would yank focus back to the opener mid-session).
 */
export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
  onEscape,
  escapeDisabled = false,
}: UseFocusTrapOptions): void {
  const latest = useRef({ onEscape, escapeDisabled });
  useEffect(() => {
    latest.current = { onEscape, escapeDisabled };
  });

  useEffect(() => {
    if (!active) return;

    // Capture the opener before we move focus, then restore it on teardown.
    const trigger = document.activeElement as HTMLElement | null;
    const target =
      initialFocusRef?.current ?? getFocusable(containerRef.current)[0] ?? containerRef.current;
    target?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!latest.current.onEscape || latest.current.escapeDisabled) return;
        e.preventDefault();
        latest.current.onEscape();
        return;
      }
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusable = getFocusable(containerRef.current);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      const outside = !containerRef.current.contains(current);
      if (e.shiftKey && (current === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // The opener may have been removed (e.g. a deleted row) - only restore
      // focus if it is still connected to the document.
      if (trigger?.isConnected) trigger.focus();
    };
  }, [active, containerRef, initialFocusRef]);
}
