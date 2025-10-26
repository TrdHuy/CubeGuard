# Textures - Hình ảnh và Định nghĩa

## Mục đích
Thư mục chứa các texture definitions (JSON) và các file hình ảnh (PNG) cho blocks, items, entities, UI elements. Textures định nghĩa cách game render và map các hình ảnh vào objects trong game.

## Nội dung
- **terrain_texture.json**: Mapping textures cho blocks
- **item_texture.json**: Mapping textures cho items
- **flipbook_textures.json**: Định nghĩa animated textures (water, lava, fire)
- **blocks/**: Thư mục con chứa block textures (nếu có)
- **items/**: Thư mục con chứa item textures (nếu có)
- **entity/**: Thư mục con chứa entity textures và models (nếu có)

## Ghi chú cho Dev
- Texture files phải là PNG format với alpha channel nếu cần transparency
- Kích thước textures nên là powers of 2 (16x16, 32x32, 64x64) để tối ưu performance
- Texture shortnames trong JSON phải match với references trong behavior pack hoặc scripts
- Animated textures dùng flipbook_textures.json với tiled texture sheets
- Khi thêm texture mới, cần khai báo trong terrain_texture.json hoặc item_texture.json
- Textures có thể hot-reload bằng cách reload resource pack, không cần restart world
