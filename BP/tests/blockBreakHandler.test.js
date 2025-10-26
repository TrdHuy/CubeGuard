import test from "node:test";
import assert from "node:assert/strict";
import { formatBlockBreakMessage, handleBlockBreak } from "../scripts/blockBreakHandler.js";

const sampleEvent = {
  player: { name: "Alex" },
  block: {
    typeId: "minecraft:stone",
    location: { x: 1, y: 64, z: -5 },
    dimension: { id: "minecraft:overworld" }
  }
};

test("formatBlockBreakMessage returns the expected string", () => {
  const message = formatBlockBreakMessage(sampleEvent);
  assert.equal(
    message,
    "🧱 Alex just broke a minecraft:stone at (1, 64, -5) in minecraft:overworld"
  );
});

test("handleBlockBreak sends a chat message and logs debug information", () => {
  const messages = [];
  const warnings = [];
  const world = {
    sendMessage(message) {
      messages.push(message);
    }
  };

  const logger = {
    warn(message) {
      warnings.push(message);
    }
  };

  const message = handleBlockBreak(sampleEvent, world, logger);

  assert.equal(messages.length, 1);
  assert.equal(messages[0], message);
  assert.equal(
    message,
    "🧱 Alex just broke a minecraft:stone at (1, 64, -5) in minecraft:overworld"
  );
  assert.equal(warnings.length, 1);
  assert.match(
    warnings[0],
    /Block broken: minecraft:stone by Alex @ 1,64,-5/
  );
});

test("handleBlockBreak requires a world with sendMessage", () => {
  assert.throws(
    () => handleBlockBreak(sampleEvent, {}),
    /sendMessage/
  );
});
