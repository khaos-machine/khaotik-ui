#!/bin/bash
# signing-keychain-lock.sh — a machine-wide lock around keychain search-list changes.
#
# IDENTICAL COPY in khaos-app and khaotik-ui, both at scripts/signing-keychain-lock.sh,
# with its test beside it. Change both together. There is no shared place for it:
# cross-repository action access is off for every khaos-studio repo.
#
# WHY. Every khaos-studio runner on the mini runs as one macOS user, so they share one
# keychain search list. Tauri's bundler signs through that list: with
# APPLE_SIGNING_IDENTITY and no APPLE_CERTIFICATE it calls `codesign -s <identity>`
# with no --keychain (tauri-macos-sign 2.3.4, keychain.rs:42-47, 228-232; reached from
# tauri-bundler 2.9.4, bundle/macos/sign.rs:37-40, both pinned by @tauri-apps/cli
# 2.11.4). So the job's keychain must be on the list while `tauri build` runs, and two
# jobs editing the list at once drop each other's keychain mid-sign. GitHub
# concurrency groups are per-repository, so the serialisation has to live on the host.
#
# USAGE
#   signing-keychain-lock.sh acquire          wait for the lock, then take it
#   signing-keychain-lock.sh add <keychain>   put <keychain> first on the search list
#   signing-keychain-lock.sh remove <keychain> take only <keychain> off the list
#   signing-keychain-lock.sh release          drop the lock if this job holds it
# `add` and `remove` refuse unless this job holds the lock. Neither ever sets the list
# to a fixed set: whatever else is on it stays, in order.
#
# OWNERSHIP. The lock outlives the step that takes it, so its owner is the job's
# Runner.Worker process — it lives exactly as long as the job. A lock is stale when
# that process is gone (pid plus start time, so a reused pid does not count as alive)
# or when it is older than KHAOS_SIGNING_LOCK_MAX_AGE seconds. A killed or cancelled
# job therefore cannot wedge every other release.
#
# Environment (all optional):
#   KHAOS_SIGNING_LOCK            lock directory   (default /tmp/khaos-signing-keychain.lock)
#   KHAOS_SIGNING_LOCK_MAX_AGE    stale after N s  (default 7200)
#   KHAOS_SIGNING_LOCK_POLL       wait between tries, s (default 5)
#   KHAOS_SIGNING_LOCK_OWNER_PID  owner process when not under a runner (tests, local)

set -euo pipefail

LOCK="${KHAOS_SIGNING_LOCK:-/tmp/khaos-signing-keychain.lock}"
REAPER="$LOCK.reap"
# ponytail: one fixed age cap. A legitimate holder past it is treated as stale and the
# collision this lock prevents comes back for that run; raise it if releases get slower.
MAX_AGE="${KHAOS_SIGNING_LOCK_MAX_AGE:-7200}"
POLL="${KHAOS_SIGNING_LOCK_POLL:-5}"

log() { echo "signing-keychain-lock: $*" >&2; }
die() { log "$*"; exit 1; }
now() { date +%s; }

# Start time of a live process, empty when there is none.
started() { ps -o lstart= -p "$1" 2>/dev/null || true; }

# The process whose life bounds this job: the nearest Runner.Worker ancestor.
owner_pid() {
    if [ -n "${KHAOS_SIGNING_LOCK_OWNER_PID:-}" ]; then
        echo "$KHAOS_SIGNING_LOCK_OWNER_PID"
        return
    fi
    local pid=$$
    while [ -n "$pid" ] && [ "$pid" -gt 1 ]; do
        case "$(ps -o comm= -p "$pid" 2>/dev/null)" in
            *Runner.Worker) echo "$pid"; return ;;
        esac
        pid="$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')"
    done
    die "no Runner.Worker ancestor; set KHAOS_SIGNING_LOCK_OWNER_PID outside a runner"
}

ME_PID="$(owner_pid)"
ME_START="$(started "$ME_PID")"
[ -n "$ME_START" ] || die "owner process $ME_PID is not running"

