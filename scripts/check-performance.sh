#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

bytes_per_second=1250000

file_size() {
  local file="$1"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    stat -f '%z' "$file"
  else
    stat -c '%s' "$file"
  fi
}

sum_files() {
  local total=0
  local file
  local size

  for file in "$@"; do
    if [[ ! -f "$file" ]]; then
      printf 'Missing performance asset: %s\n' "$file" >&2
      return 1
    fi
    size="$(file_size "$file")"
    total=$((total + size))
  done

  printf '%s\n' "$total"
}

report_payload() {
  local label="$1"
  local bytes="$2"
  awk -v label="$label" -v bytes="$bytes" -v rate="$bytes_per_second" 'BEGIN {
    printf "%-38s %6.2f MB   %5.2f s raw transfer\n", label, bytes / 1000000, bytes / rate
  }'
}

shared_assets=(
  theme.css
  style.css
  script.js
  Fonts/Rubik-Regular.ttf
  Images/logo-icon-v6.jpg
  Images/instagram-logo.png
  Images/whatsapp-logo.svg
)

home_assets=(
  index.html
  gallery-data.js
  Images/hero-balloon.jpeg
  Images/logo-primary-v6.jpg
  "${shared_assets[@]}"
)

gallery_assets=(
  gallery/index.html
  gallery-data.js
  Images/logo-primary-v6.jpg
  "${shared_assets[@]}"
)

package_assets=(
  Service_categories/event-packages.html
  "${shared_assets[@]}"
)

preview_files=()
gallery_folders=(
  Images/Gallery/bar-bat-mitzvah
  Images/Gallery/weddings
  Images/Gallery/organic
  Images/Gallery/arches
  Images/Gallery/business-events
)

for folder in "${gallery_folders[@]}"; do
  first_image=""
  while IFS= read -r image; do
    first_image="$image"
    break
  done < <(
    find "$folder" -maxdepth 1 -type f \( \
      -iname '*.jpg' -o \
      -iname '*.jpeg' -o \
      -iname '*.png' -o \
      -iname '*.webp' -o \
      -iname '*.avif' \
    \) | LC_ALL=C sort
  )
  if [[ -n "$first_image" ]]; then
    preview_files+=("$first_image")
  fi
done

home_bytes="$(sum_files "${home_assets[@]}")"
gallery_bytes="$(sum_files "${gallery_assets[@]}")"
package_bytes="$(sum_files "${package_assets[@]}")"
preview_bytes="$(sum_files "${preview_files[@]}")"
home_with_previews=$((home_bytes + preview_bytes))

largest_category_bytes=0
for folder in "${gallery_folders[@]}"; do
  category_files=()
  while IFS= read -r image; do
    category_files+=("$image")
  done < <(
    find "$folder" -maxdepth 1 -type f \( \
      -iname '*.jpg' -o \
      -iname '*.jpeg' -o \
      -iname '*.png' -o \
      -iname '*.webp' -o \
      -iname '*.avif' \
    \) | LC_ALL=C sort
  )
  if (( ${#category_files[@]} )); then
    category_bytes="$(sum_files "${category_files[@]}")"
    if (( category_bytes > largest_category_bytes )); then
      largest_category_bytes="$category_bytes"
    fi
  fi
done

printf 'Conservative 10 Mbps estimates (uncompressed, cold cache)\n'
report_payload 'Homepage above-fold assets' "$home_bytes"
report_payload 'Homepage plus 5 lazy previews' "$home_with_previews"
report_payload 'Gallery category landing' "$gallery_bytes"
report_payload 'Packages page' "$package_bytes"
report_payload 'Largest category after click' "$largest_category_bytes"

if (( home_with_previews > bytes_per_second * 2 )); then
  printf 'FAIL: homepage payload exceeds two raw transfer seconds at 10 Mbps.\n' >&2
  exit 1
fi

printf 'PASS: homepage payload stays below two raw transfer seconds at 10 Mbps.\n'
