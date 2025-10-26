# ===============================
#  CubeGuard Deploy Script (Flattened Copy)
# ===============================
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "`n=== [CubeGuard Deploy Started at $timestamp] ===" -ForegroundColor Cyan

# Source paths
$bpSource = "./BP"
$rpSource = "./RP"

# Destination paths
$bpDest = "$env:LOCALAPPDATA\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\CubeGuard BP"
$rpDest = "$env:LOCALAPPDATA\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_resource_packs\CubeGuard RP"

function Deploy-Pack($src, $dst, $name) {
    try {
        Write-Host "`n[$name] Cleaning old folder..." -ForegroundColor Yellow
        if (Test-Path $dst) {
            Remove-Item -Recurse -Force $dst
        }
        New-Item -ItemType Directory -Force -Path $dst | Out-Null

        Write-Host "[$name] Copying contents of '$src' to '$dst'..." -ForegroundColor Yellow
        # Lấy tất cả file + folder con trong source (chứ không copy thư mục cha)
        Get-ChildItem -Path $src -Force | ForEach-Object {
            Copy-Item -Recurse -Force $_.FullName -Destination $dst
        }

        Write-Host "[$name] ✅ Deploy completed successfully." -ForegroundColor Green
    }
    catch {
        Write-Host "[$name] ❌ Error during deploy: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Deploy both packs
Deploy-Pack $bpSource $bpDest "Behavior Pack"
Deploy-Pack $rpSource $rpDest "Resource Pack"

Write-Host "`n=== [CubeGuard Deploy Finished] ===" -ForegroundColor Cyan