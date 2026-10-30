#!/usr/bin/env bash
#
# Catalog coverage — every component the library exports must be playable in
# the catalog.
#
# WHY: Storybook had a coverage gate and the catalog did not, so the catalog
# drifted while `check-stories` reported 37/37. Nine components shipped between
# 2026-08-14 and 08-16 — Icon, LabeledField, Portrait, ProviderBadge,
# FilterField, SceneRow, DialogueRow, RelationshipGraph and StoryPlayer — and
# none of them reached `apps/catalog/src/fixtures.js`. Nothing was red. This is
# the check that would have been.
#
# Storybook has since been retired (D61) and the catalog is the library's only
# component surface, which makes this gate the whole story rather than half of
# it: the catalog is where a component is exercised on a real device against
# real data, and an export absent from it cannot be playtested at all.
#
# Exit 0 = every export has a fixture. Exit 1 = at least one does not.
# Exit 2 = the check could not run (a missing input is never a pass).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDEX="$ROOT/components/svelte/index.js"
FIXTURES="$ROOT/apps/catalog/src/fixtures.js"

[ -f "$INDEX" ] || { echo "CANNOT RUN: no $INDEX" >&2; exit 2; }
[ -f "$FIXTURES" ] || { echo "CANNOT RUN: no $FIXTURES" >&2; exit 2; }

# COMMENTS ARE STRIPPED FROM BOTH SIDES, before anything is matched. Every
# match below greps source as TEXT, so a line inside a comment counts as real
# code unless it is removed first. The strip used to run on fixtures.js only,
# and only for `plays:` — so the argument at (1) below was true of that
# one match and false of every other in this file. Measured both ways
# (khaos.machine#256): commenting out the entire barrel still reported full
# coverage and exit 0, while a fake export written inside a `//` comment was
# the one thing that could redden the gate.
strip_comments() {
  sed -E 's|//.*$||' "$1" | perl -0pe 's{/\*.*?\*/}{}gs'
}

index_code="$(strip_comments "$INDEX")"
fixtures_code="$(strip_comments "$FIXTURES")"

# `|| true` on each extraction is load-bearing, not defensive. `set -euo
# pipefail` (:21) plus `X="$(grep … )"` kills the script the instant a grep
# matches nothing — which is exactly the condition the CANNOT RUN guards below
# exist to report. Without it those guards were unreachable for their own
# stated cause: a barrel whose shape had changed exited 1 with an EMPTY log,
# indistinguishable from a genuine coverage gap, and took check-taxonomy,
# check-consumer and check-compile down with it (they run in one `&&` chain,
# package.json:14, on every PR and before every signed release). The contract
# at :19 says a missing input is never a pass; this is what makes that true.

# The barrel is the API surface: `export { default as Name } from './Name.svelte'`
exported="$(printf '%s' "$index_code" | grep -oE 'export \{ *default as +[A-Za-z0-9_]+ *\}' | sed -E 's/.*default as +([A-Za-z0-9_]+).*/\1/' | sort -u || true)"
[ -n "$exported" ] || { echo "CANNOT RUN: parsed zero exports from $INDEX — the barrel's shape may have changed" >&2; exit 2; }

# A fixture registers its component as `component: Name`. Matching on the
# registry entry rather than the import means an import left behind by a
# deleted fixture does not read as coverage.
registered="$(printf '%s' "$fixtures_code" | grep -oE 'component: *[A-Za-z0-9_]+' | sed -E 's/component: *//' | sort -u || true)"
# Guarded HERE, on the raw parse, and not after `plays:` has been folded in.
# Merging first let a single surviving `plays:` entry keep this non-empty while
# every `component:` had stopped matching — the registry was unparseable and
# the gate called it a 48-component coverage gap, a confident wrong number
# where the contract at :19 promises exit 2. Found by mutating `component:`
# rather than `plays:`; khaos.machine#256 mutated the latter and this survived.
[ -n "$registered" ] || { echo "CANNOT RUN: parsed zero fixtures from $FIXTURES — the registry's shape may have changed" >&2; exit 2; }

# ...and a fixture whose component is a catalog-side VIEW of one or more exports
# names them with `plays: ['Name', ...]`. The icon sheet is the case: Icon has a
# single variable, so one page per glyph answers the wrong question — the
# fixture renders a sheet of every name instead, and Icon is exercised far more
# thoroughly than the two-example page it replaced.
#
# This is a declaration, not a loophole: the exports listed must genuinely be
# rendered by the fixture, and naming them is more work than registering the
# component directly. Without it the only way to keep this gate green would be
# to keep a second, worse fixture alive purely to satisfy a grep.
# A declaration has to be checkable or it is a loophole with a comment on it.
# Two things make it one:
#
#   1. COMMENTS ARE STRIPPED FIRST. This greps the registry as text, so before
#      the strip a `plays: ['Thing']` sitting inside a comment counted as
#      coverage — delete a component from the catalog, mention it in prose, and
#      the gate reports 46/46 while nothing renders it. That is the exact rot
#      this gate exists to catch: check-stories was green at 37/37 while nine
#      components had never reached the registry.
#   2. THE NAME MUST ALSO BE IMPORTED. A fixture cannot render an export it
#      never imported, so an entry naming one is claiming something the file
#      cannot do. Cheap to check, and it makes a false claim take deliberate
#      effort rather than a typo.
#
# An empty result here is legitimate — a registry may name no `plays:` at all —
# so this one is NOT guarded below, it simply contributes nothing.
played="$(printf '%s' "$fixtures_code" | grep -oE "plays: \[[^]]*\]" | grep -oE "'[A-Za-z0-9_]+'" | tr -d "'" | sort -u || true)"

for name in $played; do
  # A here-string, NOT a pipe. `grep -q` exits at its first match, which sends
  # SIGPIPE to a `printf` still writing 55KB; printf dies on 141, and `pipefail`
  # (:21) hands the pipeline 141 instead of grep's 0. The gate then reports
  # CANNOT RUN — exit 2, a red — for an import that is present. Measured on
  # clean main: 25 spurious failures in 200 runs with pipefail, 0 without.
  # Filed as #69. Do not "tidy" this back into a pipe.
  grep -qE "^import $name from|[{,] *$name *[,}]" <<<"$fixtures_code" || {
    echo "CANNOT RUN: fixtures.js declares plays: ['$name'] but never imports $name — a fixture cannot render what it did not import" >&2
    exit 2
  }
done

playable="$(printf '%s\n%s\n' "$registered" "$played" | grep -v '^$' | sort -u || true)"

missing="$(comm -23 <(printf '%s\n' "$exported") <(printf '%s\n' "$playable") || true)"

exported_count="$(printf '%s\n' "$exported" | grep -c . || true)"

if [ -z "$missing" ]; then
  echo "catalog coverage: $exported_count/$exported_count exported components playable"
  exit 0
fi

missing_count="$(printf '%s\n' "$missing" | grep -c . || true)"
echo "catalog coverage: $((exported_count - missing_count))/$exported_count — $missing_count exported component(s) have no fixture:" >&2
printf '  %s\n' $missing >&2
echo >&2
echo "Add an entry to apps/catalog/src/fixtures.js with real data (see the registry's own notes)." >&2
exit 1
