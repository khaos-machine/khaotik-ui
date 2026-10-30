#!/usr/bin/env bash
# fetch-kspd.sh — regenerate the catalog's KSPD-derived data from the live
# khaosd API (replaces fetch-kspd.py, which is being retired
# in favor of Bash + jq per the project's language preferences).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

require_cmd jq
require_cmd curl
export PATH="$HOME/.cargo/bin:$PATH"

PROJECT="${KSPD_PROJECT:-${1:-$HOME/khaos/projects/broken-in-4-places.kspd}}"
ENC="$(jq -rn --arg p "$PROJECT" '$p | @uri')"

# What the committed fixtures say they came from. The NAME, not the path: a
# provenance line naming `/Users/k/khaos/projects/...` makes the fixture a
# record of one laptop, which is the same reason engine.json drops pid and disk.
# (The engine's own audioUrl fields still carry the path — that is the API's
# data, and rewriting it would be fabricating.)
PROJECT_NAME="$(basename "$PROJECT" .kspd | tr '-' ' ' | tr '[:lower:]' '[:upper:]')"

# Transport lives in lib.sh (khaosd_curl): the daemon went token-gated in 0.5.0
# and gained a Unix socket in 0.6.0, and this script used bare TCP, so every
# fetch here was returning 401 until it was taught about both.
khaosd_require

# jq helpers used across the mappings.
JQ_TITLE_CASE='def title_case: split(" ") | map(if length > 0 then (.[0:1]|ascii_upcase) + (.[1:]|ascii_downcase) else . end) | join(" ");'

log_info "fetching $PROJECT from khaosd"

