import { useCockpit } from "../stores/cockpit";

export function bindDrivingKeys(target: Window, onParkedAccelerate: () => void) {
  const pressed = new Set<string>();
  let shifting = false;
  const drivingKeys = new Set([
    "w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright", " ",
  ]);
  const sync = () =>
    useCockpit.getState().setInput({
      throttle: pressed.has("w") || pressed.has("arrowup") ? 1 : 0,
      brake: pressed.has("s") || pressed.has("arrowdown") || pressed.has(" ") ? 1 : 0,
      steering:
        (pressed.has("d") || pressed.has("arrowright") ? 1 : 0) -
        (pressed.has("a") || pressed.has("arrowleft") ? 1 : 0),
    });
  const keydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const element = event.target as Element | null;
    if (element?.closest?.(
      'input, select, textarea, [role="slider"], [contenteditable]:not([contenteditable="false"])',
    )) return;
    if (
      [" ", "Enter"].includes(event.key) && element?.closest?.(
        'button, a[href], summary, [role="button"], [role="switch"], [role="checkbox"], [role="radio"], [role="tab"], [tabindex]:not(canvas)',
      )
    ) return;
    const key = event.key.toLowerCase();
    if (event.repeat && drivingKeys.has(key) && !pressed.has(key) && !(key === "d" && shifting)) {
      event.preventDefault();
      return;
    }
    const { controls, gear } = useCockpit.getState();
    if (key === "d" && (controls.gear === "P" || shifting)) {
      event.preventDefault();
      if (!event.repeat) gear("D");
      shifting = true;
      return;
    }
    if ((key === "w" || key === "arrowup") && controls.gear === "P") {
      event.preventDefault();
      if (!event.repeat) onParkedAccelerate();
      return;
    }
    if (drivingKeys.has(key)) {
      event.preventDefault();
      pressed.add(key);
      sync();
    }
    if (!event.repeat && key === "q") useCockpit.getState().signal("left");
    if (!event.repeat && key === "e") useCockpit.getState().signal("right");
  };
  const keyup = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === "d") shifting = false;
    if (pressed.delete(event.key.toLowerCase())) sync();
  };
  const clear = () => {
    shifting = false;
    pressed.clear();
    const { controls, setInput } = useCockpit.getState();
    if (controls.throttle || controls.brake || controls.steering)
      setInput({ throttle: 0, brake: 0, steering: 0 });
  };
  const visibility = () => {
    if (target.document.hidden) clear();
  };
  target.addEventListener("keydown", keydown);
  target.addEventListener("keyup", keyup);
  target.addEventListener("blur", clear);
  target.document.addEventListener("visibilitychange", visibility);
  return () => {
    target.removeEventListener("keydown", keydown);
    target.removeEventListener("keyup", keyup);
    target.removeEventListener("blur", clear);
    target.document.removeEventListener("visibilitychange", visibility);
    clear();
  };
}
