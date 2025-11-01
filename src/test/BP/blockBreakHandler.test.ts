import {
  createBlockBreakBroadcastMessage,
  createBlockBreakDebugMessage,
} from "../../main/BP/blockBreakHandler";

describe("BlockBreakHandler", () => {
  it("should create a formatted broadcast message with valid inputs", () => {
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
    expect(result).toBe(
      "🧱 Alex just broke a minecraft:stone at (1, 64, -5) in minecraft:overworld"
    );
  });

  it("should return a debug message with sanitized fallbacks for empty inputs", () => {
    // Arrange
    const playerName = "";
    const blockType = "";
    const locationX = undefined as any;
    const locationY = undefined as any;
    const locationZ = undefined as any;

    // Act
    const result = createBlockBreakDebugMessage(
      playerName,
      blockType,
      locationX,
      locationY,
      locationZ
    );

    // Assert
    expect(result).toBe(
      "[DEBUG] Block broken: unknown block by Unknown Player @ (0, 0, 0)"
    );
  });

  it("should clamp non-finite coordinates to zero in the broadcast message", () => {
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
    expect(result).toBe(
      "🧱 Steve just broke a minecraft:diamond_block at (0, 0, 0) in minecraft:the_end"
    );
  });
});
