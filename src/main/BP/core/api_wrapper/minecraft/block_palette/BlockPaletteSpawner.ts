import { BlockTypes, world } from "@minecraft/server";
import { PaletteLayout } from "./PaletteLayout";
import type { SpawnOptions, SpawnResult } from "./block_palette_spawner.types";

/**
 * Bộ sinh block palette dùng để đặt toàn bộ block có sẵn trong game theo lưới.
 *
 * Tham số SpawnOptions chính:
 * - dimensionId (bắt buộc): dimension cần spawn (ví dụ: overworld, nether, the_end).
 * - maxBlocks, spacing, gridWidth, layerHeight, origin: kiểm soát giới hạn, khoảng cách, kích thước lưới và tọa độ gốc.
 * - Bộ lọc loại trừ: excludeIds (Set/mảng id cụ thể) → excludePatterns (prefix string hoặc RegExp) → filter (predicate cuối cùng).
 *   Thứ tự áp dụng: excludeIds → excludePatterns → filter.
 *
 * Ví dụ command (creator:spawnblockpalette):
 * - Loại trừ nhiều ID cụ thể (CSV): `/creator:spawnblockpalette overworld 500 2 20 3 ~~~ id1,id2,id3`
 * - Truyền JSON cho danh sách excludeIds: `/creator:spawnblockpalette overworld 300 2 15 3 ~~~ ["dirt","stone"]`
 * - Loại trừ theo prefix và regex cho excludePatterns: `/creator:spawnblockpalette overworld 500 2 20 3 ~~~ "" ["element","/candle/"]`
 *   (regex phải viết dạng `/pattern/` khi nhập lệnh).
 *
 * Ví dụ gọi API trực tiếp:
 * ```ts
 * await BlockPaletteSpawner.spawn({
 *     dimensionId: "overworld",
 *     excludeIds: ["element_core"],
 *     excludePatterns: ["element", /candle/],
 * });
 * ```
 *
 * Kết quả trả về (SpawnResult): placed, failed, attempted, filtered và bounds (giới hạn khu vực spawn).
 */
export class BlockPaletteSpawner {
    public static spawn(options: SpawnOptions): SpawnResult {
        const spacing = options.spacing ?? undefined;
        const gridWidth = options.gridWidth ?? undefined;
        const layerHeight = options.layerHeight ?? undefined;
        const origin = PaletteLayout.normalizeVector3(options.origin) ?? { x: 0, y: 0, z: 0 };

        const dimension = world.getDimension(options.dimensionId);
        const blockTypes = BlockTypes.getAll();
        const filteredBlockTypes = this.filterBlockTypes(blockTypes, options);
        const filtered = blockTypes.length - filteredBlockTypes.length;
        const config = PaletteLayout.resolvePaletteConfig(
            { spacing, gridWidth, layerHeight, maxBlocks: options.maxBlocks },
            filteredBlockTypes.length
        );
        const bounds = PaletteLayout.calculatePaletteBounds(origin, config);

        let placed = 0;
        let failed = 0;
        let attempted = 0;

        for (const { location, index } of PaletteLayout.paletteCoordinates(origin, config)) {
            const blockType = filteredBlockTypes[index];
            if (!blockType) {
                continue;
            }

            try {
                const block = dimension.getBlock(location);
                if (block) {
                    block.setType(blockType);
                    placed++;
                } else {
                    failed++;
                }
                attempted++;
            } catch (error) {
                console.error("[SpawnBlocks] Error while setting block:", error);
                failed++;
                attempted++;
            }
        }

        return { placed, failed, attempted, filtered, bounds };
    }

    private static filterBlockTypes(blockTypes: any[], options: SpawnOptions): any[] {
        const excludeIds = new Set(options.excludeIds ?? []);
        const excludePatterns = options.excludePatterns ?? [];
        const predicate = options.filter;

        return blockTypes.filter((blockType) => {
            const blockId = this.getBlockId(blockType);

            if (excludeIds.size > 0 && excludeIds.has(blockId)) {
                return false;
            }

            if (excludePatterns.length > 0 && this.isExcludedByPattern(blockId, excludePatterns)) {
                return false;
            }

            if (predicate) {
                return predicate(blockId);
            }

            return true;
        });
    }

    private static isExcludedByPattern(blockId: string, patterns: Array<string | RegExp>): boolean {
        return patterns.some((pattern) => {
            if (pattern instanceof RegExp) {
                return pattern.test(blockId);
            }

            return blockId.startsWith(pattern);
        });
    }

    private static getBlockId(blockType: { id?: string; typeId?: string }): string {
        return blockType?.id ?? blockType?.typeId ?? "";
    }
}
