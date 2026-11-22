import { expect, it, vi } from "vitest";
import { containDialogFocus } from "./dialogFocus";

function fixture(count = 2) {
  const document = Object.assign(new EventTarget(), { activeElement: null as unknown });
  const element = () => {
    const item = { isConnected: true, focus: () => { document.activeElement = item; } };
    return item;
  };
  const opener = element();
  opener.focus();
  const items = Array.from({ length: count }, element);
  const dialog = Object.assign(element(), {
    ownerDocument: document,
    querySelectorAll: () => items,
    contains: (item: unknown): boolean => item === dialog || items.includes(item as typeof opener),
  });
  const close = vi.fn();
  const cleanup = containDialogFocus(dialog as unknown as HTMLElement, close);
  const key = (value: string, shiftKey = false) => {
    const event = new Event("keydown", { cancelable: true });
    Object.assign(event, { key: value, shiftKey });
    document.dispatchEvent(event);
    return event;
  };
  return { document, dialog, opener, items, close, cleanup, key };
}

it("focuses the first control, wraps both ways, and restores the opener", () => {
  const f = fixture();
  expect(f.document.activeElement).toBe(f.items[0]);
  expect(f.key("Tab").defaultPrevented).toBe(false);
  expect(f.key("Tab", true).defaultPrevented).toBe(true);
  expect(f.document.activeElement).toBe(f.items[1]);
  expect(f.key("Tab").defaultPrevented).toBe(true);
  expect(f.document.activeElement).toBe(f.items[0]);
  expect(f.key("Escape").defaultPrevented).toBe(true);
  expect(f.close).toHaveBeenCalledTimes(1);
  f.cleanup();
  expect(f.document.activeElement).toBe(f.opener);
  f.key("Escape");
  expect(f.close).toHaveBeenCalledTimes(1);
});

it("contains focus even with no focusable controls", () => {
  const f = fixture(0);
  expect(f.document.activeElement).toBe(f.dialog);
  expect(f.key("Tab").defaultPrevented).toBe(true);
  expect(f.key("Tab", true).defaultPrevented).toBe(true);
  expect(f.document.activeElement).toBe(f.dialog);
  f.cleanup();
});

it("recaptures escaped focus and handles a disconnected opener on cleanup", () => {
  const f = fixture();
  f.opener.focus();
  const event = new Event("focusin");
  Object.defineProperty(event, "target", { value: f.opener });
  f.document.dispatchEvent(event);
  expect(f.document.activeElement).toBe(f.items[0]);
  f.opener.isConnected = false;
  f.cleanup();
  expect(f.document.activeElement).toBe(f.items[0]);
});
