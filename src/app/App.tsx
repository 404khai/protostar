import { useEffect, useState } from "react";
import {
  ArrowUp,
  BatteryMedium,
  Check,
  ChevronDown,
  CloudRain,
  Crosshair,
  Expand,
  Eye,
  HelpCircle,
  Layers3,
  Maximize2,
  Moon,
  Navigation2,
  Pause,
  Play,
  Settings2,
  Sun,
  X,
} from "lucide-react";
import { startSimulation, useCockpit } from "../stores/cockpit";
import {
  DrivingControls,
  HardwareDeck,
  useDrivingKeys,
} from "../components/Controls";
import InstrumentCluster from "../components/InstrumentCluster";
import RouteMap from "../components/RouteMap";
import RealityView from "../reality/RealityView";
import type { CameraMode } from "../simulation/engine";

function BrandMark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 2v36M2 20h36M7.3 7.3l25.4 25.4M7.3 32.7L32.7 7.3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M20 8l3.2 8.8L32 20l-8.8 3.2L20 32l-3.2-8.8L8 20l8.8-3.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);
  return (
    <time>
      {time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </time>
  );
}

function LiveStatus() {
  const battery = useCockpit((state) => Math.floor(state.world.battery));
  const night = useCockpit((state) => state.night);
  const weather = useCockpit((state) => state.weather);
  return (
    <div className="live-status">
      <span>
        <BatteryMedium size={19} />
        {battery}%
      </span>
      <span>
        {weather === "Rain" ? (
          <CloudRain size={17} />
        ) : night ? (
          <Moon size={17} />
        ) : (
          <Sun size={17} />
        )}
        18°
        <small>
          {weather === "Rain" ? "Rain" : night ? "Night" : "Clear skies"}
        </small>
      </span>
      <i />
      <Clock />
    </div>
  );
}

function VehiclePanel() {
  const controls = useCockpit((state) => state.controls);
  const night = useCockpit((state) => state.night);
  const perception = useCockpit((state) => state.perception);
  const hud = useCockpit((state) => state.hud);
  const state = useCockpit.getState();
  return (
    <section className="vehicle-panel" aria-label="Vehicle settings">
      <div className="panel-heading">
        <span className="micro-label">MAKE IT YOURS</span>
        <h2>Precisely your way.</h2>
        <p>P.01 · Dual motor · 82 kWh</p>
      </div>
      <div className="vehicle-side">
        <svg
          viewBox="0 0 360 130"
          aria-label="Protostar electric vehicle side profile"
        >
          <path
            d="M22 89L31 67L86 58L129 30H232L278 60L326 71L340 91V104H22Z"
            fill="#bfc7c1"
            stroke="#7a8980"
          />
          <path d="M107 58L137 36H224L258 59Z" fill="#3b504d" />
          <path
            d="M181 36V59M30 77H72M297 78H331"
            stroke="#e9f1e9"
            strokeWidth="3"
          />
          <circle cx="88" cy="100" r="22" fill="#343f3a" />
          <circle cx="88" cy="100" r="12" fill="#a6b1a7" />
          <circle cx="277" cy="100" r="22" fill="#343f3a" />
          <circle cx="277" cy="100" r="12" fill="#a6b1a7" />
        </svg>
      </div>
      <div className="vehicle-specs">
        <span>
          Dual motor<strong>AWD</strong>
        </span>
        <span>
          Battery<strong>82 kWh</strong>
        </span>
        <span>
          Drive mode<strong>{controls.driveMode}</strong>
        </span>
      </div>
      <div className="settings-list">
        {[
          {
            label: "Night environment",
            detail: "A quieter kind of light",
            value: night,
            key: "night",
          },
          {
            label: "Perception overlay",
            detail: "See what the simulation sees",
            value: perception,
            key: "perception",
          },
          {
            label: "Heads-up guidance",
            detail: "Only what matters",
            value: hud,
            key: "hud",
          },
        ].map((item) => (
          <button
            key={item.key}
            className="setting-row"
            role="switch"
            aria-checked={item.value}
            onClick={() =>
              state.toggle(item.key as "night" | "perception" | "hud")
            }
          >
            <span>
              {item.label}
              <small>{item.detail}</small>
            </span>
            <i className={`toggle ${item.value ? "on" : ""}`} />
          </button>
        ))}
      </div>
      <p className="settings-note">
        Driving dynamics are simulated. Cabin settings are local to this
        session.
      </p>
    </section>
  );
}

