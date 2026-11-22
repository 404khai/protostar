import { useLayoutEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DynamicDrawUsage, InstancedMesh, Object3D } from "three";
import { useCockpit } from "../stores/cockpit";
import { cityZ } from "./instances";
import type { SceneInstance } from "./instances";

export function Instanced({
  instances,
  city = false,
  castShadow = false,
  receiveShadow = false,
  children,
}: {
  instances: SceneInstance[];
  city?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  children: ReactNode;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const transform = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);
  const previousDistance = useRef<number | null>(null);
  useLayoutEffect(() => {
    const batch = mesh.current;
    if (!batch) return;
    if (city) batch.instanceMatrix.setUsage(DynamicDrawUsage);
    const distance = useCockpit.getState().world.distance;
    instances.forEach((instance, i) => {
      const [x, y, z] = instance.position;
      const blockZ = instance.blockZ ?? z;
      const offset = city ? cityZ(blockZ, distance) - blockZ : 0;
      transform.position.set(x, y, z + offset);
      if (instance.rotation) transform.rotation.set(...instance.rotation);
      else transform.rotation.set(0, 0, 0);
      if (instance.scale) transform.scale.set(...instance.scale);
      else transform.scale.set(1, 1, 1);
      transform.updateMatrix();
      batch.setMatrixAt(i, transform.matrix);
      if (instance.color) batch.setColorAt(i, color.set(instance.color));
    });
    batch.instanceMatrix.needsUpdate = true;
    if (batch.instanceColor) batch.instanceColor.needsUpdate = true;
    previousDistance.current = distance;
    // Moving batches wrap through the full scene; static batches can use their bounds.
    if (!city) batch.computeBoundingSphere();
  }, [instances, city, color, transform]);
  useFrame(() => {
    const batch = mesh.current;
    if (!city || !batch) return;
    const distance = useCockpit.getState().world.distance;
    if (distance === previousDistance.current) return;
    instances.forEach((instance, i) => {
      const z = instance.position[2];
      const blockZ = instance.blockZ ?? z;
      batch.instanceMatrix.array[i * 16 + 14] = cityZ(blockZ, distance) + z - blockZ;
    });
    batch.instanceMatrix.needsUpdate = true;
    previousDistance.current = distance;
  });
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, instances.length]}
      frustumCulled={!city}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      {children}
    </instancedMesh>
  );
}
