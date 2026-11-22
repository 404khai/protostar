import { Component, memo, Suspense, useLayoutEffect, useMemo, useRef } from "react";
import type { ComponentRef, ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Group, Vector3 } from "three";
import { useCockpit } from "../stores/cockpit";
import { relativeDistance } from "../simulation/engine";
import { Vehicle } from "./Vehicle";
import { Instanced } from "./Instanced";
import { cityInstances, laneInstances, rainInstances } from "./instances";
import { createQualityController } from "./quality";

const palette = { day: "#e9ede8", night: "#182329" };
const lookAt = new Vector3();
const cameraPosition = new Vector3();

function InspectionCamera() {
  const camera = useThree((state) => state.camera);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const previousX = useRef(0);
  useLayoutEffect(() => {
    const x = useCockpit.getState().world.x;
    previousX.current = x;
    // Never inherit the first-person camera's position inside the coachwork.
    camera.position.set(x + 8, 10, 16);
    controls.current?.target.set(x, 0.8, -1);
    controls.current?.update();
  }, [camera]);
  useFrame(() => {
    const x = useCockpit.getState().world.x;
    const deltaX = x - previousX.current;
    // Preserve the user's inspection angle and pan as the ego vehicle steers.
    camera.position.x += deltaX;
    if (controls.current) controls.current.target.x += deltaX;
    previousX.current = x;
  }, -2);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      minDistance={8}
      maxDistance={80}
      maxPolarAngle={Math.PI / 2 - 0.04}
    />
  );
}

function CameraRig() {
  const mode = useCockpit((state) => state.camera);
  const previousMode = useRef(mode);
  const target = useMemo(() => new Vector3(0, 0.5, -13), []);
  useFrame(({ camera }, dt) => {
    if (mode === "Orbit") return;
    if (previousMode.current !== mode) {
      camera.getWorldDirection(target);
      target.multiplyScalar(35).add(camera.position);
    }
    const state = useCockpit.getState();
    const x = state.world.x;
    if (mode === "Overhead") {
      cameraPosition.set(x, 46, 4);
      lookAt.set(x, 0, -13);
    } else if (mode === "Driver") {
      cameraPosition.set(x - 0.35, 1.9, -1.3);
      lookAt.set(x + Math.tan(state.world.heading) * 54, 1.4, -55);
    } else {
      // Keep the chase camera over the road, clear of roadside trees and
      // buildings even when the vehicle is steered to the right boundary.
      cameraPosition.set(Math.min(x + 12, 8), 13.5, 22);
      lookAt.set(x - 1, 0.5, -13);
    }
    camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 4));
    target.lerp(lookAt, 1 - Math.exp(-dt * 5));
    camera.lookAt(target);
    previousMode.current = mode;
  });
  // Track Orbit too, so leaving it blends from the actual inspection angle.
  useLayoutEffect(() => {
    if (mode === "Orbit") previousMode.current = mode;
  }, [mode]);
  return mode === "Orbit" ? <InspectionCamera /> : null;
}

