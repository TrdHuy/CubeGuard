import type {
    BoundingBox,
    PaletteConfig,
    PaletteIteration,
    PaletteLayoutOptions,
    Vector3,
} from "./palette_layout.types";

export class PaletteLayout {
    public static readonly DEFAULT_SPACING = 3;
    public static readonly DEFAULT_GRID_WIDTH = 5;
    public static readonly DEFAULT_LAYER_HEIGHT = 3;

    public static normalizeVector3(vector?: Vector3): Vector3 | undefined {
        return this.isValidVector3(vector)
            ? { x: vector.x, y: vector.y, z: vector.z }
            : undefined;
    }

    public static resolvePaletteConfig(options: PaletteLayoutOptions, availableBlocks: number): PaletteConfig {
        const spacing = options.spacing ?? this.DEFAULT_SPACING;
        const gridWidth = Math.max(1, Math.floor(options.gridWidth ?? this.DEFAULT_GRID_WIDTH));
        const layerHeight = Math.max(1, Math.floor(options.layerHeight ?? this.DEFAULT_LAYER_HEIGHT));
        const requestedMax = options.maxBlocks && options.maxBlocks > 0 ? Math.floor(options.maxBlocks) : availableBlocks;
        const maxBlocks = Math.min(Math.max(1, requestedMax), availableBlocks);

        return { spacing, gridWidth, layerHeight, maxBlocks };
    }

    public static *paletteCoordinates(origin: Vector3, config: PaletteConfig): Generator<PaletteIteration, void, void> {
        for (let i = 0; i < config.maxBlocks; i++) {
            const column = i % config.gridWidth;
            const row = Math.floor(i / config.gridWidth) % config.gridWidth;
            const layer = Math.floor(i / (config.gridWidth * config.gridWidth));

            yield {
                index: i,
                column,
                row,
                layer,
                location: {
                    x: origin.x + column * config.spacing,
                    y: origin.y + layer * config.layerHeight,
                    z: origin.z + row * config.spacing,
                },
            };
        }
    }

    public static calculatePaletteBounds(origin: Vector3, config: PaletteConfig): BoundingBox {
        let min: Vector3 | undefined;
        let max: Vector3 | undefined;

        for (const { location } of this.paletteCoordinates(origin, config)) {
            if (!min || !max) {
                min = { ...location };
                max = { ...location };
                continue;
            }

            min = {
                x: Math.min(min.x, location.x),
                y: Math.min(min.y, location.y),
                z: Math.min(min.z, location.z),
            };

            max = {
                x: Math.max(max.x, location.x),
                y: Math.max(max.y, location.y),
                z: Math.max(max.z, location.z),
            };
        }

        const fallback = min && max ? undefined : { min: { ...origin }, max: { ...origin } };

        return fallback ?? { min: min as Vector3, max: max as Vector3 };
    }

    private static isValidVector3(vector?: Vector3): vector is Vector3 {
        return (
            !!vector &&
            typeof vector.x === "number" &&
            typeof vector.y === "number" &&
            typeof vector.z === "number"
        );
    }
}
