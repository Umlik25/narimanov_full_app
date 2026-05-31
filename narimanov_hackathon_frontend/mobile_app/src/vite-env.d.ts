/// <reference types="vite/client" />

declare module "canvas-confetti" {
  type Options = {
    angle?: number;
    colors?: string[];
    decay?: number;
    disableForReducedMotion?: boolean;
    drift?: number;
    gravity?: number;
    origin?: { x?: number; y?: number };
    particleCount?: number;
    scalar?: number;
    spread?: number;
    startVelocity?: number;
    ticks?: number;
    zIndex?: number;
  };

  const confetti: (options?: Options) => Promise<null> | null;
  export default confetti;
}