function Road() {
  const lines = useRef<Group>(null);
  const crossing = useRef<Group>(null);
  const path = useRef<Group>(null);
  const night = useCockpit((state) => state.night);
  const weather = useCockpit((state) => state.weather);
  useFrame(() => {
    const { world } = useCockpit.getState();
    if (lines.current) lines.current.position.z = world.distance % 10;
    if (crossing.current) crossing.current.position.z = -world.signalDistance;
    if (path.current) path.current.position.x = world.x;
  });
  return (
    <group>
      <mesh position={[0, -0.17, -90]} receiveShadow>
        <boxGeometry args={[15, 0.3, 380]} />
        <meshStandardMaterial
          color={night ? "#343f44" : "#71807b"}
          roughness={weather === "Rain" ? 0.48 : 0.94}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 7.65, -0.03, -90]} receiveShadow>
            <boxGeometry args={[0.5, 0.24, 380]} />
            <meshStandardMaterial color={night ? "#52605e" : "#e0e2d9"} />
          </mesh>
          <mesh position={[side * 10.1, -0.08, -90]} receiveShadow>
            <boxGeometry args={[4.4, 0.14, 380]} />
            <meshStandardMaterial color={night ? "#293738" : "#d7dcd4"} />
          </mesh>
          <mesh position={[side * 6.7, 0.005, -90]}>
            <boxGeometry args={[0.12, 0.02, 380]} />
            <meshBasicMaterial color={night ? "#d4d4bd" : "#f5f5ec"} />
          </mesh>
        </group>
      ))}
      <group ref={lines}>
        <Instanced instances={laneInstances}>
          <boxGeometry args={[0.12, 0.025, 4]} />
          <meshBasicMaterial color={night ? "#c0c9c4" : "#f3f6ef"} />
        </Instanced>
      </group>
      <group ref={path}>
        <mesh position={[0, 0.03, -24]}>
          <boxGeometry args={[1.7, 0.015, 44]} />
          <meshBasicMaterial
            color={night ? "#78ada0" : "#397f70"}
            transparent
            opacity={0.26}
            depthWrite={false}
          />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <group key={i} position={[0, 0.06, -7 - i * 6]}>
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                position={[side * 0.24, 0, 0]}
                rotation={[0, side * 0.72, 0]}
              >
                <boxGeometry args={[0.07, 0.02, 0.7]} />
                <meshBasicMaterial
                  color={night ? "#649b8d" : "#286b5b"}
                  transparent
                  opacity={0.65 - i * 0.07}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      <group ref={crossing}>
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} position={[-6.5 + i, 0.025, 0]}>
            <boxGeometry args={[0.5, 0.025, 4]} />
            <meshBasicMaterial color="#e5e9df" />
          </mesh>
        ))}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 8.5, 0, -1]}>
            <mesh position={[0, 2.6, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 5.2, 8]} />
              <meshStandardMaterial color="#78847e" metalness={0.5} />
            </mesh>
            <TrafficLight side={side} />
          </group>
        ))}
        <Pedestrian />
      </group>
    </group>
  );
}

function TrafficLight({ side }: { side: number }) {
  const signal = useCockpit((state) => state.world.signal);
  return (
    <group position={[-side * 0.35, 4.8, 0]}>
      <mesh>
        <boxGeometry args={[0.5, 1.2, 0.3]} />
        <meshStandardMaterial color="#343f3d" />
      </mesh>
      <mesh position={[0, 0.29, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.04, 14]} />
        <meshStandardMaterial
          color={signal === "red" ? "#d77e64" : "#4c4c46"}
          emissive={signal === "red" ? "#ff674d" : "#000000"}
          emissiveIntensity={1.8}
        />
      </mesh>
      <mesh position={[0, -0.29, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.04, 14]} />
        <meshStandardMaterial
          color={signal === "green" ? "#7ba994" : "#404c42"}
          emissive={signal === "green" ? "#78bb90" : "#000000"}
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}
function Pedestrian() {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current)
      ref.current.position.x = useCockpit.getState().world.pedestrianX;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#9d8e7c" />
      </mesh>
      <mesh position={[0, 1.13, 0]} castShadow>
        <capsuleGeometry args={[0.19, 0.55, 4, 8]} />
        <meshStandardMaterial color="#8e9d8c" />
      </mesh>
      {[-0.12, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.4, 0]}>
          <capsuleGeometry args={[0.075, 0.65, 4, 8]} />
          <meshStandardMaterial color="#59635f" />
        </mesh>
      ))}
    </group>
  );
}

function City() {
  const night = useCockpit((state) => state.night);
  const city = useMemo(() => cityInstances(night), [night]);
  return (
    <group>
      <Instanced instances={city.bodies} city castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#ffffff" roughness={0.85} />
      </Instanced>
      <Instanced instances={city.windows} city>
        <boxGeometry />
        <meshStandardMaterial
          color={night ? "#c6c2a2" : "#a8b7b2"}
          emissive={night ? "#d7cdb2" : "#000000"}
          emissiveIntensity={night ? 0.35 : 0}
          roughness={0.4}
          metalness={0.3}
        />
      </Instanced>
      <Instanced instances={city.roofs} city>
        <boxGeometry />
        <meshStandardMaterial color={night ? "#52605f" : "#e9eae0"} />
      </Instanced>
      <Instanced instances={city.trunks} city castShadow>
        <cylinderGeometry args={[0.12, 0.16, 2.8, 7]} />
        <meshStandardMaterial color="#8c9485" />
      </Instanced>
      <Instanced instances={city.crowns} city castShadow>
        <sphereGeometry args={[1.45, 9, 7]} />
        <meshStandardMaterial color={night ? "#344c42" : "#9daa90"} roughness={1} />
      </Instanced>
    </group>
  );
}

