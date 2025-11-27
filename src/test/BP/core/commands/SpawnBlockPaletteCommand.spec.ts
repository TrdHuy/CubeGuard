import { SpawnBlockPaletteCommand } from "../../../../main/BP/core/commands/SpawnBlockPaletteCommand";
import { BlockPaletteSpawner } from "../../../../main/BP/core/api_wrapper/minecraft/block_palette/BlockPaletteSpawner";

jest.mock("@minecraft/server", () => {
    const startupSubscribe = jest.fn();
    const getDimension = jest.fn();
    const getAllBlocks = jest.fn();
    (globalThis as any).__mcServer = { startupSubscribe, getDimension, getAllBlocks };
    return {
        system: { beforeEvents: { startup: { subscribe: startupSubscribe } } },
        CommandPermissionLevel: { Admin: "admin" },
        CustomCommandParamType: {
            String: "string",
            Integer: "integer",
            Float: "float",
            Location: "location",
        },
        world: { getDimension },
        BlockTypes: { getAll: getAllBlocks },
    };
});

describe("SpawnBlockPaletteCommand", () => {
    let commandHandler: ((ctx: any, ...args: any[]) => any) | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        commandHandler = undefined;
        const { startupSubscribe } = (globalThis as any).__mcServer;
        startupSubscribe.mockImplementation((handler: any) => {
            handler({
                customCommandRegistry: {
                    registerCommand: (_def: any, handler: any) => {
                        commandHandler = handler;
                    },
                },
            });
        });
    });

    it("requires a dimension and falls back to sender location", async () => {
        const spawnSpy = jest
            .spyOn(BlockPaletteSpawner, "spawn")
            .mockReturnValue({ placed: 1, failed: 0, attempted: 1, bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } } });
        SpawnBlockPaletteCommand.register();

        expect(commandHandler).toBeDefined();
        const noDimensionResult = commandHandler?.({});
        expect(noDimensionResult).toEqual({ message: "Failed: No dimension provided", status: 1 });

        const senderCtx = {
            sourceEntity: { location: { x: 5, y: 6, z: 7 }, dimension: { id: "overworld" }, nameTag: "Tester" },
        };
        const response = commandHandler?.(senderCtx);
        await Promise.resolve();
        expect(spawnSpy).toHaveBeenCalledWith({
            dimensionId: "overworld",
            origin: { x: 5, y: 6, z: 7 },
            maxBlocks: undefined,
            spacing: undefined,
            gridWidth: undefined,
            layerHeight: undefined,
            excludeIds: undefined,
            excludePatterns: undefined,
        });
        expect(response).toEqual({ message: "Starting block palette generation...", status: 0 });
    });

    it("converts maxBlocks only when positive", async () => {
        const spawnSpy = jest
            .spyOn(BlockPaletteSpawner, "spawn")
            .mockReturnValue({ placed: 2, failed: 0, attempted: 2, bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } } });
        SpawnBlockPaletteCommand.register();

        const ctx = { sourceEntity: { location: { x: 0, y: 0, z: 0 }, dimension: { id: "overworld" } } };

        commandHandler?.(ctx, "overworld", -5);
        await Promise.resolve();
        expect(spawnSpy).toHaveBeenLastCalledWith({
            dimensionId: "overworld",
            origin: { x: 0, y: 0, z: 0 },
            maxBlocks: undefined,
            spacing: undefined,
            gridWidth: undefined,
            layerHeight: undefined,
            excludeIds: undefined,
            excludePatterns: undefined,
        });

        commandHandler?.(ctx, "overworld", 12);
        await Promise.resolve();
        expect(spawnSpy).toHaveBeenLastCalledWith({
            dimensionId: "overworld",
            origin: { x: 0, y: 0, z: 0 },
            maxBlocks: 12,
            spacing: undefined,
            gridWidth: undefined,
            layerHeight: undefined,
            excludeIds: undefined,
            excludePatterns: undefined,
        });
    });

    it("returns failure messaging when spawns fail", async () => {
        const spawnSpy = jest.spyOn(BlockPaletteSpawner, "spawn").mockReturnValue({
            placed: 3,
            failed: 2,
            attempted: 5,
            bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } },
        });
        SpawnBlockPaletteCommand.register();

        const ctx = { sourceEntity: { location: { x: 1, y: 1, z: 1 }, dimension: { id: "nether" } } };
        const result = commandHandler?.(ctx, "nether", 5, 2, 2, 3, { x: 1, y: 2, z: 3 });

        expect(result).toEqual({ message: "Starting block palette generation...", status: 0 });
        await Promise.resolve();
        expect(spawnSpy).toHaveBeenCalledWith({
            dimensionId: "nether",
            origin: { x: 1, y: 2, z: 3 },
            maxBlocks: 5,
            spacing: 2,
            gridWidth: 2,
            layerHeight: 3,
            excludeIds: undefined,
            excludePatterns: undefined,
        });
    });

    it("parses exclude ids and patterns from arguments", async () => {
        const spawnSpy = jest.spyOn(BlockPaletteSpawner, "spawn").mockReturnValue({
            placed: 4,
            failed: 0,
            attempted: 4,
            bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } },
        });
        SpawnBlockPaletteCommand.register();

        const ctx = { sourceEntity: { location: { x: 2, y: 2, z: 2 }, dimension: { id: "overworld" } } };

        commandHandler?.(ctx, "overworld", undefined, undefined, undefined, undefined, undefined, "stone, dirt ",
            "element,/candle/");

        await Promise.resolve();
        expect(spawnSpy).toHaveBeenCalledWith({
            dimensionId: "overworld",
            origin: { x: 2, y: 2, z: 2 },
            maxBlocks: undefined,
            spacing: undefined,
            gridWidth: undefined,
            layerHeight: undefined,
            excludeIds: ["stone", "dirt"],
            excludePatterns: ["element", /candle/],
        });
    });
});
