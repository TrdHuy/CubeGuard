// core/api_wrapper/minecraft/CommandAPI.ts
import {
    system,
    CommandPermissionLevel,
    CustomCommandParamType,
    CustomCommand,
    CustomCommandOrigin,
    CustomCommandParameter,
    StartupEvent,
} from "@minecraft/server";

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

export type CommandParameterDefinition = { name: string; type: CommandParameterType };

export interface CustomCommandDefinition {
    name: string;
    description: string;
    permission?: CommandPermission;
    mandatoryParameters?: CommandParameterDefinition[];
    optionalParameters?: CommandParameterDefinition[];
    /**
     * @deprecated Use mandatoryParameters or optionalParameters instead.
     */
    parameters?: CommandParameterDefinition[];
}

export class CustomCommandAPI {
    static getPermission(level: keyof typeof CommandPermissions): CommandPermission {
        return CommandPermissions[level];
    }

    static getParameterType(type: keyof typeof CommandParameters): CommandParameterType {
        return CommandParameters[type];
    }

    private static toRegistryParameters(parameters?: CommandParameterDefinition[]): CustomCommandParameter[] | undefined {
        return parameters?.map(parameter => ({ name: parameter.name, type: parameter.type } as CustomCommandParameter));
    }

    private static buildSenderSnapshot(ctx: CustomCommandOrigin): CommandSenderSnapshot {
        if (ctx?.sourceEntity) {
            return {
                type: "entity",
                name: ctx.sourceEntity?.nameTag ?? ctx.sourceEntity?.typeId ?? "",
                dimensionId: ctx.sourceEntity?.dimension?.id,
                location: ctx.sourceEntity?.location,
            };
        }

        if (ctx?.sourceBlock) {
            return {
                type: "block",
                blockTypeId: ctx.sourceBlock?.typeId,
                dimensionId: ctx.sourceBlock?.dimension?.id,
                location: ctx.sourceBlock?.location,
            };
        }

        return { type: "unknown" };
    }

    static registerCommand(
        def: CustomCommandDefinition,
        callback: (input: { sender: CommandSenderSnapshot; args: any[] }) => { message: string; status: number }
    ) {
        system.beforeEvents.startup.subscribe((ev: StartupEvent) => {
            const cmdDef: CustomCommand = {
                name: def.name,
                description: def.description,
                permissionLevel: def.permission ?? this.getPermission("Admin"),
                mandatoryParameters: this.toRegistryParameters(def.mandatoryParameters),
                optionalParameters:
                    this.toRegistryParameters(def.optionalParameters ?? def.parameters) ?? this.toRegistryParameters([]),
            };

            ev.customCommandRegistry.registerCommand(cmdDef, (ctx: CustomCommandOrigin, ...args: any[]) => {
                return callback({
                    sender: this.buildSenderSnapshot(ctx),
                    args,
                });
            });
        });
    }
}
