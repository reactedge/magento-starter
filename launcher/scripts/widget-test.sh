#!/usr/bin/env bash

set -euo pipefail

WIDGET="${1:-}"

if [ -z "$WIDGET" ]; then
  echo "Usage:"
  echo "  mise run widget-test -- <widget> [debug]"
  exit 1
fi

ROOT="$(git rev-parse --show-toplevel)"

if [[ "$WIDGET" == "all" ]]; then
    for dir in "$ROOT/widgets"/*; do
        [[ -d "$dir" ]] || continue
        [[ -f "$dir/package.json" ]] || continue

        widget=$(basename "$dir")

        echo
        echo "========================================="
        echo "Testing $widget"
        echo "========================================="

        "$0" "$widget" "${2:-}"
    done

    exit 0
fi

cd "$ROOT/widgets/$WIDGET"

npm run dev &
DEV_PID=$!

cleanup() {
    if kill -0 "$DEV_PID" 2>/dev/null; then
        kill "$DEV_PID" 2>/dev/null || true
        wait "$DEV_PID" 2>/dev/null || true
    fi
}

trap cleanup EXIT INT TERM

cd "$ROOT"


PWDEBUG=0

if [[ "${2:-}" == "debug" ]]; then
    PWDEBUG=1
fi

PWDEBUG=$PWDEBUG ./node_modules/.bin/playwright \
    test \
    --config=tests/playwright.dev.config.ts \
    "widgets/$WIDGET/tests"
