#!/usr/bin/env node

/**
 * Architectural Analysis Script using Madge
 */

const madge = require('madge');
const path = require('path');
const fs = require('fs');

const SRC_DIR = path.resolve('src');
const OUTPUT_DIR = path.resolve('scripts/arch-report');

if (!fs.existsSync(OUTPUT_DIR)) {
     fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
     console.log("🔍 Running architecture analysis...\n");

     const result = await madge(SRC_DIR, {
          fileExtensions: ['ts', 'tsx', 'js'],
          tsConfig: path.resolve('tsconfig.json'),
     });

     /** ------------------------------------------
      * 1) CIRCULAR DEPENDENCIES
      * ------------------------------------------- */
     const circular = result.circular();
     fs.writeFileSync(
          path.join(OUTPUT_DIR, 'circular.txt'),
          circular.length === 0
               ? "No circular dependencies 🎉"
               : circular.map(c => c.join(' -> ')).join("\n")
     );
     console.log(`➡️  Circular dependencies: ${circular.length}`);

     /** ------------------------------------------
      * 2) ORPHAN MODULES
      * ------------------------------------------- */
     const orphans = result.orphans();
     fs.writeFileSync(
          path.join(OUTPUT_DIR, 'orphans.txt'),
          orphans.length === 0
               ? "No orphan modules"
               : orphans.join("\n")
     );
     console.log(`➡️  Orphan modules: ${orphans.length}`);

     /** ------------------------------------------
      * 3) DUPLICATE DEPENDENCIES (TỰ TÍNH)
      *    Tìm module bị import bởi >1 file
      * ------------------------------------------- */
     const graph = result.obj();

     // Đảo ngược graph
     const reverseMap = {};

     Object.keys(graph).forEach(from => {
          graph[from].forEach(to => {
               if (!reverseMap[to]) reverseMap[to] = [];
               reverseMap[to].push(from);
          });
     });

     // Modules bị import >= 2 nơi
     const duplicates = Object.entries(reverseMap)
          .filter(([mod, importers]) => importers.length >= 2)
          .reduce((acc, [mod, importers]) => {
               acc[mod] = importers;
               return acc;
          }, {});

     fs.writeFileSync(
          path.join(OUTPUT_DIR, 'duplicates.txt'),
          Object.keys(duplicates).length === 0
               ? "No duplicate dependencies"
               : JSON.stringify(duplicates, null, 2)
     );

     console.log(`➡️  Duplicate dependencies: ${Object.keys(duplicates).length}`);

     /** ------------------------------------------
      * 4) GRAPH
      * ------------------------------------------- */
     // const dot = await result.dot();
     // fs.writeFileSync(
     //      path.join(OUTPUT_DIR, 'graph.dot'),
     //      dot
     // );
     // console.log("➡️  Graph DOT file generated");

     console.log("\n✅ Done! Check results in tools/arch-report/");
})();
