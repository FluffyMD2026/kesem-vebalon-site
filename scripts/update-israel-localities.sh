#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
api_url="https://api.cbs.gov.il/Dictionary/geo/localities"
source_page="https://www.cbs.gov.il/he/cbsNewBrand/Pages/%D7%9E%D7%99%D7%9C%D7%95%D7%A0%D7%99%D7%9D-API.aspx"
page_size=250
temporary_directory="$(mktemp -d)"
output_directory="$project_root/data"
output_file="$output_directory/israel-localities.js"

cleanup() {
  rm -rf "$temporary_directory"
}

trap cleanup EXIT

download_page() {
  local page="$1"
  curl -L --fail --silent --show-error \
    --output "$temporary_directory/page-$page.json" \
    "$api_url?expand=false&fields=id,year,name_heb,locality_type&format=json&download=false&page=$page&page_size=$page_size"
}

download_page 1
last_page="$(jq -er '.dictionary.paging.last_page | tonumber' "$temporary_directory/page-1.json")"

for ((page = 2; page <= last_page; page += 1)); do
  download_page "$page"
done

mkdir -p "$output_directory"

metadata_file="$temporary_directory/localities.json"

jq -cs \
  --arg source "הלשכה המרכזית לסטטיסטיקה — מילון היישובים" \
  --arg sourceUrl "$source_page" \
  --arg retrieved "$(date +%F)" \
  '
    [
      .[].dictionary.data.localities.items[].localities
      | {
          id: .ID.id,
          year: .ID.year,
          localityType: .locality_type,
          name: (.name_heb | gsub("^[[:space:]]+|[[:space:]]+$"; ""))
        }
      | select(.name != "")
      | select(.localityType != "520" and .localityType != "530")
    ] as $records
    | {
        source: $source,
        sourceUrl: $sourceUrl,
        dictionaryYear: ($records | map(.year) | unique | join(", ")),
        retrieved: $retrieved,
        items: (
          $records
          | sort_by(.name, (.id | tonumber))
          | unique_by(.name)
          | map([.id, .name])
        )
      }
  ' "$temporary_directory"/page-*.json > "$metadata_file"

{
  printf '%s\n' '// Generated from the official Israel Central Bureau of Statistics locality dictionary.'
  printf '%s' 'window.israelLocalities = '
  jq -c '.' "$metadata_file"
  printf '%s\n' ';'
} > "$output_file"

record_count="$(jq -er '.items | length' "$metadata_file")"
printf 'Updated %s with %s unique locality names.\n' "$output_file" "$record_count"