# ---- characters (khaosd /api/v1/dashboard/characters) ----
khaosd_curl "/api/v1/dashboard/characters?projectPath=$ENC" | jq -r "$JQ_TITLE_CASE
  [ .data[] | { id, name: (.name|title_case), dialogue_count: (.dialogue_lines//0), word_count: (.words//0), scene_count: (.scene_count//0) } ]
  | sort_by(-.dialogue_count, .name)" | write_json src/data/characters.json

# ---- locations (khaosd /api/v1/dashboard/locations) ----
khaosd_curl "/api/v1/dashboard/locations?projectPath=$ENC" | jq -r "$JQ_TITLE_CASE
  [ .data[] | { id, name: (.name|title_case), scene_count: (.scene_count//0), page_count: (.page_count//null), origin: (.origin//\"\"), mentionedSceneIds: (.mentionedSceneIds//[]) } ]
  | sort_by(-.scene_count, .name)" | write_json src/data/locations.json

# ---- scenes (khaosd /api/v1/dashboard/scenes; title/duration filled below) ----
khaosd_curl "/api/v1/dashboard/scenes?projectPath=$ENC" | jq -r '
  [ .data[] | { number: ((.index // 0) + 1), id, title: "", slugline: (.slugline // ""), duration: "", timeOfDay: "", type: "", word_count: 0 } ]
  | sort_by(.number)' | write_json src/data/scenes.json

# ---- dialogues (khaosd /api/dashboard/detail, one scene at a time) ----
# The scene list stopped carrying elements; a scene's detail serves them as
# `item.events`, discriminated by `kind`.
jq -r '.[].id' src/data/scenes.json | while read -r sid; do
  khaosd_curl "/api/dashboard/detail?projectPath=$ENC&section=scenes&id=$sid" | jq -c '.item'
done | jq -rs --slurpfile chars src/data/characters.json '
  ($chars[0] | map({key: .id, value: .name}) | from_entries) as $name_by_id
  | [ .[] | . as $s
      | ((($s.events // []) | reduce .[] as $e ({pending:"", out:[]};
          if $e.kind == "parenthetical" then {pending: $e.text, out: .out}
          elif $e.kind == "dialogue" then {pending: "", out: (.out + [{element_id: $e.id, scene_id: $s.id, scene_slugline: $s.slugline, character: ($name_by_id[$e.characterId] // ""), text: $e.text, parenthetical: .pending}])}
          else . end)) | .out)
    ] | flatten' | write_json src/data/dialogues.json

# scene durations, plus timeOfDay and type.
#
# The last two are what BarChart's distributions are built from (#28) — DAY 34 /
# NIGHT 20 and INT 41 / EXT 12 / INT-EXT 1 on this project. They come from the
# dashboard scenes payload below rather than the list above, which is why they are filled here rather than
# in the query above.
khaosd_curl "/api/dashboard/scenes?projectPath=$ENC" | jq -r '[.[] | {key: .id, value: {duration: (.duration // ""), timeOfDay: (.timeOfDay // ""), type: (.type // ""), word_count: (.word_count // 0)}}] | from_entries' > /tmp/kui-scenefields.json
jq --slurpfile f /tmp/kui-scenefields.json 'map(
  .duration  = ($f[0][.id].duration  // "") |
  .timeOfDay = ($f[0][.id].timeOfDay // "") |
  .type      = ($f[0][.id].type      // "") |
  .word_count = ($f[0][.id].word_count // 0)
)' src/data/scenes.json > /tmp/kui-scenes.json && mv /tmp/kui-scenes.json src/data/scenes.json

# ---- casting + coverage ----
#
# Both are sorted/pretty-printed rather than piped straight through, for the
# same reason. /api/casting returns its assignments in whatever order it walked
# them, so two fetches of IDENTICAL data produced a whole-file diff — and the
# file was one minified line, so the diff could not be read at all. A fixture
# that churns without changing trains us to skim past it, which is exactly when
# a real change slips by.
#
# The full key, not just characterId: jq's sort is stable, so a character with a
# second voiceProfileId would keep those rows in khaosd's Go map order and the
# churn would come back — silently, because sorted-by-characterId is satisfied
# either way.
#
# coverage.json needs no sort (it is an object) but was just as unreadable
# minified — 38KB on one line, so any change to it was a whole-file diff.
#
# A correction to what this comment used to say: it claimed reportId and
# generatedAt regenerate on every fetch. They do not. The daemon returns a
# STORED report — on khaosd 0.6.8 both still read the values generated
# 2026-06-23, and two consecutive fetches are byte-identical. The pretty
# printing is still worth it, for the reason above; the churn it was said to
# tame never existed. Measured, after asserting otherwise once.
#
# Written through lib.sh's write_json, which refuses an empty or invalid result,
# so a jq error against an unexpected payload shape fails here, where the cause
# is legible, instead of leaving a 0-byte file that breaks the Vite build.
khaosd_curl "/api/casting?projectPath=$ENC" \
  | jq 'sort_by(.characterId, .voiceProfileId)' | write_json src/data/casting.json

# A project with no coverage report answers with an error envelope; saving that
# as the fixture would commit the error as the data.
cov_tmp="$(mktemp)"
khaosd_curl "/api/coverage/report?projectPath=$ENC" > "$cov_tmp" || true
if jq -e 'has("error") | not' "$cov_tmp" >/dev/null 2>&1; then
  jq '{_provenance: "khaosd GET /api/coverage/report — the coverage report. sourcePath is the API'"'"'s own field and keeps whatever path it returned."} + .' "$cov_tmp" \
    | write_json src/data/coverage.json
else
  log_info "coverage: $(jq -r '.error.code // "no report"' "$cov_tmp" 2>/dev/null) — keeping the committed capture"
fi
rm -f "$cov_tmp"

# ---- character co-appearance graph (khaosd /api/story/graph) ----
#
# What StoryGraph draws. Nodes are the cast, edges are shared scenes with a
# weight — measured co-appearance, not the analysed relationships that
# RelationshipGraph shows.
khaosd_curl "/api/story/graph?projectPath=$ENC" | jq --arg p "$PROJECT_NAME" '{
  _provenance: ("khaosd GET /api/story/graph — \($p) — character co-appearance: an edge means the two share scenes, and weight is how many."),
  nodes: (.nodes // []), edges: (.edges // [])
}' | write_json src/data/story-graph.json

log_info "story graph: $(jq '.nodes | length' src/data/story-graph.json) nodes · $(jq '.edges | length' src/data/story-graph.json) edges"

# ---- engine health (khaosd /api/health) ----
#
# The daemon version and its tool table, for the engine plate (EngineDetails). Every
# tool reports a semver as of khaosd 0.6.5 — `git` and `ollama` were
# presence-only before that, which is why the plate's contract distinguishes
# `{name, version}` from `{name, status}`.
#
# Machine-specific fields (pid, port, disk, uptime) are deliberately dropped: they
# would make the committed fixture a snapshot of one laptop.
khaosd_curl /api/health | jq '{
  _provenance: "khaosd GET /api/health — daemon version plus the tool table. Machine-specific fields (pid, port, disk, uptime) are deliberately not captured.",
  daemonVersion: .version,
  tools: [ (.tools // {}) | to_entries[] | { id: .key, available: (.value.available // false), semver: (.value.semver // "") } ]
}' | write_json src/data/engine.json

log_info "engine: khaosd $(jq -r '.daemonVersion' src/data/engine.json) · $(jq -r '.tools | length' src/data/engine.json) tools"

# ---- analysis staleness (khaosd /api/analysis/staleness) ----
#
# Each scene's, character's and place's analysis state, with the engine's reasons
# and details for a stale one. AnalysisStale renders exactly these.
khaosd_curl "/api/analysis/staleness?projectPath=$ENC" | jq --arg p "$PROJECT_NAME" '{
  _provenance: ("khaosd GET /api/analysis/staleness — \($p) — each analysis state, with reasons and details for a stale one."),
  characters: (.characters // []), locations: (.locations // []), scenes: (.scenes // [])
}' | write_json src/data/staleness.json

log_info "staleness: $(jq '[.characters[], .locations[], .scenes[] | select(.state == "stale")] | length' src/data/staleness.json) stale analyses"

# ---- setup path (khaosd /api/v1/settings) ----
#
# Basic or Advanced, what Advanced asks of this Mac, and the two Advanced switches.
# Khaos App words its path choice from these values (onboarding.svelte.ts
# pathChoices), so the Settings and launcher fixtures read them rather than
# restating them. The captured path is whatever this machine is on; the fixtures
# show every state regardless.
khaosd_curl /api/v1/settings | jq '(.data // .) as $s | {
  _provenance: "khaosd GET /api/v1/settings — the setup block (offered and suggested paths, the path in effect, what Advanced needs, the Advanced switches) and each provider sign-in disclosure, verbatim.",
  setup: $s.setup,
  disclosures: [ ($s.providers // [])[] | select((.disclosure // "") != "") | { providerId: .id, title: (.title // .name // .id), text: .disclosure } ]
}' | write_json src/data/setup.json

log_info "setup: path $(jq -r '.setup.path' src/data/setup.json) · offered $(jq -r '.setup.offered | join(", ")' src/data/setup.json)"

# ---- composition timeline (khaosd /api/dashboard/composition) ----
#
# StoryPlayer's segments. Written ONLY when the daemon actually returns some:
# on 2026-08-16 every project on the daemon returned `{"segments":[]}` — the
# compositions had not been built — and a blind overwrite would have replaced
# the real capture in src/data/composition.json with an empty array. The
# committed file is a real khaosd capture; losing it to a no-op fetch would
# leave the catalog with nothing to render and no way to tell why.
comp_tmp="$(mktemp)"
if khaosd_curl "/api/dashboard/composition?projectPath=$ENC" > "$comp_tmp" \
   && [ "$(jq '(.segments // []) | length' "$comp_tmp")" -gt 0 ]; then
  jq --arg p "khaosd GET /api/dashboard/composition — $PROJECT_NAME" \
     '{_provenance: $p, segments: (.segments // [])}' "$comp_tmp" | write_json src/data/composition.json
  log_info "composition: $(jq '.segments | length' src/data/composition.json) segments"
else
  log_info "composition: none built for this project — keeping the committed capture"
fi
rm -f "$comp_tmp"

# ---- per-entity analyses (khaosd /api/dashboard/detail) ----
detail() { khaosd_curl "/api/dashboard/detail?projectPath=$ENC&section=$1&id=$2"; }

# The engine's analysis model (Stage 2) is `story` + `casting` for a character,
# `title`/`summary`/`narrative`/`speaking_characters` for a scene, and `story` +
# `setting` for a location. Each kit field below is filled only where the engine
# serves the same fact; a field with no counterpart stays empty — a gap, reported,
# never filled in from a neighbouring fact.

# character analyses (keyed by name)
jq -r '.[] | [.id, .name] | @tsv' src/data/characters.json | while IFS=$'\t' read -r cid cname; do
  detail characters "$cid" | jq -rc --arg name "$cname" "$JQ_TITLE_CASE
    (.analysis.story // {}) as \$s | (.analysis.casting.demographics // {}) as \$d
    | { name: \$name,
        summary: (\$s.summary // \"\"),
        traits: [],
        goals: ([\$s.want.goal // empty] | map(select(. != \"\"))),
        relationships: [ (\$s.relationships // [])[] | { characterName: ((.name // \"\") | title_case), type: (.nature // \"\") } ],
        profile: { background: \"\", stakes: \"\", contradictions: \"\", strengths: [], vulnerabilities: [] },
        arcDetail: { beginning: (\$s.arc.start.state // \"\"), emotionalJourney: ([(\$s.arc.turns // [])[].change] | join(\" \")), endState: (\$s.arc.end.state // \"\"), quality: (\$s.arc.shape // \"\") },
        thematic: { themes: [], role: \"\" },
        narrative: { role: (\$s.role.weight // \"\"), importance: \"\", plotFunction: (\$s.role.function // \"\") },
        dialogue: { voice: \"\", function: \"\" },
        demographics: { gender: (\$d.gender.value // \"\"), ageRange: (\$d.age.value // \"\"), genderConfidence: (\$d.gender.basis // \"\"), ageConfidence: (\$d.age.basis // \"\") } }"
done | jq -s 'map({key: .name, value: .}) | from_entries' | write_json src/data/character-analyses.json

# ---- the Characters destination, in khaosd's own shapes (catalog app-coverage plan, T2) ----
#
# Khaos App's Characters table, detail and inspector take these records as the engine serves
# them, so they are kept whole rather than mapped: every character row from
# /api/v1/dashboard/characters, and for one character (Madison, who has the most pending ties)
# the analysis on her detail, her recordings and her mentions, from the routes the app's
# adapter calls (src/adapters/khaosd/client.ts). Each answer lands in a file first, so a
# failed fetch stops the script rather than writing a partial capture.
cd_dir="$(mktemp -d)"
khaosd_curl "/api/v1/dashboard/characters?projectPath=$ENC" > "$cd_dir/rows.json"
FOCUS_ID="$(jq -r '[.data[] | select((.name | ascii_downcase) == "madison")][0].id // empty' "$cd_dir/rows.json")"
[ -n "$FOCUS_ID" ] || { log_err "characters: Madison is not in $PROJECT_NAME"; exit 1; }
FOCUS_ENC="$(jq -rn --arg p "$FOCUS_ID" '$p | @uri')"
detail characters "$FOCUS_ID" > "$cd_dir/detail.json"
khaosd_curl "/api/v1/audio/assets?projectPath=$ENC&characterId=$FOCUS_ENC" > "$cd_dir/audio.json"
khaosd_curl "/api/v1/dashboard/character-mentions?projectPath=$ENC&id=$FOCUS_ENC" > "$cd_dir/mentions.json"
jq -n --arg p "$PROJECT_NAME" --arg focus "$FOCUS_ID" \
  --slurpfile rows "$cd_dir/rows.json" --slurpfile detail "$cd_dir/detail.json" \
  --slurpfile audio "$cd_dir/audio.json" --slurpfile mentions "$cd_dir/mentions.json" '{
  _provenance: ("khaosd GET /api/v1/dashboard/characters, and for one character /api/dashboard/detail (.analysis, .graph_context), /api/v1/audio/assets?characterId and /api/v1/dashboard/character-mentions — \($p) — verbatim."),
  characters: ($rows[0].data // []),
  focus: { id: $focus, analysis: $detail[0].analysis, graphContext: $detail[0].graph_context, recordings: (($audio[0].data // $audio[0]).recordings // []), mentions: (($mentions[0].data // $mentions[0]).mentions // []) }
}' | write_json src/data/characters-destination.json
rm -rf "$cd_dir"
log_info "characters destination: $(jq '.characters | length' src/data/characters-destination.json) rows · focus $(jq '.focus.recordings | length' src/data/characters-destination.json) recordings, $(jq '.focus.mentions | length' src/data/characters-destination.json) wordings"

# ---- the Scenes destination, in khaosd's own shapes (catalog app-coverage plan, T3) ----
#
# Every scene row from /api/v1/dashboard/scenes, less `content`: the scene's raw text, which the
# Scenes views read from their own route and which would make this file 150 KB. The place and
# object rows, so a scene's accounts name what it holds. For one scene (the first, "Eviction
# Notice", whose read scene-read.json holds) the analysis on its detail.
sd_dir="$(mktemp -d)"
khaosd_curl "/api/v1/dashboard/scenes?projectPath=$ENC" > "$sd_dir/scenes.json"
khaosd_curl "/api/v1/dashboard/locations?projectPath=$ENC" > "$sd_dir/locations.json"
khaosd_curl "/api/v1/dashboard/objects?projectPath=$ENC" > "$sd_dir/objects.json"
SCENE_ID="$(jq -r '[(.data // .)[] | select(.index == 0)][0].id // empty' "$sd_dir/scenes.json")"
[ -n "$SCENE_ID" ] || { log_err "scenes: $PROJECT_NAME has no first scene"; exit 1; }
detail scenes "$SCENE_ID" > "$sd_dir/detail.json"
jq -n --arg p "$PROJECT_NAME" --arg focus "$SCENE_ID" \
  --slurpfile scenes "$sd_dir/scenes.json" --slurpfile locations "$sd_dir/locations.json" \
  --slurpfile objects "$sd_dir/objects.json" --slurpfile detail "$sd_dir/detail.json" '{
  _provenance: ("khaosd GET /api/v1/dashboard/scenes (less the content field of each row), /api/v1/dashboard/locations, /api/v1/dashboard/objects, and for the first scene /api/dashboard/detail (.analysis) — \($p) — verbatim."),
  scenes: [ ($scenes[0].data // $scenes[0])[] | del(.content) ],
  locations: ($locations[0].data // $locations[0]),
  objects: ($objects[0].data // $objects[0]),
  focus: { id: $focus, analysis: $detail[0].analysis }
}' | write_json src/data/scenes-destination.json
rm -rf "$sd_dir"
log_info "scenes destination: $(jq '.scenes | length' src/data/scenes-destination.json) scenes, $(jq '.locations | length' src/data/scenes-destination.json) places, $(jq '.objects | length' src/data/scenes-destination.json) objects · focus analysed: $(jq '.focus.analysis != null' src/data/scenes-destination.json)"

# ---- the Places destination, in khaosd's own shapes (catalog app-coverage plan, T4) ----
#
# The place and object rows are scenes-destination.json's. For the place with the most scenes
# (Desmond's Apartment on Broken in 4 Places) the analysis and graph context on its detail, and
# the project's headings and their decisions from /api/v1/locations/headings, the route the
# app's Headings view reads.
pd_dir="$(mktemp -d)"
PLACE_ID="$(jq -r '[.locations | sort_by(-(.scene_count // 0)) | .[0].id][0] // empty' src/data/scenes-destination.json)"
[ -n "$PLACE_ID" ] || { log_err "places: $PROJECT_NAME has no place"; exit 1; }
detail locations "$PLACE_ID" > "$pd_dir/detail.json"
khaosd_curl "/api/v1/locations/headings?projectPath=$ENC" > "$pd_dir/headings.json"
jq -n --arg p "$PROJECT_NAME" --arg focus "$PLACE_ID" \
  --slurpfile detail "$pd_dir/detail.json" --slurpfile headings "$pd_dir/headings.json" '{
  _provenance: ("khaosd GET /api/dashboard/detail (.analysis, .graph_context) for the place with the most scenes, and /api/v1/locations/headings — \($p) — verbatim."),
  focus: { id: $focus, analysis: $detail[0].analysis, graphContext: $detail[0].graph_context },
  headings: ($headings[0].data // $headings[0])
}' | write_json src/data/places-destination.json
rm -rf "$pd_dir"

# ---- a place's states and design areas, from the place builder ----
#
# Read from b4p.kspd, not $PROJECT: the builder refuses the catalog's default package
# (PLACE_BUILDER_FAILED), and b4p is the package with place states. DESMOND'S APARTMENT has four
# states and six areas.
STATES_PROJECT="${KSPD_STATES_PROJECT:-$HOME/khaos/projects/b4p.kspd}"
STATES_PLACE="${KSPD_STATES_PLACE:-location_01M5MJB4BPSTAAFR77ADHVD4SF}"
khaosd_curl "/api/v1/locations/builder?path=$(jq -rn --arg p "$STATES_PROJECT" '$p | @uri')&locationId=$STATES_PLACE" \
  | jq --arg p "$(basename "$STATES_PROJECT" .kspd | tr '[:lower:]' '[:upper:]')" '.data | {
  _provenance: ("khaosd GET /api/v1/locations/builder — \($p) — the place name, its states, the default state, and the preparation areas and evidence, verbatim."),
  name, state, states, preparation: { areas: .preparation.areas, evidence: .preparation.evidence }
}' | write_json src/data/place-builder-states.json
log_info "place states: $(jq '.states | length' src/data/place-builder-states.json) states, $(jq '.preparation.areas | length' src/data/place-builder-states.json) areas"

# ---- story-wide analyses (khaos.machine docs/designs/2026-10-24-stage3-analysis-display.md, item 4) ----
#
# Read from b4p.kspd, the package with all three: premise, structure (named turns) and coverage.
# Only the fields the Overview reads are kept: structure without `profile` (its unnamed rows are
# never drawn), coverage without `scenes` (it repeats the Stage 2 scene analysis) and without
# `sourcePath` (a machine path).
so_dir="$(mktemp -d)"
SO_ENC="$(jq -rn --arg p "$STATES_PROJECT" '$p | @uri')"
for r in premise structure coverage/status coverage/report story-analysis/preflight; do
  khaosd_curl "/api/v1/$r?projectPath=$SO_ENC" | jq '.data' > "$so_dir/${r/\//-}.json"
done
jq -n --arg p "$(basename "$STATES_PROJECT" .kspd | tr '[:lower:]' '[:upper:]')" \
  --slurpfile premise "$so_dir/premise.json" --slurpfile structure "$so_dir/structure.json" \
  --slurpfile status "$so_dir/coverage-status.json" --slurpfile report "$so_dir/coverage-report.json" \
  --slurpfile preflight "$so_dir/story-analysis-preflight.json" '{
  _provenance: ("khaosd GET /api/v1/premise, /structure (less profile), /coverage/status, /coverage/report (less scenes and sourcePath) and /story-analysis/preflight — \($p) — verbatim."),
  premise: $premise[0],
  structure: ($structure[0] | del(.profile)),
  "coverage/status": $status[0],
  "coverage/report": ($report[0] | del(.scenes, .sourcePath)),
  "story-analysis/preflight": $preflight[0]
}' | write_json src/data/story-overview.json
rm -rf "$so_dir"
log_info "story overview: $(jq '.structure.names.points | length' src/data/story-overview.json) named turns, coverage $(jq -r '."coverage/status".generatedAt' src/data/story-overview.json)"

# ---- readings readiness (khaos.machine docs/designs/2026-10-24-stage3-analysis-display.md, item 3) ----
#
# Read from b4p.kspd. The route writes nothing, but it checks every scene's voices, so it is slow
# (78.3 s measured, 2026-10-24); curl waits for it.
khaosd_curl "/api/v1/readings/readiness?projectPath=$(jq -rn --arg p "$STATES_PROJECT" '$p | @uri')" \
  | jq --arg p "$(basename "$STATES_PROJECT" .kspd | tr '[:lower:]' '[:upper:]')" '.data | {
  _provenance: ("khaosd GET /api/v1/readings/readiness — \($p) — every scene, the totals and the voices, verbatim."),
  scenes, totals, voices
}' | write_json src/data/reading-readiness.json
log_info "readings readiness: $(jq '.totals.ready' src/data/reading-readiness.json) of $(jq '.totals.scenes' src/data/reading-readiness.json) scenes ready, $(jq '.voices | length' src/data/reading-readiness.json) voices"

# ---- the story budget (khaos.machine docs/designs/2026-10-24-stage3-analysis-display.md, the
# global budget display) ----
#
# Read from b4p.kspd. Verbatim: the limits, what is spent, and whatever else the engine serves
# (remaining and unguarded, once served).
khaosd_curl "/api/v1/projects/budget?projectPath=$(jq -rn --arg p "$STATES_PROJECT" '$p | @uri')" \
  | jq --arg p "$(basename "$STATES_PROJECT" .kspd | tr '[:lower:]' '[:upper:]')" '{
  _provenance: ("khaosd GET /api/v1/projects/budget — \($p) — the story budget, verbatim.")
} + .data' | write_json src/data/project-budget.json
log_info "story budget: text $(jq '.spent.textCalls' src/data/project-budget.json) of $(jq '.limits.textCalls' src/data/project-budget.json) calls, $(jq '.spent.usdUnreported // 0' src/data/project-budget.json) calls without a cost"
log_info "places destination: focus analysed: $(jq '.focus.analysis != null' src/data/places-destination.json) · $(jq '.headings.occurrences | length' src/data/places-destination.json) headings, $(jq '.headings.decisions | length' src/data/places-destination.json) decisions"

# ---- the Images and Audio destinations (catalog app-coverage plan, T5) ----
#
# The project's images run to 183 KB and its recordings to 424 KB, so a slice of each is kept,
# chosen by what the other destinations already show rather than by what looks best:
# - the images of Madison, the place with the most scenes and the largest object group, from
#   /api/v1/visual/assets. Khaos App's adapter checks a generated image's recipe and groups each
#   id with its revision (profile, style, template); the same grouping is done here, and it is
#   the only change to what khaosd sent.
# - every recording placed in the first scene, from /api/v1/audio/assets, with the project's
#   refused takes, and the waveform peaks of its first line take.
ia_dir="$(mktemp -d)"
khaosd_curl "/api/v1/visual/assets?projectPath=$ENC" > "$ia_dir/visual.json"
khaosd_curl "/api/v1/audio/assets?projectPath=$ENC" > "$ia_dir/audio.json"
SUBJECT_IDS="$(jq -c --slurpfile c src/data/characters-destination.json --slurpfile p src/data/places-destination.json --slurpfile s src/data/scenes-destination.json \
  '[$c[0].focus.id, $p[0].focus.id, ([$s[0].objects[] | select(.identityKind == "group")] | max_by(.members | length) | .id)]' -n)"
FIRST_SCENE="$(jq -r '.scenes[] | select(.index == 0) | .id' src/data/scenes-destination.json)"
PEAKS_PATH="$(jq -r --arg s "$FIRST_SCENE" '[(.data // .).recordings[] | select(.scene.id == $s and .kind == "line")][0].peaks // empty' "$ia_dir/audio.json")"
[ -n "$PEAKS_PATH" ] || { log_err "audio: the first scene of $PROJECT_NAME has no line take"; exit 1; }
khaosd_curl "$PEAKS_PATH" > "$ia_dir/peaks.json"
jq -n --arg p "$PROJECT_NAME" --arg scene "$FIRST_SCENE" --argjson ids "$SUBJECT_IDS" \
  --slurpfile visual "$ia_dir/visual.json" --slurpfile audio "$ia_dir/audio.json" --slurpfile peaks "$ia_dir/peaks.json" '
  def recipe($id; $rev): if $id then { id: $id, revision: $rev } else null end;
  ($audio[0].data // $audio[0]) as $a
  | [$a.recordings[] | select(.scene.id == $scene)] as $sceneRecordings
  | {
  _provenance: ("khaosd GET /api/v1/visual/assets (three subjects, a generated recipe grouped as the app adapter groups it), /api/v1/audio/assets (the first scene, and every refused take) and one line take peaks — \($p)."),
  subjects: [ ($visual[0].data // $visual[0]).subjects[] | select(.subject.id as $id | $ids | index($id)) | .references |= map(
    if .provenance then .provenance |= ({ generationId, providerId, modelId, promptDigest, inputDigests }
      + (if .modelRevision then { modelRevision } else {} end)
      + ({ profile: recipe(.profileId; .profileRevision), style: recipe(.styleId; .styleRevision), template: recipe(.templateId; .templateRevision) } | with_entries(select(.value != null))))
    else . end) ],
  recordings: $sceneRecordings,
  refused: ($a.refused // []),
  peaks: { recordingId: ([$sceneRecordings[] | select(.kind == "line")][0].id), value: $peaks[0] }
}' | write_json src/data/images-audio-destination.json
rm -rf "$ia_dir"
log_info "images and audio: $(jq '[.subjects[].references[]] | length' src/data/images-audio-destination.json) images of $(jq '.subjects | length' src/data/images-audio-destination.json) subjects · $(jq '.recordings | length' src/data/images-audio-destination.json) recordings, $(jq '.refused | length' src/data/images-audio-destination.json) refused · peaks $(jq '.peaks.value.length // 0' src/data/images-audio-destination.json) columns"

# ---- the Review destination (catalog app-coverage plan, T6) ----
#
# The pending queue runs to 1.3 MB, so a slice is kept, chosen to show grouping: per kind, the
# largest group of identical mentions (one surface form, ignoring case and spacing, as Khaos App
# groups them), the largest mention of a person, the first relation with both endpoints settled
# and the first with an endpoint KSPD offers a link for. Their relation offers, classifications
# and scene-analysis suggestions come with them, from /api/v1/dashboard/pending-extraction
# and pending-suggestions.
rv_dir="$(mktemp -d)"
khaosd_curl "/api/v1/dashboard/pending-extraction?projectPath=$ENC" > "$rv_dir/pending.json"
khaosd_curl "/api/v1/dashboard/pending-suggestions?projectPath=$ENC" > "$rv_dir/suggestions.json"
jq -n --arg p "$PROJECT_NAME" --slurpfile pending "$rv_dir/pending.json" --slurpfile suggestions "$rv_dir/suggestions.json" '
  def key: ascii_downcase | gsub("^\\s+|\\s+$"; "") | gsub("\\s+"; " ");
  def largest(f): if length == 0 then [] else group_by(f | key) | max_by(length) end;
  ($pending[0].data // $pending[0]) as $q
  | ([$q.relations[] | select(.fromId and .toId)][0:1] + [$q.relations[] | select((.fromId and .toId | not) and (.id as $i | $q.relationEndpoints | any(.candidateId == $i)))][0:1]) as $relations
  | {
      entityAppearances: ($q.entityAppearances | largest(.entityKind + "|" + .name)),
      objectAppearances: ($q.objectAppearances | largest(.displayNoun)),
      locationAppearances: ($q.locationAppearances | largest(.proposedDisplayName // .sourcePhrase)),
      references: (($q.references | largest(.referentKind + "|" + .name)) + ([$q.references[] | select(.referentKind == "entity")] | largest(.name)) | unique_by(.id) | sort_by(.lineNumber)),
      relations: $relations,
      relationEndpoints: [$q.relationEndpoints[] | select(.candidateId as $c | $relations | map(.id) | index($c))]
    } as $slice
  | $slice + { entityClassifications: [$q.entityClassifications[] | select(.appearanceId as $a | $slice.entityAppearances | map(.id) | index($a))] }
  | . as $kept
  | ([$kept.entityAppearances, $kept.objectAppearances, $kept.locationAppearances, $kept.references, $kept.relations | .[].id]) as $ids
  | {
      _provenance: ("khaosd GET /api/v1/dashboard/pending-extraction (per kind the largest group of identical mentions, the largest mention of a person, two relations) and pending-suggestions for them — \($p)."),
      pending: $kept,
      suggestions: [($suggestions[0].data // $suggestions[0]).suggestions[] | select(.recordId as $r | $ids | index($r))]
    }' | write_json src/data/review-destination.json
rm -rf "$rv_dir"
log_info "review destination: $(jq '[.pending | .entityAppearances, .objectAppearances, .locationAppearances, .references, .relations | length] | add' src/data/review-destination.json) records · $(jq '.suggestions | length' src/data/review-destination.json) suggestions"

# ---- the Story Atlas (catalog app-coverage plan, T7) ----
#
# khaosd's Story Atlas v1 from /api/v1/story/atlas, whole but for what the atlas never reads: the
# story snapshot it carries beside the graph, and each scene node's full text (`raw.content`),
# repeated in every neighborhood. Together they are about three quarters of the 1.6 MB response.
khaosd_curl "/api/v1/story/atlas?projectPath=$ENC" | jq --arg p "$PROJECT_NAME" '
  (.data // .) | del(.snapshot, .snapshotCache)
  | walk(if type == "object" and has("raw") then .raw |= del(.content) else . end)
  | { _provenance: ("khaosd GET /api/v1/story/atlas, less the snapshot and each scene node raw.content — \($p).") } + .' | write_json src/data/story-atlas.json
log_info "story atlas: $(jq '.lenses.all.nodes | length' src/data/story-atlas.json) nodes, $(jq '.lenses.all.edges | length' src/data/story-atlas.json) edges, $(jq '.neighborhoods | length' src/data/story-atlas.json) neighborhoods, $(jq '.locationGroups | length' src/data/story-atlas.json) location groups"

# ---- the story player (catalog app-coverage plan, T7) ----
#
# khaosd's playback snapshot from /api/v1/dashboard/playback, every segment, but with the events
# and source text of the first two scenes only: the navigator lists them all, the stage and the
# timeline show the opening. The whole snapshot is 0.7 MB, almost all of it the other scenes'
# events.
khaosd_curl "/api/v1/dashboard/playback?projectPath=$ENC" | jq --arg p "$PROJECT_NAME" '
  (.data // .) | del(.snapshotCache)
  | .segments |= (to_entries | map(if .key < 2 then .value else .value | .events = [] | .sourceEvents = [] end))
  | { _provenance: ("khaosd GET /api/v1/dashboard/playback, every segment, events and source text for the first two only — \($p).") } + .' | write_json src/data/story-playback.json
log_info "story playback: $(jq '.segments | length' src/data/story-playback.json) segments, $(jq '.readyScenes' src/data/story-playback.json) ready, $(jq '[.segments[0:2][].events | length] | add' src/data/story-playback.json) events kept"

# ---- the app windows (catalog app-coverage plan, T9) ----
#
# The model inventory (/api/v1/models), decoded as Khaos App's adapter decodes it (camelCase,
# download and its error only when present), each location as khaosd reports it. And what
# this project's activity and history routes answer, kept whole: on a Basic install the history
# is FEATURE_OFF, and a project with no committed v3 story has no activity.
aw_dir="$(mktemp -d)"
khaosd_curl "/api/v1/models" > "$aw_dir/models.json"
khaosd_curl "/api/v1/projects/kspd-events?path=$ENC&offset=0&limit=200" > "$aw_dir/activity.json" || true
khaosd_curl "/api/v1/git/status?project_path=$ENC" > "$aw_dir/history.json" || true
jq -n --arg p "$PROJECT_NAME" --slurpfile models "$aw_dir/models.json" --slurpfile activity "$aw_dir/activity.json" --slurpfile history "$aw_dir/history.json" '{
  _provenance: ("khaosd GET /api/v1/models (decoded as Khaos App decodes it), and this project'"'"'s kspd-events and git/status answers — \($p)."),
  models: [($models[0].data // $models[0]).models[] | {
    id, name: (if (.name // "") == "" then .id else .name end), kind: (.kind // ""), service: (.service // ""), enables: (.enables // ""),
    repo: (.repo // ""), revision: (.revision // ""), installed: (.installed == true), sizeBytes: (.size_bytes // 0),
    location: (.location // "")
  } + (if (.download // "") != "" then { download } else {} end) + (if (.download_error // "") != "" then { downloadError: .download_error } else {} end)],
  activity: $activity[0],
  history: $history[0]
}' | write_json src/data/app-windows.json
rm -rf "$aw_dir"
log_info "app windows: $(jq '.models | length' src/data/app-windows.json) models · activity $(jq -r '.activity.error.code // "read"' src/data/app-windows.json) · history $(jq -r '.history.error.code // "read"' src/data/app-windows.json)"

# scene analyses (keyed by scene id). turningPoint is null: the engine no longer
# serves it, and false would claim a scene is not one.
jq -r '.[].id' src/data/scenes.json | while read -r sid; do
  detail scenes "$sid" | jq -rc --arg sid "$sid" "$JQ_TITLE_CASE
    (.analysis // {}) as \$a | (\$a.narrative // {}) as \$n
    | { key: \$sid, value: {
          title: (\$a.title // \"\"),
          summary: (\$a.summary // \"\"),
          mood: (\$n.emotional_tone // \"\"),
          pacing: (\$a.pacing // \"\"),
          turningPoint: null,
          narrative: { storyRole: (\$n.story_role // \"\"), stakes: \"\", plotBeats: (\$n.plot_beats // []), themes: (\$n.themes // []) },
          structure: { type: \"\", pacing: \"\", components: [], estimatedRuntimeMinutes: null },
          evaluation: { strengths: [], developmentAreas: [] },
          characters: { speaking: [ (\$a.speaking_characters // [])[] | { emotional_state: (.emotional_state // \"\"), goal: (.goal // \"\"), name: ((.name // \"\") | title_case) } ] } } }"
done | jq -s 'from_entries' | write_json src/data/scene-analyses.json

# location analyses (keyed by name)
jq -r '.[] | [.id, .name] | @tsv' src/data/locations.json | while IFS=$'\t' read -r lid lname; do
  detail locations "$lid" | jq -rc --arg name "$lname" "
    (.analysis.story // {}) as \$s | (.analysis.setting // {}) as \$g
    | { key: \$name, value: { name: \$name, summary: (\$s.summary // \"\"), mood: \"\", traits: [ (\$g.stated // [])[].detail ],
        narrativeRole: { function: (\$s.role.function // \"\"), storyRole: (\$s.role.weight // \"\"), plotAnchors: [ (\$s.events // [])[].what ] },
        thematicImportance: { thematicRole: \"\", themesEmbodied: [], symbolicElements: [] },
        continuity: { progressionPattern: (if (\$s.change.kind // \"none\") == \"none\" then \"\" else (\$s.change.what // \"\") end), revisitFrequency: \"\", environmentalChanges: (\$g.changes // []), timeOfDayDistribution: {} },
        occupants: [],
        cast: { convergence: \"\", powerDynamics: \"\", relationshipTypes: \"\" } } }"
done | jq -s 'from_entries' | write_json src/data/location-analyses.json

# ---- fill scene titles from the scene analyses (keyed by scene id) ----
jq --slurpfile sa src/data/scene-analyses.json 'map(.title = ($sa[0][.id].title // ""))' src/data/scenes.json > /tmp/kui-scenes2.json && mv /tmp/kui-scenes2.json src/data/scenes.json

rm -f /tmp/kui-scenefields.json

log_info "wrote characters $(jq length src/data/characters.json) · scenes $(jq length src/data/scenes.json) · locations $(jq length src/data/locations.json) · dialogues $(jq length src/data/dialogues.json) · char-analyses $(jq length src/data/character-analyses.json) · scene-analyses $(jq length src/data/scene-analyses.json) · loc-analyses $(jq length src/data/location-analyses.json) · casting $(jq length src/data/casting.json)"
