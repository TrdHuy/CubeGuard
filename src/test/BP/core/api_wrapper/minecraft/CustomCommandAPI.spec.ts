import { CustomCommandAPI } from "../../../../../main/BP/core/api_wrapper/minecraft/custom_command/CustomCommandAPI";
import type { CommandSenderSnapshot } from "../../../../../main/BP/core/api_wrapper/minecraft/custom_command/custom_command.types";

jest.mock("@minecraft/server", () => {
    const startupSubscribe = jest.fn();
    const runTimeout = jest.fn();
    (globalThis as any).__mcServer = { startupSubscribe };
    return {
        system: {
            beforeEvents: {
                startup: {
                    subscribe: startupSubscribe,
                },
            },
            runTimeout,
        },
        CommandPermissionLevel: { Admin: "admin" },
        CustomCommandParamType: {
            String: "string",
            Integer: "integer",
            Float: "float",
            Location: "location",
        },
    };
});

type StartupHandler = (ev: any) => void;

type RegisteredCommand = {
    definition: any;
    handler: (ctx: any, ...args: any[]) => any;
};

describe("CustomCommandAPI", () => {
    let startupHandler: StartupHandler | undefined;
    let registeredCommand: RegisteredCommand | undefined;

    beforeEach(() => {
        const { startupSubscribe } = (globalThis as any).__mcServer;
        startupSubscribe.mockImplementation((handler: StartupHandler) => {
            startupHandler = handler;
        });
        registeredCommand = undefined;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    function runStartup() {
        startupHandler?.({
            customCommandRegistry: {
                registerCommand: (definition: any, handler: any) => {
                    registeredCommand = { definition, handler };
                },
            },
        });
    }

    it("registers the command and forwards args unchanged", () => {
        const callback = jest.fn().mockReturnValue({ message: "ok", status: 0 });

        CustomCommandAPI.registerCommand(
            {
                name: "test",
                description: "Testing command",
            },
            callback
        );

        const { startupSubscribe } = (globalThis as any).__mcServer;
        expect(startupSubscribe).toHaveBeenCalledTimes(1);

        runStartup();

        expect(registeredCommand?.definition).toMatchObject({
            name: "test",
            description: "Testing command",
            permissionLevel: "admin",
        });

        const args = ["one", 2, { complex: true }];
        registeredCommand?.handler({ sourceEntity: { nameTag: "Tester" } }, ...args);

        expect(callback).toHaveBeenCalledWith({
            sender: expect.objectContaining({ type: "entity", name: "Tester" }),
            args,
        });
    });

    it("builds sender snapshot from entity or block contexts", () => {
        const snapshots: CommandSenderSnapshot[] = [];
        const callback = jest.fn(({ sender }) => {
            snapshots.push(sender);
            return { message: "", status: 0 };
        });

        CustomCommandAPI.registerCommand({ name: "test", description: "test" }, callback);

        runStartup();

        registeredCommand?.handler(
            {
                sourceEntity: {
                    nameTag: "PlayerOne",
                    location: { x: 1, y: 2, z: 3 },
                    dimension: { id: "overworld" },
                    typeId: "minecraft:player",
                },
            }
        );

        registeredCommand?.handler(
            {
                sourceBlock: {
                    typeId: "minecraft:command_block",
                    location: { x: 4, y: 5, z: 6 },
                    dimension: { id: "nether" },
                },
            }
        );

        expect(snapshots[0]).toEqual({
            type: "entity",
            name: "PlayerOne",
            dimensionId: "overworld",
            location: { x: 1, y: 2, z: 3 },
        });

        expect(snapshots[1]).toEqual({
            type: "block",
            blockTypeId: "minecraft:command_block",
            dimensionId: "nether",
            location: { x: 4, y: 5, z: 6 },
        });
    });
});
