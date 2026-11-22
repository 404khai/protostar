import { describe, expect, it } from "vitest";
import { createWorld, relativeDistance, stepWorld } from "./engine";
import type { Controls } from "./engine";

const controls: Controls = {
  throttle: 1,
  brake: 0,
  steering: 0,
  gear: "D",
  driveMode: "Touring",
  cruise: false,
  paused: false,
};
const advance = (seconds: number, input: Controls, initial = createWorld()) => {
  let world = initial;
  for (let i = 0; i < seconds * 30; i++)
    world = stepWorld(world, input, 1 / 30);
  return world;
};

describe("independent driving simulation", () => {
  it("stays parked despite throttle and preserves paused state", () => {
    expect(advance(3, { ...controls, gear: "P" }).speed).toBe(0);
    const world = createWorld();
    expect(stepWorld(world, { ...controls, paused: true }, 1)).toBe(world);
  });
  it("accelerates, consumes energy, steers and brakes to a stop", () => {
    const moving = advance(2, controls);
    expect(moving.speed).toBeGreaterThan(5);
    expect(moving.distance).toBeGreaterThan(0);
    expect(moving.battery).toBeLessThan(82);
    const steered = advance(1, { ...controls, steering: 1 }, moving);
    expect(steered.x).toBeGreaterThan(0);
    const braking = stepWorld(
      steered,
      { ...controls, throttle: 0, brake: 1 },
      1 / 30,
    );
    expect(braking.power).toBeLessThan(0);
    expect(
      advance(3, { ...controls, throttle: 0, brake: 1 }, braking).speed,
    ).toBe(0);
  });
  it("changes dynamics by driving mode and caps reverse speed", () => {
    expect(
      advance(2, { ...controls, driveMode: "Sport" }).speed,
    ).toBeGreaterThan(advance(2, { ...controls, driveMode: "Range" }).speed);
    const reverse = advance(10, { ...controls, gear: "R" });
    expect(reverse.speed).toBeLessThanOrEqual(3);
    expect(reverse.distance).toBeGreaterThan(600);
  });
  it("keeps the car inside road boundaries", () => {
    const world = advance(20, { ...controls, steering: -1 });
    expect(Math.abs(world.x)).toBeLessThanOrEqual(5.65);
  });
  it("holds a safe gap rather than driving through traffic", () => {
    const world = createWorld();
    world.speed = 15;
    world.traffic = [
      { id: 0, x: 0, distance: 4, speed: 0, color: "#fff", van: false },
    ];
    const next = stepWorld(world, controls, 1 / 30);
    expect(next.speed).toBe(0);
    expect(next.warning).toBe("Safe distance hold");
  });
  it("keeps moving traffic behind a parked ego across multiple laps", () => {
    let world = createWorld();
    for (let i = 0; i < 90 * 30; i++) {
      world = stepWorld(world, { ...controls, gear: "P", throttle: 0 }, 1 / 30);
      for (const vehicle of world.traffic.filter(
        (vehicle) => vehicle.x === 0,
      )) {
        expect(
          Math.abs(relativeDistance(vehicle.distance, world.distance)),
        ).toBeGreaterThanOrEqual(5.99);
      }
    }
  });
  it("brakes for a red crossing and releases it on green", () => {
    const world = createWorld();
    world.elapsed = 25;
    world.distance = 243;
    const held = stepWorld(world, controls, 1 / 30);
    expect(held.speed).toBe(0);
    expect(held.signal).toBe("red");
    expect(held.warning).toBe("Pedestrian crossing");
    const released = stepWorld({ ...held, elapsed: 32 }, controls, 1 / 30);
    expect(released.speed).toBeGreaterThan(0);
  });
  it("wraps entities consistently and never mutates the input snapshot", () => {
    expect(relativeDistance(5, 715)).toBe(10);
    expect(relativeDistance(715, 5)).toBe(-10);
    const world = createWorld();
    const copy = structuredClone(world);
    const next = stepWorld(world, controls, 1 / 30);
    expect(world).toEqual(copy);
    expect(next.traffic[0].distance).toBeGreaterThan(world.traffic[0].distance);
  });
  it("accumulates trip distance independently of route wrap and reverse", () => {
    const world = createWorld();
    world.distance = 719;
    world.tripDistance = 719;
    world.speed = 10;
    world.traffic = [];
    const nextLap = advance(1, controls, world);
    expect(nextLap.distance).toBeLessThan(20);
    expect(nextLap.tripDistance).toBeGreaterThan(720);
    const reverse = advance(1, { ...controls, gear: "R" });
    expect(reverse.distance).toBeGreaterThan(710);
    expect(reverse.tripDistance).toBeGreaterThan(0);
    expect(reverse.tripDistance).toBeLessThan(3);
  });
});
