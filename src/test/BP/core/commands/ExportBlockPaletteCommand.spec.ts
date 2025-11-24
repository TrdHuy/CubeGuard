import { ExportBlockPaletteCommand } from "../../../../main/BP/core/commands/ExportBlockPaletteCommand";
import { BlockPaletteExporter } from "../../../../main/BP/core/api_wrapper/minecraft/block_palette/BlockPaletteExporter";
import { CustomCommandAPI } from "../../../../main/BP/core/api_wrapper/minecraft/custom_command/CustomCommandAPI";

jest.mock("../../../../main/BP/core/api_wrapper/minecraft/custom_command/CustomCommandAPI", () => {
    const registerCommand = jest.fn();
    const getPermission = jest.fn().mockReturnValue("admin");
    const getParameterType = jest.fn((type: any) => type);
    return {
        CustomCommandAPI: {
            registerCommand,
            getPermission,
            getParameterType,
        },
    };
});

jest.mock("../../../../main/BP/core/api_wrapper/minecraft/block_palette/BlockPaletteExporter", () => {
    return {
        BlockPaletteExporter: {
            export: jest.fn(),
            transmit: jest.fn(),
        },
    };
});

describe("ExportBlockPaletteCommand", () => {
    const registerCommand = CustomCommandAPI.registerCommand as jest.Mock;
    const exportMock = BlockPaletteExporter.export as jest.Mock;
    const transmitMock = BlockPaletteExporter.transmit as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    function getHandler() {
        ExportBlockPaletteCommand.register();
        const handler = registerCommand.mock.calls[0]?.[1];
        return handler as ((ctx: any) => any) | undefined;
    }

    it("registers the command with expected parameters", () => {
        getHandler();

        expect(registerCommand).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "creator:exportblockpalette",
                mandatoryParameters: [
                    { name: "dimensionId", type: "String" },
                ],
                optionalParameters: expect.arrayContaining([
                    expect.objectContaining({ name: "origin", type: "Location" }),
                    expect.objectContaining({ name: "maxBlocks", type: "Integer" }),
                    expect.objectContaining({ name: "spacing", type: "Float" }),
                    expect.objectContaining({ name: "gridWidth", type: "Integer" }),
                    expect.objectContaining({ name: "layerHeight", type: "Integer" }),
                ]),
                permission: "admin",
            }),
            expect.any(Function)
        );
    });

    it("requires an origin and dimension", () => {
        const handler = getHandler();

        const missingDimension = handler?.({ sender: { type: "unknown" }, args: [] });
        expect(missingDimension).toEqual({ message: "Failed: No dimension provided", status: 1 });

        const missingBounds = handler?.({ sender: { type: "unknown" }, args: ["overworld"] });
        expect(missingBounds).toEqual({ message: "Failed: Provide origin", status: 1 });
    });

    it("exports and transmits when bounds are valid", () => {
        const handler = getHandler();

        exportMock.mockReturnValue({
            success: true,
            bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } },
            blocks: [{ typeId: "minecraft:stone", properties: [], location: { x: 0, y: 0, z: 0 } }],
        });

        const result = handler?.({
            sender: { type: "unknown" },
            args: ["overworld", { x: 0, y: 0, z: 0 }, 2, 1.5, 4, 2],
        });

        expect(exportMock).toHaveBeenCalledWith({
            dimensionId: "overworld",
            origin: { x: 0, y: 0, z: 0 },
            maxBlocks: 2,
            spacing: 1.5,
            gridWidth: 4,
            layerHeight: 2,
        });
        expect(transmitMock).toHaveBeenCalledWith(
            [{ typeId: "minecraft:stone", properties: [], location: { x: 0, y: 0, z: 0 } }],
            { dimensionId: "overworld", bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } } }
        );
        expect(result).toEqual({ message: "Exported 1 blocks", status: 0 });
    });

    it("propagates export errors", () => {
        const handler = getHandler();

        exportMock.mockReturnValue({ success: false, error: "bad" });

        const result = handler?.({
            sender: { type: "unknown" },
            args: ["nether", { x: 0, y: 0, z: 0 }],
        });

        expect(result).toEqual({ message: "Failed: bad", status: 1 });
    });
});
