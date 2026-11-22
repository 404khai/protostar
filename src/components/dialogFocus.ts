export function containDialogFocus(dialog: HTMLElement, close: () => void) {
  const document = dialog.ownerDocument;
  const opener = document.activeElement as HTMLElement | null;
  const focusable = () => Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ),
  );
  const focusFirst = () => (focusable()[0] ?? dialog).focus();
  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
    if (event.key !== "Tab") return;
    const items = focusable();
    const first = items[0] ?? dialog;
    const last = items[items.length - 1] ?? dialog;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  };
  const focusin = (event: FocusEvent) => {
    if (!dialog.contains(event.target as Node)) focusFirst();
  };
  document.addEventListener("keydown", keydown, true);
  document.addEventListener("focusin", focusin);
  focusFirst();
  return () => {
    document.removeEventListener("keydown", keydown, { capture: true });
    document.removeEventListener("focusin", focusin);
    if (opener?.isConnected) opener.focus();
  };
}
