import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useCockpit } from "../stores/cockpit";
import { bindDrivingKeys } from "./drivingKeys";

let target: Window;
let cleanup: () => void;
let hint = vi.fn<() => void>();

beforeEach(() => {
  useCockpit.getState().reset();
  target = Object.assign(new EventTarget(), {
    document: Object.assign(new EventTarget(), { hidden: false }),
  }) as unknown as Window;
  hint = vi.fn<() => void>();
  cleanup = bindDrivingKeys(target, hint);
});
afterEach(() => cleanup());

function key(type: string, value: string, options = {}, element?: string) {
  const event = new Event(type, { cancelable: true });
  Object.defineProperties(event, {
    key: { value },
    target: { value: { closest: (selector: string) => element && selector.includes(element) } },
  });
  Object.assign(event, options);
  target.dispatchEvent(event);
  return event;
}

it("hints on parked acceleration, shifts with D, then retains WASD steering", () => {
  key("keydown", "w");
  key("keydown", "ArrowUp", { repeat: true });
  expect(hint).toHaveBeenCalledTimes(1);
  expect(useCockpit.getState().controls.throttle).toBe(0);
  key("keydown", "d");
  key("keydown", "d", { repeat: true });
  expect(useCockpit.getState().controls.gear).toBe("D");
  expect(useCockpit.getState().controls.steering).toBe(0);
  key("keyup", "d");
  key("keydown", "d");
  key("keydown", "w");
  expect(useCockpit.getState().controls).toMatchObject({ steering: 1, throttle: 1 });
  key("keyup", "d");
  key("keyup", "w");
  expect(useCockpit.getState().controls).toMatchObject({ steering: 0, throttle: 0 });
});

it("reserves Space for interactive controls but brakes on body and canvas", () => {
  useCockpit.getState().drive();
  for (const element of ["button", "a[href]", "summary", '[role="switch"]', "[tabindex]"]) {
    expect(key("keydown", " ", {}, element).defaultPrevented).toBe(false);
    expect(useCockpit.getState().controls.brake).toBe(0);
  }
  expect(key("keydown", " ").defaultPrevented).toBe(true);
  expect(useCockpit.getState().controls.brake).toBe(1);
  key("keyup", " ");
  expect(useCockpit.getState().controls.brake).toBe(0);
});

it("leaves typing, sliders, modifier shortcuts and prevented events alone", () => {
  for (const element of ["input", "select", "textarea", '[role="slider"]', "[contenteditable]"]) {
    expect(key("keydown", "w", {}, element).defaultPrevented).toBe(false);
  }
  for (const modifier of ["altKey", "ctrlKey", "metaKey"]) {
    key("keydown", "d", { [modifier]: true });
  }
  expect(hint).not.toHaveBeenCalled();
  expect(useCockpit.getState().controls.gear).toBe("P");
  const event = new Event("keydown", { cancelable: true });
  event.preventDefault();
  target.dispatchEvent(event);
  expect(useCockpit.getState().controls.gear).toBe("P");
});

it("clears held input on blur, hidden document and suspension; removes handlers", () => {
  useCockpit.getState().gear("D");
  key("keydown", "w");
  target.dispatchEvent(new Event("blur"));
  expect(useCockpit.getState().controls.throttle).toBe(0);
  key("keydown", " ");
  Object.defineProperty(target.document, "hidden", { value: true });
  target.document.dispatchEvent(new Event("visibilitychange"));
  expect(useCockpit.getState().controls.brake).toBe(0);
  key("keydown", "a");
  cleanup();
  for (const value of ["w", "ArrowUp", " ", "q", "e"]) key("keydown", value);
  expect(useCockpit.getState().controls).toMatchObject({ throttle: 0, brake: 0, steering: 0 });
  expect(useCockpit.getState().turnSignal).toBe(null);
});

it("does not cancel demo cruise when suspending idle keyboard handlers", () => {
  useCockpit.getState().drive();
  cleanup();
  expect(useCockpit.getState().controls.cruise).toBe(true);
});
