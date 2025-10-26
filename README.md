# CubeGuard - Minecraft Bedrock Add-On Project

## Mục đích
Thư mục gốc của project CubeGuard - một Add-On cho Minecraft Bedrock Edition. Project này bao gồm Behavior Pack (BP), Resource Pack (RP), Skin Pack (SP), World Template (WT) và các scripts hỗ trợ development.

## Nội dung
- **BP/**: Behavior Pack - chứa logic game, scripts, entities, functions
- **RP/**: Resource Pack - chứa assets như textures, sounds, models
- **SP/**: Skin Pack - chứa các skin tùy chỉnh cho nhân vật
- **WT/**: World Template - chứa template cho world/map
- **scripts/**: Scripts hỗ trợ development (deploy, automation)
- **config.json**: Cấu hình project
- **deno.json**: Cấu hình Deno runtime

## Ghi chú cho Dev
- Project sử dụng bridge. editor (phiên bản 2.7.51) và dash compiler (phiên bản 0.11.7)
- Behavior Pack sử dụng JavaScript modules: @minecraft/server (1.11.0), @minecraft/server-ui (1.2.0), @minecraft/server-gametest (1.0.0-beta)
- Minimum engine version: 1.21.90
- Khi thay đổi manifest, cần đảm bảo UUID không trùng lặp với các add-on khác
- Sử dụng scripts trong thư mục /scripts để deploy và automation
