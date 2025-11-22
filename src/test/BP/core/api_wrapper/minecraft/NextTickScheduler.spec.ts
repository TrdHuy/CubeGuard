type RunTimeout = (callback: () => void, tickDelay: number) => void;

describe("NextTickScheduler", () => {
    it("resolves after scheduling a runTimeout call", async () => {
        jest.resetModules();

        let runTimeoutMock: jest.MockedFunction<RunTimeout> | undefined;
        let resultPromise: Promise<void> | undefined;

        jest.isolateModules(() => {
            runTimeoutMock = jest.fn<ReturnType<RunTimeout>, Parameters<RunTimeout>>((cb) => {
                cb();
            });

            jest.doMock("@minecraft/server", () => ({
                system: {
                    runTimeout: runTimeoutMock,
                },
            }));

            const { NextTickScheduler } = require("../../../../../main/BP/core/api_wrapper/minecraft/NextTickScheduler");
            resultPromise = NextTickScheduler.nextTick();
        });

        expect(runTimeoutMock).toBeDefined();
        expect(resultPromise).toBeDefined();

        await expect(resultPromise as Promise<void>).resolves.toBeUndefined();

        expect(runTimeoutMock as jest.MockedFunction<RunTimeout>).toHaveBeenCalledTimes(1);
        expect(runTimeoutMock as jest.MockedFunction<RunTimeout>).toHaveBeenCalledWith(expect.any(Function), 1);
    });
});
