# CubeGuard Task Agent

## 🎯 Goal
Hỗ trợ triển khai task trong dự án **CubeGuard** theo chuẩn mà anh Huy đặt ra, đảm bảo:

1. Không module nào được chứa file `index.ts`.
2. Mọi API của **lib bên ngoài** đều phải được **wrap thông qua module**:
   ```
   src/core/api_wrapper/minecraft/
   ```
3. Sau khi sửa code, agent phải:
   - Chạy `npm run build`
   - Chạy `npm test`
   - Báo cáo kết quả chi tiết

---

## 🧠 Capabilities Required
- Quét và phân tích file hệ thống
- Xoá file
- Đọc nội dung file để phát hiện code vi phạm
- Chạy command shell (`npm run build`, `npm test`)
- Xuất báo cáo dạng summary
- Hỏi input người dùng khi cần xác nhận

---

## 📌 Rules

### **Rule 1 — Không được tồn tại file `index.ts` trong bất kỳ module nào**
- Quét `src/**/index.ts`
- Nếu có:
  - Log cảnh báo
  - Hỏi người dùng: “Anh muốn xoá hết index.ts không?”
  - Nếu *Yes* → xoá ngay
  - Nếu *No* → vẫn tiếp tục workflow nhưng báo lỗi cuối cùng

---

### **Rule 2 — Tất cả API bên ngoài phải đi qua wrapper `core/api_wrapper/minecraft`**
**Ý nghĩa:**  
Các module khác không được import trực tiếp từ lib ngoài (vd: `@minecraft/server`, `@minecraft/common`, lib tự viết, lib NPM…).  
Mọi thứ phải được wrap trong thư mục:

```
src/core/api_wrapper/minecraft/
```

**Agent sẽ kiểm tra:**

1. Quét toàn bộ file `.ts` trong `src/`
2. Tìm các lệnh **vi phạm**, ví dụ:
   ```ts
   import { world } from "@minecraft/server";
   import Something from "some-external-lib";
   import * as mc from "@minecraft/server-ui";
   ```
3. Nếu file đó **không phải** file wrapper, thì đây là lỗi.
4. Báo cáo danh sách file vi phạm và gợi ý sửa:
   `→ Thay import trực tiếp bằng wrapper từ: core/api_wrapper/minecraft/<module>.ts`

> Nếu anh chọn “Fix”, agent có thể tự động sửa import.

---

### **Rule 3 — Build sau chỉnh sửa**
Chạy:
```
npm run build
```
Nếu lỗi → dừng workflow và báo lỗi chi tiết.

---

### **Rule 4 — Test toàn bộ dự án**
Chạy:
```
npm test --silent
```
Nếu lỗi → dừng workflow và báo lỗi chi tiết.

---

### **Rule 5 — Summary cuối workflow**
Hiển thị:
- Danh sách index.ts đã xoá  
- Danh sách file sử dụng API ngoài **không đi qua wrapper**  
- Kết quả build  
- Kết quả test  
- Gợi ý sửa tiếp theo

---

## 🛠️ Workflow

### **Step 1 — Scan forbidden index.ts**
- Tìm: `src/**/index.ts`
- Log lại số lượng
- Nếu > 0 → hỏi người dùng có muốn xóa file vi phạm không

### **Step 2 — Check external API wrapper rule**
- Scan các import trong tất cả file `.ts`
- Filter các import có dạng:
  - `"@minecraft/*"`
  - `"minecraft:*"`
  - `"*server*"`
  - Bất kỳ lib nào không thuộc CubeGuard (không bắt đầu bằng đường dẫn tương đối `./` hoặc `../`)
- Nếu file không nằm trong:
  ```
  src/core/api_wrapper/minecraft/**
  ```
  → Đây là vi phạm rule #2  
- Tổng hợp danh sách và báo cáo

### **Step 3 — Optional autofix**
Nếu người dùng chọn autofix:
- Auto chuyển imports thành:
  ```
  import { X } from "core/api_wrapper/minecraft/xxx";
  ```

### **Step 4 — Build**
Chạy:
```
npm run build
```

### **Step 5 — Test**
Chạy:
```
npm test --silent
```

### **Step 6 — Final Summary**
Ví dụ:

```
✔ No index.ts found  
✔ All external API calls go through wrapper  
✔ Build passed  
✔ Test passed  
✨ CubeGuard task completed
```

Hoặc:

```
⚠ Found 3 index.ts files
⚠ 5 files used external APIs without wrapper
❌ Build failed
→ Please fix above issues before continuing.
```

---

## ✔ Done
CubeGuard Task Agent đã sẵn sàng vận hành trong Cline/Codex.
