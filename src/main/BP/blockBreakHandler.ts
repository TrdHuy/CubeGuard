// ============================================================================
// 📌 Module Name: BlockBreakHandler
// 🎯 Purpose    : Provide pure message builders for block break events
// 🧩 Description: Supplies sanitized strings for broadcast and debug logging
// 🔗 Dependencies: (none)
//
// 🏷 Public APIs:
//   - createBlockBreakBroadcastMessage(playerName, blockType, locationX, locationY, locationZ, dimensionId) → string
//   - createBlockBreakDebugMessage(playerName, blockType, locationX, locationY, locationZ) → string
//
// 🔒 Internal Logic (cũng phải dùng primitive parameters):
//   - _sanitizeName(value)
//   - _sanitizeBlockType(value)
//   - _sanitizeDimension(value)
//   - _sanitizeCoordinate(value)
//   - _formatCoordinateTriplet(x, y, z)
//
// 🧪 Testability:
//   - Test file: blockBreakHandler.test.js
//   - Test tất cả Public API theo Arrange → Act → Assert
//
// ✍️ Author  : AI-Generated Using Standard Prompt
// 📅 Created : 2024-03-14
// ♻️ Updated : 2024-03-14
// ============================================================================


// ====================== PUBLIC API IMPLEMENTATION ==========================

function createBlockBreakBroadcastMessage(playerName: string, blockType: string, locationX: number, locationY: number, locationZ: number, dimensionId: string): string {
    const safePlayer = _sanitizeName(playerName);
    const safeBlock = _sanitizeBlockType(blockType);
    const safeCoords = _formatCoordinateTriplet(locationX, locationY, locationZ);
    const safeDimension = _sanitizeDimension(dimensionId);
    return `🧱 ${safePlayer} just broke a ${safeBlock} at ${safeCoords} in ${safeDimension}`;
}

function createBlockBreakDebugMessage(playerName: string, blockType: string, locationX: number, locationY: number, locationZ: number): string {
    const safePlayer = _sanitizeName(playerName);
    const safeBlock = _sanitizeBlockType(blockType);
    const safeCoords = _formatCoordinateTriplet(locationX, locationY, locationZ);
    return `[DEBUG] Block broken: ${safeBlock} by ${safePlayer} @ ${safeCoords}`;
}


// ====================== INTERNAL IMPLEMENTATION ===========================

function _sanitizeName(value: string): string {
    if (typeof value === "string" && value.trim() !== "") {
        return value.trim();
    }
    return "Unknown Player";
}

function _sanitizeBlockType(value: string): string {
    if (typeof value === "string" && value.trim() !== "") {
        return value.trim();
    }
    return "unknown block";
}

function _sanitizeDimension(value: string): string {
    if (typeof value === "string" && value.trim() !== "") {
        return value.trim();
    }
    return "unknown dimension";
}

function _sanitizeCoordinate(value: number): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    return 0;
}

function _formatCoordinateTriplet(x: number, y: number, z: number): string {
    const safeX = _sanitizeCoordinate(x);
    const safeY = _sanitizeCoordinate(y);
    const safeZ = _sanitizeCoordinate(z);
    return `(${safeX}, ${safeY}, ${safeZ})`;
}


// ====================== EXPORT MODULES ====================================

export { createBlockBreakBroadcastMessage, createBlockBreakDebugMessage };
