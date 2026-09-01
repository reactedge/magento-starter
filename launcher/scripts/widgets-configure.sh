#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONFIG="$ROOT/.env"

echo "Preparing ReactEdge workspace..."

# Initialise root environment configuration.
if [[ ! -f "$CONFIG" ]]; then
    if [[ ! -f "$ROOT/.env.sample" ]]; then
        echo "❌ Missing .env.sample"
        exit 1
    fi

    cp "$ROOT/.env.sample" "$CONFIG"
    echo "✓ Created .env from .env.sample"
fi

# Initialise workspace.
if [[ ! -f "$ROOT/workspace/registry.json" ]]; then
    if [[ ! -d "$ROOT/workspace.sample" ]]; then
        echo "❌ Missing workspace.sample"
        exit 1
    fi

    mkdir -p "$ROOT/workspace"
    cp -R "$ROOT/workspace.sample/." "$ROOT/workspace/"
    echo "✓ Created workspace from workspace.sample"
fi

echo

if [[ -f "$CONFIG" ]]; then
    # Load existing configuration
    set -a
    source "$CONFIG"
    set +a
fi

echo "ReactEdge Configuration"
echo

prompt() {
    local label="$1"
    local var="$2"
    local default="$3"

    local current="${!var:-}"

    echo

    if [[ -n "$current" ]]; then
        read -rp "$label [$current]: " value
        printf -v "$var" "%s" "${value:-$current}"
    else
        read -rp "$label [$default]: " value
        printf -v "$var" "%s" "${value:-$default}"
    fi
}

echo "========================================"
echo "ReactEdge Configuration"
echo "========================================"
echo
echo "Press ENTER to accept the default value."
echo

#read -rp "Cloudflare Turnstile Site Key (optional): " CLOUDFLARE_KEY
#read -rp "Google Maps API Key (optional): " GOOGLE_MAPS_API_KEY
#read -rp "Google Place ID (optional): " GOOGLE_PLACE_ID
#read -rp "Magento GraphQL API [https://mageos-docker.magsite.co.uk/graphql]: " MAGENTO_GRAPHQL_API
#MAGENTO_GRAPHQL_API=${MAGENTO_GRAPHQL_API:-https://mageos-docker.magsite.co.uk/graphql}
#read -rp "Intent API Base URL [http://localhost:8000/v1]: " INTENT_API_BASE_URL
#INTENT_API_BASE_URL=${INTENT_API_BASE_URL:-http://localhost:8000/v1}
#read -rp "Store Code [default]: " STORE_CODE
#STORE_CODE=${STORE_CODE:-default}
#read -rp "Category [tops-men]: " CATEGORY
#CATEGORY=${CATEGORY:-tops-men}

echo
echo "Platform"
echo "--------"
echo "Configure the website where ReactEdge will run."

prompt \
    "Site URL" \
    SITEURL \
    "https://mageos-docker.magsite.co.uk"

prompt \
    "Store Code" \
    STORE_CODE \
    "default"

prompt \
    "Platform root directory" \
    TARGET_ROOT \
    "/var/www/docker_mageos/magento"

echo
echo "External Services"
echo "-----------------"
echo "Only configure the services required by the widgets you intend to use."

REACTEDGE_ROOT="$(dirname "$TARGET_ROOT")/reactedge"

echo "Checking ReactEdge workspace: $REACTEDGE_ROOT"

mkdir -p "$REACTEDGE_ROOT"

touch "$REACTEDGE_ROOT/.reactedge-write-test" || {
    echo
    echo "Error: ReactEdge must be writable."
    echo
    echo "Expected layout:"
    echo "  $(dirname "$TARGET_ROOT")/"
    echo "  ├── magento/"
    echo "  └── reactedge/"
    exit 1
}

rm -f "$REACTEDGE_ROOT/.reactedge-write-test"

echo
echo "Google Reviews"
echo "--------------"
echo "Display Google customer reviews."

prompt \
    "Enable Google Reviews (0 or 1)" \
    GOOGLE_REVIEWS_ENABLED \
    "0"

if [ "$GOOGLE_REVIEWS_ENABLED" = "1" ]; then
  prompt "Google Maps API Key" GOOGLE_MAPS_API_KEY ""
  prompt "Google Place ID" GOOGLE_PLACE_ID ""
fi

echo
echo "Demo Data"
echo "---------"
echo "Used by example widgets during local development."

prompt \
    "Demo product SKU" \
    SKU \
    "WJ12"

echo
echo "Server-Side Rendering (SSR)"
echo "---------------------------"
echo "Generate pre-rendered HTML alongside the npm packages."
echo "Enable this for hosts that cannot render React on the server (e.g. PHP)."

prompt \
    "Generate SSR artefacts (0 or 1)" \
    SSR_ENABLED \
    "1"

if [[ "$SSR_ENABLED" == "1" ]]; then
    prompt \
        "SSR port" \
        SSR_PORT \
        "4000"

    prompt \
        "SSR base URL" \
        SSR_BASE_URL \
        "https://widgets-ssr.co.uk"
fi

echo

ALLOW_SELF_SIGNED_SSL=true

if [ "$GOOGLE_REVIEWS_ENABLED" == "1" ]; then
    GOOGLE_API_CONFIG=',
    "googleMaps": {
      "apiKey": "'"$GOOGLE_MAPS_API_KEY"'",
      "placeId": "'"$GOOGLE_PLACE_ID"'"
    }'
else
    GOOGLE_API_CONFIG=""
fi

for dir in "$ROOT"/widgets/*; do
    if [[ -d "$dir" && -d "$dir/public" ]]; then
        echo "📦 Generating runtime for $(basename "$dir")"

        cat > "$dir/public/reactedge-runtime.json" <<EOF
{
  "integrations": {
    "magentoGraphql": {
      "api": "$SITEURL/graphql"
    }$GOOGLE_API_CONFIG
  },
  "context": {
    "storeCode": "$STORE_CODE",
    "sku": "$SKU"
  }
}
EOF
    fi
done

RUNTIME_TEMPLATE="$ROOT/packages/widget-template/runtime"

if [[ -d "$RUNTIME_TEMPLATE/public" ]]; then
    echo "📦 Generating runtime for runtime widget template"

    cat > "$RUNTIME_TEMPLATE/public/reactedge-runtime.json" <<EOF
{
  "integrations": {
    "magentoGraphql": {
      "api": "$SITEURL/graphql"
    }$GOOGLE_API_CONFIG
  },
  "context": {
    "storeCode": "$STORE_CODE",
    "sku": "$SKU"
  }
}
EOF
fi

echo
echo "✅ Runtime configuration generated."
echo "✅ Configuration written to $CONFIG"

cat > "$CONFIG" <<EOF
STORE_CODE=$STORE_CODE
SITEURL=$SITEURL
TARGET_ROOT=$TARGET_ROOT
SSR_ENABLED=$SSR_ENABLED
SSR_PORT=$SSR_PORT
SSR_BASE_URL=$SSR_BASE_URL
SKU=$SKU
EOF

set -a
source "$CONFIG"
set +a

cat > "$ROOT/services/ssr/.env" <<EOF
SSR_PORT=$SSR_PORT
EOF

cat > "$ROOT/services/orchestrator/.env.dev" <<EOF
STORE_CODE=$STORE_CODE
SITEURL=$SITEURL
TARGET_ROOT=$TARGET_ROOT
SSR_ENABLED=$SSR_ENABLED
EOF

cat > "$ROOT/browser-mcp/.env" <<EOF
SITEURL=$SITEURL
EOF
