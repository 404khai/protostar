# Protostar — Automotive Cockpit Simulator

## 1. Project Overview

**Protostar** is a fictional electric vehicle (EV) brand with a next-generation digital cockpit and interactive driving simulation.

The project aims to recreate the experience of sitting inside a modern electric vehicle, with a fully interactive automotive interface comprising:

- A 3D driving visualization (Reality View).
- A digital instrument cluster.
- A central infotainment display.
- A heads-up display (HUD).
- Vehicle controls and settings.
- Navigation, media and climate controls.
- Battery, charging and energy management.

The initial implementation will be a **web-based desktop application**, with the possibility of evolving into a standalone automotive software platform.

### Core Direction

Build a complete automotive cockpit simulator, prioritizing the 3D Reality View and surrounding environment.

The project should feel like an actual vehicle interface rather than a conventional web dashboard.

---

# 2. Product Vision

Protostar should simulate an entire electric vehicle's digital experience.

The application will have multiple interconnected displays that share the same underlying vehicle state.

For example, when the simulated vehicle accelerates:

- The digital speedometer updates.
- The 3D vehicle accelerates.
- Surrounding traffic responds appropriately.
- Energy consumption changes.
- The HUD reflects the current speed.
- Navigation continues to operate.

All displays must remain synchronized.

## Primary Interfaces

### 2.1 Reality View

The primary engineering priority.

A real-time 3D visualization of the vehicle's surroundings, inspired by Tesla's Reality View and autonomous-driving visualizations.

Features:

- 3D vehicle representation.
- Procedurally generated roads.
- Multiple road lanes.
- Surrounding vehicles.
- Pedestrians.
- Traffic lights.
- Lane markings.
- Road boundaries.
- Obstacle visualization.
- Virtual overhead camera.
- Third-person follow camera.
- First-person driving camera.
- Navigation path visualization.
- Vehicle movement and steering.
- Day/night environments.
- Weather conditions.
- Different visualization modes.

The visualization should communicate the simulated vehicle's perception of its environment.

Importantly, the initial implementation will use simulated perception data rather than actual autonomous-driving sensors.

### 2.2 Digital Instrument Cluster

A dedicated driver-facing instrument display.

Features:

- Large digital speedometer.
- Speed in km/h.
- Battery percentage.
- Estimated remaining range.
- Current gear (P, R, N, D).
- Driving mode.
- Regenerative braking indicator.
- Speed limit.
- Turn indicators.
- Warning notifications.
- Energy consumption.
- Trip information.

Potential themes:

- Minimal.
- Performance.
- Detailed.

### 2.3 Central Infotainment Display

The primary interaction surface.

Features:

- Reality View.
- Navigation.
- Media player.
- Climate controls.
- Vehicle settings.
- Battery and charging information.
- Phone connectivity.
- Quick controls.
- System settings.

Supported layouts:

- Full-screen Reality View.
- Reality View + Navigation split-screen.
- Full navigation.
- Media interface.
- Vehicle controls.
- Charging interface.

Persistent interface elements:

- Top status bar.
- Main content area.
- Bottom navigation dock.
- Quick-access controls.

### 2.4 Heads-Up Display (HUD)

A simulated windshield projection interface.

Features:

- Current speed.
- Navigation directions.
- Distance to next turn.
- Lane guidance.
- Speed limits.
- Collision warnings.
- Relevant driving notifications.

The HUD should prioritize minimal information and avoid unnecessary visual clutter.

### 2.5 Vehicle Controls

Interactive controls for:

- Acceleration.
- Braking.
- Steering.
- Gear selection.
- Driving modes.
- Turn signals.
- Headlights.
- Climate.
- Door locking.
- Seat heating.
- Regenerative braking.

---

# 3. Technology Stack

The initial version will be web-based.

## Frontend

| Technology   | Purpose                                  |
| ------------ | ---------------------------------------- |
| React        | Component-based application architecture |
| TypeScript   | Type safety                              |
| Vite         | Development and build tooling            |
| Tailwind CSS | Utility-based styling                    |
| Custom CSS   | Automotive interface styling             |
| Motion       | UI transitions and animations            |
| Zustand      | Shared application and vehicle state     |
| Lucide       | Interface icons                          |

## 3D Rendering

| Technology        | Purpose                                    |
| ----------------- | ------------------------------------------ |
| Three.js          | 3D rendering engine                        |
| React Three Fiber | React integration for Three.js             |
| Drei              | 3D helpers, cameras, lighting and controls |
| GLTF / GLB        | 3D asset formats                           |

