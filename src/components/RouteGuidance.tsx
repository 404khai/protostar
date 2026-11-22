import { ArrowDown, ArrowUp, Repeat2 } from "lucide-react";
import { useRouteGuidance } from "../stores/useRouteGuidance";

export default function RouteGuidance({
  className = "",
}: {
  className?: string;
}) {
  const guidance = useRouteGuidance();
  const Icon = guidance.reverse
    ? ArrowDown
    : guidance.instruction === "Loop restart ahead"
      ? Repeat2
      : ArrowUp;
  return (
    <div className={`route-guidance ${className}`} aria-label="Route guidance">
      <div className="direction-icon">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div>
        <strong>
          {guidance.distance} <small>m</small>
        </strong>
        <span>{guidance.instruction}</span>
        <small>{guidance.detail}</small>
      </div>
    </div>
  );
}
