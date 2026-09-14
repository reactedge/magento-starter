#!/usr/bin/env bash

set -euo pipefail

STORE_CODE="${1:-default}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "🚀 Deploying workspace to Target Environment"

source "$ROOT/.env.$STORE_CODE"

REACTEDGE_WORKSPACE="$(dirname "$TARGET_ROOT")/reactedge"

mkdir -p "$REACTEDGE_WORKSPACE"

rsync -av --delete \
    --exclude='.git/' \
    "$ROOT/workspace/$STORE_CODE/" \
    "$REACTEDGE_WORKSPACE/$STORE_CODE/"

echo "files copied to $REACTEDGE_WORKSPACE"
echo "✅ Deployment orchestrator built successfully"