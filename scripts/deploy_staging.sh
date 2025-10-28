#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

BP_SOURCE="${PROJECT_ROOT}/BP"
RP_SOURCE="${PROJECT_ROOT}/RP"
SP_SOURCE="${PROJECT_ROOT}/SP"

DEFAULT_SERVER_PATH="${HOME}/Desktop/workspace/server/minecraft-staging/data"
TARGET_BASE="${1:-$DEFAULT_SERVER_PATH}"

# Resolve potential '~' in the provided path
if [[ "$TARGET_BASE" == ~* ]]; then
  TARGET_BASE="${TARGET_BASE/#\~/$HOME}"
fi

if [[ ! -d "$TARGET_BASE" ]]; then
  echo "[Error] Target base path '$TARGET_BASE' does not exist." >&2
  exit 1
fi

BEHAVIOR_DEST="${TARGET_BASE}/development_behavior_packs/CubeGuard BP"
RESOURCE_DEST="${TARGET_BASE}/development_resource_packs/CubeGuard RP"
SKIN_DEST="${TARGET_BASE}/development_skin_packs/CubeGuard SP"

log_section() {
  local message="$1"
  printf '\n=== %s ===\n' "$message"
}

copy_pack() {
  local name="$1"
  local src="$2"
  local dst="$3"

  log_section "[$name] Preparing deploy"
  if [[ ! -d "$src" ]]; then
    echo "[Warning] Source directory '$src' for $name does not exist. Skipping." >&2
    return
  fi

  echo "[$name] Cleaning destination '$dst'..."
  rm -rf "$dst"
  mkdir -p "$dst"

  echo "[$name] Copying contents from '$src' to '$dst'..."
  cp -a "$src"/. "$dst"/

  echo "[$name] Deploy completed successfully."
}

start_time="$(date '+%Y-%m-%d %H:%M:%S')"
log_section "CubeGuard Staging Deploy Started at ${start_time}"

copy_pack "Behavior Pack" "$BP_SOURCE" "$BEHAVIOR_DEST"
copy_pack "Resource Pack" "$RP_SOURCE" "$RESOURCE_DEST"
copy_pack "Skin Pack" "$SP_SOURCE" "$SKIN_DEST"

log_section "CubeGuard Staging Deploy Finished"
