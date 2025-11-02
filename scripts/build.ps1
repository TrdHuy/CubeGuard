# ===============================
#  CubeGuard Build Script
# ===============================
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "`n=== [CubeGuard Build Started at $timestamp] ===" -ForegroundColor Cyan

# --- Configuration ---
$buildDir = "./builds"
$sourceDirs = @{
    BP = @{ Path = "./BP" }
    RP = @{ Path = "./RP" }
    SP = @{ Path = "./SP" }
    WT = @{ Path = "./WT" }
}

# Files/Folders to exclude from build
$excludePatterns = @(
    "*.md",
    "README",
    "*.test.js",
    "node_modules",
    "package.json",
    "package-lock.json",
    "tests" # Remove the entire tests folder
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

# --- Build Functions ---
function Invoke-PreBuild() {
    Write-Host "`n--- [Pre-Build] Cleaning build directory ---" -ForegroundColor Magenta
    if (Test-Path $buildDir) {
        Remove-Item -Recurse -Force $buildDir
    }
    New-Item -ItemType Directory -Force -Path $buildDir | Out-Null
}

function Invoke-OnBuild() {
    Write-Host "`n--- [On-Build] Building TypeScript files ---" -ForegroundColor Magenta
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ TypeScript build failed. Aborting." -ForegroundColor Red
        exit 1
    }

    Write-Host "`n--- [On-Build] Copying and renaming packs ---" -ForegroundColor Magenta
    foreach ($key in $sourceDirs.Keys) {
        $sourceInfo = $sourceDirs[$key]
        $srcPath = $sourceInfo.Path
        if (-not (Test-Path $srcPath)) {
            Write-Host "[$key] Source directory '$srcPath' not found. Skipping." -ForegroundColor Gray
            continue
        }

        $packName = Get-PackName "$srcPath/manifest.json"
        if (-not $packName) {
            Write-Host "[$key] Could not get pack name. Skipping." -ForegroundColor Red
            continue
        }

        $buildDest = "$buildDir/$packName/$key"
        # Explicitly create the destination directory first
        New-Item -ItemType Directory -Path $buildDest -Force | Out-Null
        Write-Host "[$key] Copying contents of '$srcPath' to '$buildDest'..." -ForegroundColor Yellow
        # Copy the contents of the source directory into the destination
        Copy-Item -Path "$srcPath\*" -Destination $buildDest -Recurse -Force
    }
}

function Invoke-PostBuild() {
    Write-Host "`n--- [Post-Build] Cleaning up build output ---" -ForegroundColor Magenta
    Get-ChildItem -Path $buildDir -Recurse | ForEach-Object {
        foreach ($pattern in $excludePatterns) {
            if ($_.Name -like $pattern) {
                Write-Host "  -> Deleting $($_.FullName)" -ForegroundColor Gray
                Remove-Item -Recurse -Force $_.FullName
            }
        }
    }
}

# --- Main Execution ---
Invoke-PreBuild
Invoke-OnBuild
Invoke-PostBuild

Write-Host "`n=== [CubeGuard Build Finished] ===" -ForegroundColor Cyan
