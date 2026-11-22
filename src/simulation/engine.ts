/** Pure, renderer-independent, deterministic driving simulation. SI units internally. */
export type Gear = "P" | "R" | "N" | "D";
export type DriveMode = "Range" | "Touring" | "Sport";
export type Signal = "left" | "right" | null;
export type CameraMode = "Follow" | "Overhead" | "Driver" | "Orbit";
export type Weather = "Clear" | "Rain";
export interface TrafficVehicle {
  id: number;
  x: number;
  distance: number;
  speed: number;
  color: string;
  van: boolean;
}
export interface World {
  speed: number;
  distance: number;
  tripDistance: number;
  x: number;
  heading: number;
  battery: number;
  elapsed: number;
  power: number;
  traffic: TrafficVehicle[];
  warning: string | null;
  signal: "green" | "red";
  signalDistance: number;
  pedestrianX: number;
}
export interface Controls {
  throttle: number;
  brake: number;
  steering: number;
  gear: Gear;
  driveMode: DriveMode;
  cruise: boolean;
  paused: boolean;
}
export const ROAD_HALF_WIDTH = 5.65;
export const LOOP_LENGTH = 720;
export const CROSSING_DISTANCE = 250;
export const rangeFor = (battery: number) => Math.round(battery * 4.35);
export const relativeDistance = (distance: number, origin: number) =>
  ((((distance - origin + LOOP_LENGTH / 2) % LOOP_LENGTH) + LOOP_LENGTH) %
    LOOP_LENGTH) -
  LOOP_LENGTH / 2;

export function createWorld(): World {
  return {
    speed: 0,
    distance: 0,
    tripDistance: 0,
    x: 0,
    heading: 0,
    battery: 82,
    elapsed: 0,
    power: 0,
    warning: null,
    signal: "green",
    signalDistance: CROSSING_DISTANCE,
    pedestrianX: -10,
    traffic: [
      { id: 0, x: -3.7, distance: 30, speed: 12, color: "#879b99", van: false },
      { id: 1, x: 0, distance: 68, speed: 14, color: "#d8dbd9", van: false },
      { id: 2, x: 3.7, distance: 115, speed: 10, color: "#8c9298", van: true },
      {
        id: 3,
        x: -3.7,
        distance: 210,
        speed: 15,
        color: "#a9b3bd",
        van: false,
      },
      { id: 4, x: 3.7, distance: 310, speed: 13, color: "#c9c2b5", van: false },
      { id: 5, x: 0, distance: 430, speed: 12, color: "#849392", van: true },
      {
        id: 6,
        x: -3.7,
        distance: 530,
        speed: 16,
        color: "#b6b6b1",
        van: false,
      },
    ],
  };
}

