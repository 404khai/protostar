import { useId, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Minus, Plus } from "lucide-react";

/** A native keyboard slider with relative pointer travel, not click-to-seek. */
export function RotaryDial({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  icon,
  display,
  valueText,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  icon: ReactNode;
  display: ReactNode;
  valueText: string;
}) {
  const hintId = useId();
  const drag = useRef<{ id: number; y: number; value: number } | null>(null);
  const setValue = (next: number) =>
    onChange(Math.min(max, Math.max(min, min + Math.round((next - min) / step) * step)));
  return (
    <div className="dial-control">
      <div className="dial-label">{icon}<span>{label}</span></div>
      <div className="dial-row">
        <button
          className="dial-step"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => setValue(value - step)}
        >
          <Minus size={14} />
        </button>
        <div className="knob-wrap">
          <div
            className="knob"
            aria-hidden="true"
            style={{ "--rotation": `${-135 + ((value - min) / (max - min)) * 270}deg` } as CSSProperties}
          >
            <i /><span>{display}</span>
          </div>
          <input
            aria-label={label}
            aria-valuetext={valueText}
            aria-describedby={hintId}
            aria-orientation="vertical"
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            onPointerDown={(event) => {
              if (!event.isPrimary || event.button !== 0) return;
              // Suppress the native range's absolute seek on contact.
              event.preventDefault();
              event.currentTarget.focus({ preventScroll: true });
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { id: event.pointerId, y: event.clientY, value };
            }}
            onPointerMove={(event) => {
              const start = drag.current;
              if (start?.id !== event.pointerId) return;
              setValue(start.value + ((start.y - event.clientY) / 180) * (max - min));
            }}
            onPointerUp={(event) => {
              if (drag.current?.id !== event.pointerId) return;
              drag.current = null;
              event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={() => { drag.current = null; }}
            onLostPointerCapture={() => { drag.current = null; }}
            onBlur={() => { drag.current = null; }}
          />
        </div>
        <button
          className="dial-step"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => setValue(value + step)}
        >
          <Plus size={14} />
        </button>
      </div>
      <span className="hardware-footnote" id={hintId}>Drag ↕ · Arrow keys to fine-tune</span>
    </div>
  );
}
