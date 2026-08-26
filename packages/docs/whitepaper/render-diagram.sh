#!/usr/bin/env bash

npx -y @mermaid-js/mermaid-cli \
  -i "$1" \
  -o "${1%.mmd}.png" \
  -w 770