function Help({ close }: { close: () => void }) {
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        className="help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="icon-button modal-close"
          aria-label="Close driving guide"
          onClick={close}
          autoFocus
        >
          <X size={20} />
        </button>
        <span className="micro-label">MEET YOUR PROTOSTAR</span>
        <h2 id="help-title">Take the long way.</h2>
        <p>
          Start a demo drive, or select D and take the wheel. Everything you see
          responds to the same vehicle state.
        </p>
        <dl>
          <div>
            <dt>
              <kbd>W</kbd> / <kbd>↑</kbd>
            </dt>
            <dd>Accelerate</dd>
          </div>
          <div>
            <dt>
              <kbd>S</kbd> / <kbd>↓</kbd> / <kbd>Space</kbd>
            </dt>
            <dd>Brake</dd>
          </div>
          <div>
            <dt>
              <kbd>A</kbd> <kbd>D</kbd> / <kbd>←</kbd> <kbd>→</kbd>
            </dt>
            <dd>Steer</dd>
          </div>
          <div>
            <dt>
              <kbd>Q</kbd> / <kbd>E</kbd>
            </dt>
            <dd>Turn signals</dd>
          </div>
        </dl>
        <p className="help-note">
          Stop before changing gears. Manual input cancels demo cruise. The
          simulator brakes for traffic and the pedestrian crossing.
        </p>
        <button className="primary-button" onClick={close}>
          Understood <Check size={16} />
        </button>
      </section>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<"Reality View" | "Navigation" | "Vehicle">(
    "Reality View",
  );
  const [help, setHelp] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const camera = useCockpit((state) => state.camera);
  const night = useCockpit((state) => state.night);
  const perception = useCockpit((state) => state.perception);
  const weather = useCockpit((state) => state.weather);
  const hud = useCockpit((state) => state.hud);
  const controls = useCockpit((state) => state.controls);
  const warning = useCockpit((state) => state.world.warning);
  const signalDistance = useCockpit((state) =>
    Math.max(0, Math.round(state.world.signalDistance)),
  );
  const state = useCockpit.getState();
  useDrivingKeys();
  useEffect(() => startSimulation(), []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelp(false);
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  const cameras: CameraMode[] = ["Follow", "Overhead", "Driver", "Orbit"];
  return (
    <div
      className={`app-shell ${night ? "night" : ""} ${expanded ? "immersive" : ""}`}
    >
      <header className="app-header">
        <a
          className="brand"
          href="#"
          aria-label="Protostar home"
          onClick={(event) => {
            event.preventDefault();
            setTab("Reality View");
          }}
        >
          <BrandMark />
          <span>PROTOSTAR</span>
        </a>
        <div className="header-description">
          <span>P.01</span>
          <i /> THE DIGITAL COCKPIT
        </div>
        <div className="header-right">
          <LiveStatus />
          <button
            className="profile-button"
            title="Open vehicle settings"
            aria-label="Open vehicle settings"
            onClick={() =>
              setTab(tab === "Vehicle" ? "Reality View" : "Vehicle")
            }
          >
            <Settings2 size={19} />
          </button>
        </div>
      </header>
      <main className="cockpit-display">
        {!expanded && <InstrumentCluster />}
        <section className="infotainment" aria-label="Infotainment display">
          <div className="display-toolbar">
            <div className="display-title">
              <span className="micro-label">
                CONNECTED TO YOUR SURROUNDINGS
              </span>
              <h1>{tab}</h1>
            </div>
            <nav className="display-tabs" aria-label="Cockpit views">
              {(["Reality View", "Navigation", "Vehicle"] as const).map(
                (item) => (
                  <button
                    key={item}
                    className={tab === item ? "active" : ""}
                    aria-current={tab === item ? "page" : undefined}
                    onClick={() => setTab(item)}
                  >
                    {item}
                  </button>
                ),
              )}
            </nav>
            <button
              className="icon-button help"
              aria-label="Driving guide"
              onClick={() => setHelp(true)}
            >
              <HelpCircle size={19} />
            </button>
          </div>
          <div
            className={`scene-container ${tab !== "Reality View" ? "split-view" : ""}`}
          >
            <div className="scene-canvas">
              <RealityView />
            </div>
            <div className="scene-topline">
              <div className="world-tag">
                <span className="live-indicator" />
                LIVE SCENE
                <span className="world-divider" />
                PROSPECT BAY
              </div>
              <div className="scene-actions">
                <button
                  className={`icon-button ${perception ? "active" : ""}`}
                  title="Toggle perception overlay"
                  aria-label="Toggle perception overlay"
                  aria-pressed={perception}
                  onClick={() => state.toggle("perception")}
                >
                  <Layers3 size={17} />
                </button>
                <button
                  className="icon-button"
                  title={expanded ? "Exit immersive view" : "Immersive view"}
                  aria-label={
                    expanded ? "Exit immersive view" : "Immersive view"
                  }
                  aria-pressed={expanded}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <Maximize2 size={17} /> : <Expand size={17} />}
                </button>
              </div>
            </div>
            {hud && (
              <div className="navigation-cue">
                <div className="direction-icon">
                  <ArrowUp size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <strong>
                    {signalDistance > 0 ? signalDistance : "—"} <small>m</small>
                  </strong>
                  <span>Continue straight</span>
                  <small>Observatory Drive</small>
                </div>
                <Navigation2 size={16} className="navigation-mini" />
              </div>
            )}
            <div className="scene-description">
              <span className="coordinate-mark">+</span>
              <div>
                <span>Reality, thoughtfully rendered.</span>
                <small>Simulated perception · All systems connected</small>
              </div>
            </div>
            {warning && (
              <div className="warning-message" role="status">
                <Eye size={16} />
                {warning}
              </div>
            )}
            {controls.paused && (
              <div className="paused-message">
                <Pause size={18} />
                Simulation paused
              </div>
            )}
            <div className="camera-switch" aria-label="Camera perspectives">
              <Crosshair size={15} />
              {cameras.map((item) => (
                <button
                  key={item}
                  className={camera === item ? "active" : ""}
                  aria-pressed={camera === item}
                  onClick={() => state.setCamera(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="environment-switch">
              <button
                aria-label="Toggle day and night"
                title="Toggle day and night"
                onClick={() => state.toggle("night")}
              >
                {night ? <Moon size={17} /> : <Sun size={17} />}
                <ChevronDown size={12} />
              </button>
              <i />
              <button
                className={weather === "Rain" ? "active" : ""}
                title="Toggle rain"
                aria-label="Toggle rain"
                aria-pressed={weather === "Rain"}
                onClick={() =>
                  state.setWeather(weather === "Rain" ? "Clear" : "Rain")
                }
              >
                <CloudRain size={18} />
              </button>
            </div>
            {tab !== "Reality View" && (
              <div className="context-panel">
                {tab === "Navigation" ? (
                  <RouteMap expanded />
                ) : (
                  <VehiclePanel />
                )}
              </div>
            )}
          </div>
          <div className="drive-bar">
            <DrivingControls />
            <div className="drive-actions">
              <button
                className="icon-button pause-button"
                onClick={state.pause}
                aria-label={
                  controls.paused ? "Resume simulation" : "Pause simulation"
                }
              >
                {controls.paused ? <Play size={17} /> : <Pause size={17} />}
              </button>
              <button
                className={`primary-button ${controls.cruise ? "cruising" : ""}`}
                onClick={state.drive}
              >
                {controls.cruise ? (
                  <>
                    <Pause size={14} />
                    End demo drive
                  </>
                ) : (
                  <>
                    <Play size={14} fill="currentColor" />
                    Start demo drive
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>
      {!expanded && <HardwareDeck />}
      <div className="app-bottomline">
        <span>
          PROTOSTAR OS <b>0.1</b>
        </span>
        <span>EXPERIMENTAL COCKPIT · SIMULATED DRIVING ENVIRONMENT</span>
        <span>BUILT TO FEEL DIFFERENT.</span>
      </div>
      {help && <Help close={() => setHelp(false)} />}
    </div>
  );
}
