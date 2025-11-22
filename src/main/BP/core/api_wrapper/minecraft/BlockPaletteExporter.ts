import { world } from "@minecraft/server";

type Vector3 = { x: number; y: number; z: number };

type BoundingBox = { min: Vector3; max: Vector3 };

export type ExportedBlock = {
    typeId: string;
    properties: { name: string; value: boolean | number | string }[];
    location: Vector3;
};

export type ExportOptions = {
    dimensionId: string;
    origin?: Vector3;
    size?: { width: number; height: number; depth: number };
    min?: Vector3;
    max?: Vector3;
};

export type ExportResult =
    | { success: true; blocks: ExportedBlock[]; bounds: BoundingBox }
    | { success: false; error: string };

export class BlockPaletteExporter {
    private static isValidVector(vector?: Vector3): vector is Vector3 {
        return (
            !!vector &&
            typeof vector.x === "number" &&
            typeof vector.y === "number" &&
            typeof vector.z === "number"
        );
    }

    private static normalizeBounds(options: ExportOptions): BoundingBox | undefined {
        if (this.isValidVector(options.min) && this.isValidVector(options.max)) {
            return {
                min: {
                    x: Math.min(options.min.x, options.max.x),
                    y: Math.min(options.min.y, options.max.y),
                    z: Math.min(options.min.z, options.max.z),
                },
                max: {
                    x: Math.max(options.min.x, options.max.x),
                    y: Math.max(options.min.y, options.max.y),
                    z: Math.max(options.min.z, options.max.z),
                },
            };
        }

        if (this.isValidVector(options.origin) && options.size) {
            const width = Math.floor(options.size.width);
            const height = Math.floor(options.size.height);
            const depth = Math.floor(options.size.depth);

            if (width > 0 && height > 0 && depth > 0) {
                return {
                    min: {
                        x: Math.floor(options.origin.x),
                        y: Math.floor(options.origin.y),
                        z: Math.floor(options.origin.z),
                    },
                    max: {
                        x: Math.floor(options.origin.x + width - 1),
                        y: Math.floor(options.origin.y + height - 1),
                        z: Math.floor(options.origin.z + depth - 1),
                    },
                };
            }
        }

        return undefined;
    }

    static export(options: ExportOptions): ExportResult {
        const bounds = this.normalizeBounds(options);

        if (!bounds) {
            return { success: false, error: "Missing bounding information" };
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

        const blocks: ExportedBlock[] = [];

        for (let x = bounds.min.x; x <= bounds.max.x; x++) {
            for (let y = bounds.min.y; y <= bounds.max.y; y++) {
                for (let z = bounds.min.z; z <= bounds.max.z; z++) {
                    const location = { x, y, z };
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
                        typeof permutation.getAllProperties === "function" ? permutation.getAllProperties() : [];
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
            }
        }

        return { success: true, blocks, bounds };
    }

    static transmit(blocks: ExportedBlock[], metadata: { dimensionId: string; bounds: BoundingBox }) {
        const payload = {
            type: "blockPaletteExport",
            dimensionId: metadata.dimensionId,
            bounds: metadata.bounds,
            blocks,
        };

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
