import * as server from "@minecraft/server";
import {
  createBlockBreakBroadcastMessage,
  createBlockBreakDebugMessage,
} from "./blockBreakHandler.js";

console.warn("[CubeGuard] Script loaded and listening for block break events!");

const world = server.world;

world.afterEvents.playerBreakBlock.subscribe((event) => {
  try {
    const playerName = event?.player?.name ?? "";
    const blockType = event?.block?.typeId ?? "";
    const location = event?.block?.location;
    const dimensionId = event?.block?.dimension?.id ?? "";

    const locationX = location?.x;
    const locationY = location?.y;
    const locationZ = location?.z;

    const broadcastMessage = createBlockBreakBroadcastMessage(
      playerName,
      blockType,
      locationX,
      locationY,
      locationZ,
      dimensionId
    );
    const debugMessage = createBlockBreakDebugMessage(
      playerName,
      blockType,
      locationX,
      locationY,
      locationZ
    );

    world.sendMessage(broadcastMessage);
    console.warn(debugMessage);
  } catch (error) {
    console.error("[CubeGuard] Error handling blockBreak event:", error);
  }
});
