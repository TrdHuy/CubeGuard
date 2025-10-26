export function formatBlockBreakMessage(event) {
  const playerName = event?.player?.name ?? "Unknown Player";
  const blockType = event?.block?.typeId ?? "unknown block";
  const location = event?.block?.location ?? { x: 0, y: 0, z: 0 };
  const dimension = event?.block?.dimension?.id ?? "unknown dimension";

  return `🧱 ${playerName} just broke a ${blockType} at (${location.x}, ${location.y}, ${location.z}) in ${dimension}`;
}

export function handleBlockBreak(event, world, logger = console) {
  if (!world || typeof world.sendMessage !== "function") {
    throw new TypeError("A world object with a sendMessage function is required");
  }

  const message = formatBlockBreakMessage(event);
  world.sendMessage(message);

  const block = event?.block;
  const location = block?.location ?? { x: "?", y: "?", z: "?" };
  const blockType = block?.typeId ?? "unknown block";
  const playerName = event?.player?.name ?? "Unknown Player";

  if (logger?.warn) {
    logger.warn(
      `[DEBUG] Block broken: ${blockType} by ${playerName} @ ${location.x},${location.y},${location.z}`
    );
  }

  return message;
}
