import { create } from "zustand";
import { createWorld, stepWorld } from "../simulation/engine";
import type {
  CameraMode,
  Controls,
  DriveMode,
  Gear,
  Signal,
  Weather,
  World,
} from "../simulation/engine";

interface CockpitState {
  world: World;
  controls: Controls;
  camera: CameraMode;
  weather: Weather;
  night: boolean;
  perception: boolean;
  turnSignal: Signal;
  temperature: number;
  volume: number;
  suspension: "Comfort" | "Balanced" | "Firm";
  hud: boolean;
  setInput: (
    input: Partial<Pick<Controls, "throttle" | "brake" | "steering">>,
  ) => void;
  gear: (gear: Gear) => void;
  mode: (mode: DriveMode) => void;
  setCamera: (camera: CameraMode) => void;
  setWeather: (weather: Weather) => void;
  toggle: (key: "night" | "perception" | "hud") => void;
  signal: (signal: Signal) => void;
  setTemperature: (value: number) => void;
  setVolume: (value: number) => void;
  setSuspension: (value: CockpitState["suspension"]) => void;
  drive: () => void;
  pause: () => void;
  reset: () => void;
  tick: (dt: number) => void;
}
const initialControls: Controls = {
  throttle: 0,
  brake: 0,
  steering: 0,
  gear: "P",
  driveMode: "Touring",
  cruise: false,
  paused: false,
};
export const useCockpit = create<CockpitState>((set, get) => ({
  world: createWorld(),
  controls: { ...initialControls },
  camera: "Follow",
  weather: "Clear",
  night: false,
  perception: false,
  turnSignal: null,
  temperature: 21,
  volume: 35,
  suspension: "Balanced",
  hud: true,
  // Only engaging an input takes over from demo cruise; releases (key up, blur) do not.
  setInput: (input) =>
    set((state) => ({
      controls: {
        ...state.controls,
        ...input,
        cruise: state.controls.cruise && !Object.values(input).some(Boolean),
      },
    })),
  gear: (gear) => {
    if (get().world.speed > 0.5) return;
    set((state) => ({
      controls: { ...state.controls, gear, throttle: 0, cruise: false },
    }));
  },
  mode: (driveMode) =>
    set((state) => ({ controls: { ...state.controls, driveMode } })),
  setCamera: (camera) => set({ camera }),
  setWeather: (weather) => set({ weather }),
  toggle: (key) => set((state) => ({ [key]: !state[key] })),
  signal: (signal) =>
    set((state) => ({
      turnSignal: state.turnSignal === signal ? null : signal,
    })),
  setTemperature: (temperature) =>
    set({ temperature: Math.min(28, Math.max(16, temperature)) }),
  setVolume: (volume) => set({ volume: Math.min(100, Math.max(0, volume)) }),
  setSuspension: (suspension) => set({ suspension }),
  drive: () => {
    if (get().controls.gear !== "D" && get().world.speed > 0.5) return;
    set((state) => ({
      controls: {
        ...state.controls,
        gear: "D",
        cruise: !state.controls.cruise,
        paused: false,
      },
    }));
  },
  pause: () =>
    set((state) => ({
      controls: {
        ...state.controls,
        paused: !state.controls.paused,
        throttle: 0,
        brake: 0,
        steering: 0,
      },
    })),
  reset: () =>
    set({
      world: createWorld(),
      controls: { ...initialControls },
      turnSignal: null,
    }),
  tick: (dt) =>
    set((state) => ({ world: stepWorld(state.world, state.controls, dt) })),
}));

/** Fixed step clock runs outside the React renderer. Background tabs do not catch up. */
export function startSimulation() {
  let frame = 0;
  let previous = performance.now();
  let accumulator = 0;
  const update = (now: number) => {
    accumulator += Math.min((now - previous) / 1000, 0.1);
    previous = now;
    while (accumulator >= 1 / 30) {
      useCockpit.getState().tick(1 / 30);
      accumulator -= 1 / 30;
    }
    frame = requestAnimationFrame(update);
  };
  frame = requestAnimationFrame(update);
  return () => cancelAnimationFrame(frame);
}
