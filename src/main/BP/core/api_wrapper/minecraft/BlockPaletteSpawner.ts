import { BlockTypes, world } from "@minecraft/server";

type Vector3 = { x: number; y: number; z: number };

type SpawnOptions = {
    dimensionId: string;
    origin: Vector3;
    spacing?: number;
    gridWidth?: number;
    layerHeight?: number;
    maxBlocks?: number;
};

export class BlockPaletteSpawner {
    static spawn(options: SpawnOptions) {
        const spacing = options.spacing ?? 3;
        const gridWidth = options.gridWidth ?? 5;
        const layerHeight = options.layerHeight ?? 3;

        const dimension = world.getDimension(options.dimensionId);
        const blockTypes = BlockTypes.getAll();
        const maxBlocks = options.maxBlocks && options.maxBlocks > 0 ? Math.min(options.maxBlocks, blockTypes.length) : blockTypes.length;

        let placed = 0;
        let failed = 0;

        for (let i = 0; i < maxBlocks; i++) {
            const blockType = blockTypes[i];
            const column = i % gridWidth;
            const row = Math.floor(i / gridWidth) % gridWidth;
            const layer = Math.floor(i / (gridWidth * gridWidth));

            const location = {
                x: options.origin.x + column * spacing,
                y: options.origin.y + layer * layerHeight,
                z: options.origin.z + row * spacing,
            };

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

        return { placed, failed, attempted: maxBlocks };
    }
}
