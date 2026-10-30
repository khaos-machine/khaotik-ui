#!/usr/bin/env bash
# release-lib.sh — cut a `lib-*` marker Release for the library.
#
# The counterpart to apps/catalog/scripts/release.sh, which asserts `--latest`
# for the catalog. This path had no script, so its rules lived only in
# AGENTS.md prose — and a rule that lives only in prose is followed only by
# whoever reads it. The repo-wide `latest` pointer has been taken off the
# catalog SIX times by a `lib-*` release cut from memory.
#
# Usage:
#   scripts/release-lib.sh                      # version from package.json
#   scripts/release-lib.sh --notes-file NOTES.md
#   scripts/release-lib.sh --dry-run            # run every guard, publish nothing
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

NOTES_FILE=""; DRY_RUN=0
while [ $# -gt 0 ]; do
  case "$1" in
    --notes-file) NOTES_FILE="${2:?--notes-file needs a path}"; shift 2 ;;
    --dry-run)    DRY_RUN=1; shift ;;
    *) echo "error: unknown argument $1" >&2; exit 2 ;;
  esac
done

fail() { echo "FAIL: $*" >&2; exit 1; }

VERSION="$(node -p "require('./package.json').version")"
TAG="lib-$VERSION"
SHA="$(git rev-parse HEAD)"   # FULL sha: an abbreviated --target is rejected as
                              # `Release.target_commitish is invalid`, which reads
                              # like a tag problem and is not.

# ---- guards, before anything is published ----
[ -z "$(git status --porcelain)" ] || fail "working tree is dirty"
git fetch -q origin
git merge-base --is-ancestor "$SHA" origin/main || fail "HEAD is not on origin/main"
git rev-parse "$TAG" >/dev/null 2>&1 && fail "$TAG already exists locally"
# Checked on the REMOTE too, since the tag is now created locally and pushed: a
# tag that exists there and not here would fail at the push, after the guards
# had all passed and with nothing rolled back.
git ls-remote --exit-code --tags origin "$TAG" >/dev/null 2>&1 && fail "$TAG already exists on origin"
[ -z "$NOTES_FILE" ] || [ -f "$NOTES_FILE" ] || fail "notes file not found: $NOTES_FILE"

# What `latest` points at NOW — the value the post-publish check defends.
# No `|| echo ""` here: a read that fails and a repo with no releases are not the
# same thing, and collapsing them to "" makes the check below compare nothing to
# nothing and pass. The only legitimate empty is a repo with no releases at all,
# so that case is asked for explicitly and every other failure aborts under `set -e`.
if LATEST_BEFORE="$(gh release list --limit 10000 --json tagName,isLatest --jq '.[] | select(.isLatest) | .tagName' 2>/dev/null)"; then
  :
else
  # The read failed. That is either "no releases exist yet" (legitimate) or a
  # broken `gh` (not). Ask in a form that ABORTS on the second: a bare command
  # whose failure `set -e` acts on. Do NOT test this through a command
  # substitution inside `[ ]` — `$(gh ... | wc -l)` prints "0" when gh fails, so
  # a broken read reads as an empty repository and the script sails past.
  gh release list --limit 1 >/dev/null
  LATEST_BEFORE=""
fi
echo "version     $VERSION"
echo "tag         $TAG"
echo "target      $SHA"
echo "latest is   ${LATEST_BEFORE:-<none>}"

if [ "$DRY_RUN" -eq 1 ]; then echo "dry run: every guard passed, nothing published"; exit 0; fi

NOTES_ARGS=(--notes "Library release, published to npm by lib-publish.yml. Pin the exact version.

\`\`\`
\"@khaos-machine/khaotik-ui\": \"$VERSION\"
\`\`\`

See [CHANGELOG.md](https://github.com/khaos-machine/khaotik-ui/blob/$TAG/CHANGELOG.md) for what moved.")
[ -n "$NOTES_FILE" ] && NOTES_ARGS=(--notes-file "$NOTES_FILE")

# ANNOTATED, not lightweight. Operator ruling 2026-09-24, applying to both
# khaos-app and this repository from the next release onward. `gh release
# create` makes a LIGHTWEIGHT tag — it writes the ref straight at the commit —
# so the tag object has to exist first and the release attach to it.
#
# A lightweight tag is indistinguishable from an annotated one in `gh release
# view` and in the web UI, which is why this is created deliberately and then
# VERIFIED below rather than assumed. Measured 2026-09-24: every tag this
# repository had shipped was lightweight.
#
# Forward-only. Existing lightweight tags stay, and every `git describe` call
# site across the estate passes `--tags`, which reads them.
git tag -a "$TAG" -m "Library $VERSION" "$SHA"
git push -q origin "$TAG"

# No `--target`: the tag already exists and points where it should. Passing one
# here would be a second claim about the same thing.
#
# `--latest=false` is the whole point of the flag. GitHub resolves `latest`
# repo-wide by publish time, and this repo carries two tag families (`v*`
# catalog, `lib-*` library), so a library release with no flag silently takes
# the pointer off the signed catalog build.
gh release create "$TAG" --latest=false \
  --title "Library $VERSION" "${NOTES_ARGS[@]}" >/dev/null

# Assert the OBJECT TYPE, not that a tag exists. `tag` is annotated, `commit` is
# lightweight, and nothing else tells them apart — so without this the ruling
# lapses silently the first time someone edits this script.
TAG_TYPE="$(gh api "repos/khaos-machine/khaotik-ui/git/refs/tags/$TAG" --jq '.object.type')"
if [ "$TAG_TYPE" != "tag" ]; then
  fail "$TAG is a '$TAG_TYPE' ref, not an annotated tag object.
      The operator ruled tags annotated from 2026-09-24 onward.
      Check with: gh api repos/khaos-machine/khaotik-ui/git/refs/tags/$TAG --jq .object.type"
fi
echo "tag type   $TAG_TYPE (annotated)"

# Assert the ARTIFACT, not the invocation. Passing the flag and the pointer
# actually holding are two different claims, and only the second one matters.
# Bare, exactly as the catalog path reads it at
# apps/catalog/scripts/release.sh:259. A release was just created, so this read
# MUST succeed; swallowing it would let the script print "latest held" having
# verified nothing — asserting neither the artifact nor the invocation.
LATEST_AFTER="$(gh release list --limit 10000 --json tagName,isLatest --jq '.[] | select(.isLatest) | .tagName')"
# Only the catalog's `latest` is worth defending. Until a `v*` release exists,
# GitHub hands `latest` to the newest lib release, and that harms nothing.
if [ "$LATEST_AFTER" != "$LATEST_BEFORE" ] && [[ "$LATEST_BEFORE" == v* ]]; then
  fail "$TAG moved 'latest' from $LATEST_BEFORE to ${LATEST_AFTER:-<none>}.
      Restore it with: gh release edit $LATEST_BEFORE --latest"
fi

echo "published   $TAG"
echo "latest held ${LATEST_AFTER:-<none>}"
