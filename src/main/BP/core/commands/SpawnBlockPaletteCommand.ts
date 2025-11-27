import { CustomCommandAPI } from "../api_wrapper/minecraft/custom_command/CustomCommandAPI";
import { BlockPaletteSpawner } from "../api_wrapper/minecraft/block_palette/BlockPaletteSpawner";
import { SystemUtils } from "../api_wrapper/minecraft/SystemUtils";
export class SpawnBlockPaletteCommand {
    static register() {
        CustomCommandAPI.registerCommand(
            {
                name: "creator:spawnblockpalette",
                description:
                    "Spawn a palette of every block in a grid for quick browsing. Supports excludeIds/excludePatterns filters.",
                permission: CustomCommandAPI.getPermission("Admin"),
                parameters: [
                    { name: "dimensionId", type: CustomCommandAPI.getParameterType("String") },
                    { name: "maxBlocks", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "spacing", type: CustomCommandAPI.getParameterType("Float") },
                    { name: "gridWidth", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "layerHeight", type: CustomCommandAPI.getParameterType("Integer") },
                    { name: "origin", type: CustomCommandAPI.getParameterType("Location") },
                    { name: "excludeIds", type: CustomCommandAPI.getParameterType("String") },
                    { name: "excludePatterns", type: CustomCommandAPI.getParameterType("String") },
                ],
            },
            ({ sender, args }) => {
                const [
                    dimensionArg,
                    maxBlocksArg,
                    spacingArg,
                    gridWidthArg,
                    layerHeightArg,
                    originArg,
                    excludeIdsArg,
                    excludePatternsArg,
                ] = args ?? [];

                const dimensionId = dimensionArg || (sender.type !== "unknown" ? (sender as any).dimensionId : undefined);
                const origin = originArg || (sender.type !== "unknown" ? (sender as any).location : undefined);

                if (!dimensionId) {
                    return { message: "Failed: No dimension provided", status: 1 };
                }

                const parsedMaxBlocks = typeof maxBlocksArg === "number" && maxBlocksArg > 0 ? Math.floor(maxBlocksArg) : undefined;
                const parsedExcludeIds = SpawnBlockPaletteCommand.parseStringList(excludeIdsArg);
                const parsedExcludePatterns = SpawnBlockPaletteCommand.parsePatternList(excludePatternsArg);

                console.warn(
                    `[SpawnBlockPalette] Command args => sender=${"name" in sender ? (sender as any).name ?? sender.type : sender.type}, dimension=${dimensionId}, origin=${JSON.stringify(origin)}, maxBlocks(raw/parsed)=${maxBlocksArg}/${parsedMaxBlocks}, spacing=${spacingArg}, gridWidth=${gridWidthArg}, layerHeight=${layerHeightArg}, excludeIds(raw/parsed)=${excludeIdsArg}/${JSON.stringify(parsedExcludeIds)}, excludePatterns(raw/parsed)=${excludePatternsArg}/${JSON.stringify(parsedExcludePatterns)}`
                );

                SystemUtils.nextTick().then(() => {
                    const result = BlockPaletteSpawner.spawn({
                        dimensionId,
                        origin: origin ?? { x: 0, y: 0, z: 0 },
                        maxBlocks: parsedMaxBlocks,
                        spacing: spacingArg,
                        gridWidth: gridWidthArg,
                        layerHeight: layerHeightArg,
                        excludeIds: parsedExcludeIds,
                        excludePatterns: parsedExcludePatterns,
                    });

                    console.warn(
                        `[SpawnBlockPalette] Spawned ${result.placed}/${result.attempted} blocks (failed=${result.failed})`
                    );
                });

                // Callback phải return ngay
                return {
                    message: "Starting block palette generation...",
                    status: 0,
                };
            }
        );
    }

    private static parseStringList(value: unknown): string[] | undefined {
        if (value === undefined || value === null) {
            return undefined;
        }

        if (Array.isArray(value)) {
            const normalized = value.map(entry => `${entry}`.trim()).filter(Boolean);
            return normalized.length > 0 ? normalized : undefined;
        }

        if (typeof value !== "string") {
            return undefined;
        }

        const trimmed = value.trim();
        if (!trimmed) {
            return undefined;
        }

        const parsedJson = this.tryParseJsonArray(trimmed);
        if (parsedJson) {
            const normalized = parsedJson.map(entry => `${entry}`.trim()).filter(Boolean);
            return normalized.length > 0 ? normalized : undefined;
        }

        const parts = trimmed.split(",").map(part => part.trim()).filter(Boolean);
        return parts.length > 0 ? parts : undefined;
    }

    private static parsePatternList(value: unknown): Array<string | RegExp> | undefined {
        const stringList = this.parseStringList(value);
        if (!stringList || stringList.length === 0) {
            return undefined;
        }

        const patterns = stringList
            .map(entry => {
                if (entry.startsWith("/") && entry.endsWith("/") && entry.length > 2) {
                    const pattern = entry.slice(1, -1);
                    return new RegExp(pattern);
                }
                return entry;
            })
            .filter(Boolean);

        return patterns.length > 0 ? patterns : undefined;
    }

    private static tryParseJsonArray(raw: string): unknown[] | undefined {
        if (!raw.startsWith("[") || !raw.endsWith("]")) {
            return undefined;
        }

        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : undefined;
        } catch (error) {
            console.warn("[SpawnBlockPalette] Failed to parse JSON array for exclude options", error);
            return undefined;
        }
    }
}
