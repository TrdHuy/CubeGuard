/**
 * Strict Module Design v4 — System utilities wrapper cho world/system facade.
 *
 * - PUBLIC API: SystemUtils.nextTick được expose để lập lịch chạy ở tick kế tiếp.
 * - INTERNAL IMPLEMENTATION: Hàm helper không export để chọn scheduler phù hợp.
 * - EXPORT MODULES: Export default gom nhóm entry points.
 */
import { system } from "@minecraft/server";

// ====================== PUBLIC API ========================================

export class SystemUtils {
    static nextTick(): Promise<void> {
        return new Promise(resolve => {
            const schedule = selectScheduler();
            if (schedule) {
                schedule(() => resolve());
                return;
            }

            resolve();
        });
    }
}

// ====================== INTERNAL IMPLEMENTATION ===========================

type Scheduler = (callback: () => void) => void;

function selectScheduler(): Scheduler | undefined {
    if (typeof system.runTimeout === "function") {
        return (callback: () => void) => system.runTimeout(callback, 1);
    }

    if (typeof system.run === "function") {
        return (callback: () => void) => system.run(callback);
    }

    return undefined;
}

// ====================== EXPORT MODULES ====================================

export default { SystemUtils };
