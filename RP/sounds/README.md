# Sounds - Âm thanh và Định nghĩa

## Mục đích
Thư mục chứa sound definitions (JSON) và các file âm thanh (.ogg, .wav) cho game. Sounds được trigger bởi events, actions, hoặc ambient conditions trong game.

## Nội dung
- **sound_definitions.json**: Định nghĩa sound events, categories, và file mappings

## Ghi chú cho Dev
- Sound files nên dùng format .ogg (preferred) hoặc .wav
- Tránh file âm thanh quá lớn (>5MB) để không ảnh hưởng loading time và performance
- Sound definitions map sound events (như "mob.zombie.ambient") tới actual sound files
- Categories quan trọng: hostile, neutral, weather, music, player, ambient, ui
- Volume và pitch có thể được customize trong sound_definitions.json
- Sounds có thể được trigger từ scripts: world.playSound(soundId, location, options)
- Khi thêm sound mới, đảm bảo khai báo trong RP/sounds.json và sound_definitions.json
