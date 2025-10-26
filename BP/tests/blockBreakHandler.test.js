import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createBlockBreakBroadcastMessage,
  createBlockBreakDebugMessage,
} from "../scripts/blockBreakHandler.js";

test("createBlockBreakBroadcastMessage returns formatted details", () => {
  // Arrange
  const playerName = "Alex";
  const blockType = "minecraft:stone";
  const locationX = 1;
  const locationY = 64;
  const locationZ = -5;
  const dimensionId = "minecraft:overworld";

  // Act
  const result = createBlockBreakBroadcastMessage(
    playerName,
    blockType,
    locationX,
    locationY,
    locationZ,
    dimensionId
  );

  // Assert
  assert.equal(
    result,
    "🧱 Alex just broke a minecraft:stone at (1, 64, -5) in minecraft:overworld"
  );
});

test("createBlockBreakDebugMessage returns sanitized fallback strings", () => {
  // Arrange
  const playerName = "";
  const blockType = "";
  const locationX = undefined;
  const locationY = undefined;
  const locationZ = undefined;

  // Act
  const result = createBlockBreakDebugMessage(
    playerName,
    blockType,
    locationX,
    locationY,
    locationZ
  );

  // Assert
  assert.equal(
    result,
    "[DEBUG] Block broken: unknown block by Unknown Player @ (0, 0, 0)"
  );
});

test("createBlockBreakBroadcastMessage clamps non-finite coordinates to zero", () => {
  // Arrange
  const playerName = "Steve";
  const blockType = "minecraft:diamond_block";
  const locationX = Number.POSITIVE_INFINITY;
  const locationY = Number.NaN;
  const locationZ = Number.NEGATIVE_INFINITY;
  const dimensionId = "minecraft:the_end";

  // Act
  const result = createBlockBreakBroadcastMessage(
    playerName,
    blockType,
    locationX,
    locationY,
    locationZ,
    dimensionId
  );

  // Assert
  assert.equal(
    result,
    "🧱 Steve just broke a minecraft:diamond_block at (0, 0, 0) in minecraft:the_end"
  );
});
