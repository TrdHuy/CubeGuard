import { BlockPaletteExporter } from "../../../../../../main/BP/core/api_wrapper/minecraft/block_palette/BlockPaletteExporter";

jest.mock("@minecraft/server", () => {
    const getDimension = jest.fn();
    const sendMessage = jest.fn();
    const getAllBlocks = jest.fn(() => []);
    const mockWorld = { getDimension, sendMessage };
    (globalThis as any).__mcServer = { getDimension, sendMessage, getAllBlocks };
    return { world: mockWorld, BlockTypes: { getAll: getAllBlocks } };
});

describe("BlockPaletteExporter", () => {
    beforeEach(() => {
        const { getDimension, sendMessage, getAllBlocks } = (globalThis as any).__mcServer;
        getDimension.mockReset();
        sendMessage.mockReset();
        getAllBlocks.mockReset();
        getAllBlocks.mockReturnValue([{ id: "minecraft:stone" }]);
        jest.clearAllMocks();
    });

    it("returns failure when the origin is missing", () => {
        const result = BlockPaletteExporter.export({ dimensionId: "overworld" });

        expect(result).toEqual({ success: false, error: "Missing origin" });
    });

    it("fails when the dimension is unknown", () => {
        const { getDimension } = (globalThis as any).__mcServer;
        getDimension.mockReturnValue(undefined);

        const result = BlockPaletteExporter.export({
            dimensionId: "custom",
            origin: { x: 0, y: 0, z: 0 },
        });

        expect(getDimension).toHaveBeenCalledWith("custom");
        expect(result).toEqual({ success: false, error: "Unknown dimension: custom" });
    });

    it("handles dimension lookup throwing an error", () => {
        const { getDimension } = (globalThis as any).__mcServer;
        getDimension.mockImplementation(() => {
            throw new Error("failed");
        });

        const result = BlockPaletteExporter.export({
            dimensionId: "overworld",
            origin: { x: 0, y: 0, z: 0 },
        });

        expect(result).toEqual({ success: false, error: "Unknown dimension: overworld" });
    });

    it("collects non-air blocks with properties using the shared palette traversal", () => {
        const placedBlocks = new Map<string, any>();
        placedBlocks.set("1,2,3", {
            typeId: "minecraft:stone",
            location: { x: 1, y: 2, z: 3 },
            permutation: {
                getAllProperties: () => [
                    { name: "facing", value: "north" },
                    { name: "waterlogged", value: false },
                ],
            },
        });
        placedBlocks.set("2,2,4", { typeId: "minecraft:air" });

        const mockDimension = {
            getBlock: jest.fn((loc: any) => placedBlocks.get(`${loc.x},${loc.y},${loc.z}`)),
        };
        const { getDimension, getAllBlocks } = (globalThis as any).__mcServer;
        getDimension.mockReturnValue(mockDimension);
        getAllBlocks.mockReturnValue(new Array(4).fill(null).map((_, i) => ({ id: `block-${i}` })));

        const result = BlockPaletteExporter.export({
            dimensionId: "overworld",
            origin: { x: 1, y: 2, z: 3 },
            maxBlocks: 4,
            spacing: 1,
            gridWidth: 2,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.bounds).toEqual({
                min: { x: 1, y: 2, z: 3 },
                max: { x: 2, y: 2, z: 4 },
            });
            expect(result.blocks).toEqual([
                {
                    typeId: "minecraft:stone",
                    location: { x: 1, y: 2, z: 3 },
                    properties: [
                        { name: "facing", value: "north" },
                        { name: "waterlogged", value: false },
                    ],
                },
            ]);
        }

        expect(mockDimension.getBlock).toHaveBeenCalledTimes(4);
    });

    it("transmits a JSON payload and announces the export", () => {
        const { sendMessage } = (globalThis as any).__mcServer;
        const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

        const bounds = { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
        const length = BlockPaletteExporter.transmit(
            [
                {
                    typeId: "minecraft:stone",
                    location: { x: 0, y: 0, z: 0 },
                    properties: [],
                },
            ],
            { dimensionId: "overworld", bounds }
        );

        expect(length).toBeGreaterThan(0);
        expect(sendMessage).toHaveBeenCalledWith(
            expect.stringContaining("Exported 1 blocks from overworld")
        );
        expect(warnSpy).toHaveBeenCalled();
    });
});
