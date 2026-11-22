import {
  CROSSING_DISTANCE,
  LOOP_LENGTH,
  type Gear,
  type World,
} from "./engine";

export const routePosition = (distance: number) =>
  ((distance % LOOP_LENGTH) + LOOP_LENGTH) % LOOP_LENGTH;

/** The world is a straight road that wraps, not a route with geometric turns. */
export function routeGuidance(
  distance: number,
  gear: Gear,
  signal: World["signal"],
) {
  const position = routePosition(distance);
  const reverse = gear === "R";
  const crossing = (CROSSING_DISTANCE - position) * (reverse ? -1 : 1);
  const toRestart = reverse ? position : LOOP_LENGTH - position;
  const nextCrossing = crossing >= 0 && crossing < toRestart;
  return {
    position,
    reverse,
    toRestart: Math.ceil(toRestart),
    distance: Math.ceil(nextCrossing ? crossing : toRestart),
    instruction: nextCrossing
      ? reverse
        ? "Reverse · crossing"
        : signal === "red"
          ? "Stop for crossing"
          : "Crossing ahead"
      : reverse
        ? "Reverse · loop restart"
        : "Loop restart ahead",
    detail: nextCrossing
      ? signal === "red"
        ? "Pedestrians crossing · red signal"
        : "Observatory Drive · green signal"
      : "Straight test road · no turn needed",
  };
}