# owner file: pid, start time, acquired-at epoch, description — one per line.
read_owner() {
    O_PID="" O_START="" O_AT="" O_WHO=""
    [ -f "$LOCK/owner" ] || return 1
    { IFS= read -r O_PID; IFS= read -r O_START; IFS= read -r O_AT; IFS= read -r O_WHO; } < "$LOCK/owner" || true
    [ -n "$O_PID" ]
}

held_by_me() {
    read_owner && [ "$O_PID" = "$ME_PID" ] && [ "$O_START" = "$ME_START" ]
}

describe() {
    if read_owner; then
        echo "$O_WHO (pid $O_PID, $(( $(now) - O_AT ))s)"
    else
        echo "an owner still being written"
    fi
}

is_stale() {
    if ! read_owner; then
        # Taken a moment ago and the owner file is not written yet — unless that
        # moment was long enough ago that the taker must have died in between.
        local m
        m="$(stat -f %m "$LOCK" 2>/dev/null)" || return 1
        [ $(( $(now) - m )) -gt 60 ]
        return
    fi
    [ "$(started "$O_PID")" != "$O_START" ] && return 0
    [ $(( $(now) - O_AT )) -gt "$MAX_AGE" ]
}

# Remove a stale lock. One reaper at a time, so a lock recovered and re-taken by
# another job can never be removed by a second reaper that judged the old one.
reap_if_stale() {
    is_stale || return 0
    if ! mkdir "$REAPER" 2>/dev/null; then
        # A reaper that died mid-recovery leaves its guard; recovery takes
        # milliseconds, so a minute-old guard is abandoned.
        local m
        m="$(stat -f %m "$REAPER" 2>/dev/null)" || return 0
        [ $(( $(now) - m )) -gt 60 ] && rmdir "$REAPER" 2>/dev/null
        return 0
    fi
    if is_stale; then
        log "recovering stale lock held by $(describe)"
        rm -rf "$LOCK"
    fi
    rmdir "$REAPER"
}

acquire() {
    if held_by_me; then log "already held by this job"; return; fi
    local waited=0
    until mkdir "$LOCK" 2>/dev/null; do
        reap_if_stale
        if [ $(( waited % 60 )) -eq 0 ]; then log "waiting; held by $(describe)"; fi
        sleep "$POLL"
        waited=$(( waited + POLL ))
    done
    printf '%s\n%s\n%s\n%s\n' "$ME_PID" "$ME_START" "$(now)" \
        "${GITHUB_REPOSITORY:-local} run ${GITHUB_RUN_ID:-?} job ${GITHUB_JOB:-?}" > "$LOCK/owner.tmp"
    mv "$LOCK/owner.tmp" "$LOCK/owner"
    log "acquired after ${waited}s"
}

release() {
    if held_by_me; then
        rm -rf "$LOCK"
        log "released"
    elif [ -d "$LOCK" ]; then
        log "not releasing: held by $(describe), not this job"
    else
        log "not held"
    fi
}

# The user search list, one path per line.
search_list() {
    security list-keychains -d user | sed -e 's/^[[:space:]]*"//' -e 's/"[[:space:]]*$//'
}

# Set the list to: [FIRST] + current list without DROP. Rereads the list here, under
# the lock, so the read and the write cannot interleave with another holder.
rewrite_list() {
    local first="$1" drop="$2" k keep=()
    while IFS= read -r k; do
        [ -n "$k" ] && [ "$k" != "$drop" ] && keep+=("$k")
    done < <(search_list)
    if [ -n "$first" ]; then
        security list-keychains -d user -s "$first" ${keep[@]+"${keep[@]}"}
    else
        security list-keychains -d user -s ${keep[@]+"${keep[@]}"}
    fi
}

case "${1:-}" in
    acquire) acquire ;;
    release) release ;;
    add)
        [ -n "${2:-}" ] || die "add needs a keychain path"
        held_by_me || die "add refused: this job does not hold the lock"
        rewrite_list "$2" "$2"
        ;;
    remove)
        [ -n "${2:-}" ] || die "remove needs a keychain path"
        if held_by_me; then
            rewrite_list "" "$2"
        else
            log "remove skipped: this job does not hold the lock, so it never added $2"
        fi
        ;;
    *) die "usage: $0 acquire|release|add <keychain>|remove <keychain>" ;;
esac
