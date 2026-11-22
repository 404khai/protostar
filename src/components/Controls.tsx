import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Gauge,
  RotateCcw,
  SlidersHorizontal,
  Snowflake,
  Volume1,
  VolumeX,
} from "lucide-react";
import { useCockpit } from "../stores/cockpit";
import { RotaryDial } from "./RotaryDial";
import { bindDrivingKeys } from "./drivingKeys";

export function useDrivingKeys(enabled = true) {
  const [parkedHint, setParkedHint] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const cleanup = bindDrivingKeys(window, () => {
      setParkedHint(true);
      clearTimeout(timer);
      timer = setTimeout(() => setParkedHint(false), 4000);
    });
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [enabled]);
  return parkedHint;
}

function HoldButton({
  label,
  children,
  input,
  value,
  className = "",
}: {
  label: string;
  children: ReactNode;
  input: "throttle" | "brake" | "steering";
  value: number;
  className?: string;
}) {
  const active = useRef(false);
  const release = () => {
    if (active.current) {
      active.current = false;
      useCockpit.getState().setInput({ [input]: 0 });
    }
  };
  return (
    <button
      className={`hold-button ${className}`}
      aria-label={label}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        active.current = true;
        useCockpit.getState().setInput({ [input]: value });
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          active.current = true;
          useCockpit.getState().setInput({ [input]: value });
        }
      }}
      onKeyUp={release}
      onBlur={release}
    >
      {children}
    </button>
  );
}

export function DrivingControls({ parkedHint = false }: { parkedHint?: boolean }) {
  const controls = useCockpit((state) => state.controls);
  const reset = useCockpit((state) => state.reset);
  return (
    <div className="driving-controls">
      <div className="control-caption">
        <span className="tiny-dot" />{" "}
        <span role="status">
          {controls.gear === "P"
            ? parkedHint
              ? "Shift to D to drive (press D)"
              : "Select D to drive · press D"
            : controls.cruise
              ? "Demo cruise · 50 km/h"
              : "You’re in control"}
        </span>
        <span className="keyboard-hint">WASD / ↑↓←→</span>
      </div>
      <div className="pedals">
        <HoldButton label="Steer left" input="steering" value={-1}>
          <ArrowLeft size={17} />
        </HoldButton>
        <HoldButton label="Steer right" input="steering" value={1}>
          <ArrowRight size={17} />
        </HoldButton>
        <span className="pedal-separator" />
        <HoldButton
          label="Hold to brake"
          input="brake"
          value={1}
          className={`pedal ${controls.brake ? "pressed" : ""}`}
        >
          <ArrowDown size={16} />
          <span>Brake</span>
          <kbd>S</kbd>
        </HoldButton>
        <HoldButton
          label="Hold to accelerate"
          input="throttle"
          value={1}
          className={`pedal accelerator ${controls.throttle ? "pressed" : ""}`}
        >
          <ArrowUp size={16} />
          <span>Accelerate</span>
          <kbd>W</kbd>
        </HoldButton>
        <button
          className="icon-button reset"
          onClick={reset}
          aria-label="Reset simulation"
          title="Reset simulation"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}

export function HardwareDeck() {
  const temperature = useCockpit((state) => state.temperature);
  const volume = useCockpit((state) => state.volume);
  const mode = useCockpit((state) => state.controls.driveMode);
  const suspension = useCockpit((state) => state.suspension);
  const state = useCockpit.getState();
  const modes = ["Range", "Touring", "Sport"] as const;
  const suspensions = ["Comfort", "Balanced", "Firm"] as const;
  return (
    <footer className="hardware-deck">
      <div className="hardware-caption">
        <span className="engraved">P / 01</span>
        <span>THE HUMAN ELEMENT</span>
        <span className="deck-screw" />
      </div>
      <div className="hardware-content">
        <RotaryDial
          label="Volume"
          value={volume}
          min={0}
          max={100}
          onChange={state.setVolume}
          icon={volume ? <Volume1 size={16} /> : <VolumeX size={16} />}
          display={volume === 0 ? "Off" : volume}
          valueText={volume === 0 ? "Off" : `${volume} percent`}
        />
        <RotaryDial
          label="Temperature"
          value={temperature}
          min={16}
          max={28}
          step={0.5}
          onChange={state.setTemperature}
          icon={<Snowflake size={16} />}
          valueText={`${temperature} degrees Celsius`}
          display={
            <>
              {temperature}
              <small>°</small>
            </>
          }
        />
        <div className="mode-control">
          <div className="dial-label">
            <Gauge size={16} />
            <span>Drive mode</span>
          </div>
          <div className="mode-row">
            <button
              className="mode-knob"
              aria-label="Cycle driving mode"
              title={`Drive mode: ${mode}. Press to cycle.`}
              style={{ "--rotation": `${(modes.indexOf(mode) - 1) * 65}deg` } as CSSProperties}
              onClick={() =>
                state.mode(modes[(modes.indexOf(mode) + 1) % modes.length])
              }
            >
              <i aria-hidden="true" />
            </button>
            <div className="mode-options">
              {modes.map((item) => (
                <button
                  key={item}
                  className={mode === item ? "selected" : ""}
                  aria-pressed={mode === item}
                  onClick={() => state.mode(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <span className="hardware-footnote">Press to turn · {mode.toLowerCase()}</span>
        </div>
        <div className="suspension-control">
          <div className="dial-label">
            <SlidersHorizontal size={16} />
            <span>Suspension</span>
          </div>
          <div
            className="mechanical-switch"
            role="group"
            aria-label="Suspension preference"
            style={{ "--position": suspensions.indexOf(suspension) } as CSSProperties}
          >
            <span className="switch-actuator" aria-hidden="true" />
            {suspensions.map((item) => (
              <button
                key={item}
                className={suspension === item ? "selected" : ""}
                aria-pressed={suspension === item}
                onClick={() => state.setSuspension(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="hardware-footnote">
            Cabin preference · {suspension.toLowerCase()}
          </span>
        </div>
        <div className="deck-statement">
          <span>Designed around you.</span>
          <small>Digital clarity. Mechanical soul.</small>
        </div>
      </div>
    </footer>
  );
}
