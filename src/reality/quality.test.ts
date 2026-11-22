import { describe, expect, it, vi } from "vitest";
import { createQualityController } from "./quality";

describe("adaptive rendering quality", () => {
  it("leaves capable hardware at its initial quality", () => {
    const setDpr = vi.fn();
    const quality = createQualityController(1.5, setDpr);
    for (let i = 0; i < 10; i++) quality.onIncline();
    expect(setDpr).not.toHaveBeenCalled();
  });

  it("reduces quality once per decline and restores preferred DPR on recovery", () => {
    const setDpr = vi.fn();
    const quality = createQualityController(1.25, setDpr);
    quality.onDecline();
    quality.onDecline();
    quality.onIncline();
    quality.onIncline();
    expect(setDpr.mock.calls).toEqual([[1], [1.25]]);
  });

  it("settles at low quality instead of oscillating indefinitely", () => {
    const setDpr = vi.fn();
    const quality = createQualityController(2, setDpr);
    for (let i = 0; i < 10; i++) {
      quality.onDecline();
      quality.onIncline();
    }
    expect(setDpr.mock.calls).toEqual([[1], [1.5], [1], [1.5], [1]]);
  });

  it("never requests a DPR below one", () => {
    const setDpr = vi.fn();
    const quality = createQualityController(0.75, setDpr);
    quality.onDecline();
    quality.onIncline();
    expect(setDpr.mock.calls).toEqual([[1], [1]]);
  });
});
