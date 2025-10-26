# Loot Tables - Định nghĩa Phần thưởng

## Mục đích
Thư mục chứa các file JSON định nghĩa items được drop khi phá blocks, giết entities, mở chests, hoặc fishing. Loot tables kiểm soát xác suất, số lượng, và điều kiện của items được trao.

## Nội dung
- **empty.json**: Placeholder hoặc loot table trống

## Ghi chú cho Dev
- Mỗi loot table định nghĩa pools (nhóm items), entries (items cụ thể), conditions, và functions
- Có thể override vanilla loot tables bằng cách đặt file cùng tên (ví dụ: blocks/stone.json)
- Functions trong loot tables: set_count, set_data, enchant_randomly, looting_enchant
- Conditions phổ biến: random_chance, killed_by_player, match_tool
- Test loot tables trong game để đảm bảo xác suất và drops hoạt động đúng
- Có thể reference loot tables từ entity definitions hoặc block components
