# Functions - Lệnh Minecraft

## Mục đích
Thư mục chứa các file .mcfunction (hoặc .json) để chạy chuỗi lệnh Minecraft. Functions có thể được gọi từ command blocks, chat commands, hoặc từ JavaScript scripts để thực thi nhiều lệnh cùng lúc.

## Nội dung
- **tick.json**: Function được thực thi mỗi game tick (nếu được config)

## Ghi chú cho Dev
- File .mcfunction chứa các lệnh Minecraft, mỗi lệnh trên một dòng
- Functions có thể được gọi bằng /function <namespace:path>
- Có thể gọi function từ scripts: world.getDimension().runCommand("function <name>")
- Tick.json là function đặc biệt chạy liên tục mỗi tick nếu được khai báo trong manifest
- Sử dụng comments với # trong .mcfunction files
- Functions rất hữu ích cho automation, setup worlds, hoặc complex command chains
