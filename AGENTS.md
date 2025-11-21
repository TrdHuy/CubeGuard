# CubeGuard Task Agent

## 🎯 Goal
Hỗ trợ triển khai task cho dự án **CubeGuard** theo đúng workflow chuẩn, đảm bảo:

1. **Không module nào chứa file `index.ts`.**
2. **Tất cả API từ lib ngoài phải thông qua wrapper:**  
   ```
   src/main/BP/core/api_wrapper/
   ```
3. **Agent chỉ được phép sửa code trong thư mục `src/**`**  
   → *Tuyệt đối không sửa hoặc ghi file trong `BP/`, `RP/` hoặc thư mục pack.*
4. Sau khi chỉnh code, agent phải:
   - Chạy `npm run build`
   - Chạy `npm test`
   - Xuất summary rõ ràng

---

## 🧠 Capabilities Required
- Quét cấu trúc file
- Phân tích code (import, rule violations)
- Hạn chế vùng được phép ghi file
- Xoá file hợp lệ
- Chạy shell (`npm run build`, `npm test`)
- Sinh summary

---

## 📌 Rules

### **Rule 1 — Không được tồn tại file `index.ts` trong bất kỳ module nào**
- Quét: `src/**/index.ts`
- Nếu có:
  - Cảnh báo
  - Hỏi người dùng có muốn xoá không
  - Nếu Yes → xoá  
  - Nếu No → đánh dấu lỗi cuối workflow

---

### **Rule 2 — Chỉ được sửa code trong thư mục `src/**`**
- Agent **không được ghi / chỉnh / xoá** file trong:
  - `BP/`
  - `RP/`
  - `SP/`
  - `WT/`
  - bất kỳ file JSON của pack
  - thư mục asset (textures, models)
- Nếu tác vụ yêu cầu sửa file nằm ngoài `src/`:
  → Agent từ chối và hỏi lại người dùng  
  → “File nằm ngoài vùng code được phép chỉnh sửa (src/**). Có muốn tiếp tục không?”

Đây là **hard rule**, để bảo vệ pack khỏi bị agent chỉnh nhầm.

---

### **Rule 3 — Tất cả API từ lib ngoài phải đi qua wrapper**
- Quét tất cả file `.ts` trong `src/**`
- File wrapper hợp lệ nằm tại:
  ```
  src/main/BP/core/api_wrapper/minecraft/
  ```
- Các import bị xem là *vi phạm* nếu:
  - import trực tiếp từ `"@minecraft/*"`
  - import từ lib npm
  - import từ thư viện third-party (không bắt đầu bằng ./ hoặc ../)
- Nếu file *không phải* wrapper → báo lỗi  
- Nếu người dùng chọn “fix imports” → agent chỉnh sửa **chỉ trong `src/**`**

---

### **Rule 4 — Build sau khi code sửa**
Chạy:
```
npm run build
```
Nếu lỗi → dừng và báo chi tiết.

---

### **Rule 5 — Test toàn bộ dự án**
Chạy:
```
npm test --silent
```
Nếu lỗi → dừng và báo chi tiết.

---

### **Rule 6 — Summary**
Hiển thị:
- index.ts đã xoá (nếu có)
- file API import sai wrapper
- import đã được autofix (nếu có)
- build pass/fail
- test pass/fail
- cảnh báo nếu có file ngoài `src/` bị yêu cầu chỉnh sửa

---

## 🛠 Workflow

### **Step 1 — Scan forbidden index.ts**
- Quét `src/**/index.ts`
- Log danh sách
- Hỏi user có muốn xoá không

---

### **Step 2 — Enforce “src only” modification rule**
Agent:
- Chỉ được ghi/sửa xoá file trong `src/**`
- Khi phát hiện lệnh ghi vào BP/RP:
  ```
  ⚠ Blocked: attempting to modify file outside src/**
  ```
- Hỏi lại user để xác nhận nếu thật sự cần

---

### **Step 3 — Check wrapper imports**
- Quét import từ:
  - `@minecraft/server`
  - `@minecraft/server-ui`
  - `@minecraft/*`
  - npm libs
- Nếu import nằm ngoài wrapper → vi phạm rule

Nếu user bật autofix:
- Agent refactor import → chuyển về wrapper tương ứng  
  (chỉ áp dụng trong `src/**`)

---

### **Step 4 — Build**
```
npm run build
```

---

### **Step 5 — Test**
```
npm test --silent
```

---

### **Step 6 — Final Summary**
Ví dụ output:

```
✔ No illegal index.ts
✔ All external API imports routed through wrapper
✔ No forbidden modifications detected in BP/RP
✔ Build success
✔ Test success
✨ Task completed successfully
```

Hoặc:

```
⚠ Found 2 forbidden index.ts files
⚠ 3 files imported external APIs directly
⚠ Attempted modification blocked outside src/**
❌ Build failed
→ Please review issues above.
```

---

## ✔ Done
CubeGuard Task Agent updated with stricter “src-only modifications” rule.
