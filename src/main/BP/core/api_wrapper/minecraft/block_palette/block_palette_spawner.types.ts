import type { BoundingBox, Vector3 } from "./palette_layout.types";

export type SpawnOptions = {
    dimensionId: string;
    origin?: Vector3;
    spacing?: number;
    gridWidth?: number;
    layerHeight?: number;
    maxBlocks?: number;
};

export type SpawnResult = { placed: number; failed: number; attempted: number; bounds: BoundingBox };
