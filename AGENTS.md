# CubeGuard Task Agent

## 🎯 Goal
Hỗ trợ triển khai task cho dự án **CubeGuard** theo đúng workflow chuẩn, đảm bảo:

1. **Không module nào chứa file `index.ts`.**
2. **Tất cả API từ lib ngoài phải thông qua wrapper:**  
   ```
   src/main/BP/core/api_wrapper/
   ```
3. **Agent chỉ được phép sửa code trong các khu vực cho phép:**
   - `src/**`  *(toàn quyền sửa khi cần)*
   - `.github/**` *(được sửa nhẹ)*
   - `scripts/**` *(được sửa nhẹ)*
4. **Agent tuyệt đối không được sửa hoặc ghi file trong thư mục pack:**
   - `BP/`, `RP/`, `SP/`, `WT/`
5. Sau khi chỉnh code xong, agent phải:
   - Chạy `npm run build`
   - Chạy `npm test`
   - Xuất summary rõ ràng

---

## 🧠 Capabilities Required
- Quét cấu trúc file
- Phân tích import
- Áp quy tắc vùng được phép sửa
- Chạy shell (`npm run build`, `npm test`)
- Tạo report cuối task

---

## 📌 Rules

### **Rule 1 — Không được tồn tại file `index.ts` trong bất kỳ module nào**
- Quét `src/**/index.ts`
- Nếu có:
  - cảnh báo
  - hỏi người dùng có muốn xoá
  - xoá nếu user đồng ý

---

### **Rule 2 — Allowed modification zones**
Agent chỉ được phép sửa code trong những vùng sau:

#### **✔ Toàn quyền sửa**
```
src/**
```

#### **✔ Sửa nhẹ, hạn chế thay đổi lớn**
```
.github/**
scripts/**
```
Giới hạn sửa nhẹ bao gồm:
- cập nhật chuỗi cấu hình
- chỉnh sửa một vài dòng nhỏ (fix path, sửa env, update workflow step)
- không được xoá file
- không được rewrite toàn bộ file
- không tạo file mới trừ khi user yêu cầu

#### **❌ Tuyệt đối không được sửa**
```
BP/**
RP/**
SP/**
WT/**
```
- Không được ghi / xoá / chỉnh bất kỳ file nào trong pack của Minecraft.

Nếu có tác vụ yêu cầu chỉnh file ngoài vùng cho phép:
→ Agent phải hỏi lại user:
```
⚠ File nằm ngoài vùng được phép chỉnh sửa. Anh có muốn continue không?
```

---

### **Rule 3 — Tất cả API lib ngoài phải đi qua wrapper**
- Quét tất cả file `.ts` trong `src/**`
- Wrapper hợp lệ:
  ```
  src/main/BP/core/api_wrapper/minecraft/
  ```
- Import trực tiếp từ:
  - `@minecraft/*`
  - npm libs
  - third-party libs  
  nếu không nằm trong wrapper → violation.

Nếu user bật autofix:
- Agent sửa lại import, nhưng:
  - chỉ áp dụng trong `src/**`
  - không sửa trong `.github/` hoặc `scripts/**`

---

### **Rule 4 — Build**
Chạy:
```
npm run build
```

---

### **Rule 5 — Test**
Chạy:
```
npm test --silent
```

---

### **Rule 6 — Summary**
Bao gồm:
- file index.ts bị xoá
- vi phạm wrapper và autofix
- vùng code nào đã được sửa (`src/`, `.github/`, `scripts/`)
- build/test kết quả
- cảnh báo nếu:
  - agent chặn thay đổi ngoài allowed zones
  - agent thực hiện “sửa nhẹ” trong CI/CD

---

## 🛠 Workflow

### **Step 1 — Scan forbidden index.ts**
- Quét `src/**/index.ts`
- Hỏi delete

---

### **Step 2 — Enforce allowed modification zones**
Khi agent chuẩn bị modify file:
- Nếu nằm trong `src/**` → OK
- Nếu nằm trong `.github/**` hoặc `scripts/**` →  
  → OK nhưng giới hạn sửa nhẹ
- Nếu nằm ngoài 3 folder trên →  
  ```
  ⚠ Blocked: cannot modify file outside allowed zones.
  ```

---

### **Step 3 — Check wrapper imports**
- Quét import sai
- Báo cáo vi phạm
- Autofix nếu user cho phép

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
Ví dụ:

```
✔ 0 index.ts files
✔ Wrapper import check passed
✔ Performed small updates inside .github/workflows/build.yml
✔ Build success
✔ Test success
✨ Task completed successfully
```

---

## ✔ Done
CubeGuard Task Agent được cập nhật để hỗ trợ sửa code an toàn trong `src/**`, `.github/**` và `scripts/**`.
