#!/usr/bin/env bash

set -euo pipefail

mm_file="${1:-design.mmd}"
png_file="${mm_file%.mmd}.png"

if [[ ! -f "$mm_file" ]]; then
  echo "Error: '$mm_file' not found in $(pwd)" >&2
  exit 1
fi

if ! command -v mmdc >/dev/null 2>&1; then
  echo "Error: 'mmdc' command not found. Install Mermaid CLI (https://github.com/mermaid-js/mermaid-cli) first." >&2
  exit 1
fi

mmdc -i "$mm_file" -o "$png_file"

if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$png_file"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$png_file"
else
  echo "Generated '$png_file'. Please open it manually."
fi
