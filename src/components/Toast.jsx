import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Toast.css';

export function Toast({ toast, onDismiss }) {
  const ref = useRef(null);
  const [displayToast, setDisplayToast] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const displayToastRef = useRef(null);
  // Prevents the beforetoggle listener from intercepting our own hidePopover()
  // call inside handleAnimationEnd.
  const isManagedCloseRef = useRef(false);

  // Single exit entry-point. All dismiss paths converge here.
  const startExit = useCallback(() => {
    setIsExiting(true);
  }, []);

  // Show the popover when a toast arrives; trigger exit when it's cleared.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (toast) {
      setIsExiting(false);
      setDisplayToast(toast);
      displayToastRef.current = toast;
      el.showPopover();
    } else if (displayToastRef.current) {
      startExit();
    }
  }, [toast, startExit]);

  // Intercept browser-initiated closes (click outside, Escape) so we can
  // animate before the popover hides. toast is included in deps so the
  // listener is (re)attached whenever the element mounts.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleBeforeToggle(event) {
      if (event.newState !== 'closed' || isManagedCloseRef.current) return;
      event.preventDefault();
      startExit();
    }

    el.addEventListener('beforetoggle', handleBeforeToggle);
    return () => el.removeEventListener('beforetoggle', handleBeforeToggle);
  }, [toast, startExit]);

  function handleAnimationEnd(event) {
    if (event.animationName !== 'toast-exit') return;
    isManagedCloseRef.current = true;
    ref.current?.hidePopover();
    isManagedCloseRef.current = false;
    onDismiss();
    setDisplayToast(null);
    displayToastRef.current = null;
    setIsExiting(false);
  }

  const content = toast || displayToast;
  if (!content) return null;

  const role = content.type === 'error' ? 'alert' : 'status';

  return (
    <div
      ref={ref}
      popover="auto"
      role={role}
      className={`toast toast--${content.type}${isExiting ? ' toast--exiting' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <p className="toast__message">{content.message}</p>
      <button
        className="toast__dismiss"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}
