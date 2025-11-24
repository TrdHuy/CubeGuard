/**
 * Strict Module Design v4 — Wrapper layer for @minecraft/server Custom Command API.
 *
 * Quy tắc:
 * - PUBLIC API: Chỉ export các hằng/kiểu/entry point cần dùng bên ngoài.
 * - INTERNAL IMPLEMENTATION: Hàm private (không export) để validate và chuẩn hóa dữ liệu đầu vào.
 * - EXPORT MODULES: Export default để gom các entry point công khai khi cần.
 */
import { system, CommandPermissionLevel, CustomCommandParamType } from "@minecraft/server";
import type { CustomCommand, CustomCommandOrigin, CustomCommandParameter, StartupEvent } from "@minecraft/server";

export const CommandPermissions: typeof CommandPermissionLevel = CommandPermissionLevel;
export const CommandParameters: typeof CustomCommandParamType = CustomCommandParamType;

type CommandPermission = CommandPermissionLevel;
type CommandParameterType = CustomCommandParamType;

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

    static registerCommand(
        def: CustomCommandDefinition,
        callback: (input: { sender: CommandSenderSnapshot; args: any[] }) => { message: string; status: number }
    ) {
        validateCommandDefinition(def);

        system.beforeEvents.startup.subscribe((ev: StartupEvent) => {
            const normalized = normalizeCommandDefinition(def);
            const cmdDef: CustomCommand = {
                name: normalized.name,
                description: normalized.description,
                permissionLevel: normalized.permissionLevel,
                mandatoryParameters: normalized.mandatoryParameters,
                optionalParameters: normalized.optionalParameters,
            };

            ev.customCommandRegistry.registerCommand(cmdDef, (ctx: CustomCommandOrigin, ...args: any[]) => {
                return callback({
                    sender: buildSenderSnapshot(ctx),
                    args,
                });
            });
        });
    }
}

// ====================== INTERNAL IMPLEMENTATION ===========================

function toRegistryParameters(parameters?: CommandParameterDefinition[]): CustomCommandParameter[] | undefined {
    return parameters?.map(parameter => ({ name: parameter.name, type: parameter.type } as CustomCommandParameter));
}

function buildSenderSnapshot(ctx: CustomCommandOrigin): CommandSenderSnapshot {
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

function validateCommandDefinition(def: CustomCommandDefinition): void {
    if (!def || typeof def.name !== "string" || def.name.trim().length === 0) {
        throw new Error("Command name is required and must be a non-empty string");
    }

    if (typeof def.description !== "string" || def.description.trim().length === 0) {
        throw new Error("Command description is required and must be a non-empty string");
    }

    const parameterSets = [def.mandatoryParameters, def.optionalParameters, def.parameters];
    parameterSets.forEach(parameterList => {
        if (!parameterList) return;
        parameterList.forEach(parameter => {
            if (typeof parameter?.name !== "string" || parameter.name.trim().length === 0) {
                throw new Error("Command parameter name must be a non-empty string");
            }

            if (!parameter?.type) {
                throw new Error(`Command parameter type is missing for parameter "${parameter?.name ?? "unknown"}"`);
            }
        });
    });
}

function normalizeCommandDefinition(def: CustomCommandDefinition): {
    name: string;
    description: string;
    permissionLevel: CommandPermission;
    mandatoryParameters?: CustomCommandParameter[];
    optionalParameters?: CustomCommandParameter[];
} {
    return {
        name: def.name.trim(),
        description: def.description.trim(),
        permissionLevel: def.permission ?? CommandPermissionLevel.Admin,
        mandatoryParameters: toRegistryParameters(def.mandatoryParameters),
        optionalParameters:
            toRegistryParameters(def.optionalParameters ?? def.parameters) ?? toRegistryParameters([]),
    };
}

// ====================== EXPORT MODULES ====================================

export default { CustomCommandAPI, CommandPermissions, CommandParameters };
