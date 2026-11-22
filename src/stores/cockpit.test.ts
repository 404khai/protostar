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
