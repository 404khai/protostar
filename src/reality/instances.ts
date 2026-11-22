export type Triple = [number, number, number];
export interface SceneInstance {
  position: Triple;
  scale?: Triple;
  rotation?: Triple;
  color?: string;
  blockZ?: number;
}

export const cityZ = (z: number, distance: number) =>
  ((((z + distance + 300) % 378) + 378) % 378) - 300;

export function cityInstances(night: boolean) {
  const bodies: SceneInstance[] = [];
  const windows: SceneInstance[] = [];
  const roofs: SceneInstance[] = [];
  const trunks: SceneInstance[] = [];
  const crowns: SceneInstance[] = [];
  for (let i = 0; i < 36; i++) {
    const x = (i % 2 ? 1 : -1) * (19 + ((i * 7) % 13));
    const z = 65 - Math.floor(i / 2) * 21;
    const height = 7 + ((i * 13) % 23);
    const width = 6 + ((i * 3) % 8);
    bodies.push({ position: [x, height / 2, z], scale: [width, height, 11], blockZ: z,
      color: night ? i % 2 ? "#344248" : "#29383d" : i % 3 ? "#d5dbd4" : "#c7cfc8" });
    for (let floor = 0; floor < Math.floor(height / 3); floor++) {
      windows.push({ position: [x, 2 + floor * 3, z + 5.52], scale: [width * 0.78, 0.9, 0.03], blockZ: z });
    }
    roofs.push({ position: [x, height + 0.15, z], scale: [width + 0.3, 0.3, 11.3], blockZ: z });
    const treeX = x - Math.sign(x) * (Math.abs(x) - 10.7);
    trunks.push({ position: [treeX, 1.4, z + 2], blockZ: z });
    crowns.push({ position: [treeX, 3.7, z + 2], blockZ: z });
  }
  return { bodies, windows, roofs, trunks, crowns };
}

export const laneInstances: SceneInstance[] = [-1.85, 1.85].flatMap((x) =>
  Array.from({ length: 37 }, (_, i) => ({ position: [x, 0.012, 75 - i * 10] as Triple })),
);

export const rainInstances: SceneInstance[] = Array.from({ length: 110 }, (_, i) => ({
  position: [((i * 7.3) % 50) - 25, (i * 2.1) % 24, -((i * 9.3) % 90) + 15],
  rotation: [0, 0, -0.15],
}));