export function stepWorld(
  previous: World,
  controls: Controls,
  delta: number,
): World {
  if (controls.paused) return previous;
  const dt = Math.min(Math.max(delta, 0), 0.05);
  const world = {
    ...previous,
    traffic: previous.traffic.map((vehicle) => ({ ...vehicle })),
  };
  world.elapsed += dt;
  world.warning = null;
  world.signal = world.elapsed % 32 < 23 ? "green" : "red";
  world.signalDistance = relativeDistance(CROSSING_DISTANCE, world.distance);
  world.pedestrianX =
    world.signal === "red" ? -8 + (((world.elapsed % 32) - 23) / 9) * 16 : -10;

  // Vehicles slow for the crossing, as well as for another car in their lane.
  for (const vehicle of world.traffic) {
    const stopDistance = relativeDistance(CROSSING_DISTANCE - 4, vehicle.distance);
    const stoppingDistance = (vehicle.speed * vehicle.speed) / (2 * 5) + 8;
    let gap = previous.traffic.reduce((nearest, other) => {
      const distance = relativeDistance(other.distance, vehicle.distance);
      return other.id !== vehicle.id &&
        Math.abs(other.x - vehicle.x) < 2 &&
        distance > 0
        ? Math.min(nearest, distance)
        : nearest;
    }, Infinity);
    const egoDistance = relativeDistance(previous.distance, vehicle.distance);
    if (Math.abs(previous.x - vehicle.x) < 2 && egoDistance > 0)
      gap = Math.min(gap, egoDistance);
    if (world.signal === "red" && stopDistance > 0)
      gap = Math.min(gap, stopDistance);
    const stopping = gap < stoppingDistance;
    const target = stopping ? 0 : 10 + (vehicle.id % 4) * 2;
    vehicle.speed = Math.max(
      0,
      vehicle.speed +
        Math.max(-5 * dt, Math.min(1.6 * dt, target - vehicle.speed)),
    );
    // Enforce a minimum centre-to-centre gap even after a sudden cut-in.
    const travel = Math.min(vehicle.speed * dt, Math.max(0, gap - 6));
    if (travel < vehicle.speed * dt) vehicle.speed = travel / dt;
    vehicle.distance = (vehicle.distance + travel) % LOOP_LENGTH;
  }

  const direction = controls.gear === "R" ? -1 : 1;
  const inGear = controls.gear === "D" || controls.gear === "R";
  const acceleration = { Range: 2.2, Touring: 3.3, Sport: 5.4 }[
    controls.driveMode
  ];
  const maxSpeed =
    controls.gear === "R" ? 3 : controls.driveMode === "Sport" ? 38 : 30;
  const targetCruise = 50 / 3.6;
  const throttle =
    controls.cruise && inGear && controls.brake === 0
      ? Math.max(0, Math.min(1, (targetCruise - world.speed) * 0.8))
      : controls.throttle;
  let dv = inGear && world.battery > 0 ? throttle * acceleration : 0;
  if (world.speed > 0) dv -= 0.24 + world.speed * 0.014;
  dv -= controls.brake * 8;
  if (controls.gear === "P") dv -= 12;

  const closest = world.traffic.reduce((gap, vehicle) => {
    const distance =
      relativeDistance(vehicle.distance, world.distance) * direction;
    return Math.abs(vehicle.x - world.x) < 1.9 && distance > 0
      ? Math.min(gap, distance)
      : gap;
  }, Infinity);
  const crossingAhead =
    world.signal === "red" && world.signalDistance > 0 && direction > 0;
  const stoppingGap = crossingAhead
    ? Math.min(closest - 5, world.signalDistance - 8)
    : closest - 5;
  if (stoppingGap < (world.speed * world.speed) / 10 + 8 && world.speed > 0) {
    dv = Math.min(dv, -6);
    world.warning =
      crossingAhead && world.signalDistance - 8 < closest - 5
        ? "Stopping for crossing"
        : "Traffic ahead · braking";
  }
  world.speed = Math.max(0, Math.min(maxSpeed, world.speed + dv * dt));
  if (stoppingGap < 0.5) {
    world.speed = 0;
    world.warning = crossingAhead
      ? "Pedestrian crossing"
      : "Safe distance hold";
  }
  world.heading += (controls.steering * 0.34 - world.heading * 2) * dt;
  world.x += Math.sin(world.heading) * world.speed * dt * direction;
  if (Math.abs(world.x) > ROAD_HALF_WIDTH) {
    world.x = Math.sign(world.x) * ROAD_HALF_WIDTH;
    world.heading = 0;
    world.speed = Math.max(0, world.speed - 8 * dt);
    world.warning = "Road edge · steer to centre";
  }
  const travelled = world.speed * dt;
  world.tripDistance += travelled;
  world.distance =
    (world.distance + travelled * direction + LOOP_LENGTH) % LOOP_LENGTH;
  world.signalDistance = relativeDistance(CROSSING_DISTANCE, world.distance);
  const consumption = travelled * (0.00036 + throttle * 0.00012);
  const recovered = controls.brake > 0 && world.speed > 0 ? dt * 0.0009 : 0;
  world.battery = Math.max(
    0,
    Math.min(100, world.battery - consumption + recovered),
  );
  world.power =
    world.speed > 0
      ? dv < -0.5
        ? Math.max(-65, dv * world.speed * 1.8)
        : throttle * acceleration * world.speed * 2 + 2
      : 0;
  return world;
}
