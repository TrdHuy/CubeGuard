import { world } from "@minecraft/server";
import { EntityController } from "../core/entity_controller.js";

/**
 * @class PandaCreeperController
 * @description A custom controller for a "Panda Creeper" entity.
 * @extends EntityController
 */
export class PandaCreeperController extends EntityController {
    /**
     * @param {import("@minecraft/server").Entity} entity
     */
    constructor(entity) {
        super(entity);

        // Cooldown in ticks to prevent checking for players every single tick.
        // 60 ticks = 3 seconds
        this.detectionCooldown = 60; 
    }

    /**
     * Called when the Panda Creeper spawns.
     */
    OnSpawn() {
        this.entity.nameTag = "Panda Creeper";
        world.sendMessage("A wild Panda Creeper has spawned!");
    }

    /**
     * Called every tick.
     * @param {number} deltaTime The time since the last tick.
     */
    OnUpdate(deltaTime) {
        super.OnUpdate(deltaTime); // Important to call the base method to increment this.tick

        // Only run the detection logic every `detectionCooldown` ticks for performance.
        if (this.tick % this.detectionCooldown === 0) {
            const players = this.entity.dimension.getPlayers({
                location: this.entity.location,
                maxDistance: 5,
            });

            // If there is at least one player nearby
            if (players.length > 0) {
                world.sendMessage("🐼 Panda Creeper phát hiện người chơi!");

                // Play a sneeze sound
                this.entity.dimension.playSound("mob.panda.sneeze", this.entity.location);

                // Trigger the creeper's explosion behavior
                this.entity.triggerEvent("minecraft:start_exploding");
            }
        }
    }

    /**
     * Called when the Panda Creeper is removed from the world.
     */
    OnDestroy() {
        super.OnDestroy(); // Call base method to set isAlive to false
        world.sendMessage("The Panda Creeper has despawned.");
    }
}
