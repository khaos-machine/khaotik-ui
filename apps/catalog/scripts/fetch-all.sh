#!/usr/bin/env bash
# fetch-all.sh — regenerate the catalog's stored (committed) data from the live
# sources. This is the "export/convert" step: the JSON it writes is committed and
# becomes the build-time input for the web + desktop catalog, so neither needs a
# running daemon.
#
# Requires khaosd running (voices + kspd detail) and khaos-tools on PATH.
set -euo pipefail

cd "$(dirname "$0")/.."
export PATH="$HOME/.cargo/bin:$PATH"

echo "▶ fetch KSPD data (scenes/characters/locations/dialogues/analyses/casting/coverage)"
bash scripts/fetch-kspd.sh

echo "▶ fetch voice catalog + provider status"
bash scripts/fetch-voices.sh

echo "▶ done — commit src/data/*.json to update the build-time export."
