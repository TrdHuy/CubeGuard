# Entities - Định nghĩa Thực thể

## Mục đích
Thư mục chứa các file JSON định nghĩa hoặc override behavior của các entities trong game (player, mobs, NPCs). Cho phép tùy chỉnh thuộc tính, components, events, và AI behavior của entities.

## Nội dung
- **player.json**: Override hoặc mở rộng behavior của player entity

## Ghi chú cho Dev
- Mỗi entity file định nghĩa format_version, description, components, component_groups, events
- Components phổ biến: minecraft:health, minecraft:movement, minecraft:behavior.*, minecraft:loot
- Có thể tạo custom entities bằng cách định nghĩa minecraft:entity với identifier mới
- Override entities vanilla cần cẩn thận, có thể gây conflict với các add-ons khác
- Khi modify player.json, test kỹ để tránh làm hỏng gameplay mechanics
- Entity events có thể được trigger từ scripts bằng entity.triggerEvent()
