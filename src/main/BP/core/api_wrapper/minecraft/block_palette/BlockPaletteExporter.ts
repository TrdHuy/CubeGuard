import { BlockTypes, world } from "@minecraft/server";
import { PaletteLayout } from "./PaletteLayout";
import type { ExportOptions, ExportResult, ExportedBlock } from "./block_palette_exporter.types";
import type { BoundingBox } from "./palette_layout.types";

export class BlockPaletteExporter {
    public static export(options: ExportOptions): ExportResult {
        const origin = PaletteLayout.normalizeVector3(options.origin);

        if (!origin) {
            return { success: false, error: "Missing origin" };
        }

        let dimension;

        try {
            dimension = world.getDimension(options.dimensionId);
        } catch (error) {
            return { success: false, error: `Unknown dimension: ${options.dimensionId}` };
        }

        if (!dimension) {
            return { success: false, error: `Unknown dimension: ${options.dimensionId}` };
        }

        const blockTypes = BlockTypes.getAll();
        const config = PaletteLayout.resolvePaletteConfig(options, blockTypes.length);
        const bounds = PaletteLayout.calculatePaletteBounds(origin, config);
        const blocks: ExportedBlock[] = [];

        for (const { location } of PaletteLayout.paletteCoordinates(origin, config)) {
            let block;

            try {
                block = dimension.getBlock(location);
            } catch (error) {
                continue;
            }

            if (!block) {
                continue;
            }

            const typeId = block.typeId;

            if (!typeId || typeId === "minecraft:air") {
                continue;
            }

            const permutation: any = block.permutation as any;
            const rawProperties: any[] =
                permutation && typeof permutation.getAllProperties === "function"
                    ? permutation.getAllProperties()
                    : [];
            const properties = rawProperties.map((property: any) => ({
                name: property.name,
                value: property.value,
            }));

            blocks.push({
                typeId,
                properties,
                location: { x: block.location.x, y: block.location.y, z: block.location.z },
            });
        }

        return { success: true, blocks, bounds };
    }

    public static transmit(blocks: ExportedBlock[], metadata: { dimensionId: string; bounds: BoundingBox }) {
        const payload = {
            type: "blockPaletteExport",
            dimensionId: metadata.dimensionId,
            bounds: metadata.bounds,
            blocks,
        };

        const serialized = JSON.stringify(payload);
        console.warn(`[BlockPaletteExport] ${serialized}`);

        try {
            world.sendMessage(
                `Exported ${blocks.length} blocks from ${metadata.dimensionId}. Payload size: ${serialized.length}`
            );
        } catch (error) {
            console.warn(`[BlockPaletteExport] Failed to broadcast message: ${error}`);
        }

        return serialized.length;
    }
}
