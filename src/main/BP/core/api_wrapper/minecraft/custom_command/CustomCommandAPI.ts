// ============================================================================
// 📌 Module Name: CustomCommandAPI
// 🎯 Purpose    : Cung cấp wrapper đăng ký custom command cho Minecraft Bedrock
// 🧩 Description: Đóng gói registry custom command với tiện ích chuẩn hóa tham số và thông tin người gửi
// 🔒 Design     : Class-based Static API (CubeGuard)
// ============================================================================

import { system, CommandPermissionLevel, CustomCommandParamType } from "@minecraft/server";
import type { CustomCommand, CustomCommandOrigin, CustomCommandParameter, StartupEvent } from "@minecraft/server";
import type {
    CommandParameterDefinition,
    CommandParameterType,
    CommandPermission,
    CommandSenderSnapshot,
} from "./custom_command.types";
import type { CustomCommandDefinition } from "./custom_command.interfaces";

export class CustomCommandAPI {
    // ================= PUBLIC STATIC =================

    public static getPermission(level: keyof typeof CommandPermissionLevel): CommandPermission {
        return this.commandPermissions[level];
    }

    public static getParameterType(type: keyof typeof CustomCommandParamType): CommandParameterType {
        return this.commandParameters[type];
    }

    public static registerCommand(
        def: CustomCommandDefinition,
        callback: (input: { sender: CommandSenderSnapshot; args: any[] }) => { message: string; status: number }
    ) {
        system.beforeEvents.startup.subscribe((ev: StartupEvent) => {
            const cmdDef: CustomCommand = {
                name: def.name,
                description: def.description,
                permissionLevel: def.permission ?? this.getPermission("Admin"),
                mandatoryParameters: this.toRegistryParameters(def.mandatoryParameters),
                optionalParameters: this.toRegistryParameters(def.optionalParameters ?? def.parameters) ?? this.toRegistryParameters([]),
            };

            ev.customCommandRegistry.registerCommand(cmdDef, (ctx: CustomCommandOrigin, ...args: any[]) => {
                return callback({
                    sender: this.buildSenderSnapshot(ctx),
                    args,
                });
            });
        });
    }

    // ================= PRIVATE STATIC ================

    private static get commandPermissions(): typeof CommandPermissionLevel {
        return CommandPermissionLevel;
    }

    private static get commandParameters(): typeof CustomCommandParamType {
        return CustomCommandParamType;
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
}
