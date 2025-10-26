import * as server from "@minecraft/server"
import * as ui from "@minecraft/server-ui"

// In ra console khi script bắt đầu
console.warn("[CubeGuard] Script loaded and listening for block break events!");

const w = server.world
// Đăng ký listener cho sự kiện phá block
w.afterEvents.playerBreakBlock.subscribe((event) => {
    try {
        const player = event.player;     // Người chơi phá block
        const block = event.block;       // Block bị phá
        const dim = block.dimension.id;  // Dimension (overworld / nether / end)

        // Gửi thông báo trong chat
        w.sendMessage(
            `🧱 ${player.name} just broke a3 ${block.typeId} at (${block.location.x}, ${block.location.y}, ${block.location.z}) in ${dim}`
        );

        // Ghi log ra console debug
        console.warn(`[DEBUG] Block broken: ${block.typeId} by ${player.name} @ ${block.location.x},${block.location.y},${block.location.z}`);

    } catch (err) {
        console.error("[CubeGuard] Error handling blockBreak event:", err);
    }
});