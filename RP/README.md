# Resource Pack (RP)

## Mục đích
Resource Pack chứa toàn bộ assets và visual elements của project CubeGuard. Bao gồm textures, sounds, models, UI elements, và client-side definitions. RP định nghĩa cách game hiển thị và phát âm thanh, không chứa logic gameplay.

## Nội dung
- **manifest.json**: File khai báo thông tin pack, module type "resources"
- **pack_icon.png**: Icon hiển thị trong game
- **textures/**: Chứa texture definitions và các file hình ảnh (blocks, items, entities, UI)
- **sounds/**: Chứa sound definitions và các file âm thanh (.ogg, .wav)
- **texts/**: Chứa localization files (en_US.lang, languages.json)
- **blocks.json**: Client-side block definitions (render, culling, materials)
- **sounds.json**: Khai báo sound events và mappings
- **biomes_client.json**: Client-side biome definitions (colors, fog, sky)
- **splashes.json**: Custom splash texts trong main menu

## Ghi chú cho Dev
- Resource Pack hoạt động độc lập với Behavior Pack nhưng thường được dùng cùng
- UUID trong manifest.json phải match với dependency trong BP/manifest.json
- Textures cần format chuẩn (PNG, kích thước powers of 2 cho optimal performance)
- Sounds cần format .ogg hoặc .wav, tránh file quá lớn ảnh hưởng loading time
- Localization files cho phép đa ngôn ngữ, mỗi .lang file tương ứng với một locale
- Thay đổi textures/sounds không cần reload world, chỉ cần reload resource packs
