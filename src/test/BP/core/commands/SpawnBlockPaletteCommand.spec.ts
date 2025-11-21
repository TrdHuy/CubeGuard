import { SpawnBlockPaletteCommand } from "../../../../main/BP/core/commands/SpawnBlockPaletteCommand";
import { BlockPaletteSpawner } from "../../../../main/BP/core/api_wrapper/minecraft/BlockPaletteSpawner";

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

    it("requires a dimension and falls back to sender location", () => {
        const spawnSpy = jest.spyOn(BlockPaletteSpawner, "spawn").mockReturnValue({ placed: 1, failed: 0, attempted: 1 });
        SpawnBlockPaletteCommand.register();

        expect(commandHandler).toBeDefined();
        const noDimensionResult = commandHandler?.({});
        expect(noDimensionResult).toEqual({ message: "Failed: No dimension provided", status: 1 });

        const senderCtx = {
            sourceEntity: { location: { x: 5, y: 6, z: 7 }, dimension: { id: "overworld" }, nameTag: "Tester" },
        };
        const response = commandHandler?.(senderCtx);
        expect(spawnSpy).toHaveBeenCalledWith({
            dimensionId: "overworld",
            origin: { x: 5, y: 6, z: 7 },
            maxBlocks: undefined,
            spacing: undefined,
            gridWidth: undefined,
            layerHeight: undefined,
        });
        expect(response).toEqual({ message: "Spawned 1 blocks", status: 0 });
    });

    it("converts maxBlocks only when positive", () => {
        const spawnSpy = jest.spyOn(BlockPaletteSpawner, "spawn").mockReturnValue({ placed: 2, failed: 0, attempted: 2 });
        SpawnBlockPaletteCommand.register();

        const ctx = { sourceEntity: { location: { x: 0, y: 0, z: 0 }, dimension: { id: "overworld" } } };

        commandHandler?.(ctx, "overworld", -5);
        expect(spawnSpy).toHaveBeenLastCalledWith({
            dimensionId: "overworld",
            origin: { x: 0, y: 0, z: 0 },
            maxBlocks: undefined,
            spacing: undefined,
            gridWidth: undefined,
            layerHeight: undefined,
        });

        commandHandler?.(ctx, "overworld", 12);
        expect(spawnSpy).toHaveBeenLastCalledWith({
            dimensionId: "overworld",
            origin: { x: 0, y: 0, z: 0 },
            maxBlocks: 12,
            spacing: undefined,
            gridWidth: undefined,
            layerHeight: undefined,
        });
    });

    it("returns failure messaging when spawns fail", () => {
        jest.spyOn(BlockPaletteSpawner, "spawn").mockReturnValue({ placed: 3, failed: 2, attempted: 5 });
        SpawnBlockPaletteCommand.register();

        const ctx = { sourceEntity: { location: { x: 1, y: 1, z: 1 }, dimension: { id: "nether" } } };
        const result = commandHandler?.(ctx, "nether", 5, 2, 2, 3, { x: 1, y: 2, z: 3 });

        expect(result).toEqual({ message: "Spawned 3/5 blocks with 2 failures", status: 1 });
    });
});
