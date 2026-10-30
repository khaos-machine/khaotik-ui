#!/usr/bin/env bash
# Self-check for check-issue-refs.mjs.
#
# DETERMINISTIC ON PURPOSE. The first version called the real API and pinned
# cases to #123 and #61 being open — two issues the blocked list names, i.e. the
# two likeliest to close. This runs first in a required check with
# strict: true, so closing #61 would have stopped the whole repository merging,
# and the fix would have been editing this file rather than CURRENT.md. A gate
# that reds on a stale document is the point; a self-check that reds on a
# CORRECT one is a hostage.
#
# The live half is covered by the gate itself running against the real
# CURRENT.md in the next CI step. This proves the PARSING, which is where all
# three review-found fail-opens lived.
set -uo pipefail
GATE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/check-issue-refs.mjs"
work="$(mktemp -d)"; stub="$(mktemp -d)"; trap 'rm -rf "$work" "$stub"' EXIT
fails=0

# Stub `gh`, routing on REPO as well as number. Keying on the number alone let
# `const repo = DEFAULT_REPO` pass every case, so repo routing was untested.
#   khaotik-ui#9001    open        khaotik-ui#9002    closed
#   khaos-manager#9001 open        khaos-manager#9002 closed
#   khaos-manager#9003 unreadable  (a repo-scoped CI token, the real case)
#   anything else      404
cat > "$stub/gh" <<'STUB'
#!/usr/bin/env bash
case "$*" in
  *khaos-manager/issues/9003*) echo "gh: Not Found (HTTP 404)" >&2; exit 1 ;;
  *khaos-manager/issues/9001*) echo '{"state":"open","title":"open in khaos-manager"}' ;;
  *khaos-manager/issues/9002*) echo '{"state":"closed","title":"closed in khaos-manager"}' ;;
  *khaotik-ui/issues/9001*)    echo '{"state":"open","title":"open here"}' ;;
  *khaotik-ui/issues/9002*)    echo '{"state":"closed","title":"closed here"}' ;;
  *) echo "gh: Not Found (HTTP 404)" >&2; exit 1 ;;
esac
STUB
chmod +x "$stub/gh"

run() { # run <name> <expected-exit> <body>
  printf '%s\n' "$3" > "$work/CURRENT.md"
  ( cd "$work" && PATH="$stub:$PATH" node "$GATE" ) >/dev/null 2>&1
  local got=$?
  if [ "$got" -eq "$2" ]; then printf '  ok   %s (exit %s)\n' "$1" "$got"
  else printf '  FAIL %s — expected %s, got %s\n' "$1" "$2" "$got"; fails=$((fails+1)); fi
}

run "closed ref in the section — THE founding case" 1 '## Blocked or blocking
- **#9002 — a closed issue** listed as blocking.'

run "open ref passes" 0 '## Blocked or blocking
- **#9001 — an open issue.**'

# --- the three fail-opens review found in the subject-parsing version ---
run "FAIL-OPEN 1: subject wrapped onto a second line" 1 '## Blocked or blocking
- **#9001 — an open issue** whose text continues and
  then names #9002 on the next line.'

run "FAIL-OPEN 2: #9001/#9002 with no spaces — BOTH checked" 1 '## Blocked or blocking
- **#9001/#9002 — two refs joined by a slash.**'

run "FAIL-OPEN 3: owner/repo-qualified ref is not skipped" 1 '## Blocked or blocking
- **khaos-studio/khaotik-ui#9002 — fully qualified.**'

run "cross-repo repo#N resolves against that repo" 1 '## Blocked or blocking
- **khaos-manager#9002 — a closed issue in another repo.**'

# --- the escape hatch, and the shapes that used to red on correct prose ---
run "allow-closed marker permits a deliberate citation" 0 '<!-- check-issue-refs: allow-closed #9002 -->
## Blocked or blocking
- **#9001 — open.** Its other half was fixed by #9002.'

run "en dash does not change the answer" 1 '## Blocked or blocking
- **#9002 – an en dash, not an em dash.**'

run "nested sub-bullet is still read" 1 '## Blocked or blocking
- **#9001 — open.**
  - a nested note mentioning #9002'

# --- cannot-run paths: never 0 ---
run "section renamed away — must be 2" 2 '## Something Else
- **#9002 — must not be silently skipped.**'

run "unreadable issue — must be 2, never 0" 2 '## Blocked or blocking
- **#7777 — the stub 404s on this.**'

run "section with no refs at all" 0 '## Blocked or blocking
Nothing is blocked today.'

run "a later ## section ends the scan" 0 '## Blocked or blocking
- **#9001 — open.**

## Upstream facts
- #9002 is cited here, outside the section.'

# --- review round 2: the allow-list must not become a blind spot ---
run "allow-listed issue that is OPEN — stale marker, must FAIL" 1 '<!-- check-issue-refs: allow-closed #9001 -->
## Blocked or blocking
- **#9001 — allow-listed but still open.**'

run "allow-listed CLOSED ref in another repo is queried and confirmed" 0 '<!-- check-issue-refs: allow-closed khaos-manager#9002 -->
## Blocked or blocking
- **#9001 — open.** Its upstream half closed as khaos-manager#9002.'

run "marker inside a code fence does NOT exempt" 1 '## Blocked or blocking
- **#9002 — closed and not really allowed.**

```sh
<!-- check-issue-refs: allow-closed #9002 -->
```'

run "cross-repo ref CI cannot read — named gap, exit 1" 1 '## Blocked or blocking
- **khaos-manager#9003 — unreadable from a repo-scoped token.**'

run "cross-repo ref that IS readable and open" 0 '## Blocked or blocking
- **khaos-manager#9001 — open in another repo.**'

run "cross-repo ref that is readable and CLOSED" 1 '## Blocked or blocking
- **khaos-manager#9002 — closed in another repo.**'

# --- review round 3 ---
run "INDENTED fence does not exempt (CURRENT.md's own style)" 1 '## Blocked or blocking
- **#9002 — closed.**

  ```sh
  <!-- check-issue-refs: allow-closed #9002 -->
  ```'

run "~~~ fence does not exempt" 1 '## Blocked or blocking
- **#9002 — closed.**

~~~
<!-- check-issue-refs: allow-closed #9002 -->
~~~'

run "unterminated fence does not swallow later refs" 1 '## Blocked or blocking
- **#9001 — open.**

```
an unterminated fence
- **#9002 — closed, after it.**'

run "inline backticks are NOT treated as a fence" 1 '## Blocked or blocking
- **#9002 — closed**, mentioned with `inline code` around it.'

run "unreadable cross-repo does not MASK a closed same-repo ref" 1 '## Blocked or blocking
- **#9002 — closed here.**
- **khaos-manager#9003 — unreadable.**'

run "a real fence still exempts when at column zero" 0 '<!-- check-issue-refs: allow-closed #9002 -->
## Blocked or blocking
- **#9002 — deliberately cited.**'

[ "$fails" -eq 0 ] && { echo "check-issue-refs.test: all checks passed"; exit 0; }
echo "check-issue-refs.test: $fails failed"; exit 1
