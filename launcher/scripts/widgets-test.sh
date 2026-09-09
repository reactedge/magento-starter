#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ "${1:-}" == "debug" ]]; then
    export PWDEBUG=1
fi

export SITEURL

echo "🚀 Building test orchestrator"

(
    cd "$ROOT/services/orchestrator"
    npm run test
)

echo "✅ Tests ran successfully"