# Scripts - Behavior Pack Logic

## Mục đích
Thư mục chứa JavaScript code để điều khiển game logic, xử lý events, tương tác với players, blocks, entities thông qua Minecraft Scripting APIs. File main.js là entry point được khai báo trong BP/manifest.json.

## Nội dung
- **main.js**: Entry point script, hiện tại đang lắng nghe sự kiện playerBreakBlock và gửi thông báo trong chat

## Ghi chú cho Dev
- Import modules từ @minecraft/server (world, events, entities, blocks, dimensions)
- Import modules từ @minecraft/server-ui (forms, modals, action bars) nếu cần tạo UI
- Import modules từ @minecraft/server-gametest nếu cần testing
- Subscribe vào events thông qua world.afterEvents hoặc world.beforeEvents
- Mọi thay đổi code cần reload world để áp dụng, hoặc dùng hot-reload trong development
- Sử dụng console.warn() hoặc console.error() để debug, logs sẽ hiện trong content log
- Tránh blocking operations trong event handlers để không làm giảm hiệu suất game