## Navigation and Mapping

| Technology          | Purpose              |
| ------------------- | -------------------- |
| MapLibre GL JS      | Interactive maps     |
| OpenStreetMap       | Geographic data      |
| Custom route engine | Simulated navigation |

## Simulation

Initially implemented in TypeScript.

Potential future technologies:

- Rust for computationally intensive simulation.
- Axum for backend services.
- WebSockets for real-time telemetry.

**Do not introduce a backend prematurely.** The first version should run locally in the browser.

---

# 4. System Architecture

The simulation must be independent of the UI and rendering layers.

```text
                PROTOSTAR
                    |
          Vehicle Simulation
                    |
        +-----------+-----------+
        |           |           |
     Vehicle     Environment  Traffic
      State       State       State
        |           |           |
        +-----------+-----------+
                    |
              Shared State
                    |
          Application Interface
                    |
       +------------+------------+
       |            |            |
    Reality      Instrument     HUD
     View         Cluster
       |
    Three.js
       |
  3D Environment
```

## Shared Vehicle State

Example telemetry:

```json
{
  "speed": 85,
  "battery": 78,
  "range": 342,
  "gear": "D",
  "steeringAngle": 12,
  "brakePressed": false,
  "turnSignal": "left",
  "driveMode": "comfort"
}
```

The same state should drive every relevant interface.

## Simulation Entities

Each entity should have independent simulation data.

Examples:

- Vehicle.
- Other vehicles.
- Pedestrians.
- Traffic lights.
- Road segments.
- Lane boundaries.
- Obstacles.

Entities should have appropriate properties such as:

- Position.
- Rotation.
- Velocity.
- Classification.
- Dimensions.
- Current state.

The rendering engine should consume simulation data rather than own simulation logic.

---

# 5. Reality View Engineering

This is the most important part of the initial implementation.

## 5.1 Environment

Create a simulated driving environment containing:

- Multi-lane roads.
- Road intersections.
- Lane markings.
- Road boundaries.
- Other vehicles.
- Pedestrians.
- Traffic lights.
- Static obstacles.

Start with a controlled environment before attempting a large open world.

## 5.2 Vehicle

Implement:

- 3D electric vehicle model.
- Acceleration.
- Deceleration.
- Steering.
- Braking.
- Vehicle rotation.
- Lane positioning.
- Basic collision detection.

## 5.3 Cameras

Support:

1. Overhead virtual camera.
2. Third-person follow camera.
3. First-person driving camera.
4. Free camera for inspection.

Camera transitions should be smooth.

## 5.4 Traffic Simulation

Implement:

- Multiple moving vehicles.
- Different vehicle sizes.
- Lane following.
- Basic traffic behavior.
- Traffic light responses.
- Pedestrian movement.
- Basic collision avoidance.

## 5.5 Visualization Modes

Potential modes:

- Standard Reality View.
- Minimal visualization.
- Detailed perception visualization.
- Night visualization.
- Weather visualization.

## 5.6 Simulated Perception

Eventually, introduce a perception layer that exposes:

- Detected object positions.
- Object classifications.
- Object dimensions.
- Object velocities.
- Detection confidence.
- Lane boundaries.
- Traffic signals.

This should be independent of the renderer so actual perception-model output could eventually replace simulated data.

---

# 6. Design Direction

Protostar should have a distinctive automotive design language.

## Visual Identity

- Dark-first interface.
- Charcoal and near-black surfaces.
- Electric blue accent colour.
- Clean, legible typography.
- Minimal visual clutter.
- Fluid animations.
- Premium automotive styling.
- Edge-to-edge layouts.

## Design References

Study the following automotive interfaces:

- Tesla: Reality View and driving visualization.
- Rivian: Infotainment and interaction design.
- Lucid Motors: Premium digital cockpit.
- Porsche: Driver instrument cluster.
- Mercedes-Benz: Large-scale infotainment integration.

Use these as references, not templates to copy.

## Display Targets

Desktop-first development.

Initial targets:

- 1920 × 1080.
- 2560 × 1440.
- 3440 × 1440 ultrawide.

The interface should adapt to different screen dimensions.

---

# 7. Proposed Repository Structure

