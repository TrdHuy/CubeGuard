# ===============================
#  CubeGuard Deploy Script
# ===============================
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "`n=== [CubeGuard Deploy Started at $timestamp] ===" -ForegroundColor Cyan

# --- Configuration ---
$buildDir = "./builds"
$sourceDirs = @{
    BP = @{ Path = "./BP"; Type = "development_behavior_packs"; DestType = "Behavior Pack" }
    RP = @{ Path = "./RP"; Type = "development_resource_packs"; DestType = "Resource Pack" }
    SP = @{ Path = "./SP"; Type = "development_skin_packs"; DestType = "Skin Pack" }
    WT = @{ Path = "./WT"; Type = "world_templates"; DestType = "World Template" }
}
$mojangDestinations = @(
    # @{ Path = "$env:LOCALAPPDATA\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang"; Name = "UWP Storage" },
    @{ Path = "$env:APPDATA\Minecraft Bedrock\Users\Shared\games\com.mojang"; Name = "Roaming Storage" }
)
# --- Helper Functions ---
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

# --- Deploy Function ---
function Invoke-Deploy() {
    Write-Host "`n--- [Deploy] Deploying packs from build directory ---" -ForegroundColor Magenta
    foreach ($key in $sourceDirs.Keys) {
        $sourceInfo = $sourceDirs[$key]
        $srcPath = $sourceInfo.Path
        if (-not (Test-Path $srcPath)) {
            continue # Skip if source folder doesn't exist
        }

        $packName = Get-PackName "$srcPath/manifest.json"
        if (-not $packName) {
            Write-Host "[$key] Could not get pack name from source. Skipping." -ForegroundColor Red
            continue
        }

        $builtPackPath = "$buildDir/$packName/$key"
        if (-not (Test-Path $builtPackPath)) {
            Write-Host "[$key] Built pack '$builtPackPath' not found. Skipping." -ForegroundColor Red
            continue
        }

        $packType = $sourceInfo.Type
        $destType = $sourceInfo.DestType
        
        Write-Host "`n--- Deploying $destType ($packName) ---" -ForegroundColor Cyan
        foreach ($destination in $mojangDestinations) {
            $destPath = "$($destination.Path)/$packType/$packName"
            Deploy-Single-Pack $builtPackPath $destPath $destType $destination.Name
        }
    }
}

function Deploy-Single-Pack($src, $dst, $packType, $destName) {
    try {
        Write-Host "[$packType -> $destName] Cleaning old folder..." -ForegroundColor Yellow
        if (Test-Path $dst) {
            Remove-Item -Recurse -Force $dst
        }
        
        Write-Host "[$packType -> $destName] Copying '$src' to '$dst'..." -ForegroundColor Yellow
        Copy-Item -Recurse -Force $src -Destination $dst

        Write-Host "[$packType -> $destName] ✅ Deploy completed successfully." -ForegroundColor Green
    }
    catch {
        Write-Host "[$packType -> $destName] ❌ Error during deploy: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# --- Main Execution ---
Write-Host "`n--- [Step 1] Running Build Script ---" -ForegroundColor Green
try {
    # Execute the build script
    pwsh -File ./scripts/build.ps1
}
catch {
    Write-Host "❌ Build script failed. Aborting deploy." -ForegroundColor Red
    exit 1
}

# Proceed with deploy only if build was successful
Invoke-Deploy

Write-Host "`n=== [CubeGuard Deploy Finished] ===" -ForegroundColor Cyan
