# CubeGuard Task Agent

## 🎯 Goal
Agent hỗ trợ anh Huy triển khai task cho dự án **CubeGuard**, đảm bảo:

1. **Không được tồn tại file `index.ts` trong bất kỳ module nào.**
2. **Tất cả API của lib ngoài phải đi qua wrapper:**
   ```
   src/core/api_wrapper/minecraft/
   ```
3. **Agent chỉ được sửa code trong các khu vực được phép:**
   - `src/**`
   - `.github/**`
   - `scripts/**`
4. **Agent không được phép sửa hoặc ghi file trong:**
   - `BP/`
   - `RP/`
   - `SP/`
   - `WT/`
   - bất kỳ thư mục pack nào
5. Sau khi sửa code xong, agent phải:
   - chạy `npm run build`
   - chạy `npm test`
   - xuất summary cuối workflow.

---

## 🧠 Capabilities Required
- File system scanning
- Controlled write permissions
- Import rule checking
- Auto-fix for safe folders
- Shell execution (npm build/test)
- Reporting

---

## 📌 Rules

### **Rule 1 — Không được tồn tại file index.ts**
- Quét: `src/**/index.ts`
- Nếu có:
  - Cảnh báo
  - Hỏi người dùng có muốn xoá
  - Nếu Yes → xoá
  - Nếu No → ghi lỗi cuối workflow

---

### **Rule 2 — Allowed Edit Zones**
Agent chỉ được phép tạo, xoá, update file trong:

```
src/**
scripts/**
.github/**
```

Điều này có nghĩa:

### **✔ Được phép sửa**
- Source code game logic: `src/**`
- Tooling build/test: `scripts/**`
- GitHub Actions / workflows: `.github/**`
- NPM scripts, linter, formatter trong các folder op/cicd

### **❌ Không được phép sửa**
- `BP/**` (behavior pack)
- `RP/**` (resource pack)
- `SP/**`
- `WT/**`
- Bất kỳ file JSON/manifest/texture/model của pack
- Thư mục assets

Nếu user hoặc task yêu cầu chỉnh file ngoài allowed zones:  
→ Agent phải từ chối với thông báo:

```
⚠ Modification blocked: File is outside allowed edit zones (src/, scripts/, .github/)
```

---

### **Rule 3 — External API must go through wrapper**
Agent phải kiểm tra:

- import trực tiếp từ:  
  `@minecraft/server`, `@minecraft/server-ui`, `@minecraft/*`  
- import lib npm third-party

Nếu file đó **không nằm trong**:

```
src/core/api_wrapper/minecraft/**
```

→ Đây là violation.

Nếu user bật autofix:  
Agent chỉnh import để route qua wrapper, nhưng **chỉ trong các folder được phép**.

---

### **Rule 4 — Build**
Chạy:
```
npm run build
```
- Nếu fail → stop + báo lỗi.

---

### **Rule 5 — Test**
Chạy:
```
npm test --silent
```
- Nếu fail → stop + báo lỗi.

---

## 🛠 Workflow

### **Step 1 — Scan forbidden index.ts**
- Quét file
- Log danh sách
- Xin phép xóa

---

### **Step 2 — Validate allowed edit zones**
Mọi hành động ghi file phải được kiểm tra:

- Nếu path bắt đầu bằng:  
  `src/`, `scripts/`, `.github/` → OK  
- Nếu path bắt đầu bằng:  
  `BP/`, `RP/`, `SP/`, `WT/` → BLOCK  
- Các path khác → hỏi user để confirm

---

### **Step 3 — Check wrapper usage**
- Tìm import từ lib ngoài
- Validate wrapper rule
- Nếu violation → báo danh sách file
- Cho phép autofix → **chỉ fix trong src, scripts, .github**

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

### **Step 6 — Summary**
Ví dụ output:

```
✔ 0 index.ts found  
✔ All external API imports routed through wrapper  
✔ No forbidden modifications in BP/RP  
✔ Build success  
✔ Test success  
✨ CubeGuard task completed successfully.
```

Hoặc:

```
⚠ 2 index.ts found and removed  
⚠ 4 files violated API wrapper rules  
⚠ Attempted modification in BP/ blocked  
❌ Build failed  
→ Please review above issues.
```

---

## ✔ Final
Agent đã được cập nhật đầy đủ với mức bảo vệ mạnh hơn, đảm bảo:

- Logic game chỉ sửa ở `src/**`
- CI/CD công cụ chỉ sửa ở `.github/**` và `scripts/**`
- Không bao giờ đụng file pack Minecraft
- Vẫn enforce wrapper API rule + build/test pipeline