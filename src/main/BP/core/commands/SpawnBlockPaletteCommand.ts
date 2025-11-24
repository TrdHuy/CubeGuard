import { CustomCommandAPI } from "../api_wrapper/minecraft/custom_command/CustomCommandAPI";
import { BlockPaletteSpawner } from "../api_wrapper/minecraft/block_palette/BlockPaletteSpawner";
import { SystemUtils } from "../api_wrapper/minecraft/SystemUtils";
export class SpawnBlockPaletteCommand {
    static register() {
        CustomCommandAPI.registerCommand(
            {
                name: "creator:spawnblockpalette",
                description: "Spawn a palette of every block in a grid for quick browsing",
                permission: CustomCommandAPI.getPermission("Admin"),
                parameters: [
                    { name: "dimensionId", type: CustomCommandAPI.getParameterType("String") },
                    { name: "maxBlocks", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "spacing", type: CustomCommandAPI.getParameterType("Float") },
                    { name: "gridWidth", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "layerHeight", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "origin", type: CustomCommandAPI.getParameterType("Location") },
                ],
            },
            ({ sender, args }) => {
                const [dimensionArg, maxBlocksArg, spacingArg, gridWidthArg, layerHeightArg, originArg] = args ?? [];

                const dimensionId = dimensionArg || (sender.type !== "unknown" ? (sender as any).dimensionId : undefined);
                const origin = originArg || (sender.type !== "unknown" ? (sender as any).location : undefined);

                if (!dimensionId) {
                    return { message: "Failed: No dimension provided", status: 1 };
                }

                const parsedMaxBlocks = typeof maxBlocksArg === "number" && maxBlocksArg > 0 ? Math.floor(maxBlocksArg) : undefined;

                SystemUtils.nextTick().then(() => {
                    const result = BlockPaletteSpawner.spawn({
                        dimensionId,
                        origin: origin ?? { x: 0, y: 0, z: 0 },
                        maxBlocks: parsedMaxBlocks,
                        spacing: spacingArg,
                        gridWidth: gridWidthArg,
                        layerHeight: layerHeightArg,
                    });

                    console.warn(
                        `[SpawnBlockPalette] Spawned ${result.placed}/${result.attempted} blocks (failed=${result.failed})`
                    );
                });

                // Callback phải return ngay
                return {
                    message: "Starting block palette generation...",
                    status: 0,
                };
            }
        );
    }
}
