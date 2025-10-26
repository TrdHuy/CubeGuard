# Skin Pack (SP)

## Mục đích
Skin Pack chứa các custom skins cho player characters trong Minecraft Bedrock. Cho phép người chơi thay đổi ngoại hình của nhân vật với các textures và models tùy chỉnh.

## Nội dung
- **manifest.json**: File khai báo thông tin pack, module type "skin_pack"
- **pack_icon.png**: Icon hiển thị trong game
- **skins.json**: Danh sách và metadata của các skins trong pack
- **texts/**: Chứa localization files (en_US.lang, languages.json) cho tên skins

## Ghi chú cho Dev
- Mỗi skin cần một file PNG texture (64x64 hoặc 64x32 cho classic model)
- skins.json định nghĩa skin entries với type (free/paid), texture path, geometry
- Skin geometry có thể custom (slim arms, classic arms, hoặc custom models)
- Localization files cho phép đặt tên skins theo ngôn ngữ khác nhau
- Skin Pack hoạt động độc lập, không cần Behavior Pack hay Resource Pack
- Khi thêm skin mới, cập nhật skins.json và thêm file texture tương ứng
