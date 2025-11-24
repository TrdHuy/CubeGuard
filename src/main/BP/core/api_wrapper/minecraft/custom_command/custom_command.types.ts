import type { CommandPermissionLevel, CustomCommandParamType } from "@minecraft/server";

export type CommandPermission = CommandPermissionLevel;
export type CommandParameterType = CustomCommandParamType;

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
