# CubeGuard Task Agent

## 🎯 Goal
Hỗ trợ triển khai task cho dự án **CubeGuard** theo đúng workflow chuẩn, đảm bảo:

1. **Không module nào chứa file `index.ts`.**  
   → Minecraft Bedrock không hỗ trợ barrel-file, không resolve index → PHẢI cấm hoàn toàn.
2. **Tất cả API từ lib ngoài phải thông qua wrapper:**
   ```
   src/main/BP/core/api_wrapper/
   ```
3. **Agent chỉ được phép sửa code trong các khu vực cho phép:**
   - `src/**`  *(toàn quyền sửa khi cần)*
   - `.github/**` *(sửa nhẹ, phải hỏi user nếu sửa lớn)*
   - `scripts/**` *(sửa nhẹ, phải hỏi user nếu sửa lớn)*
4. **Agent tuyệt đối không được sửa hoặc ghi file trong thư mục pack:**
   - `BP/`, `RP/`, `SP/`, `WT/`
5. Trước khi chạy `npm run build` hoặc `npm test`, agent phải:
   - kiểm tra **dependencies** đầy đủ
   - chạy `npm install` hoặc `npm ci` nếu cần (phải hỏi user)
6. Sau khi chỉnh code xong, agent phải:
   - chạy `npm run build`
   - chạy `npm test`
   - xuất summary rõ ràng
7. **Mọi phản hồi phải dùng tiếng Việt.**
8. **Strict Module Design v5 (Class-based, No index.ts) áp dụng khi tạo module mới hoặc khi user yêu cầu refactor module theo chuẩn.**
9. **Wrapper modules có quy tắc riêng (Strict Wrapper Design).**

---

## 🧠 Capabilities Required
- Quét cấu trúc file  
- Phát hiện rule violation  
- Giới hạn vùng ghi file  
- Xoá file hợp lệ  
- Phân tích import (Wrapper Rule)  
- Chạy shell (`npm install`, `npm ci`, `npm run build`, `npm test`)  
- Sinh code đúng template v5  
- Sinh summary tiếng Việt  

---

# 📌 RULES

---

## **Rule 1 — Cấm tuyệt đối mọi file `index.ts`**
- Quét: `src/**/index.ts`
- Nếu tồn tại:
  - cảnh báo
  - hỏi user có muốn xoá không
  - nếu Yes → xoá
  - nếu No → report trong summary

---

## **Rule 2 — Allowed Modification Zones**
### ✔ Toàn quyền sửa
```
src/**
```

### ✔ Sửa nhẹ / hạn chế
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

## **Rule 3 — Wrapper Import Rule**
Chỉ được phép import API Minecraft từ wrapper:

```
src/main/BP/core/api_wrapper/minecraft/**
```

Vi phạm nếu:
- `import "@minecraft/*"`
- import trực tiếp từ thư viện npm  
- import không bắt đầu bằng "./" hoặc "../" (ngoại trừ file wrapper chính)

Nếu vi phạm → agent phải báo:

```
⚠ Import API từ lib ngoài phải qua wrapper.
```

Nếu user yêu cầu “fix imports” → agent tự sửa.

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

# 🚀 RULE 8 — **Strict Module Design v5 (Class-based, No index.ts)**  
Áp dụng khi:

- user yêu cầu **tạo module mới**  
- user yêu cầu **refactor module theo strict design**  
- agent tự tạo file mới trong `src/**`

---

# 🎯 Strict Module Design v5 — Specification

## ✔ 1. Mỗi module = **một folder riêng**

Ví dụ:
```
custom_command/
    CustomCommandAPI.ts
    custom_command.types.ts
    custom_command.interfaces.ts
```

## ✔ 2. KHÔNG BAO GIỜ tạo file `index.ts`
Minecraft Bedrock không support → cấm tuyệt đối.

## ✔ 3. File chính của module = **1 class duy nhất**
- Public API = **static methods**
- Internal = **private static methods**
- Không tạo instance  
- Không chứa shared state  
- Không export function rời rạc  

## ✔ 4. Phân tách type và interface
- `<module>.types.ts`
- `<module>.interfaces.ts`

## ✔ 5. Tên file chuẩn hóa
- class file: PascalCase  
- type/interface file: snake case hoặc kebab case theo module name

## ✔ 6. Template CHUẨN

### 🔶 **FILE: ModuleName.ts**

```ts
// ============================================================================
// 📌 Module Name: <ModuleName>
// 🎯 Purpose    : <Mục đích module>
// 🧩 Description: <Giải thích behavior>
// 🔒 Design     : Class-based Static API (CubeGuard)
// ============================================================================

export class <ModuleName> {
    // ================= PUBLIC STATIC =================

    public static doSomething(input: number): number {
        this.validateNumber(input);
        return input * 2;
    }

    // ================= PRIVATE STATIC ================

    private static validateNumber(n: number): void {
        if (typeof n !== "number") {
            throw new Error("Input must be a number");
        }
    }
}
```

---

### 🔶 **FILE: module.types.ts**

```ts
export type <TypeName> = {
    id: number;
    name: string;
};
```

---

### 🔶 **FILE: module.interfaces.ts**

```ts
export interface <InterfaceName> {
    id: number;
    name: string;
}
```

---

# 🚀 RULE 9 — Strict Wrapper Design (áp dụng cho folder `core/api_wrapper/minecraft/**`)

Wrapper phải theo chuẩn:

### ✔ 1. Một wrapper = một class  
### ✔ 2. Public API = static  
### ✔ 3. Internal logic = private static  
### ✔ 4. Không tách internal function ra ngoài class  
### ✔ 5. Không export default object  
### ✔ 6. Không dùng functional-template của Strict Module v4  
### ✔ 7. Bắt buộc dùng TS class OOP  
### ✔ 8. Được phép giữ behavior cũ của Minecraft API

Nếu refactor wrapper → agent **phải** tạo module theo chuẩn v5 như ví dụ:

- `CustomCommandAPI.ts`
- `custom_command.types.ts`
- `custom_command.interfaces.ts`

---

# 🛠 Workflow

### Step 0 — Strict v5 Template (nếu tạo module mới)
### Step 1 — Scan forbidden index.ts
### Step 2 — Allowed zones check
### Step 3 — Wrapper import validation
### Step 4A — Dependency check
### Step 5 — Build
### Step 6 — Test
### Step 7 — Summary

---

## ✔ Done
Agent đã được cập nhật đầy đủ với dependency check, vùng sửa hợp lệ, wrapper rule và output tiếng Việt.
