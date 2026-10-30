#!/usr/bin/env bash
# make-og-image.sh — render a social-share card (scripts/og-card.html) to a PNG
# at 1200×630 with headless Chrome.
#
# The card is authored as HTML (not SVG) so it gets the system font stack and a
# real browser render; Chrome's --screenshot gives an exact 1200×630 PNG with
# no QuickLook square padding.
#
# One template, any surface — the title and subtitle are passed in so the
# layout, logo and palette stay identical everywhere the design system is
# shared. Defaults render the catalog's own card, which index.html serves as
# the share image for khaotik-catalog.loswf.com.
#
#   ./scripts/make-og-image.sh
#   ./scripts/make-og-image.sh --title "Khaotik UI" \
#       --subtitle "The Khaos design system · components and tokens" \
#       --out public/og.png
set -euo pipefail

cd "$(dirname "$0")/.."

TITLE=""
SUBTITLE=""
OUT="public/og.png"

while [ $# -gt 0 ]; do
  case "$1" in
    --title)    TITLE="$2"; shift 2 ;;
    --subtitle) SUBTITLE="$2"; shift 2 ;;
    --out)      OUT="$2"; shift 2 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || { echo "Chrome not found at $CHROME" >&2; exit 1; }

# percent-encode the query so spaces and · survive the file:// URL
urlencode() { python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1],safe=""))' "$1"; }

QUERY=""
[ -n "$TITLE" ] && QUERY="title=$(urlencode "$TITLE")"
[ -n "$SUBTITLE" ] && QUERY="${QUERY:+$QUERY&}subtitle=$(urlencode "$SUBTITLE")"

mkdir -p "$(dirname "$OUT")"

"$CHROME" --headless --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 \
  --window-size=1200,630 \
  --screenshot="$OUT" \
  "file://$PWD/scripts/og-card.html${QUERY:+?$QUERY}" >/dev/null 2>&1

[ -s "$OUT" ] || { echo "error: $OUT was not written" >&2; exit 1; }

echo "rendered $OUT ($(sips -g pixelWidth -g pixelHeight "$OUT" 2>/dev/null | awk '/pixel/{printf "%s ", $2}'))"
