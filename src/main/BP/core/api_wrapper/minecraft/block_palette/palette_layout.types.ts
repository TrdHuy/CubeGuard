export type Vector3 = { x: number; y: number; z: number };

export type BoundingBox = { min: Vector3; max: Vector3 };

export type PaletteLayoutOptions = {
    spacing?: number;
    gridWidth?: number;
    layerHeight?: number;
    maxBlocks?: number;
};

export type PaletteConfig = {
    spacing: number;
    gridWidth: number;
    layerHeight: number;
    maxBlocks: number;
};

export type PaletteIteration = {
    index: number;
    column: number;
    row: number;
    layer: number;
    location: Vector3;
};
