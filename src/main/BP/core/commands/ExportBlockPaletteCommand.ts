import { BlockPaletteExporter } from "../api_wrapper/minecraft/BlockPaletteExporter";
import { CustomCommandAPI } from "../api_wrapper/minecraft/CustomCommandAPI";

type Vector3 = { x: number; y: number; z: number };

export class ExportBlockPaletteCommand {
    static register() {
        CustomCommandAPI.registerCommand(
            {
                name: "creator:exportblockpalette",
                description: "Export block data within a bounding box as JSON",
                permission: CustomCommandAPI.getPermission("Admin"),
                mandatoryParameters: [{ name: "dimensionId", type: CustomCommandAPI.getParameterType("String") }],
                optionalParameters: [
                    { name: "origin", type: CustomCommandAPI.getParameterType("Location") },
                    { name: "width", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "height", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "depth", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "min", type: CustomCommandAPI.getParameterType("Location") },
                    { name: "max", type: CustomCommandAPI.getParameterType("Location") },
                ],
            },
            ({ sender, args }) => {
                const [dimensionArg, originArg, widthArg, heightArg, depthArg, minArg, maxArg] = args ?? [];

                const dimensionId = dimensionArg || (sender.type !== "unknown" ? (sender as any).dimensionId : undefined);
                const origin = (originArg as Vector3 | undefined) ?? (sender.type !== "unknown" ? (sender as any).location : undefined);
                const min = minArg as Vector3 | undefined;
                const max = maxArg as Vector3 | undefined;

                if (!dimensionId) {
                    return { message: "Failed: No dimension provided", status: 1 };
                }

                const normalizedSize = {
                    width: typeof widthArg === "number" ? Math.floor(widthArg) : undefined,
                    height: typeof heightArg === "number" ? Math.floor(heightArg) : undefined,
                    depth: typeof depthArg === "number" ? Math.floor(depthArg) : undefined,
                };

                const sizeIsComplete =
                    normalizedSize.width !== undefined &&
                    normalizedSize.height !== undefined &&
                    normalizedSize.depth !== undefined;

                if (!origin && !min && !max) {
                    return { message: "Failed: Provide origin or min/max bounding box", status: 1 };
                }

                const result = BlockPaletteExporter.export({
                    dimensionId,
                    origin,
                    size: sizeIsComplete
                        ? {
                              width: normalizedSize.width as number,
                              height: normalizedSize.height as number,
                              depth: normalizedSize.depth as number,
                          }
                        : undefined,
                    min,
                    max,
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
