// core/api_wrapper/minecraft/CommandAPI.ts
import { system } from "@minecraft/server";
import {
    CommandPermissionLevel,
    CustomCommandParamType
} from "@minecraft/server";

export class CustomCommandAPI {

    static registerCommand(def: {
        name: string;
        description: string;
        permission?: CommandPermissionLevel;
        parameters?: { name: string; type: CustomCommandParamType }[];
    }, callback: (input: {
        sender: string;
        args: any[];
    }) => { message: string; status: number }) {

        system.beforeEvents.startup.subscribe(ev => {

            const cmdDef = {
                name: def.name,
                description: def.description,
                permissionLevel: def.permission ?? CommandPermissionLevel.Admin,
                overloads: [{
                    parameters: def.parameters ?? []
                }]
            };

            ev.customCommandRegistry.registerCommand(cmdDef, (_ctx, args) => {
				return callback({
                    sender: "",
                    args: args
                });
            });
        });
    }
}