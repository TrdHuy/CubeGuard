import { BlockPaletteSpawner } from "../../../../../../main/BP/core/api_wrapper/minecraft/block_palette/BlockPaletteSpawner";

jest.mock("@minecraft/server", () => {
    const startupSubscribe = jest.fn();
    const getDimension = jest.fn();
    const getAllBlocks = jest.fn();
    (globalThis as any).__mcServer = {
        startupSubscribe,
        getDimension,
        getAllBlocks,
    };
    return {
        system: {
            beforeEvents: { startup: { subscribe: startupSubscribe } },
        },
        world: {
            getDimension,
        },
        BlockTypes: {
            getAll: getAllBlocks,
        },
    };
});

describe("BlockPaletteSpawner", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("places blocks in a grid with spacing and layers", () => {
        const placedBlocks: any[] = [];
        const mockDimension = {
            getBlock: jest.fn((location: any) => ({
                setType: jest.fn(() => placedBlocks.push(location)),
            })),
        };
        const { getDimension, getAllBlocks } = (globalThis as any).__mcServer;
        getDimension.mockReturnValue(mockDimension);
        getAllBlocks.mockReturnValue(new Array(10).fill(null).map((_, i) => ({ id: `block-${i}` })));

        const result = BlockPaletteSpawner.spawn({
            dimensionId: "overworld",
            origin: { x: 0, y: 10, z: 0 },
            spacing: 2,
            gridWidth: 3,
            layerHeight: 5,
        });

        expect(result).toEqual({
            placed: 10,
            failed: 0,
            attempted: 10,
            filtered: 0,
            bounds: { min: { x: 0, y: 10, z: 0 }, max: { x: 4, y: 15, z: 4 } },
        });

        // First row (y=10)
        expect(placedBlocks[0]).toEqual({ x: 0, y: 10, z: 0 });
        expect(placedBlocks[1]).toEqual({ x: 2, y: 10, z: 0 });
        expect(placedBlocks[2]).toEqual({ x: 4, y: 10, z: 0 });

        // Second row
        expect(placedBlocks[3]).toEqual({ x: 0, y: 10, z: 2 });
        expect(placedBlocks[4]).toEqual({ x: 2, y: 10, z: 2 });
        expect(placedBlocks[5]).toEqual({ x: 4, y: 10, z: 2 });

        // Third row
        expect(placedBlocks[6]).toEqual({ x: 0, y: 10, z: 4 });
        expect(placedBlocks[7]).toEqual({ x: 2, y: 10, z: 4 });

        // Next layer starts with the remaining blocks
        expect(placedBlocks[8]).toEqual({ x: 4, y: 10, z: 4 });
        expect(placedBlocks[9]).toEqual({ x: 0, y: 15, z: 0 });
    });

    it("caps work by maxBlocks and tolerates failures", () => {
        const mockDimension = {
            getBlock: jest.fn((location: any) => {
                if (location.x === 2) {
                    throw new Error("cannot place");
                }
                return {
                    setType: jest.fn(),
                };
            }),
        };
        const { getDimension, getAllBlocks } = (globalThis as any).__mcServer;
        getDimension.mockReturnValue(mockDimension);
        getAllBlocks.mockReturnValue(new Array(6).fill(null).map((_, i) => ({ id: `block-${i}` })));

        const result = BlockPaletteSpawner.spawn({
            dimensionId: "overworld",
            origin: { x: 0, y: 0, z: 0 },
            gridWidth: 2,
            spacing: 2,
            maxBlocks: 4,
        });

        expect(getAllBlocks).toHaveBeenCalled();
        expect(mockDimension.getBlock).toHaveBeenCalledTimes(4);
        expect(result).toEqual({
            placed: 2,
            failed: 2,
            attempted: 4,
            filtered: 0,
            bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 2, y: 0, z: 2 } },
        });
    });

    it("excludes blocks using filter options and reports statistics", () => {
        const placedBlockIds: string[] = [];
        const mockDimension = {
            getBlock: jest.fn(() => ({
                setType: jest.fn((block: any) => placedBlockIds.push(block.id)),
            })),
        };

        const { getDimension, getAllBlocks } = (globalThis as any).__mcServer;
        getDimension.mockReturnValue(mockDimension);
        getAllBlocks.mockReturnValue(new Array(5).fill(null).map((_, i) => ({ id: `block-${i}` })));

        const result = BlockPaletteSpawner.spawn({
            dimensionId: "overworld",
            excludeIds: ["block-1", "block-3"],
            filter: (blockId) => !blockId.endsWith("4"),
        });

        expect(result).toEqual({
            placed: 2,
            failed: 0,
            attempted: 2,
            filtered: 3,
            bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 3, y: 0, z: 0 } },
        });
        expect(placedBlockIds).toEqual(["block-0", "block-2"]);
    });

    it("excludes blocks by pattern prefix", () => {
        const placedBlockIds: string[] = [];
        const mockDimension = {
            getBlock: jest.fn(() => ({
                setType: jest.fn((block: any) => placedBlockIds.push(block.id)),
            })),
        };

        const { getDimension, getAllBlocks } = (globalThis as any).__mcServer;
        getDimension.mockReturnValue(mockDimension);
        getAllBlocks.mockReturnValue([
            { id: "element_1" },
            { id: "element_2" },
            { id: "elemental_block" },
            { id: "stone" },
            { id: "dirt" },
        ]);

        const result = BlockPaletteSpawner.spawn({
            dimensionId: "overworld",
            excludePatterns: ["element"],
        });

        expect(result).toEqual({
            placed: 2,
            failed: 0,
            attempted: 2,
            filtered: 3,
            bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 3, y: 0, z: 0 } },
        });
        expect(placedBlockIds).toEqual(["stone", "dirt"]);
    });
});
