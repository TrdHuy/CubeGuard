import type { BoundingBox, Vector3 } from "./palette_layout.types";

export type ExportedBlock = {
    typeId: string;
    properties: { name: string; value: boolean | number | string }[];
    location: Vector3;
};

export type ExportOptions = {
    dimensionId: string;
    origin?: Vector3;
    spacing?: number;
    gridWidth?: number;
    layerHeight?: number;
    maxBlocks?: number;
};

export type ExportResult =
    | { success: true; blocks: ExportedBlock[]; bounds: BoundingBox }
    | { success: false; error: string };
