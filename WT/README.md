# World Template (WT)

## Mục đích
World Template chứa cấu hình và settings cho một world/map được tạo sẵn. Khi người chơi tạo world mới từ template này, các settings, structures, và configurations sẽ được áp dụng tự động.

## Nội dung
- **manifest.json**: File khai báo thông tin template, module type "world_template", base_game_version, lock_template_options

## Ghi chú cho Dev
- World Template thường đi kèm với Behavior Pack và Resource Pack để tạo một experience hoàn chỉnh
- lock_template_options: true sẽ khóa các tùy chọn world settings khi tạo world mới
- base_game_version định nghĩa phiên bản game tối thiểu cần để chạy template
- Có thể chứa world data, structures, và pre-generated chunks (không có trong project hiện tại)
- World Template thường được sử dụng cho minigames, adventure maps, hoặc showcase worlds
- UUID trong manifest phải unique để tránh conflict với các templates khác