```text
protostar/
│
├── public/
│   ├── models/
│   │   ├── vehicle/
│   │   ├── traffic/
│   │   └── environment/
│   ├── textures/
│   └── audio/
│
├── src/
│   ├── app/
│   │
│   ├── components/
│   │   ├── cockpit/
│   │   ├── instrument-cluster/
│   │   ├── infotainment/
│   │   ├── hud/
│   │   └── controls/
│   │
│   ├── reality/
│   │   ├── world/
│   │   ├── vehicle/
│   │   ├── traffic/
│   │   ├── pedestrians/
│   │   ├── cameras/
│   │   └── rendering/
│   │
│   ├── simulation/
│   │   ├── vehicle/
│   │   ├── environment/
│   │   ├── physics/
│   │   └── telemetry/
│   │
│   ├── stores/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── styles/
│
├── package.json
└── README.md
```

---

# 8. Development Roadmap

## Milestone 1 — Cockpit Foundation

- Initialize React, TypeScript and Vite.
- Establish the design system.
- Build the main infotainment layout.
- Implement application navigation.
- Establish shared vehicle state.
- Create the basic instrument cluster layout.

## Milestone 2 — Reality View

- Integrate Three.js and React Three Fiber.
- Create the 3D environment.
- Implement road geometry.
- Add the vehicle model.
- Implement camera perspectives.
- Add basic environment lighting.

## Milestone 3 — Vehicle Simulation

- Implement acceleration.
- Implement braking.
- Implement steering.
- Implement gear selection.
- Implement vehicle movement.
- Synchronize vehicle telemetry.

## Milestone 4 — Surrounding Environment

- Add surrounding vehicles.
- Add traffic behavior.
- Add pedestrians.
- Add traffic lights.
- Add lane markings.
- Add basic collision detection.

## Milestone 5 — Instrument Cluster

- Implement speedometer.
- Implement battery indicator.
- Implement estimated range.
- Implement gear indicator.
- Implement driving modes.
- Implement warning indicators.

## Milestone 6 — Infotainment

- Navigation.
- Media player.
- Climate controls.
- Vehicle settings.
- Charging information.
- Energy consumption.

## Milestone 7 — HUD

- Dedicated HUD interface.
- Navigation guidance.
- Speed display.
- Lane guidance.
- Driving notifications.

## Milestone 8 — Complete Cockpit

- Synchronize all displays.
- Add display-specific configurations.
- Implement full-screen modes.
- Add split-screen layouts.
- Improve transitions.
- Optimize rendering performance.

---

# 9. Initial Playable Demo

The first meaningful prototype should allow someone to:

1. Open Protostar in a desktop browser.
2. Enter the driving interface.
3. See a 3D electric vehicle in a simulated environment.
4. Accelerate and brake.
5. Steer the vehicle.
6. See other vehicles and road markings.
7. Switch between camera perspectives.
8. Watch the digital speedometer update.
9. See battery and range information.
10. Observe synchronized changes across the interface.

## Initial Performance Goals

- Target 60 FPS on supported desktop hardware.
- Avoid unnecessary React re-renders during 3D animation.
- Keep simulation updates independent of UI rendering.
- Use efficient 3D models and instancing where appropriate.
- Support lower-performance devices through reduced rendering quality.

---

# 10. Engineering Principles

1. Build the simulation independently of the UI.
2. Keep vehicle state centralized.
3. Avoid tightly coupling Three.js components to business logic.
4. Keep the initial architecture modular.
5. Avoid introducing unnecessary backend infrastructure.
6. Prioritize the Reality View before expanding secondary features.
7. Use real 3D assets where possible rather than relying entirely on primitive shapes.
8. Keep rendering and simulation performance in mind from the beginning.
9. Make all vehicle displays consume the same underlying state.
10. Build an actual interactive simulator, not a collection of static dashboard mockups.

## Important Scope Boundary

Protostar initially simulates an electric vehicle and its digital cockpit.

It is not an actual autonomous-driving system, safety-certified instrument cluster, or production-ready automotive operating system.

All driving, perception and environmental behavior will initially be simulated.

---

# 11. First Development Objective

**Build the Protostar Reality View and establish the cockpit foundation.**

Do not attempt to implement every feature simultaneously.

The first deliverable should be a polished, interactive 3D driving environment with:

- A recognizable electric vehicle.
- A road environment.
- Surrounding traffic.
- Camera controls.
- Basic vehicle physics.
- Live telemetry.
- A connected digital instrument cluster.

The goal is to establish the core experience that the rest of the Protostar cockpit will build upon.
