import { world, PlayerBreakBlockAfterEvent } from "@minecraft/server";
import { createBlockBreakBroadcastMessage, createBlockBreakDebugMessage } from "./blockBreakHandler.js";
import { EntityControllerSystem } from "./core/entity_controller.js";
import { PandaCreeperController } from "./mobs/panda_creeper_controller.js";
console.log("[Main] Begin the script: v0.0.1");


// ============================================================================
// VÙNG LOGIC CŨ - DÀNH CHO DEBUG
// ============================================================================

// Lắng nghe sự kiện khi một khối bị phá hủy
world.afterEvents.playerBreakBlock.subscribe((event: PlayerBreakBlockAfterEvent) => {
    const { player, block, dimension } = event;
    const playerName = player.name;
    const blockType = block.typeId;
    const location = block.location;
    const dimensionId = dimension.id;

    // Tạo và gửi tin nhắn broadcast
    const broadcastMessage = createBlockBreakBroadcastMessage(
        playerName,
        blockType,
        location.x,
        location.y,
        location.z,
        dimensionId
    );
    world.sendMessage(broadcastMessage);

    // Tạo và ghi log tin nhắn debug
    const debugMessage = createBlockBreakDebugMessage(
        playerName,
        blockType,
        location.x,
        location.y,
        location.z
    );
    console.log(debugMessage);
});


// ============================================================================
// VÙNG LOGIC MỚI - HỆ THỐNG ENTITY CONTROLLER
// ============================================================================

// --- Khởi tạo Hệ thống ---
// Đảm bảo hệ thống là một singleton bằng cách kiểm tra xem nó đã được khởi tạo chưa.

// Augment the World interface to include our custom ecs property
declare module "@minecraft/server" {
    interface World {
        ecs: EntityControllerSystem;
    }
}

if (!world.ecs) {
    world.ecs = new EntityControllerSystem();

    // --- Đăng ký Controller ---
    // Đăng ký tất cả các controller tùy chỉnh của bạn tại đây.
    // Hệ thống sẽ tự động tạo instance của chúng khi entity tương ứng xuất hiện.

    world.ecs.registerType("myname:testentity", PandaCreeperController);
    // Để thêm một mob khác, bạn sẽ làm như sau:
    // import { AnotherMobController } from "./mobs/another_mob_controller.js";
    // world.ecs.registerType("myname:anothermob", AnotherMobController);

    world.afterEvents.worldInitialize.subscribe(() => {
        console.log("[Main] Entity Controller System initialized successfully.");
    });
}
