import { beforeEach, expect, it } from "vitest";
import { useCockpit } from "./cockpit";

beforeEach(() => useCockpit.getState().reset());
it("interlocks gear changes while moving and manual input cancels demo cruise", () => {
  const state = useCockpit.getState();
  state.drive();
  for (let i = 0; i < 60; i++) useCockpit.getState().tick(1 / 30);
  state.gear("R");
  expect(useCockpit.getState().controls.gear).toBe("D");
  state.setInput({ brake: 1 });
  expect(useCockpit.getState().controls.cruise).toBe(false);
});
it("reset returns all driving telemetry to a stationary safe state", () => {
  const state = useCockpit.getState();
  state.drive();
  state.signal("left");
  state.tick(1 / 30);
  state.reset();
  expect(useCockpit.getState().controls.gear).toBe("P");
  expect(useCockpit.getState().world.speed).toBe(0);
  expect(useCockpit.getState().world.battery).toBe(82);
  expect(useCockpit.getState().turnSignal).toBe(null);
});
it("demo start cannot change reverse gear while the car is moving", () => {
  const state = useCockpit.getState();
  state.gear("R");
  state.setInput({ throttle: 1 });
  for (let i = 0; i < 60; i++) useCockpit.getState().tick(1 / 30);
  expect(useCockpit.getState().world.speed).toBeGreaterThan(0.5);
  state.drive();
  expect(useCockpit.getState().controls.gear).toBe("R");
  expect(useCockpit.getState().controls.cruise).toBe(false);
  state.setInput({ throttle: 0, brake: 1 });
  for (let i = 0; i < 60; i++) useCockpit.getState().tick(1 / 30);
  state.drive();
  expect(useCockpit.getState().controls.gear).toBe("D");
});
it("releasing inputs keeps demo cruise while engaging one takes over", () => {
  const state = useCockpit.getState();
  state.drive();
  state.setInput({ throttle: 0, brake: 0, steering: 0 });
  expect(useCockpit.getState().controls.cruise).toBe(true);
  state.setInput({ steering: -1 });
  expect(useCockpit.getState().controls.cruise).toBe(false);
});
