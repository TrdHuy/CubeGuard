/**
 * Strict Module Design v4 — Block palette export wrapper.
 *
 * Lưu ý khi bổ sung wrapper mới:
 * - PUBLIC API: Chỉ export kiểu dữ liệu và entry point cần dùng ở layer ngoài.
 * - INTERNAL IMPLEMENTATION: Validate đầu vào, tránh export helper không cần thiết.
 * - EXPORT MODULES: Cung cấp export default gom nhóm public API.
 */
import { BlockTypes, world } from "@minecraft/server";
import { calculatePaletteBounds, normalizeVector3, paletteCoordinates, resolvePaletteConfig } from "./PaletteLayout";
import type { BoundingBox, Vector3 } from "./PaletteLayout";

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

export class BlockPaletteExporter {
    static export(options: ExportOptions): ExportResult {
        const validation = validateExportOptions(options);

        if (!validation.valid) {
            return { success: false, error: validation.reason };
        }

        const { origin, dimension } = validation;
        const blockTypes = BlockTypes.getAll();
        const config = resolvePaletteConfig(options, blockTypes.length);
        const bounds = calculatePaletteBounds(origin, config);
        const blocks: ExportedBlock[] = [];

        for (const { location } of paletteCoordinates(origin, config)) {
            const block = safelyGetBlock(dimension, location);
            if (!block) {
                continue;
            }

            const typeId = block.typeId;

            if (!typeId || typeId === "minecraft:air") {
                continue;
            }

            const properties = collectBlockProperties(block);

            blocks.push({
                typeId,
                properties,
                location: { x: block.location.x, y: block.location.y, z: block.location.z },
            });
        }

        return { success: true, blocks, bounds };
    }

    static transmit(blocks: ExportedBlock[], metadata: { dimensionId: string; bounds: BoundingBox }) {
        const payload = buildExportPayload(blocks, metadata);
        const serialized = JSON.stringify(payload);
        console.warn(`[BlockPaletteExport] ${serialized}`);

        try {
            world.sendMessage(`Exported ${blocks.length} blocks from ${metadata.dimensionId}. Payload size: ${serialized.length}`);
        } catch (error) {
            console.warn(`[BlockPaletteExport] Failed to broadcast message: ${error}`);
        }

        return serialized.length;
    }
}

// ====================== INTERNAL IMPLEMENTATION ===========================

function validateExportOptions(options: ExportOptions):
    | { valid: true; origin: Vector3; dimension: ReturnType<typeof world.getDimension> }
    | { valid: false; reason: string } {
    const origin = normalizeVector3(options.origin);
    if (!origin) {
        return { valid: false, reason: "Missing origin" };
    }

    if (!options.dimensionId || typeof options.dimensionId !== "string") {
        return { valid: false, reason: "dimensionId is required" };
    }

    try {
        const dimension = world.getDimension(options.dimensionId);
        if (!dimension) {
            return { valid: false, reason: `Unknown dimension: ${options.dimensionId}` };
        }

        return { valid: true, origin, dimension };
    } catch (error) {
        return { valid: false, reason: `Unknown dimension: ${options.dimensionId}` };
    }
}

function safelyGetBlock(
    dimension: ReturnType<typeof world.getDimension>,
    location: Vector3
): ReturnType<ReturnType<typeof world.getDimension>["getBlock"]> | undefined {
    try {
        return dimension.getBlock(location);
    } catch (error) {
        return undefined;
    }
}

function collectBlockProperties(block: any): { name: string; value: boolean | number | string }[] {
    const permutation: any = block.permutation as any;
    const rawProperties: any[] =
        permutation && typeof permutation.getAllProperties === "function" ? permutation.getAllProperties() : [];

    return rawProperties.map((property: any) => ({
        name: property.name,
        value: property.value,
    }));
}

function buildExportPayload(blocks: ExportedBlock[], metadata: { dimensionId: string; bounds: BoundingBox }) {
    return {
        type: "blockPaletteExport",
        dimensionId: metadata.dimensionId,
        bounds: metadata.bounds,
        blocks,
    };
}

// ====================== EXPORT MODULES ====================================

export default { BlockPaletteExporter };
