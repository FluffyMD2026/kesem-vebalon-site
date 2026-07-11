#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

port="${PORT:-8000}"
bash scripts/generate-gallery.sh

(
  while true; do
    sleep 2
    bash scripts/generate-gallery.sh
  done
) &
gallery_watcher_pid=$!

cleanup() {
  kill "$gallery_watcher_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM
python3 -m http.server "$port" --bind 127.0.0.1
