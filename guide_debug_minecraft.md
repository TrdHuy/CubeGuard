# Debug Minecraft Bedrock Script (VSCode + Bridge)

## 1) Build & Deploy
Run:
```
powershell ./scripts/deploy.ps1
```
This command:
- Builds TypeScript → JavaScript into `BP/scripts`
- Copies the pack into Minecraft `com.mojang`
- Prepares source maps for VSCode debugging

---

## 2) VSCode launch.json configuration
Add this block into `.vscode/launch.json`:

```json
{
  "type": "minecraft-js",
  "request": "attach",
  "name": "Attach Debug with Minecraft (Client)",
  "mode": "listen",
  "localRoot": "${workspaceFolder}/BP/scripts",
  "generatedSourceRoot": "${workspaceFolder}/BP/scripts",
  "sourceMapRoot": "${workspaceFolder}/BP/scripts",
  "port": 19144
}
```

---

## 3) IMPORTANT
Before attaching:
👉 **Remove all breakpoints** in VSCode.

Old breakpoints may cause VSCode to freeze when Minecraft connects the debugger.

Breakpoints should be added **only after** VSCode successfully attaches.

---

## 4) Debug Workflow
### Step 1 — Build & deploy
```
./deploy.ps1
```

### Step 2 — In VSCode
Open Debug panel → select:
```
Attach Debug with Minecraft (Client)
```
→ Press **Start Debugging**

VSCode will listen on `19144`.

### Step 3 — In Minecraft
Load a world with your Behavior Pack enabled.

Minecraft will automatically connect the debugger.

You should see:
```
Debugger attached to [127.0.0.1] on port [19144]
```

### Step 4 — Add breakpoints
After attach completes, add breakpoints in `.ts` files.

VSCode will map TS → JS correctly.

---

## 5) Success indicators
VSCode debug console should show:
```
Found .js files at BP/scripts
Found source maps
Breakpoint resolved
```

---

## 6) Summary
To debug:
1. Run `./deploy.ps1`
2. Start "Attach Debug with Minecraft (Client)" in VSCode
3. Load world in Minecraft
4. Add breakpoints afterward

Debugging for Behavior Pack works at 100%.
