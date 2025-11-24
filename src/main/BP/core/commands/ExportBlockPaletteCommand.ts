import { BlockPaletteExporter } from "../api_wrapper/minecraft/block_palette/BlockPaletteExporter";
import { CustomCommandAPI } from "../api_wrapper/minecraft/custom_command/CustomCommandAPI";

type Vector3 = { x: number; y: number; z: number };

export class ExportBlockPaletteCommand {
    static register() {
        CustomCommandAPI.registerCommand(
            {
                name: "creator:exportblockpalette",
                description: "Export block palette data as JSON using shared layout parameters",
                permission: CustomCommandAPI.getPermission("Admin"),
                mandatoryParameters: [{ name: "dimensionId", type: CustomCommandAPI.getParameterType("String") }],
                optionalParameters: [
                    { name: "origin", type: CustomCommandAPI.getParameterType("Location") },
                    { name: "maxBlocks", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "spacing", type: CustomCommandAPI.getParameterType("Float") },
                    { name: "gridWidth", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "layerHeight", type: CustomCommandAPI.getParameterType("Integer") },
                ],
            },
            ({ sender, args }) => {
                const [dimensionArg, originArg, maxBlocksArg, spacingArg, gridWidthArg, layerHeightArg] = args ?? [];

                const dimensionId = dimensionArg || (sender.type !== "unknown" ? (sender as any).dimensionId : undefined);
                const origin = (originArg as Vector3 | undefined) ?? (sender.type !== "unknown" ? (sender as any).location : undefined);

                if (!dimensionId) {
                    return { message: "Failed: No dimension provided", status: 1 };
                }

                if (!origin) {
                    return { message: "Failed: Provide origin", status: 1 };
                }

                const result = BlockPaletteExporter.export({
                    dimensionId,
                    origin,
                    maxBlocks: typeof maxBlocksArg === "number" && maxBlocksArg > 0 ? Math.floor(maxBlocksArg) : undefined,
                    spacing: typeof spacingArg === "number" ? spacingArg : undefined,
                    gridWidth: typeof gridWidthArg === "number" ? Math.floor(gridWidthArg) : undefined,
                    layerHeight: typeof layerHeightArg === "number" ? Math.floor(layerHeightArg) : undefined,
                });

                if (!result.success) {
                    return { message: `Failed: ${result.error}`, status: 1 };
                }

                BlockPaletteExporter.transmit(result.blocks, { dimensionId, bounds: result.bounds });

                return { message: `Exported ${result.blocks.length} blocks`, status: 0 };
            }
        );
    }
}
