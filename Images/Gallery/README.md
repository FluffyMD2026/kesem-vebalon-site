# Gallery folders

Move an image between these folders to change its category:

- `bar-bat-mitzvah` — בר/בת מצווה
- `weddings` — חתונות
- `organic` — אורגני
- `arches` — קשתות
- `business-events` — אירועים עסקיים

When the local preview is started with `bash scripts/serve-local.sh`, the open
homepage or gallery reloads after a file moves. Both pages use the new folder
automatically. Netlify regenerates the same index at deploy time.
