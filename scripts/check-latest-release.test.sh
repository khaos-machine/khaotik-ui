#!/usr/bin/env bash
# Self-check for check-latest-release.mjs, run against a stubbed `gh`.
#
# It exists because MEMORY.md records a gate in this repository that shipped
# VACUOUS: `check-citations` checked one citation and none in the eight
# documents it was written for, because a path that did not exist counted as
# "skipped" rather than as a gap. A gate that cannot catch its own founding
# case is worse than no gate, since its green is read as evidence.
#
# So case 1 IS the founding case: a lib-* tag holding `latest`.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STUB="$(mktemp -d)"; trap 'rm -rf "$STUB"' EXIT
fails=0

case_() { # case_ <name> <expected-exit> <gh body>
  printf '#!/usr/bin/env bash\n%s\n' "$3" > "$STUB/gh"; chmod +x "$STUB/gh"
  PATH="$STUB:$PATH" node "$ROOT/scripts/check-latest-release.mjs" >/dev/null 2>&1
  local got=$?
  if [ "$got" -eq "$2" ]; then printf '  ok   %s (exit %s)\n' "$1" "$got"
  else printf '  FAIL %s — expected exit %s, got %s\n' "$1" "$2" "$got"; fails=$((fails+1)); fi
}

case_ "lib-* holds latest — THE founding defect" 1 'echo "{\"tag_name\":\"lib-0.20.0\",\"assets\":[]}"'
case_ "v* tag but zero assets"                   1 'echo "{\"tag_name\":\"v9.9.9\",\"assets\":[]}"'
case_ "healthy v* with assets"                   0 'echo "{\"tag_name\":\"v9.9.9\",\"assets\":[{\"name\":\"a.dmg\"},{\"name\":\"a.sha256\"}]}"'
case_ "API read fails — must be 2, never 0"      2 'exit 1'
case_ "API returns no tag_name — must be 2"      2 'echo "{}"'

[ "$fails" -eq 0 ] && { echo "check-latest-release.test: all checks passed"; exit 0; }
echo "check-latest-release.test: $fails failed"; exit 1
