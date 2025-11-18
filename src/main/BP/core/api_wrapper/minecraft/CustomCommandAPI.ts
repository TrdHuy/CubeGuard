// core/api_wrapper/minecraft/CustomCommandAPI.ts
import { system } from "@minecraft/server";
import type { CustomCommandOrigin, CustomCommandResult } from "@minecraft/server";
import {
    CommandPermissionLevel,
    CustomCommandParamType,
    CustomCommandSource,
    CustomCommandStatus,
} from "@minecraft/server";

export interface CommandSenderLocation {
    x: number;
    y: number;
    z: number;
}

export interface CommandSenderSnapshot {
    type: CustomCommandSource;
    dimensionId?: string;
    location?: CommandSenderLocation;
    name?: string;
}

export interface CustomCommandCallbackInput {
    sender: CommandSenderSnapshot;
    args: any[];
}

export type CustomCommandCallback = (
    input: CustomCommandCallbackInput,
) => CustomCommandResult | undefined;

function buildSenderSnapshot(origin: CustomCommandOrigin): CommandSenderSnapshot {
    const snapshot: CommandSenderSnapshot = {
        type: origin.sourceType,
    };

    if (origin.sourceEntity) {
        snapshot.location = {
            x: origin.sourceEntity.location.x,
            y: origin.sourceEntity.location.y,
            z: origin.sourceEntity.location.z,
        };
        snapshot.dimensionId = origin.sourceEntity.dimension.id;
        snapshot.name = origin.sourceEntity.nameTag;
    } else if (origin.sourceBlock) {
        snapshot.location = {
            x: origin.sourceBlock.location.x,
            y: origin.sourceBlock.location.y,
            z: origin.sourceBlock.location.z,
        };
        snapshot.dimensionId = origin.sourceBlock.dimension.id;
    }

    return snapshot;
}

export class CustomCommandAPI {
    static registerCommand(
        def: {
            name: string;
            description: string;
            permission?: CommandPermissionLevel;
            parameters?: { name: string; type: CustomCommandParamType }[];
        },
        callback: CustomCommandCallback,
    ) {
        system.beforeEvents.startup.subscribe((ev) => {
            const cmdDef = {
                name: def.name,
                description: def.description,
                permissionLevel: def.permission ?? CommandPermissionLevel.Admin,
                overloads: [
                    {
                        parameters: def.parameters ?? [],
                    },
                ],
            };

            ev.customCommandRegistry.registerCommand(cmdDef, (origin, ...args) => {
                const sender = buildSenderSnapshot(origin);
                return callback({
                    sender,
                    args,
                });
            });
        });
    }
}

export { CommandPermissionLevel, CustomCommandParamType, CustomCommandSource, CustomCommandStatus };
