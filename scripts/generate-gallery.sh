#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

output="gallery-data.js"
temporary=".${output}.tmp"

escape_javascript_string() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  value="${value//$'\r'/\\r}"
  value="${value//$'\t'/\\t}"
  value="${value//&/\\u0026}"
  value="${value//</\\u003c}"
  value="${value//>/\\u003e}"
  printf '%s' "$value"
}

write_category() {
  local slug="$1"
  local title="$2"
  local folder="$3"
  local first_image=true

  mkdir -p "$folder"

  printf '  {\n' >> "$temporary"
  printf '    slug: "%s",\n' "$slug" >> "$temporary"
  printf '    title: "%s",\n' "$title" >> "$temporary"
  printf '    images: [\n' >> "$temporary"

  while IFS= read -r image_path; do
    local public_path="/${image_path#./}"
    local escaped_path
    escaped_path="$(escape_javascript_string "$public_path")"

    if [[ "$first_image" == false ]]; then
      printf ',\n' >> "$temporary"
    fi

    printf '      "%s"' "$escaped_path" >> "$temporary"
    first_image=false
  done < <(
    find "$folder" -maxdepth 1 -type f \( \
      -iname '*.jpg' -o \
      -iname '*.jpeg' -o \
      -iname '*.png' -o \
      -iname '*.webp' -o \
      -iname '*.avif' \
    \) | LC_ALL=C sort
  )

  if [[ "$first_image" == false ]]; then
    printf '\n' >> "$temporary"
  fi

  printf '    ]\n' >> "$temporary"
  printf '  }' >> "$temporary"
}

printf 'window.galleryData = [\n' > "$temporary"
write_category "bar-bat-mitzvah" "בר/בת מצווה" "Images/Gallery/bar-bat-mitzvah"
printf ',\n' >> "$temporary"
write_category "weddings" "חתונות" "Images/Gallery/weddings"
printf ',\n' >> "$temporary"
write_category "organic" "אורגני" "Images/Gallery/organic"
printf ',\n' >> "$temporary"
write_category "arches" "קשתות" "Images/Gallery/arches"
printf ',\n' >> "$temporary"
write_category "business-events" "אירועים עסקיים" "Images/Gallery/business-events"
printf '\n];\n' >> "$temporary"

if [[ -f "$output" ]] && cmp -s "$temporary" "$output"; then
  rm "$temporary"
else
  mv "$temporary" "$output"
fi
