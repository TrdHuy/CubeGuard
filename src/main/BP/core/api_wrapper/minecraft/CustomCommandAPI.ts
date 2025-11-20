// core/api_wrapper/minecraft/CommandAPI.ts
import { system, CommandPermissionLevel, CustomCommandParamType } from "@minecraft/server";

export const CommandPermissions = { ...CommandPermissionLevel };
export const CommandParameters = { ...CustomCommandParamType };

type CommandPermission = (typeof CommandPermissions)[keyof typeof CommandPermissions];
type CommandParameterType = (typeof CommandParameters)[keyof typeof CommandParameters];

export type CommandSenderSnapshot =
    | {
          type: "entity";
          name: string;
          dimensionId?: string;
          location?: { x: number; y: number; z: number };
      }
    | {
          type: "block";
          blockTypeId?: string;
          dimensionId?: string;
          location?: { x: number; y: number; z: number };
      }
    | { type: "unknown" };

export interface CustomCommandDefinition {
    name: string;
    description: string;
    permission?: CommandPermission;
    parameters?: { name: string; type: CommandParameterType }[];
}

export class CustomCommandAPI {
    static getPermission(level: keyof typeof CommandPermissions): CommandPermission {
        return CommandPermissions[level];
    }

    static getParameterType(type: keyof typeof CommandParameters): CommandParameterType {
        return CommandParameters[type];
    }

    private static buildSenderSnapshot(ctx: any): CommandSenderSnapshot {
        if (ctx?.sender) {
            return {
                type: "entity",
                name: ctx.sender?.nameTag ?? ctx.sender?.typeId ?? "",
                dimensionId: ctx.sender?.dimension?.id,
                location: ctx.sender?.location,
            };
        }

        if (ctx?.block) {
            return {
                type: "block",
                blockTypeId: ctx.block?.typeId,
                dimensionId: ctx.block?.dimension?.id,
                location: ctx.block?.location,
            };
        }

        return { type: "unknown" };
    }

    static registerCommand(
        def: CustomCommandDefinition,
        callback: (input: { sender: CommandSenderSnapshot; args: any[] }) => { message: string; status: number }
    ) {
        system.beforeEvents.startup.subscribe((ev: any) => {
            const cmdDef = {
                name: def.name,
                description: def.description,
                permissionLevel: def.permission ?? this.getPermission("Admin"),
                overloads: [
                    {
                        parameters: def.parameters ?? [],
                    },
                ],
            };

            ev.customCommandRegistry.registerCommand(cmdDef, (ctx: any, args: any[]) => {
                return callback({
                    sender: this.buildSenderSnapshot(ctx),
                    args: args,
                });
            });
        });
    }
}
