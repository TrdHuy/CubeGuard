import { world } from "@minecraft/server";
import { EntityController } from "../core/entity_controller";

/**
 * @class PandaCreeperController
 * @description Controller tùy chỉnh cho mob "Panda Creeper".
 * @extends EntityController
 */
export class PandaCreeperController extends EntityController {
    private detectionCooldown: number;

    constructor(entity: import("@minecraft/server").Entity) {
        super(entity);

        // Thời gian chờ (tính bằng tick) để tránh kiểm tra người chơi mỗi tick.
        // 60 ticks = 3 giây
        this.detectionCooldown = 60;
    }

    /**
     * Được gọi khi Panda Creeper xuất hiện.
     */
    OnSpawn(): void {
        this.entity.nameTag = "Panda Creeper";
        world.sendMessage("A wild Panda Creeper has spawned!");
    }

    /**
     * Được gọi mỗi tick.
     * @param {number} deltaTime Thời gian kể từ tick trước.
     */
    OnUpdate(deltaTime: number): void {
        super.OnUpdate(deltaTime); // Quan trọng: gọi phương thức của lớp cha để tăng this.tick

        // Chỉ chạy logic phát hiện mỗi `detectionCooldown` tick để tối ưu hiệu suất.
        if (this.tick % this.detectionCooldown === 0) {
            const players = this.entity.dimension.getPlayers({
                location: this.entity.location,
                maxDistance: 5,
            });

            // Nếu có ít nhất một người chơi ở gần
            if (players.length > 0) {
                world.sendMessage("🐼 Panda Creeper phát hiện người chơi!");

                // Phát ra âm thanh hắt xì
                this.entity.dimension.playSound("mob.panda.sneeze", this.entity.location);

                // Kích hoạt hành vi phát nổ của creeper
                this.entity.triggerEvent("minecraft:start_exploding");
            }
        }
    }

    /**
     * Được gọi khi Panda Creeper bị xóa khỏi thế giới.
     */
    OnDestroy(): void {
        super.OnDestroy(); // Gọi phương thức của lớp cha để đặt isAlive thành false
        world.sendMessage("The Panda Creeper has despawned.");
    }
}
