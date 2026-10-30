#!/usr/bin/env bash
# Self-check for write_json. Run it directly: apps/catalog/scripts/write_json_test.sh
#
# The assertion that matters is #2 and #3: the committed fixture is STILL THERE,
# with its original bytes, after the producer failed. That is the whole point of
# the helper, and `> file` fails it.
set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
target="$work/data.json"
original='{"kept":true}'
fails=0

check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then printf '  ok   %s\n' "$1"
  else printf '  FAIL %s\n       expected: %s\n       actual:   %s\n' "$1" "$2" "$3"; fails=$((fails+1)); fi
}

# 1. a good producer replaces the target
printf '%s' "$original" > "$target"
echo '{"new":1}' | write_json "$target"
check "good producer writes" '{"new":1}' "$(cat "$target")"

# 2. a producer that writes NOTHING leaves the target intact
printf '%s' "$original" > "$target"
( true | write_json "$target" ) >/dev/null 2>&1
check "empty producer leaves file intact" "$original" "$(cat "$target")"

# 3. a producer that writes garbage leaves the target intact
printf '%s' "$original" > "$target"
( echo 'not json' | write_json "$target" ) >/dev/null 2>&1
check "invalid JSON leaves file intact" "$original" "$(cat "$target")"

# 4. failure is reported, not swallowed — pipefail must see a non-zero status
printf '%s' "$original" > "$target"
( true | write_json "$target" ) >/dev/null 2>&1
check "failure exits non-zero" "nonzero" "$([ $? -ne 0 ] && echo nonzero || echo zero)"

# 5. no temp files left behind
check "no temp files left" "0" "$(find "$work" -name '.tmp.*' | wc -l | tr -d ' ')"

# 6. the defect itself: plain `>` truncates before the producer runs
printf '%s' "$original" > "$target"
( false > "$target" ) 2>/dev/null || true
check "plain > truncates (the defect)" "" "$(cat "$target")"

[ "$fails" -eq 0 ] && { echo "write_json: all checks passed"; exit 0; }
echo "write_json: $fails check(s) failed"; exit 1
