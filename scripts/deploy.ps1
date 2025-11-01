# ===============================
#  CubeGuard Deploy Script
# ===============================
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "`n=== [CubeGuard Deploy Started at $timestamp] ===" -ForegroundColor Cyan

# Source paths
$bpSource = "./BP"
$rpSource = "./RP"

# Destination base paths
$mojangDestUWP = "$env:LOCALAPPDATA\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang"
$mojangDestRoaming = "$env:APPDATA\Minecraft Bedrock\Users\Shared\games\com.mojang"

# Function to get pack name from manifest
function Get-PackName($manifestPath) {
    try {
        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        return $manifest.header.name
    }
    catch {
        Write-Host "❌ Error reading manifest '$manifestPath': $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Deploy-Pack($src, $dst, $packType, $destName) {
    try {
        Write-Host "`n[$packType -> $destName] Cleaning old folder..." -ForegroundColor Yellow
        if (Test-Path $dst) {
            Remove-Item -Recurse -Force $dst
        }
        New-Item -ItemType Directory -Force -Path $dst | Out-Null

        Write-Host "[$packType -> $destName] Copying contents of '$src' to '$dst'..." -ForegroundColor Yellow
        Get-ChildItem -Path $src -Force | ForEach-Object {
            Copy-Item -Recurse -Force $_.FullName -Destination $dst
        }

        Write-Host "[$packType -> $destName] ✅ Deploy completed successfully." -ForegroundColor Green
    }
    catch {
        Write-Host "[$packType -> $destName] ❌ Error during deploy: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Get pack names
$bpName = Get-PackName "$bpSource/manifest.json"
$rpName = Get-PackName "$rpSource/manifest.json"

if (-not $bpName -or -not $rpName) {
    Write-Host "`n=== [CubeGuard Deploy Failed: Could not read pack names from manifest.json] ===" -ForegroundColor Red
    exit 1
}

# --- Deploy Behavior Pack ---
Write-Host "`n--- Deploying Behavior Pack ($bpName) ---" -ForegroundColor Magenta
$bpDestUWP = "$mojangDestUWP\development_behavior_packs\$bpName"
$bpDestRoaming = "$mojangDestRoaming\development_behavior_packs\$bpName"
Deploy-Pack $bpSource $bpDestUWP "Behavior Pack" "UWP Storage"
Deploy-Pack $bpSource $bpDestRoaming "Behavior Pack" "Roaming Storage"


# --- Deploy Resource Pack ---
Write-Host "`n--- Deploying Resource Pack ($rpName) ---" -ForegroundColor Magenta
$rpDestUWP = "$mojangDestUWP\development_resource_packs\$rpName"
$rpDestRoaming = "$mojangDestRoaming\development_resource_packs\$rpName"
Deploy-Pack $rpSource $rpDestUWP "Resource Pack" "UWP Storage"
Deploy-Pack $rpSource $rpDestRoaming "Resource Pack" "Roaming Storage"


Write-Host "`n=== [CubeGuard Deploy Finished] ===" -ForegroundColor Cyan
