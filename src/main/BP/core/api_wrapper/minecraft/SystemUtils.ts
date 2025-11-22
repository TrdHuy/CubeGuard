import { system } from "@minecraft/server";

export class SystemUtils {
    static nextTick(): Promise<void> {
        return new Promise((resolve) => {
            const schedule = typeof system.runTimeout === "function" ? system.runTimeout.bind(system) : undefined;

            if (schedule) {
                schedule(() => resolve(), 1);
                return;
            }

            if (typeof system.run === "function") {
                system.run(() => resolve());
                return;
            }

            resolve();
        });
    }
}
