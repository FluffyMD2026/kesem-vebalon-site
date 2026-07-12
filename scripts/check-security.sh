#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDEX_FILE="$ROOT_DIR/index.html"
CONFIG_FILE="$ROOT_DIR/netlify.toml"

computed_hash="$(
  perl -0777 -ne 'if (m{<script type="application/ld\+json">(.*?)</script>}s) { print $1; $found = 1 } END { exit 1 unless $found }' "$INDEX_FILE" \
    | openssl dgst -sha256 -binary \
    | openssl base64 \
    | tr -d '\n'
)"

if [[ -z "$computed_hash" ]]; then
  echo "Security check failed: homepage JSON-LD block was not found." >&2
  exit 1
fi

if ! grep -Fq "'sha256-$computed_hash'" "$CONFIG_FILE"; then
  echo "Security check failed: the JSON-LD CSP hash is stale." >&2
  echo "Expected: sha256-$computed_hash" >&2
  exit 1
fi

if ! grep -Fq 'Strict-Transport-Security = "max-age=63072000; includeSubDomains"' "$CONFIG_FILE"; then
  echo "Security check failed: the hardened HSTS policy is missing." >&2
  exit 1
fi

seo_files=(
  "$ROOT_DIR/index.html"
  "$ROOT_DIR/gallery/index.html"
  "$ROOT_DIR/contact/index.html"
  "$ROOT_DIR/Service_categories/business-events.html"
  "$ROOT_DIR/Service_categories/event-design.html"
  "$ROOT_DIR/Service_categories/event-packages.html"
  "$ROOT_DIR/Service_categories/home-balloons.html"
  "$ROOT_DIR/Service_categories/room-design.html"
  "$ROOT_DIR/robots.txt"
  "$ROOT_DIR/sitemap.xml"
)

if grep -nF 'https://kesem-vebalon.netlify.app' "${seo_files[@]}"; then
  echo "Security check failed: an old Netlify origin remains in public SEO metadata." >&2
  exit 1
fi

mixed_content=0
while IFS= read -r -d '' file; do
  if grep -nE '(src|href)="http://' "$file"; then
    echo "Security check failed: mixed-content reference in $file" >&2
    mixed_content=1
  fi
done < <(
  find "$ROOT_DIR" -type f \( -name '*.html' -o -name '*.js' \) \
    -not -path "$ROOT_DIR/.git/*" \
    -not -path "$ROOT_DIR/Images/Gallery/New Images/*" \
    -print0
)

if (( mixed_content != 0 )); then
  exit 1
fi

echo "Security checks passed: CSP hash, HSTS, canonical origin, and mixed content."
