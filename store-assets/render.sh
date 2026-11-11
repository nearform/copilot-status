#!/bin/bash
# Renders the store artwork from feature-graphic.html with headless Google Chrome (macOS),
# then flattens each screenshot to an RGB PNG, because both stores reject alpha channels.
#
#   play-feature-graphic.png  Google Play feature graphic, 1024x500
#   app-store-header.png      App Store product page header, 21:9, 3840x1646
#
# Usage: ./store-assets/render.sh
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
SRC="file://$DIR/feature-graphic.html"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

shot() { # layout css-width css-height scale output
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --user-data-dir="$TMP/profile" --window-size="$2,$3" --force-device-scale-factor="$4" \
    --virtual-time-budget=6000 --screenshot="$TMP/$1.png" "$SRC?layout=$1" >/dev/null 2>&1
  swift "$DIR/flatten.swift" "$TMP/$1.png" "$DIR/$5" "#0F2530"
}

shot play 1024 500 1 play-feature-graphic.png
shot header 1920 823 2 app-store-header.png
