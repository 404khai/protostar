import { Flag, MapPin } from "lucide-react";
import { useCockpit } from "../stores/cockpit";
import { CROSSING_DISTANCE, LOOP_LENGTH } from "../simulation/engine";
import RouteGuidance from "./RouteGuidance";
import { useRouteGuidance } from "../stores/useRouteGuidance";

export default function RouteMap({ expanded = false }: { expanded?: boolean }) {
  const guidance = useRouteGuidance();
  const x = useCockpit((state) => state.world.x);
  const signal = useCockpit((state) => state.world.signal);
  const mapY = (distance: number) => 246 - (distance / LOOP_LENGTH) * 216;
  return (
    <div className={`route-map ${expanded ? "expanded" : ""}`}>
      <div className="map-heading">
        <span>TEST ROAD · SCHEMATIC</span>
        <span>{LOOP_LENGTH} M</span>
      </div>
      <svg
        viewBox="0 0 320 280"
        role="img"
        aria-label={`Straight wrapping test road. Vehicle at ${Math.round(guidance.position)} metres; crossing at ${CROSSING_DISTANCE} metres.`}
      >
        <rect width="320" height="280" fill="#e6e9df" />
        <path d="M250 -10 Q218 75 267 130 T278 290H330V-10Z" fill="#c7dad7" />
        <path d="M150 30V246" stroke="#f8f8f1" strokeWidth="64" />
        <path
          d="M140 30V246M160 30V246"
          stroke="#cbd0c4"
          strokeDasharray="7 6"
        />
        <path d="M150 246V30" stroke="#548a78" strokeWidth="3" opacity=".5" />
        <path
          d="M183 30H215V246H183"
          stroke="#8b9890"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        />
        <g fill="#717c71" fontSize="8" fontFamily="sans-serif">
          <text x="13" y="34">
            {LOOP_LENGTH} M · RESTART
          </text>
          <text x="13" y="250">
            0 M · START
          </text>
          <text x="252" y="192" transform="rotate(-90 252 192)">
            PROSPECT BAY
          </text>
          <text x="232" y="177" transform="rotate(-90 232 177)">
            WRAPS TO START
          </text>
          <text x="111" y="228" transform="rotate(-90 111 228)">
            OBSERVATORY DR.
          </text>
          <text x="13" y={mapY(CROSSING_DISTANCE) - 7}>
            CROSSING
          </text>
          <text x="13" y={mapY(CROSSING_DISTANCE) + 6}>
            {CROSSING_DISTANCE} M
          </text>
        </g>
        <g
          transform={`translate(120 ${mapY(CROSSING_DISTANCE) - 6})`}
          fill="#a7b4a8"
        >
          {[0, 10, 20, 30, 40, 50].map((offset) => (
            <rect key={offset} x={offset} width="6" height="12" />
          ))}
        </g>
        <circle
          cx="191"
          cy={mapY(CROSSING_DISTANCE)}
          r="4"
          fill={signal === "red" ? "#b4574e" : "#548a78"}
        />
        <g
          transform={`translate(${150 + x * 4} ${mapY(guidance.position)}) rotate(${guidance.reverse ? 180 : 0})`}
        >
          <circle r="13" fill="#fff" />
          <circle r="9" fill="#325b4a" />
          <path d="M0 -5L4 5L0 3L-4 5Z" fill="#fff" />
        </g>
      </svg>
      <div className="map-destination">
        <MapPin size={17} />
        <span>
          Observatory test loop
          <small>
            {guidance.toRestart} m to restart ·{" "}
            {guidance.reverse ? "Reverse" : "Forward"}
          </small>
        </span>
      </div>
      {expanded && (
        <div className="route-details">
          <RouteGuidance />
          <div className="route-caption">
            <Flag size={16} />
            <span>A drive, not a destination.</span>
          </div>
          <p>
            A straight {LOOP_LENGTH} m road with three lanes and a pedestrian
            crossing. The scene wraps at the end; no turns are required. This
            schematic follows the same vehicle position as Reality View.
          </p>
        </div>
      )}
    </div>
  );
}
