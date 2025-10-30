import { world } from "@minecraft/server";
import { EntityControllerSystem } from "./core/entity_controller.js";
import { PandaCreeperController } from "./mobs/panda_creeper_controller.js";

// --- System Initialization ---
// It's good practice to ensure the system is a singleton, 
// so we'll check if it has been initialized before.
if (!world.ecs) {
    world.ecs = new EntityControllerSystem();
    
    // --- Controller Registration ---
    // Register all your custom entity controllers here.
    // The system will automatically instantiate them when the corresponding entity spawns.
    
    world.ecs.registerType("myname:testentity", PandaCreeperController);
    // To add another mob, you would do:
    // import { AnotherMobController } from "./mobs/another_mob_controller.js";
    // world.ecs.registerType("myname:anothermob", AnotherMobController);

    world.afterEvents.worldInitialize.subscribe(() => {
        console.log("[Main] Entity Controller System initialized successfully.");
    });
}
