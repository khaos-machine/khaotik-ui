#!/usr/bin/env bash
# lib.sh — small proven-style Bash utilities (logging, die, require_cmd).
# Source it from a script with:  source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
# Keep it dependency-free; jq is expected to be present on these machines.

log_info() { printf '\033[1;34m▶ %s\033[0m\n' "$*"; }
log_warn() { printf '\033[1;33m⚠ %s\033[0m\n' "$*" >&2; }
log_err()  { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; }

die() { log_err "$*"; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

# khaosd_curl — one call into the local daemon, transport chosen for us.
#
# khaosd 0.5.0 put every endpoint behind a token (khaos-manager#84), which broke
# these scripts outright: they used bare TCP and started getting 401 on every
# request. 0.6.0 then added a Unix socket whose CREDENTIAL IS THE FILE MODE —
# `srw-------`, owner only — so a local caller needs no secret at all
# (khaos-manager#140).
#
# Prefer the socket for that reason, not just because it works: the TCP path
# means reading a token out of runtime.json and putting it in an argv that shows
# up in `ps`. The socket has nothing to leak.
#
# TCP with the token is the fallback for a daemon too old to have a socket, and
# a tokenless fallback after that for one older still.
khaosd_curl() {
  local runtime="$HOME/.khaos/runtime.json"
  local sock port token
  sock="$(jq -r '.socket // empty' "$runtime" 2>/dev/null)"

  if [ -n "$sock" ] && [ -S "$sock" ]; then
    curl -sS --unix-socket "$sock" "http://localhost$1"
    return
  fi

  port="$(jq -r '.port // 8080' "$runtime" 2>/dev/null || echo 8080)"
  token="$(jq -r '.token // empty' "$runtime" 2>/dev/null)"
  if [ -n "$token" ]; then
    curl -sS -H "Authorization: Bearer $token" "http://127.0.0.1:$port$1"
  else
    curl -sS "http://127.0.0.1:$port$1"
  fi
}

# Fail loudly rather than writing a file full of an error envelope. Every one of
# these fetches used to `> src/data/whatever.json` unconditionally, so a 401
# would have been committed as the data — and the catalog would render an error
# object as if it were a screenplay.
khaosd_require() {
  local body
  body="$(khaosd_curl /api/health)" || die "khaosd unreachable — is the daemon running?"
  printf '%s' "$body" | jq -e '.ok == true' >/dev/null 2>&1 \
    || die "khaosd did not report healthy: $(printf '%s' "$body" | head -c 200)"
  log_info "khaosd $(printf '%s' "$body" | jq -r '.version // "?"') · $(printf '%s' "$body" | jq -r '.project_count // 0') projects"
}

# Replace TARGET only if the producer succeeded and wrote parseable, non-empty
# JSON. Use this instead of `> src/data/whatever.json`.
#
# `>` opens and TRUNCATES its target the instant the shell parses the line —
# before the producer on the left has run at all. So under `set -euo pipefail`
# a failing capture does not leave the committed fixture untouched; it leaves it
# at ZERO BYTES, and the script then aborts having already destroyed the data it
# was regenerating. Worse, a later step slurping that file reads the emptied one.
#
# That is the same defect `khaosd_require` above was written for, one layer
# over: that one stopped an error envelope being committed AS the data, and this
# one stops a failure committing NOTHING as the data. Guarding the fetch and
# leaving the write unguarded is how the second survived the first.
#
# The temp file is created beside the target so the `mv` is an atomic rename on
# the same filesystem rather than a copy a reader can catch half-written.
write_json() {
  local target="$1" tmp
  [ -n "$target" ] || die "write_json: no target given"
  tmp="$(mktemp "$(dirname "$target")/.tmp.XXXXXX")" || die "write_json: mktemp failed for $target"
  cat > "$tmp"
  if [ ! -s "$tmp" ]; then
    rm -f "$tmp"; die "refusing to overwrite $target: the producer wrote nothing"
  fi
  if ! jq -e . "$tmp" >/dev/null 2>&1; then
    rm -f "$tmp"; die "refusing to overwrite $target: the producer wrote invalid JSON"
  fi
  mv "$tmp" "$target"
}
