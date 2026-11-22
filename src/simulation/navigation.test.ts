import { describe, expect, it } from "vitest";
import { createWorld, stepWorld, type Controls } from "./engine";
import { routeGuidance } from "./navigation";

describe("guidance on the straight, wrapping test road", () => {
  it("guides to the crossing, then to the restart without a blank distance", () => {
    expect(routeGuidance(0, "D", "green")).toMatchObject({
      distance: 250,
      instruction: "Crossing ahead",
      toRestart: 720,
    });
    expect(routeGuidance(242, "D", "red")).toMatchObject({
      distance: 8,
      instruction: "Stop for crossing",
    });
    expect(routeGuidance(250, "D", "green").distance).toBe(0);
    expect(routeGuidance(251, "D", "green")).toMatchObject({
      distance: 469,
      instruction: "Loop restart ahead",
    });
    expect(routeGuidance(719, "D", "green").distance).toBe(1);
    expect(routeGuidance(720, "D", "green")).toMatchObject({
      distance: 250,
      position: 0,
    });
  });

  it("faces backward and picks the next landmark in reverse, including the boundary", () => {
    expect(routeGuidance(300, "R", "green")).toMatchObject({
      distance: 50,
      reverse: true,
      instruction: "Reverse · crossing",
    });
    expect(routeGuidance(200, "R", "green")).toMatchObject({
      distance: 200,
      instruction: "Reverse · loop restart",
    });
    expect(routeGuidance(0, "R", "green").distance).toBe(0);
    expect(routeGuidance(-1, "R", "green")).toMatchObject({
      distance: 469,
      position: 719,
    });
  });

  it("stays synchronized with simulation snapshots across the crossing and wrap", () => {
    const controls: Controls = {
      throttle: 0,
      brake: 0,
      steering: 0,
      gear: "D",
      driveMode: "Touring",
      cruise: false,
      paused: false,
    };
    for (const distance of [249.9, 719.9]) {
      const world = { ...createWorld(), distance, speed: 10, traffic: [] };
      const next = stepWorld(world, controls, 1 / 30);
      const guidance = routeGuidance(next.distance, controls.gear, next.signal);
      expect(guidance.position).toBeCloseTo(next.distance);
      if (distance < 250)
        expect(guidance.instruction).toBe("Loop restart ahead");
      else {
        expect(guidance.instruction).toBe("Crossing ahead");
        expect(guidance.distance).toBe(Math.ceil(next.signalDistance));
      }
    }
  });
});
