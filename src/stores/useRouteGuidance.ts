import { useCockpit } from "./cockpit";
import { routeGuidance } from "../simulation/navigation";

export function useRouteGuidance() {
  const distance = useCockpit((state) => state.world.distance);
  const gear = useCockpit((state) => state.controls.gear);
  const signal = useCockpit((state) => state.world.signal);
  return routeGuidance(distance, gear, signal);
}
