#!/usr/bin/env bash
# The docs-only classifier. Copied verbatim into each child repo's scripts/;
# the copy must not drift (khaos-home's gate-run.sh refuses to skip when it
# does). Source: khaos-home scripts/docs-only.sh.
#
# Usage: docs-only.sh <patterns-file> <base> <tree>
#        docs-only.sh --clean-patterns <patterns-file>
#
# Prints `docs-only` or `code`, then the changed paths, one per line. It prints
# `docs-only` only when it can prove every path changed between <base> and
# <tree> matches a pattern (one ERE per line), and `code` otherwise:
#   0. The gate's own files are always code, before any pattern applies.
#   1. Both sides of a rename are listed (--no-renames).
#   2. Blank, all-whitespace and `#` lines are stripped; no pattern left is code.
#   3. A pattern that is not plain ERE, or that grep rejects or warns about,
#      is code with a warning; so is any grep, git diff or base failure.
#   4. An empty change set is code.
#   5. A pattern that matches any path of a fixed code-path probe set (see
#      CODE_PROBES) is code with a warning: it would match code changes too.
#   6. A pattern must name non-code file types, by its text: it ends in
#      `\.<ext>$` or `\.(<ext>|<ext>...)$` with each <ext> literal [a-z0-9]+
#      and none of CODE_EXTS, and has no `|` outside parentheses and bracket
#      expressions. Anything else, or an unbalanced group or bracket, is code
#      with a warning. Such a pattern can only match paths ending in a
#      non-code extension, in any directory.
#
# --clean-patterns prints the patterns that survive rules 2 and 3, and exits 1
# (with the same warnings) when rule 2 or 3 would give `code`.
#
# Written for bash 3.2, which macOS ships.
set -uo pipefail

warn() { echo "docs-only.sh: $*" >&2; }

# The gate's own files (rule 0). A PR cannot widen the patterns, or break the
# classifier, and skip its own code steps.
GATE_FILES='^scripts/(docs-only\.sh|docs-paths\.txt|gate)$|^scripts/unread/|^\.github/'

# Rule 5: code paths no docs pattern may match. This catches match-all and
# near-match-all patterns whatever their syntax (^, $, a*, .{0}, [[:alpha:]]).
CODE_PROBES='x.go
a/b/x.go
go.mod
go.sum
Makefile
justfile
package.json
src/x.ts
scripts/x.sh
x'

# Rule 6: extensions no docs pattern may name.
CODE_EXTS=' go ts tsx mts cts js jsx mjs cjs svelte vue rs py rb sh swift java clj cljc cljs bb '

# Rule 6's required suffix, matched by bash itself (no grep, no pipe). The
# characters are spelled out, because a locale can widen a [a-z] range.
EXT_CHARS='abcdefghijklmnopqrstuvwxyz0123456789'
SUFFIX_RE="\\\\\\.([$EXT_CHARS]+|\\(([$EXT_CHARS]+\\|)*[$EXT_CHARS]+\\))\\\$\$"

# escapes_outside <pattern>: prints `:<i>:` for each index i where an escape
# (a backslash and the character after it) starts outside a bracket
# expression, and fails when a group or bracket expression is unbalanced or
# a `|` stands outside both. A bracket expression may open with `^`, then a
# literal `]`, and holds [:class:], [=x=] and [.x.] items; a `(` inside it is
# not a group.
escapes_outside() {
  local p=$1 n=${#1} i=0 j depth=0 c two close out=:
  while [ "$i" -lt "$n" ]; do
    c=${p:i:1}
    case "$c" in
      \\)
        [ $((i + 1)) -lt "$n" ] || return 1
        out="$out$i:"
        i=$((i + 2))
        continue
        ;;
      \[)
        j=$((i + 1))
        [ "${p:j:1}" != '^' ] || j=$((j + 1))
        [ "${p:j:1}" != ']' ] || j=$((j + 1))
        while :; do
          [ "$j" -lt "$n" ] || return 1
          two=${p:j:2}
          case "$two" in
            '[:' | '[=' | '[.')
              close="${two:1:1}]"
              j=$((j + 2))
              while [ "${p:j:2}" != "$close" ]; do
                [ "$j" -lt "$n" ] || return 1
                j=$((j + 1))
              done
              j=$((j + 2))
              ;;
            *)
              [ "${p:j:1}" != ']' ] || break
              j=$((j + 1))
              ;;
          esac
        done
        i=$((j + 1))
        continue
        ;;
      \() depth=$((depth + 1)) ;;
      \)) depth=$((depth - 1)); [ "$depth" -ge 0 ] || return 1 ;;
      \|) [ "$depth" -gt 0 ] || return 1 ;;
    esac
    i=$((i + 1))
  done
  [ "$depth" -eq 0 ] || return 1
  printf '%s\n' "$out"
}

