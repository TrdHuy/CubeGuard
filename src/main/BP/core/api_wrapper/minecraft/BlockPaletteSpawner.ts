import { BlockPermutation, BlockTypes, Dimension, world } from "@minecraft/server";

export interface SpawnBlockPaletteOptions {
    origin: { x: number; y: number; z: number };
    dimensionId: string;
    spacing?: number;
    gridWidth?: number;
    gridLength?: number;
    layerHeight?: number;
    maxBlocks?: number;
}

export interface SpawnBlockPaletteResult {
    placed: number;
    attempted: number;
    totalCandidates: number;
    layersUsed: number;
}

const DEFAULT_GRID_WIDTH = 10;
const DEFAULT_GRID_LENGTH = 10;
const DEFAULT_SPACING = 3;
const DEFAULT_LAYER_HEIGHT = 4;
const DEFAULT_MAX_BLOCKS = 800;

function resolveDimension(id: string): Dimension {
    return world.getDimension(id);
}

export function spawnBlockPalette(options: SpawnBlockPaletteOptions): SpawnBlockPaletteResult {
    const dimension = resolveDimension(options.dimensionId);
    const blockTypes = BlockTypes.getAll();

    const spacing = Math.max(1, Math.floor(options.spacing ?? DEFAULT_SPACING));
    const gridWidth = Math.max(1, Math.floor(options.gridWidth ?? DEFAULT_GRID_WIDTH));
    const gridLength = Math.max(1, Math.floor(options.gridLength ?? DEFAULT_GRID_LENGTH));
    const layerHeight = Math.max(1, Math.floor(options.layerHeight ?? DEFAULT_LAYER_HEIGHT));
    const maxBlocks = Math.min(blockTypes.length, Math.max(1, options.maxBlocks ?? DEFAULT_MAX_BLOCKS));
    const blocksPerLayer = gridWidth * gridLength;

    let placed = 0;
    let attempted = 0;

    for (const blockType of blockTypes) {
        if (attempted >= maxBlocks) {
            break;
        }

        const layerIndex = Math.floor(attempted / blocksPerLayer);
        const indexWithinLayer = attempted % blocksPerLayer;
        const row = Math.floor(indexWithinLayer / gridWidth);
        const column = indexWithinLayer % gridWidth;

        const target = {
            x: Math.floor(options.origin.x + column * spacing),
            y: Math.floor(options.origin.y + layerIndex * layerHeight),
            z: Math.floor(options.origin.z + row * spacing),
        };

        const block = dimension.getBlock(target);
        if (!block) {
            attempted++;
            continue;
        }

        try {
            block.setPermutation(BlockPermutation.resolve(blockType.id));
            placed++;
        } catch (error) {
            console.warn(`[BlockPaletteSpawner] Failed placing ${blockType.id} at (${target.x}, ${target.y}, ${target.z}): ${error}`);
        }

        attempted++;
    }

    return {
        placed,
        attempted,
        totalCandidates: blockTypes.length,
        layersUsed: Math.max(1, Math.ceil(attempted / blocksPerLayer)),
    };
}
