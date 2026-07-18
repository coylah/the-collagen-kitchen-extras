#!/bin/bash
# Normalizes every filename in public/images/ into a safe, hyphenated slug
# matching what the app's code expects. Safe to run repeatedly - already-clean
# filenames pass through unchanged.
cd public/images || { echo "Run this from the project root"; exit 1; }
for f in *; do
  [ -f "$f" ] || continue
  ext="${f##*.}"
  base="${f%.*}"
  new_base=$(echo "$base" | tr '[:upper:]' '[:lower:]' | sed 's/&/and/g' | sed -E 's/[^a-z0-9]+/-/g' | sed -E 's/^-+|-+$//g')
  new="${new_base}.${ext}"
  if [ "$f" != "$new" ]; then
    mv -v -- "$f" "$new"
  fi
done
