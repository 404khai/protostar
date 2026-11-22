import { useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";

interface VehicleProps {
  color?: string;
  ego?: boolean;
  van?: boolean;
  braking?: boolean;
  perception?: boolean;
}

/** Locally authored coachwork: extruded body, panoramic glass, machined wheels and light bars. */
export function Vehicle({
  color = "#e5e7df",
  ego = false,
  van = false,
  braking = false,
  perception = false,
}: VehicleProps) {
  const body = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-2.28, 0.48);
    shape.lineTo(-2.25, 0.92);
    shape.lineTo(-1.53, 1.04);
    shape.lineTo(-0.9, van ? 1.92 : 1.55);
    shape.lineTo(0.6, van ? 1.92 : 1.52);
    shape.lineTo(1.4, 1.0);
    shape.lineTo(2.15, 0.86);
    shape.lineTo(2.3, 0.52);
    shape.closePath();
    const geometry = new ExtrudeGeometry(shape, {
      depth: 1.88,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.12,
      bevelThickness: 0.1,
    });
    geometry.translate(0, 0, -0.94);
    return geometry;
  }, [van]);
  const glass = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-1.23, 1.08);
    shape.lineTo(-0.79, van ? 1.82 : 1.5);
    shape.lineTo(0.55, van ? 1.82 : 1.47);
    shape.lineTo(1.18, 1.08);
    shape.closePath();
    const geometry = new ExtrudeGeometry(shape, {
      depth: 1.91,
      bevelEnabled: true,
      bevelSize: 0.035,
      bevelThickness: 0.025,
      bevelSegments: 2,
    });
    geometry.translate(0, 0, -0.955);
    return geometry;
  }, [van]);
  return (
    <group>
      <mesh
        geometry={body}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} metalness={0.58} roughness={0.32} />
      </mesh>
      <mesh geometry={glass} rotation={[0, Math.PI / 2, 0]} castShadow>
        <meshStandardMaterial
          color="#263a40"
          metalness={0.42}
          roughness={0.2}
        />
      </mesh>
      {/* A fine silver B-pillar breaks the side glass. */}
      {[-0.99, 0.99].map((x) => (
        <mesh key={x} position={[x, 1.3, 0.1]}>
          <boxGeometry args={[0.035, 0.45, 0.065]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {[-1.03, 1.03].flatMap((x) =>
        [-1.4, 1.43].map((z) => (
          <group
            key={`${x}-${z}`}
            position={[x, 0.48, z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <mesh castShadow>
              <cylinderGeometry args={[0.47, 0.47, 0.24, 20]} />
              <meshStandardMaterial color="#272b2c" roughness={0.85} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.32, 0.32, 0.253, 12]} />
              <meshStandardMaterial
                color="#a1aaa9"
                metalness={0.85}
                roughness={0.22}
              />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.19, 0.19, 0.26, 6]} />
              <meshStandardMaterial
                color="#41494b"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        )),
      )}
      <mesh position={[0, 0.79, -2.19]}>
        <boxGeometry args={[1.67, 0.065, 0.055]} />
        <meshStandardMaterial
          color="#f7ffff"
          emissive="#dcffff"
          emissiveIntensity={1.6}
        />
      </mesh>
      <mesh position={[0, 0.82, 2.23]}>
        <boxGeometry args={[1.65, 0.055, 0.05]} />
        <meshStandardMaterial
          color={ego ? "#b85e4e" : "#813f35"}
          emissive="#ff4433"
          emissiveIntensity={braking ? 3 : 0.3}
        />
      </mesh>
      <mesh position={[0, 0.38, 2.24]}>
        <boxGeometry args={[1.6, 0.14, 0.06]} />
        <meshStandardMaterial color="#394445" roughness={0.5} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, 0]}
        scale={[1, 2.1, 1]}
      >
        <circleGeometry args={[1.35, 32]} />
        <meshBasicMaterial
          color="#273b3b"
          transparent
          opacity={0.13}
          depthWrite={false}
        />
      </mesh>
      {ego && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
          <ringGeometry args={[3.1, 3.13, 80]} />
          <meshBasicMaterial color="#6caaa2" transparent opacity={0.55} />
        </mesh>
      )}
      {perception && (
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[2.4, 2.1, 5]} />
          <meshBasicMaterial
            color={ego ? "#397d70" : "#709a94"}
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}