# names_doc_types <pattern>: rule 6. Succeeds only when the pattern ends in a
# literal, non-code `\.<ext>$` or `\.(<ext>|...)$` whose backslash is a real
# escape, and has no `|` outside groups and bracket expressions.
names_doc_types() {
  local p=$1 esc tail exts ext at
  esc=$(escapes_outside "$p") || return 1
  [[ $p =~ $SUFFIX_RE ]] || return 1
  tail=${BASH_REMATCH[0]}
  at=$((${#p} - ${#tail}))
  case "$esc" in *":$at:"*) ;; *) return 1 ;; esac
  exts=${BASH_REMATCH[1]}
  exts=${exts#(}
  exts=${exts%)}
  while [ -n "$exts" ]; do
    ext=${exts%%|*}
    case "$CODE_EXTS" in *" $ext "*) return 1 ;; esac
    [ "$ext" != "$exts" ] || break
    exts=${exts#*|}
  done
}

# clean_patterns <file>: rules 2 and 3. Prints the surviving patterns.
clean_patterns() {
  local file=$1 line rc err n=0 bad=0
  if [ ! -r "$file" ]; then
    warn "cannot read patterns file '$file'"
    return 1
  fi
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      *[![:space:]]*) ;;
      *) continue ;;
    esac
    case "$line" in \#*) continue ;; esac
    case "$line" in
      *'(?'* | *'\d'* | *'\w'* | *'\s'* | *'\S'* | *'\W'* | *'\b'* | *'\B'* | *'\<'* | *'\>'*)
        warn "pattern '$line' in $file is not plain ERE"
        bad=1
        continue
        ;;
    esac
    err=$(grep -E -e "$line" < /dev/null 2>&1 > /dev/null)
    rc=$?
    if [ "$rc" -ge 2 ] || [ -n "$err" ]; then
      warn "pattern '$line' in $file is rejected by grep: ${err:-exit $rc}"
      bad=1
      continue
    fi
    # Rule 5, through a here-string: no pipe for an early exit to break.
    grep -E -e "$line" <<< "$CODE_PROBES" > /dev/null 2>&1
    rc=$?
    if [ "$rc" -ne 1 ]; then
      warn "pattern '$line' in $file matches a code path (rule 5)"
      bad=1
      continue
    fi
    if ! names_doc_types "$line"; then
      warn "pattern '$line' in $file does not end in non-code file types, as \\.<ext>\$ or \\.(<ext>|...)\$ with no top-level | (rule 6)"
      bad=1
      continue
    fi
    printf '%s\n' "$line"
    n=$((n + 1))
  done < "$file"
  if [ "$n" -eq 0 ] && [ "$bad" -eq 0 ]; then
    warn "no pattern in $file"
    return 1
  fi
  [ "$bad" -eq 0 ]
}

if [ "${1:-}" = --clean-patterns ]; then
  [ $# -eq 2 ] || { warn "usage: docs-only.sh --clean-patterns <patterns-file>"; exit 2; }
  clean_patterns "$2"
  exit
fi

if [ $# -ne 3 ]; then
  warn "usage: docs-only.sh <patterns-file> <base> <tree>"
  echo code
  exit 2
fi
patterns_file=$1 base=$2 tree=$3

verdict() { echo "$1"; [ -z "${2:-}" ] || printf '%s\n' "$2"; exit 0; }

if [ -z "$base" ] || ! git rev-parse -q --verify "$base^{tree}" > /dev/null 2>&1; then
  warn "base '$base' does not resolve; treating the change as code"
  verdict code
fi
if ! git rev-parse -q --verify "$tree^{tree}" > /dev/null 2>&1; then
  warn "tree '$tree' does not resolve; treating the change as code"
  verdict code
fi

# Rule 1: both sides of a rename. quotePath off, so a non-ASCII path is
# printed as itself and the patterns see it.
if ! changed=$(git -c core.quotePath=false diff --no-renames --name-only "$base" "$tree" --); then
  warn "git diff $base $tree failed; treating the change as code"
  verdict code
fi

# Rule 4: nothing changed is not docs-only.
[ -n "$changed" ] || verdict code

# Rule 0. A here-string, not a pipe into grep -q: under pipefail an early
# exit SIGPIPEs the writer once the list outgrows the pipe buffer, and the
# match would read as a miss. A grep error is code too.
grep -E "$GATE_FILES" <<< "$changed" > /dev/null
rc=$?
if [ "$rc" -ne 1 ]; then
  [ "$rc" -eq 0 ] || warn "grep failed on the gate-file rule (exit $rc); treating the change as code"
  verdict code "$changed"
fi

# Rules 2 and 3.
clean="$(mktemp "${TMPDIR:-/tmp}/docs-only.XXXXXX")" || verdict code "$changed"
trap 'rm -f "$clean"' EXIT
clean_patterns "$patterns_file" > "$clean" || verdict code "$changed"

# Every changed path must match a pattern: grep -v keeps the paths that match
# none. Exit 1 (nothing kept) is the only docs-only result; any stderr or an
# exit of 2 or more is code.
kept=$(grep -v -E -f "$clean" <<< "$changed" 2> "$clean.err")
rc=$?
err=$(cat "$clean.err" 2> /dev/null)
rm -f "$clean.err"
if [ "$rc" -ge 2 ] || [ -n "$err" ]; then
  warn "grep failed over $patterns_file: ${err:-exit $rc}; treating the change as code"
  verdict code "$changed"
fi
if [ "$rc" -eq 1 ] && [ -z "$kept" ]; then
  verdict docs-only "$changed"
fi
verdict code "$changed"
