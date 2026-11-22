export function createQualityController(
  preferredDpr: number,
  setDpr: (dpr: number) => void,
) {
  const highDpr = Math.min(1.5, Math.max(1, preferredDpr));
  let reduced = false;
  let recoveries = 0;
  return {
    onDecline: () => {
      if (reduced) return;
      reduced = true;
      setDpr(1);
    },
    onIncline: () => {
      if (!reduced || recoveries >= 2) return;
      reduced = false;
      recoveries++;
      setDpr(highDpr);
    },
  };
}
