import { CustomCommandAPI } from "../api_wrapper/minecraft";
import { BlockPaletteSpawner } from "../api_wrapper/minecraft/BlockPaletteSpawner";
import { CommandPermissionLevel } from "@minecraft/server";

export class SpawnBlockPaletteCommand {
    static register() {
        CustomCommandAPI.registerCommand(
            {
                name: "spawnblockpalette",
                description: "Spawn a palette of every block in a grid for quick browsing",
                permission: CommandPermissionLevel.Admin,
            },
            ({ sender, args }) => {
                const [dimensionArg, maxBlocksArg, spacingArg, gridWidthArg, layerHeightArg, originArg] = args ?? [];

                const dimensionId = dimensionArg || (sender.type !== "unknown" ? (sender as any).dimensionId : undefined);
                const origin = originArg || (sender.type !== "unknown" ? (sender as any).location : undefined);

                if (!dimensionId) {
                    return { message: "Failed: No dimension provided", status: 1 };
                }

                const parsedMaxBlocks = typeof maxBlocksArg === "number" && maxBlocksArg > 0 ? Math.floor(maxBlocksArg) : undefined;

                const result = BlockPaletteSpawner.spawn({
                    dimensionId,
                    origin: origin ?? { x: 0, y: 0, z: 0 },
                    maxBlocks: parsedMaxBlocks,
                    spacing: spacingArg,
                    gridWidth: gridWidthArg,
                    layerHeight: layerHeightArg,
                });

                if (result.failed > 0) {
                    return {
                        message: `Spawned ${result.placed}/${result.attempted} blocks with ${result.failed} failures`,
                        status: 1,
                    };
                }

                return { message: `Spawned ${result.placed} blocks`, status: 0 };
            }
        );
    }
}
