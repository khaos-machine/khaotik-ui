#!/bin/bash
# Tests for signing-keychain-lock.sh.
# IDENTICAL COPY in khaos-app and khaotik-ui (scripts/), beside the script it tests.
# Run: bash scripts/signing-keychain-lock.test.sh
#
# The lock runs for real against a temporary lock directory, with real processes
# as owners. `security` is replaced by a shim over a file, so the user's actual
# keychain search list is never read or written here.

# pass() always succeeds, so `check && pass ... || fail ...` is a true if/else here.
# shellcheck disable=SC2015
set -euo pipefail

SCRIPT="$(cd "$(dirname "$0")" && pwd)/signing-keychain-lock.sh"
PASS=0
FAIL=0
pass() { PASS=$((PASS + 1)); echo "  ✓ $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  ✗ $1"; }

WORK="$(mktemp -d)"
OWNERS=()
cleanup() {
    local p
    for p in ${OWNERS[@]+"${OWNERS[@]}"}; do kill "$p" 2>/dev/null || true; wait "$p" 2>/dev/null || true; done
    rm -rf "$WORK"
}
trap cleanup EXIT

export KHAOS_SIGNING_LOCK="$WORK/lock"
export KHAOS_SIGNING_LOCK_POLL=1

# A live process to stand in for a job's Runner.Worker.
new_owner() { sleep 600 >/dev/null 2>&1 & OWNERS+=("$!"); NEW=$!; }
# Backgrounded acquirers run the script directly, never through as(): $! must be the
# acquirer itself, or killing it orphans the real one.
as() { KHAOS_SIGNING_LOCK_OWNER_PID="$1" bash "$SCRIPT" "${@:2}"; }
owner_pid_on_disk() { head -1 "$KHAOS_SIGNING_LOCK/owner" 2>/dev/null || true; }

# acquire_within SECS OWNER — acquire, but give up after SECS so a lock that is
# never recovered fails the test instead of hanging it.
acquire_within() {
    local secs="$1" owner="$2" pid n=0
    KHAOS_SIGNING_LOCK_OWNER_PID="$owner" bash "$SCRIPT" acquire 2>>"$WORK/acquire.log" &
    pid=$!
    while kill -0 "$pid" 2>/dev/null && [ "$n" -lt "$secs" ]; do sleep 1; n=$((n + 1)); done
    if kill -0 "$pid" 2>/dev/null; then kill "$pid"; wait "$pid" 2>/dev/null || true; return 1; fi
    wait "$pid"
}
# Each case starts from no lock, so one failure cannot cascade into the next.
reset_lock() { rm -rf "$KHAOS_SIGNING_LOCK" "$KHAOS_SIGNING_LOCK.reap"; : > "$WORK/acquire.log"; }

echo "=== signing-keychain-lock.sh ==="

echo ""
echo "--- acquire and release ---"
new_owner; A=$NEW
as "$A" acquire 2>/dev/null
[ "$(owner_pid_on_disk)" = "$A" ] && pass "acquire records the owner" || fail "owner on disk is '$(owner_pid_on_disk)', want $A"
as "$A" acquire 2>/dev/null && pass "re-acquire by the holder returns at once" || fail "re-acquire by the holder failed"

echo ""
echo "--- a second acquirer waits for the holder ---"
new_owner; B=$NEW
KHAOS_SIGNING_LOCK_OWNER_PID="$B" bash "$SCRIPT" acquire 2>"$WORK/b.log" &
WAITER=$!
sleep 3
if kill -0 "$WAITER" 2>/dev/null && [ "$(owner_pid_on_disk)" = "$A" ]; then
    pass "second acquirer still waiting after 3s; holder unchanged"
else
    fail "second acquirer did not wait (owner now '$(owner_pid_on_disk)')"
fi
grep -q "waiting; held by" "$WORK/b.log" && pass "waiter names the holder" || fail "waiter did not report the holder"
as "$B" release 2>"$WORK/r.log"
[ "$(owner_pid_on_disk)" = "$A" ] && grep -q "not releasing" "$WORK/r.log" \
    && pass "a non-holder's release leaves the lock alone" || fail "a non-holder's release removed the lock"
as "$A" release 2>/dev/null
waited=0
while kill -0 "$WAITER" 2>/dev/null && [ "$waited" -lt 10 ]; do sleep 1; waited=$((waited + 1)); done
if ! kill -0 "$WAITER" 2>/dev/null && wait "$WAITER" && [ "$(owner_pid_on_disk)" = "$B" ]; then
    pass "waiter acquires once the holder releases (${waited}s)"
else
    fail "waiter did not acquire after release"
fi
as "$B" release 2>/dev/null
[ ! -e "$KHAOS_SIGNING_LOCK" ] && pass "release removes the lock" || fail "lock still present after release"

