import { BlockTypes, world } from "@minecraft/server";
import { PaletteLayout } from "./PaletteLayout";
import type { SpawnOptions, SpawnResult } from "./block_palette_spawner.types";

export class BlockPaletteSpawner {
    public static spawn(options: SpawnOptions): SpawnResult {
        const spacing = options.spacing ?? undefined;
        const gridWidth = options.gridWidth ?? undefined;
        const layerHeight = options.layerHeight ?? undefined;
        const origin = PaletteLayout.normalizeVector3(options.origin) ?? { x: 0, y: 0, z: 0 };

        const dimension = world.getDimension(options.dimensionId);
        const blockTypes = BlockTypes.getAll();
        const config = PaletteLayout.resolvePaletteConfig(
            { spacing, gridWidth, layerHeight, maxBlocks: options.maxBlocks },
            blockTypes.length
        );
        const bounds = PaletteLayout.calculatePaletteBounds(origin, config);

        let placed = 0;
        let failed = 0;

        for (const { location, index } of PaletteLayout.paletteCoordinates(origin, config)) {
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
