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
        const filteredBlockTypes = this.filterBlockTypes(blockTypes, options);
        const filtered = blockTypes.length - filteredBlockTypes.length;
        const config = PaletteLayout.resolvePaletteConfig(
            { spacing, gridWidth, layerHeight, maxBlocks: options.maxBlocks },
            filteredBlockTypes.length
        );
        const bounds = PaletteLayout.calculatePaletteBounds(origin, config);

        let placed = 0;
        let failed = 0;
        let attempted = 0;

        for (const { location, index } of PaletteLayout.paletteCoordinates(origin, config)) {
            const blockType = filteredBlockTypes[index];
            if (!blockType) {
                continue;
            }

            try {
                const block = dimension.getBlock(location);
                if (block) {
                    block.setType(blockType);
                    placed++;
                } else {
                    failed++;
                }
                attempted++;
            } catch (error) {
                console.error("[SpawnBlocks] Error while setting block:", error);
                failed++;
                attempted++;
            }
        }

        return { placed, failed, attempted, filtered, bounds };
    }

    private static filterBlockTypes(blockTypes: any[], options: SpawnOptions): any[] {
        const excludeIds = new Set(options.excludeIds ?? []);
        const predicate = options.filter;

        return blockTypes.filter((blockType) => {
            const blockId = this.getBlockId(blockType);

            if (excludeIds.size > 0 && excludeIds.has(blockId)) {
                return false;
            }

            if (predicate) {
                return predicate(blockId);
            }

            return true;
        });
    }

    private static getBlockId(blockType: { id?: string; typeId?: string }): string {
        return blockType?.id ?? blockType?.typeId ?? "";
    }
}
