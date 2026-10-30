#!/usr/bin/env bash
# fetch-voices.sh — regenerate src/data/{voices,provider-status}.json from the
# live voice catalog served by khaosd (GET /api/voices + /api/providers/status).
#
# Auditions play clips this repo hosts, never a third-party URL: one per gender
# bucket in public/samples/ (female, male, neutral), made on-device with macOS
# `say` and encoded with afconvert. src/voice-samples.test.js fails if a voice
# points at a clip that is not committed.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

require_cmd jq
require_cmd curl

# Transport lives in lib.sh (khaosd_curl) — see fetch-kspd.sh.
khaosd_require

ACCENT='{"en-US":"American","en-GB":"British","en-AU":"Australian","en-NZ":"New Zealand","en-IN":"Indian","de-DE":"German","fr-CA":"Canadian French"}'

log_info "fetching voices from khaosd"

khaosd_curl "/api/voices" | jq --argjson accent "$ACCENT" '
  [ .[] | {
      id:        (.profileId // .id),
      name:      (.name // ""),
      description: (.description // ""),
      language:  (.languages[0] // (.language // "")),
      gender:    (.gender // ""),
      ageRange:  ((.ageRange // .age) // ""),
      tone:      ((.toneTags // []) | join(", ")),
      accent:    ($accent[(.languages[0] // "")] // ""),
      personalityTags: (.toneTags // []),
      provider:  (.provider // ""),
      providerId: (.providerId // ""),
      qualityTier: (.qualityTier // ""),
      sampleURL: ("/samples/" + (if .gender == "female" or .gender == "male" then .gender else "neutral" end) + ".m4a"),
      steeringKind: ((.steering.kind) // "none"),
      tags:      (.tags // [])
  } ] | sort_by(.name | ascii_downcase)
' | write_json src/data/voices.json

khaosd_curl "/api/providers/status" | jq '
  [ .providers[] | { id, isReady: (.status == "ready"), capabilities: (.capabilities // []) } ]
' | write_json src/data/provider-status.json

log_info "wrote src/data/voices.json ($(jq length src/data/voices.json) voices) + provider-status.json ($(jq length src/data/provider-status.json) providers)"
