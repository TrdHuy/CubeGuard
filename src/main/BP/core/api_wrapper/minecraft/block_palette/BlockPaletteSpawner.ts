import { BlockTypes, world } from "@minecraft/server";
import { calculatePaletteBounds, normalizeVector3, paletteCoordinates, resolvePaletteConfig } from "./PaletteLayout";
import type { BoundingBox, Vector3 } from "./PaletteLayout";

type SpawnOptions = {
    dimensionId: string;
    origin?: Vector3;
    spacing?: number;
    gridWidth?: number;
    layerHeight?: number;
    maxBlocks?: number;
};

type SpawnResult = { placed: number; failed: number; attempted: number; bounds: BoundingBox };

export class BlockPaletteSpawner {
    static spawn(options: SpawnOptions): SpawnResult {
        const spacing = options.spacing ?? undefined;
        const gridWidth = options.gridWidth ?? undefined;
        const layerHeight = options.layerHeight ?? undefined;
        const origin = normalizeVector3(options.origin) ?? { x: 0, y: 0, z: 0 };

        const dimension = world.getDimension(options.dimensionId);
        const blockTypes = BlockTypes.getAll();
        const config = resolvePaletteConfig(
            { spacing, gridWidth, layerHeight, maxBlocks: options.maxBlocks },
            blockTypes.length
        );
        const bounds = calculatePaletteBounds(origin, config);

        let placed = 0;
        let failed = 0;

        for (const { location, index } of paletteCoordinates(origin, config)) {
            const blockType = blockTypes[index];

            try {
                const block = dimension.getBlock(location);
                if (block) {
                    block.setType(blockType);
                    placed++;
                } else {
                    failed++;
                }
            } catch (error) {
                console.error("[SpawnBlocks] Error while setting block:", error);
                failed++;
            }
        }

        return { placed, failed, attempted: config.maxBlocks, bounds };
    }
}
