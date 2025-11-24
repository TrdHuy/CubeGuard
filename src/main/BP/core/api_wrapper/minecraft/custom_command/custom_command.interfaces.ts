import type { CommandParameterDefinition, CommandPermission } from "./custom_command.types";

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
