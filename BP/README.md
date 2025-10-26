# Behavior Pack (BP)

## Mục đích
Behavior Pack chứa toàn bộ logic và hành vi của game trong project CubeGuard. Đây là nơi định nghĩa cách các entities hoạt động, các functions được thực thi, loot tables cho items, và đặc biệt là JavaScript scripts để tương tác với game engine thông qua Minecraft APIs.

## Nội dung
- **manifest.json**: File khai báo thông tin pack, dependencies (modules API), entry point
- **pack_icon.png**: Icon hiển thị trong game
- **package.json & package-lock.json**: Quản lý npm dependencies
- **scripts/**: Chứa JavaScript code chính (main.js) sử dụng @minecraft/server APIs
- **entities/**: Định nghĩa và override behavior của entities (player.json, mob customs)
- **functions/**: Chứa các .mcfunction files để chạy lệnh Minecraft
- **loot_tables/**: Định nghĩa loot drops khi phá block, kill entity, mở chest

## Ghi chú cho Dev
- Entry point script: scripts/main.js
- Module dependencies: @minecraft/server (1.11.0), @minecraft/server-ui (1.2.0), @minecraft/server-gametest (1.0.0-beta)
- Khi thêm script mới, import từ @minecraft/server để truy cập world, player, block events
- Mọi thay đổi trong scripts cần reload world hoặc dùng hot-reload nếu có
- UUID trong manifest.json không được trùng với bất kỳ pack nào khác
- Functions có thể được gọi từ scripts hoặc command blocks bằng /function