function MovingVehicles() {
  const traffic = useRef<Group>(null);
  const ego = useRef<Group>(null);
  const perception = useCockpit((state) => state.perception);
  const braking = useCockpit(
    (state) => state.controls.brake > 0 || !!state.world.warning,
  );
  const initial = useMemo(() => useCockpit.getState().world.traffic, []);
  useFrame((_, dt) => {
    const { world, camera } = useCockpit.getState();
    if (ego.current) {
      ego.current.position.x = world.x;
      ego.current.rotation.y = -world.heading;
      ego.current.visible = camera !== "Driver";
    }
    traffic.current?.children.forEach((group, i) => {
      const vehicle = world.traffic[i];
      const z = -relativeDistance(vehicle.distance, world.distance);
      group.position.x = vehicle.x;
      // Do not interpolate across the scene wrap.
      group.position.z =
        Math.abs(group.position.z - z) > 50
          ? z
          : group.position.z + (z - group.position.z) * Math.min(1, dt * 16);
    });
  });
  return (
    <>
      <group ref={ego}>
        <Vehicle ego braking={braking} perception={perception} />
      </group>
      <group ref={traffic}>
        {initial.map((vehicle) => (
          <group key={vehicle.id} position={[vehicle.x, 0, -vehicle.distance]}>
            <Vehicle
              trafficId={vehicle.id}
              color={vehicle.color}
              van={vehicle.van}
              perception={perception}
            />
          </group>
        ))}
      </group>
    </>
  );
}

function Rain() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = -((clock.elapsedTime * 12) % 8);
  });
  return (
    <group ref={ref}>
      <Instanced instances={rainInstances}>
        <boxGeometry args={[0.016, 0.7, 0.016]} />
        <meshBasicMaterial color="#b3c9ce" transparent opacity={0.65} />
      </Instanced>
    </group>
  );
}

function Scene() {
  const night = useCockpit((state) => state.night);
  const weather = useCockpit((state) => state.weather);
  const color = night
    ? palette.night
    : weather === "Rain"
      ? "#c8d4d2"
      : palette.day;
  return (
    <>
      <color attach="background" args={[color]} />
      <fog attach="fog" args={[color, 45, weather === "Rain" ? 140 : 210]} />
      <ambientLight intensity={night ? 0.7 : 1.65} />
      <hemisphereLight
        args={[night ? "#90b4c7" : "#ffffff", "#acb7a5", night ? 0.7 : 1.4]}
      />
      <directionalLight
        position={[-30, 55, 20]}
        intensity={night ? 0.55 : 2.5}
        color={night ? "#aac8e1" : "#fffbed"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-camera-far={150}
        shadow-bias={-0.001}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.35, -50]}
        receiveShadow
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial
          color={night ? "#233132" : "#dfe4da"}
          roughness={1}
        />
      </mesh>
      <Road />
      <City />
      <MovingVehicles />
      <CameraRig />
      {weather === "Rain" && <Rain />}
    </>
  );
}

function AdaptiveQuality() {
  const setDpr = useThree((state) => state.setDpr);
  const preferredDpr = Math.min(1.5, Math.max(1, window.devicePixelRatio));
  const quality = useMemo(
    () => createQualityController(preferredDpr, setDpr),
    [preferredDpr, setDpr],
  );
  return (
    <PerformanceMonitor
      bounds={() => [40, 55]}
      factor={1}
      step={1}
      onDecline={quality.onDecline}
      onIncline={quality.onIncline}
    />
  );
}

class SceneBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="scene-error">
        <strong>Reality View needs WebGL</strong>
        <p>
          Enable hardware acceleration in your browser and reload. The cockpit
          controls remain available.
        </p>
        <button onClick={() => location.reload()}>Reload cockpit</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function RealityView() {
  return (
    <SceneBoundary>
      <Suspense
        fallback={
          <div className="scene-loading">Preparing your surroundings…</div>
        }
      >
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [12, 13.5, 22], fov: 43, near: 0.1, far: 500 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          fallback={
            <div className="scene-error">
              WebGL is unavailable. Enable hardware acceleration to see Reality
              View.
            </div>
          }
        >
          <AdaptiveQuality />
          <Scene />
        </Canvas>
      </Suspense>
    </SceneBoundary>
  );
}

export default memo(RealityView);
