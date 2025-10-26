import * as server from "@minecraft/server";
import { handleBlockBreak } from "./blockBreakHandler.js";

console.warn("[CubeGuard] Script loaded and listening for block break events!");

const w = server.world;

w.afterEvents.playerBreakBlock.subscribe((event) => {
  try {
    handleBlockBreak(event, w);
  } catch (err) {
    console.error("[CubeGuard] Error handling blockBreak event:", err);
  }
});
