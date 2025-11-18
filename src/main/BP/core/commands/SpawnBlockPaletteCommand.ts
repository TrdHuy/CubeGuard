import {
    CommandPermissionLevel,
    CustomCommandAPI,
    CustomCommandParamType,
    CustomCommandStatus,
} from "../api_wrapper/minecraft";
import type { CommandSenderLocation } from "../api_wrapper/minecraft";
import { spawnBlockPalette } from "../api_wrapper/minecraft/BlockPaletteSpawner";

const COMMAND_NAME = "creator:spawn_block_palette";
const DESCRIPTION = "Spawns a reviewable palette grid of every enabled block type.";

CustomCommandAPI.registerCommand(
    {
        name: COMMAND_NAME,
        description: DESCRIPTION,
        permission: CommandPermissionLevel.Admin,
        parameters: [
            { name: "origin", type: CustomCommandParamType.Location },
            { name: "maxBlocks", type: CustomCommandParamType.Integer },
        ],
    },
    ({ sender, args }) => {
        const origin = (args[0] as CommandSenderLocation | undefined) ?? sender.location;
        const maxBlocksArg = typeof args[1] === "number" ? args[1] : undefined;

        if (!sender.dimensionId) {
            return {
                message: "Spawn palette failed: missing dimension context.",
                status: CustomCommandStatus.Failure,
            };
        }

        if (!origin) {
            return {
                message: "Spawn palette failed: please provide an origin location.",
                status: CustomCommandStatus.Failure,
            };
        }

        const maxBlocks = maxBlocksArg && maxBlocksArg > 0 ? maxBlocksArg : undefined;

        const result = spawnBlockPalette({
            origin,
            dimensionId: sender.dimensionId,
            maxBlocks,
        });

        return {
            message: `Spawned ${result.placed}/${result.attempted} palette blocks across ${result.layersUsed} layer(s). Total candidates: ${result.totalCandidates}.`,
            status: CustomCommandStatus.Success,
        };
    },
);