echo ""
echo "--- a lock whose owner died is recovered ---"
reset_lock
sleep 0 & DEAD=$!; wait "$DEAD" || true
mkdir "$KHAOS_SIGNING_LOCK"
printf '%s\n%s\n%s\n%s\n' "$DEAD" "Mon Jan  1 00:00:00 2024" "$(date +%s)" "killed job" > "$KHAOS_SIGNING_LOCK/owner"
new_owner; C=$NEW
if acquire_within 5 "$C" && [ "$(owner_pid_on_disk)" = "$C" ] && grep -q "recovering stale lock held by killed job" "$WORK/acquire.log"; then
    pass "dead owner's lock recovered and re-taken"
else
    fail "dead owner's lock not recovered"
fi
as "$C" release 2>/dev/null

echo ""
echo "--- a live pid with a different start time is not the owner ---"
reset_lock
new_owner; D=$NEW
mkdir "$KHAOS_SIGNING_LOCK"
printf '%s\n%s\n%s\n%s\n' "$D" "Mon Jan  1 00:00:00 2024" "$(date +%s)" "reused pid" > "$KHAOS_SIGNING_LOCK/owner"
new_owner; E=$NEW
if acquire_within 5 "$E" && [ "$(owner_pid_on_disk)" = "$E" ]; then
    pass "reused pid treated as a dead owner"
else
    fail "reused pid kept the lock"
fi
as "$E" release 2>/dev/null

echo ""
echo "--- a lock older than the age cap is recovered ---"
reset_lock
new_owner; F=$NEW
mkdir "$KHAOS_SIGNING_LOCK"
printf '%s\n%s\n%s\n%s\n' "$F" "$(ps -o lstart= -p "$F")" "$(( $(date +%s) - 100 ))" "hung job" > "$KHAOS_SIGNING_LOCK/owner"
new_owner; G=$NEW
if KHAOS_SIGNING_LOCK_MAX_AGE=50 acquire_within 5 "$G" && [ "$(owner_pid_on_disk)" = "$G" ]; then
    pass "over-age lock recovered although its owner lives"
else
    fail "over-age lock not recovered"
fi
as "$G" release 2>/dev/null

echo ""
echo "--- a live owner under the age cap is never recovered ---"
reset_lock
new_owner; H=$NEW
as "$H" acquire 2>/dev/null
new_owner; I=$NEW
KHAOS_SIGNING_LOCK_OWNER_PID="$I" bash "$SCRIPT" acquire 2>/dev/null &
W2=$!
sleep 3
kill "$W2" 2>/dev/null || true
wait "$W2" 2>/dev/null || true
[ "$(owner_pid_on_disk)" = "$H" ] && pass "live holder kept the lock" || fail "live holder lost the lock to $(owner_pid_on_disk)"
as "$H" release 2>/dev/null

echo ""
echo "--- search list: add and remove touch only their own keychain ---"
SHIM="$WORK/shim"; mkdir -p "$SHIM"
LIST="$WORK/list"
cat > "$SHIM/security" <<EOF
#!/bin/bash
# list-keychains -d user [-s path...] over a file, in security's output format.
[ "\$1 \$2 \$3" = "list-keychains -d user" ] || exit 2
if [ "\${4:-}" = "-s" ]; then shift 4; : > "$LIST"; for k in "\$@"; do echo "\$k" >> "$LIST"; done
else while IFS= read -r k; do echo "    \"\$k\""; done < "$LIST"; fi
EOF
chmod +x "$SHIM/security"
printf '%s\n' "/Users/u/Library/Keychains/login.keychain-db" "/Users/u/Library/Keychains/other one.keychain-db" > "$LIST"
cp "$LIST" "$WORK/list.orig"
KC="$WORK/run temp/signing.keychain-db"
reset_lock
new_owner; J=$NEW
if PATH="$SHIM:$PATH" as "$J" add "$KC" 2>/dev/null; then
    fail "add succeeded without the lock"
else
    cmp -s "$LIST" "$WORK/list.orig" && pass "add without the lock is refused and changes nothing" || fail "refused add still changed the list"
fi
as "$J" acquire 2>/dev/null
PATH="$SHIM:$PATH" as "$J" add "$KC" 2>/dev/null
{ echo "$KC"; cat "$WORK/list.orig"; } > "$WORK/want"
cmp -s "$LIST" "$WORK/want" && pass "add puts the keychain first and keeps the rest, in order" || fail "add produced: $(cat "$LIST")"
PATH="$SHIM:$PATH" as "$J" add "$KC" 2>/dev/null
cmp -s "$LIST" "$WORK/want" && pass "a second add does not duplicate it" || fail "second add produced: $(cat "$LIST")"
# Another job's keychain arrives while this one holds its own on the list.
printf '%s\n' "/elsewhere/third.keychain-db" >> "$LIST"
PATH="$SHIM:$PATH" as "$J" remove "$KC" 2>/dev/null
{ cat "$WORK/list.orig"; echo "/elsewhere/third.keychain-db"; } > "$WORK/want"
cmp -s "$LIST" "$WORK/want" && pass "remove takes only this keychain off; others stay" || fail "remove produced: $(cat "$LIST")"
as "$J" release 2>/dev/null

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
