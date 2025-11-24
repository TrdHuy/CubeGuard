/**
 * Strict Module Design v4 — Block palette spawn wrapper.
 *
 * - PUBLIC API: Chỉ export các kiểu cần dùng và entry point spawn.
 * - INTERNAL IMPLEMENTATION: Validate input và ẩn helper.
 * - EXPORT MODULES: Export default gom nhóm API.
 */
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
        const validation = validateSpawnOptions(options);
        if (!validation.valid) {
            return {
                placed: 0,
                failed: 0,
                attempted: 0,
                bounds: validation.bounds,
            };
        }

        const { origin, dimension } = validation;
        const blockTypes = BlockTypes.getAll();
        const config = resolvePaletteConfig(
            { spacing: options.spacing, gridWidth: options.gridWidth, layerHeight: options.layerHeight, maxBlocks: options.maxBlocks },
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

// ====================== INTERNAL IMPLEMENTATION ===========================

function validateSpawnOptions(options: SpawnOptions):
    | { valid: true; origin: Vector3; dimension: ReturnType<typeof world.getDimension> }
    | { valid: false; bounds: BoundingBox } {
    const origin = normalizeVector3(options.origin) ?? { x: 0, y: 0, z: 0 };

    if (!options.dimensionId || typeof options.dimensionId !== "string") {
        return { valid: false, bounds: { min: { ...origin }, max: { ...origin } } };
    }

    try {
        const dimension = world.getDimension(options.dimensionId);
        if (!dimension) {
            return { valid: false, bounds: { min: { ...origin }, max: { ...origin } } };
        }

        return { valid: true, origin, dimension };
    } catch (error) {
        return { valid: false, bounds: { min: { ...origin }, max: { ...origin } } };
    }
}

// ====================== EXPORT MODULES ====================================

export default { BlockPaletteSpawner };
