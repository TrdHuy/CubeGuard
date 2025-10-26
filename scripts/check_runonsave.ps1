Write-Host "Checking CubeGuard VSCode Auto-Deploy Configuration..." -ForegroundColor Cyan

# 1. Check if VSCode extension installed
$ext = code --list-extensions | Where-Object { $_ -match "emeraldwalk.runonsave" }
if ($ext) {
    Write-Host "[OK] Extension 'emeraldwalk.runonsave' installed: $ext" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Extension 'emeraldwalk.runonsave' is NOT installed. Please install it from Marketplace." -ForegroundColor Red
}

# 2. Check current folder
$current = Get-Location
if (Test-Path ".vscode") {
    Write-Host "[OK] Current folder has .vscode directory: $current" -ForegroundColor Green
} else {
    Write-Host "[WARN] No .vscode folder found here. You might be in parent folder of the project." -ForegroundColor Yellow
}

# 3. Check settings.json contains emeraldwalk.runonsave
$settingsPath = ".vscode/settings.json"
if (Test-Path $settingsPath) {
    $settingsContent = Get-Content $settingsPath -Raw
    if ($settingsContent -match "emeraldwalk.runonsave") {
        Write-Host "[OK] settings.json includes 'emeraldwalk.runonsave' configuration." -ForegroundColor Green
    } else {
        Write-Host "[WARN] settings.json does NOT include run-on-save configuration." -ForegroundColor Yellow
    }
} else {
    Write-Host "[FAIL] No .vscode/settings.json file found." -ForegroundColor Red
}

# 4. Check tasks.json for Deploy tasks
$tasksPath = ".vscode/tasks.json"
if (Test-Path $tasksPath) {
    $tasksContent = Get-Content $tasksPath -Raw
    if ($tasksContent -match "Deploy CubeGuard Behavior Pack") {
        Write-Host "[OK] tasks.json includes 'Deploy CubeGuard Behavior Pack' task." -ForegroundColor Green
    } else {
        Write-Host "[WARN] tasks.json found but deploy task missing." -ForegroundColor Yellow
    }
} else {
    Write-Host "[FAIL] No .vscode/tasks.json file found." -ForegroundColor Red
}

# 5. Check permission to Minecraft dev folder
$mcPath = "$env:LOCALAPPDATA\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs"
if (Test-Path $mcPath) {
    Write-Host "[OK] Minecraft dev folder detected at:" -ForegroundColor Green
    Write-Host "     $mcPath" -ForegroundColor Gray
} else {
    Write-Host "[FAIL] Minecraft dev folder not found. Make sure Minecraft for Windows is installed." -ForegroundColor Red
}

# 6. Test write permission
Write-Host ""
Write-Host "Testing file write permission..." -ForegroundColor Cyan

$testFile = Join-Path $mcPath "__test_write_permission.txt"
try {
    "CubeGuard deploy test $(Get-Date)" | Out-File -FilePath $testFile -Encoding utf8 -Force
    if (Test-Path $testFile) {
        Write-Host "[OK] Write permission verified. File created at:" -ForegroundColor Green
        Write-Host "     $testFile" -ForegroundColor Gray
        Remove-Item $testFile -Force
    } else {
        Write-Host "[WARN] Could not verify write permission." -ForegroundColor Yellow
    }
} catch {
    Write-Host "[FAIL] No permission to write to Minecraft dev folder." -ForegroundColor Red
}

Write-Host ""
Write-Host "Check complete!"
Write-Host "If all items are [OK] (green), auto-deploy on save should work correctly." -ForegroundColor Cyan