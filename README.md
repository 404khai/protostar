# Protostar

A precision-minimal electric cockpit with a playable 3D **Reality View**. Built with React, TypeScript, Vite, Three.js / React Three Fiber and Zustand. No backend, map API key, external model download or account is required.

## Run

Requires Node.js **22.12+** and npm.

```sh
npm ci
npm run dev
```

Open the address Vite prints (normally `http://localhost:5173`). A desktop browser with WebGL / hardware acceleration is recommended. Touch controls and stacked layouts are available on smaller screens.

```sh
npm run check     # TypeScript
npm test          # deterministic simulation and state tests
npm run build    # production build
npm run preview  # serve dist on port 4173
```

## Take a drive

- **Start demo drive** selects D and accelerates toward 50 km/h. Manual driving input cancels cruise.
- For manual driving, select **D** while stopped, then hold **W / ↑** to accelerate, **S / ↓ / Space** to brake, and **A / D / ← / →** to steer. On-screen pedals also support press-and-hold.
- **Q / E** toggle turn signals. Stop before selecting P, R or N. Reverse is limited to walking speed.
- Switch **Follow, Overhead, Driver and Orbit** cameras. Drag / scroll in Orbit to inspect the scene.
- Toggle day/night, rain, perception boxes or immersive mode. Pause and reset are next to the driving controls.
- Navigation shows the fictional **720 m Observatory loop**, not real-world directions.
- The machined-style cabin deck provides temperature, volume, drive-mode and suspension preferences. Temperature / volume / suspension are local simulated cabin settings, not hardware or audio output. Drive mode changes acceleration and top speed.

## What's here

- Locally authored 3D electric vehicles, three-lane road, procedural architecture, trees, traffic lights and a moving pedestrian.
- Moving traffic with basic following, crossing response and proximity braking for the ego vehicle.
- Acceleration, regenerative braking telemetry, steering, road-edge containment, gear interlock and battery / range estimation.
- Synchronized cluster, guidance, environment and cockpit controls.
- A renderer-independent, deterministic TypeScript engine driven by a fixed-step clock; the 3D scene reads shared state rather than owning vehicle physics.

```text
src/simulation/   Pure world model and step function (metres, seconds, m/s)
src/stores/       Shared state, input actions and simulation clock
src/reality/      Three.js environment, vehicle geometry and camera rigs
src/components/  Cluster, route view and tactile controls
src/app/         Integrated cockpit shell
src/styles/      Material language and responsive layouts
```

## Scope

This is a fictional cockpit simulator, not an autonomous-driving system. Traffic behavior and perception are simulated. The straight road wraps on a controlled test loop; the route diagram is illustrative. Physics, proximity avoidance, battery usage and regenerative energy are simplified. Vehicle geometry is authored in this repository and uses no third-party vehicle model.

Future work includes a curved / branching road network, model assets, richer collision geometry and audio / media integration. See [AGENTS.md](AGENTS.md) for the product direction, design language and spatial naming vocabulary, and [references/](references/) for the supplied inspiration.
