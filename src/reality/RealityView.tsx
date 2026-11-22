import { Component, Suspense, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Color, Group, Vector3 } from "three";
import { useCockpit } from "../stores/cockpit";
import { relativeDistance } from "../simulation/engine";
import { Vehicle } from "./Vehicle";

const palette = { day: "#e9ede8", night: "#182329" };
const lookAt = new Vector3();
const cameraPosition = new Vector3();

function CameraRig() {
  const mode = useCockpit((state) => state.camera);
  useFrame(({ camera }, dt) => {
    if (mode === "Orbit") return;
    const state = useCockpit.getState();
    const x = state.world.x;
    if (mode === "Overhead") {
      cameraPosition.set(x, 46, 4);
      lookAt.set(x, 0, -13);
    } else if (mode === "Driver") {
      cameraPosition.set(x - 0.35, 1.9, -1.3);
      lookAt.set(x + state.world.heading * 15, 1.4, -55);
    } else {
      // Keep the chase camera over the road, clear of roadside trees and
      // buildings even when the vehicle is steered to the right boundary.
      cameraPosition.set(Math.min(x + 12, 8), 13.5, 22);
      lookAt.set(x - 1, 0.5, -13);
    }
    camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 4));
    camera.lookAt(lookAt);
  });
  return mode === "Orbit" ? (
    <OrbitControls
      makeDefault
      target={[0, 0, -8]}
      minDistance={8}
      maxDistance={80}
      maxPolarAngle={Math.PI / 2 - 0.04}
    />
  ) : null;
}

function Road() {
  const lines = useRef<Group>(null);
  const crossing = useRef<Group>(null);
  const path = useRef<Group>(null);
  const night = useCockpit((state) => state.night);
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
          color={night ? "#343f44" : "#afb9b6"}
          roughness={0.94}
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
            <boxGeometry args={[0.075, 0.02, 380]} />
            <meshBasicMaterial color={night ? "#d4d4bd" : "#f5f5ec"} />
          </mesh>
        </group>
      ))}
      <group ref={lines}>
        {[-1.85, 1.85].flatMap((x) =>
          Array.from({ length: 37 }, (_, i) => (
            <mesh key={`${x}-${i}`} position={[x, 0.012, 75 - i * 10]}>
              <boxGeometry args={[0.07, 0.025, 4]} />
              <meshBasicMaterial color={night ? "#c0c9c4" : "#f3f6ef"} />
            </mesh>
          )),
        )}
      </group>
      <group ref={path}>
        <mesh position={[0, 0.03, -24]}>
          <boxGeometry args={[1.7, 0.015, 44]} />
          <meshBasicMaterial
            color="#78ada0"
            transparent
            opacity={night ? 0.26 : 0.18}
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
                  color="#649b8d"
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
  const blocks = useRef<Group>(null);
  const night = useCockpit((state) => state.night);
  const buildings = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        x: (i % 2 ? 1 : -1) * (19 + ((i * 7) % 13)),
        z: 65 - Math.floor(i / 2) * 21,
        height: 7 + ((i * 13) % 23),
        width: 6 + ((i * 3) % 8),
      })),
    [],
  );
  useFrame(() => {
    if (!blocks.current) return;
    for (let i = 0; i < blocks.current.children.length; i++) {
      const group = blocks.current.children[i];
      const base = buildings[i].z;
      group.position.z =
        ((((base + useCockpit.getState().world.distance + 300) % 378) + 378) %
          378) -
        300;
    }
  });
  return (
    <group ref={blocks}>
      {buildings.map((building, i) => (
        <group key={i} position={[building.x, 0, building.z]}>
          <mesh position={[0, building.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[building.width, building.height, 11]} />
            <meshStandardMaterial
              color={
                night
                  ? i % 2
                    ? "#344248"
                    : "#29383d"
                  : i % 3
                    ? "#d5dbd4"
                    : "#c7cfc8"
              }
              roughness={0.85}
            />
          </mesh>
          {Array.from(
            { length: Math.floor(building.height / 3) },
            (_, floor) => (
              <mesh key={floor} position={[0, 2 + floor * 3, 5.52]}>
                <boxGeometry args={[building.width * 0.78, 0.9, 0.03]} />
                <meshStandardMaterial
                  color={night ? "#c6c2a2" : "#a8b7b2"}
                  emissive={night ? "#d7cdb2" : "#000000"}
                  emissiveIntensity={night ? 0.35 : 0}
                  roughness={0.4}
                  metalness={0.3}
                />
              </mesh>
            ),
          )}
          <mesh position={[0, building.height + 0.15, 0]}>
            <boxGeometry args={[building.width + 0.3, 0.3, 11.3]} />
            <meshStandardMaterial color={night ? "#52605f" : "#e9eae0"} />
          </mesh>
          <group
            position={[
              -Math.sign(building.x) * (Math.abs(building.x) - 10.7),
              0,
              2,
            ]}
          >
            <mesh position={[0, 1.4, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 2.8, 7]} />
              <meshStandardMaterial color="#8c9485" />
            </mesh>
            <mesh position={[0, 3.7, 0]} castShadow>
              <sphereGeometry args={[1.45, 9, 7]} />
              <meshStandardMaterial
                color={night ? "#344c42" : "#9daa90"}
                roughness={1}
              />
            </mesh>
          </group>
        </group>
      ))}
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
      {Array.from({ length: 110 }, (_, i) => (
        <mesh
          key={i}
          position={[
            ((i * 7.3) % 50) - 25,
            (i * 2.1) % 24,
            -((i * 9.3) % 90) + 15,
          ]}
          rotation={[0, 0, -0.15]}
        >
          <boxGeometry args={[0.016, 0.7, 0.016]} />
          <meshBasicMaterial color="#b3c9ce" transparent opacity={0.65} />
        </mesh>
      ))}
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
        color={new Color(night ? "#aac8e1" : "#fffbed")}
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
export default function RealityView() {
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
          <Scene />
        </Canvas>
      </Suspense>
    </SceneBoundary>
  );
}
