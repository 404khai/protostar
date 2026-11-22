import { describe, expect, it } from "vitest";
import { cityInstances, cityZ, laneInstances, rainInstances } from "./instances";

describe("instanced scene layout", () => {
  it("preserves both lanes of road markings", () => {
    expect(laneInstances).toHaveLength(74);
    expect(laneInstances[0].position).toEqual([-1.85, 0.012, 75]);
    expect(laneInstances[73].position).toEqual([1.85, 0.012, -285]);
  });

  it("preserves building sizes, colors, windows and tree offsets", () => {
    const city = cityInstances(false);
    expect(city.bodies).toHaveLength(36);
    expect(city.roofs).toHaveLength(36);
    expect(city.trunks).toHaveLength(36);
    expect(city.crowns).toHaveLength(36);
    expect(city.bodies[0]).toEqual({ position: [-19, 3.5, 65], scale: [6, 7, 11], blockZ: 65, color: "#c7cfc8" });
    expect(city.windows[0]).toEqual({ position: [-19, 2, 70.52], scale: [4.68, 0.9, 0.03], blockZ: 65 });
    city.bodies.forEach((body, i) => {
      const [x, y, z] = body.position;
      expect(city.windows.filter((window) => window.position[0] === x && window.blockZ === z))
        .toHaveLength(Math.floor(y * 2 / 3));
      expect(city.trunks[i].position[0]).toBeCloseTo(Math.sign(x) * 10.7);
      expect(city.crowns[i].position[0]).toBeCloseTo(Math.sign(x) * 10.7);
      expect(city.trunks[i].position.slice(1)).toEqual([1.4, z + 2]);
      expect(city.crowns[i].position.slice(1)).toEqual([3.7, z + 2]);
    });
    expect(cityInstances(true).bodies.slice(0, 2).map((body) => body.color))
      .toEqual(["#29383d", "#344248"]);
  });

  it("wraps city blocks together at either boundary, including reset", () => {
    expect(cityZ(65, 0)).toBe(65);
    expect(cityZ(65, 13)).toBe(-300);
    expect(cityZ(65, 14)).toBe(-299);
    expect(cityZ(-301, 0)).toBe(77);
    expect(cityZ(65, -379)).toBe(64);
    expect(cityZ(65, 756)).toBe(65);
  });

  it("preserves all rain drop positions and rotations", () => {
    expect(rainInstances).toHaveLength(110);
    rainInstances.forEach((drop, i) => {
      expect(drop.position).toEqual([((i * 7.3) % 50) - 25, (i * 2.1) % 24, -((i * 9.3) % 90) + 15]);
      expect(drop.rotation).toEqual([0, 0, -0.15]);
    });
  });
});
