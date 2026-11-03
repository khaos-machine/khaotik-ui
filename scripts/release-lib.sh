#!/usr/bin/env bash
# release-lib.sh — cut a `lib-*` Release for the library, holding `latest`.
#
# `lib-*` is the only release family this repository publishes now that the
# desktop catalog is gone, so the newest library release holds the repo-wide
# `latest` pointer. The script publishes with `--latest` and then reads the
# pointer back, because passing the flag and the pointer holding are two
# different claims and only the second one matters.
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

echo "version     $VERSION"
echo "tag         $TAG"
echo "target      $SHA"

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
# `--latest` explicitly rather than GitHub's default, which picks `latest` by
# date and semver and so is not a claim this script can make about its own run.
gh release create "$TAG" --latest \
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

# Assert the ARTIFACT, not the invocation. A release was just created, so this
# read MUST succeed; it is bare so `set -e` aborts on a failed read rather than
# comparing nothing to the tag.
LATEST="$(gh release view --json tagName --jq .tagName)"
[ "$LATEST" = "$TAG" ] || fail "'latest' is ${LATEST:-<none>}, not $TAG.
      Restore it with: gh release edit $TAG --latest"

echo "published   $TAG"
echo "latest      $LATEST"
