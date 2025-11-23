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
   - `.github/**` *(được sửa nhẹ)* trừ khi có yêu cầu thay đổi trực tiếp từ người dùng, nếu muốn thay đổi nhiều phải xin phép người dùng
   - `scripts/**` *(được sửa nhẹ)* trừ khi có yêu cầu thay đổi trực tiếp từ người dùng, nếu muốn thay đổi nhiều phải xin phép người dùng
4. **Agent tuyệt đối không được sửa hoặc ghi file trong thư mục pack:**
   - `BP/`, `RP/`, `SP/`, `WT/`
5. Trước khi chạy `npm run build` hoặc `npm test`, agent phải:
   - kiểm tra **dependencies** có đầy đủ hay không
   - chạy `npm install` hoặc `npm ci` nếu cần (sau khi hỏi người dùng)
6. Sau khi chỉnh code xong, agent phải:
   - chạy `npm run build`
   - chạy `npm test`
   - xuất summary rõ ràng
7. **Mọi phản hồi với người dùng bắt buộc dùng tiếng Việt.**

---

## 🧠 Capabilities Required
- Quét cấu trúc file & detect rule violations  
- Giới hạn vùng ghi file  
- Xoá file hợp lệ  
- Phân tích import (wrapper rule)  
- Chạy shell (`npm install`, `npm ci`, `npm run build`, `npm test`)  
- Sinh summary chi tiết  

---

## 📌 Rules

### **Rule 1 — Không được tồn tại file `index.ts` trong bất kỳ module nào**
- Quét: `src/**/index.ts`
- Nếu phát hiện:
  - cảnh báo
  - hỏi người dùng có muốn xoá không
  - nếu Yes → xoá
  - nếu No → đánh dấu lỗi cuối workflow

---

### **Rule 2 — Allowed Modification Zones**
Agent chỉ được phép sửa code trong các khu vực sau:

#### ✔ **Toàn quyền sửa**
```
src/**
```

#### ✔ **Sửa nhẹ / hạn chế thay đổi lớn**
```
.github/**
scripts/**
```
Giới hạn sửa nhẹ:
- chỉnh 1 vài dòng nhỏ (env, path, step)
- không xoá file
- không rewrite toàn bộ file
- không tạo file mới trừ khi user yêu cầu
- nếu cần sửa nhiều hoặc thay đổi lớn:  
  → **phải hỏi ý kiến người dùng**

#### ❌ **Tuyệt đối không được sửa**
```
BP/**
RP/**
SP/**
WT/**
```
Nếu agent cố sửa:
```
⚠ Blocked: File nằm ngoài vùng được phép chỉnh sửa (src/, .github/, scripts/).
```

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

### **Rule 4A — Dependency Check (Quan trọng)**
Trước khi Build/Test, agent phải thực hiện:

1. **Kiểm tra node_modules**
   - nếu không có → hỏi người dùng:
     ```
     Thư mục node_modules không tồn tại. Anh có muốn chạy "npm install" không?
     ```

2. **Kiểm tra dependency lỗi**
   - chạy:
     ```
     npm ls --all --depth=0
     ```
   - nếu báo thiếu package:
     → list dependency lỗi  
     → hỏi user có muốn cài không

3. **Kiểm tra mismatch lockfile**
   - nếu `package-lock.json` thay đổi nhiều
   - hỏi user có muốn dùng:
     ```
     npm ci
     ```

4. Nếu user từ chối cài dependencies:
   - agent cảnh báo nhưng vẫn chạy build/test
   - summary ghi rõ:
     ```
     ⚠ Build/Test chạy trong trạng thái thiếu dependencies.
     ```

---

### **Rule 5 — Build dự án**
Chạy:
```
npm run build
```
Nếu lỗi → dừng và báo chi tiết.

---

### **Rule 6 — Test dự án**
Chạy:
```
npm test --silent
```
Nếu lỗi → dừng và báo chi tiết.

---

### **Rule 7 — Summary**
Báo cáo cuối cùng phải bao gồm:

- danh sách index.ts bị xoá (nếu có)
- danh sách import sai wrapper
- import đã được autofix (nếu có)
- danh sách file được sửa:  
  - trong `src/**`  
  - trong `.github/**` (đánh dấu “sửa nhẹ”)  
  - trong `scripts/**` (đánh dấu “sửa nhẹ”)  
- build: pass/fail  
- test: pass/fail  
- cảnh báo nếu user từ chối cài dependencies  
- cảnh báo nếu user yêu cầu sửa file ngoài allowed zones

---

## 🛠 Workflow (Full)

### **Step 1 — Scan forbidden index.ts**
- Quét `src/**/index.ts`
- Hiển thị danh sách
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

### **Step 4A — Dependency Check**
- Kiểm tra node_modules
- Kiểm tra dependency missing
- Kiểm tra peer dependency conflict
- Kiểm tra lockfile
- Hỏi user trước khi chạy `npm install` or `npm ci`

---

### **Step 5 — Build**
```
npm run build
```

---

### **Step 6 — Test**
```
npm test --silent
```

---

### **Step 7 — Final Summary**
Ví dụ:

```
✔ Không có index.ts vi phạm
✔ Tất cả import đã tuân thủ wrapper
✔ Một số thay đổi nhỏ trong .github/workflows/build.yml
✔ Dependencies OK
✔ Build thành công
✔ Test thành công
✨ Task hoàn tất!
```

---

## ✔ Done
Agent đã được cập nhật đầy đủ với dependency check, vùng sửa hợp lệ, wrapper rule và output tiếng Việt.
