import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  BatteryMedium,
  Gauge,
  Leaf,
  Navigation,
} from "lucide-react";
import { useCockpit } from "../stores/cockpit";
import { rangeFor } from "../simulation/engine";

export default function InstrumentCluster() {
  const world = useCockpit((state) => state.world);
  const controls = useCockpit((state) => state.controls);
  const signal = useCockpit((state) => state.turnSignal);
  const state = useCockpit.getState();
  return (
    <aside
      className="instrument-cluster"
      aria-label="Digital instrument cluster"
    >
      <div className="cluster-top">
        <span className="micro-label">P.01 / DUAL MOTOR</span>
        <span className="cluster-ready">
          <i />
          READY
        </span>
      </div>
      <div className="gear-row" aria-label="Gear selection">
        {(["P", "R", "N", "D"] as const).map((gear) => (
          <button
            key={gear}
            aria-label={`Select ${gear} gear`}
            aria-pressed={controls.gear === gear}
            disabled={world.speed > 0.5}
            onClick={() => state.gear(gear)}
            className={controls.gear === gear ? "active" : ""}
          >
            {gear}
          </button>
        ))}
      </div>
      <div className="speed-area">
        <div className="signal-row">
          <button
            className={signal === "left" ? "signal-on" : ""}
            aria-pressed={signal === "left"}
            aria-label="Left turn signal"
            onClick={() => state.signal("left")}
          >
            <ArrowLeft size={21} />
          </button>
          <span>{controls.driveMode}</span>
          <button
            className={signal === "right" ? "signal-on" : ""}
            aria-pressed={signal === "right"}
            aria-label="Right turn signal"
            onClick={() => state.signal("right")}
          >
            <ArrowRight size={21} />
          </button>
        </div>
        <div className="speed-number" data-testid="speed">
          {Math.round(world.speed * 3.6)
            .toString()
            .padStart(2, "0")}
        </div>
        <div className="speed-unit">km/h</div>
        <div className="speed-limit">
          <span>50</span>
          <small>SPEED LIMIT</small>
        </div>
      </div>
      <div className="energy-status">
        <span>
          <Leaf size={14} />
          {world.power < -1
            ? "Regenerating energy"
            : controls.gear === "P"
              ? "Ready when you are"
              : controls.cruise
                ? "Demo cruise active"
                : "All-electric. All yours."}
        </span>
        <div className="power-track">
          <i
            style={{ width: `${Math.min(100, Math.abs(world.power))}%` }}
            className={world.power < 0 ? "regen" : ""}
          />
        </div>
        <div className="power-labels">
          <span>REGEN</span>
          <span>{Math.abs(Math.round(world.power))} kW</span>
          <span>POWER</span>
        </div>
      </div>
      <div className="range-grid">
        <div>
          <span>
            <BatteryMedium size={16} /> Battery
          </span>
          <strong>
            {Math.floor(world.battery)}
            <small>%</small>
          </strong>
          <div className="battery-track">
            <i style={{ width: `${world.battery}%` }} />
          </div>
        </div>
        <div>
          <span>
            <Navigation size={13} /> Range
          </span>
          <strong>
            {rangeFor(world.battery)}
            <small>km</small>
          </strong>
          <p>Estimated</p>
        </div>
      </div>
      <div className="cluster-bottom">
        <div>
          <Gauge size={17} />
          <span>
            Since departure
            <strong>
              {(world.tripDistance / 1000).toFixed(2)} <small>km</small>
            </strong>
          </span>
        </div>
        <span className="drive-symbol">
          <ArrowDownLeft size={18} />
        </span>
      </div>
      <div className="cluster-note">A NEW PERSPECTIVE ON MOTION</div>
    </aside>
  );
}
