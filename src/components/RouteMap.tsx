import { ArrowUpRight, Flag, MapPin } from "lucide-react";
import { useCockpit } from "../stores/cockpit";

export default function RouteMap({ expanded = false }: { expanded?: boolean }) {
  const distance = useCockpit((state) => state.world.distance);
  return (
    <div className={`route-map ${expanded ? "expanded" : ""}`}>
      <div className="map-heading">
        <span>THE SCENIC ROUTE</span>
        <span>N ↑</span>
      </div>
      <svg
        viewBox="0 0 320 280"
        role="img"
        aria-label="Simulated loop route along Observatory Drive"
      >
        <rect width="320" height="280" fill="#e6e9df" />
        <path d="M238 -10 Q185 60 253 100 T268 300H330V-10Z" fill="#c7dad7" />
        <path
          d="M0 43H230M0 102H250M0 167H252M0 229H250M50 0V280M118 0V280M186 0V280"
          stroke="#f8f8f1"
          strokeWidth="12"
          fill="none"
        />
        <path
          d="M0 43H230M0 102H250M0 167H252M0 229H250M50 0V280M118 0V280M186 0V280"
          stroke="#cbd0c4"
          strokeWidth="0.7"
          fill="none"
        />
        <path
          d="M118 227V44H186V227Z"
          stroke="#6e9e8e"
          strokeWidth="9"
          strokeLinejoin="round"
          fill="none"
          opacity=".18"
        />
        <path
          d="M118 227V44H186V227Z"
          stroke="#548a78"
          strokeWidth="3"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M280 0Q209 70 281 126T302 280"
          fill="none"
          stroke="#8bbdb8"
          strokeWidth="1"
        />
        <g fill="#717c71" fontSize="7" fontFamily="sans-serif">
          <text x="11" y="89">
            NORTH QUARTER
          </text>
          <text x="133" y="150" transform="rotate(-90 133 150)">
            OBSERVATORY DR.
          </text>
          <text x="201" y="199">
            COASTAL PARK
          </text>
          <text x="12" y="258">
            PROSPECT BAY
          </text>
        </g>
        <g transform={`translate(118 ${220 - ((distance % 720) / 720) * 165})`}>
          <circle r="13" fill="#fff" />
          <circle r="9" fill="#325b4a" />
          <path d="M0 -5L4 5L0 3L-4 5Z" fill="#fff" />
        </g>
        <circle
          cx="186"
          cy="44"
          r="5"
          fill="#325b4a"
          stroke="#fff"
          strokeWidth="3"
        />
      </svg>
      <div className="map-destination">
        <MapPin size={17} />
        <span>
          Observatory loop
          <small>
            {Math.max(0, 720 - distance).toFixed(0)} m remaining · Simulated
            route
          </small>
        </span>
        <ArrowUpRight size={20} />
      </div>
      {expanded && (
        <div className="route-details">
          <div>
            <Flag size={16} />
            <span>A drive, not a destination.</span>
          </div>
          <p>
            A continuous 720 m test loop with moving traffic, a pedestrian
            crossing and three lanes to explore.
          </p>
        </div>
      )}
    </div>
  );
}
