#!/usr/bin/env bash
# release.sh — build → sign (Developer ID) → notarize → staple → DMG → publish GH release.
#
# Tauri v2 builds/signs/notarizes/staples the .app; this script resolves
# the signing identity, supplies notarization credentials, then packages the DMG
# itself with hdiutil (Tauri's create-dmg script fails on these machines — see
# AGENTS.md) and publishes the GitHub release.
#
# Usage:
#   scripts/release.sh [--version X.Y.Z] [--skip-release]
#
# Credentials come from env vars (set by the workflow from org secrets, or from
# ~/KhaosFoundation/.env locally):
#   APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"

# Rust/cargo live under ~/.cargo/bin on these machines and are not on the
# default PATH — `tauri build` needs them.
export PATH="$HOME/.cargo/bin:$PATH"

VERSION=""
SKIP_RELEASE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --version) VERSION="$2"; shift 2 ;;
    --skip-release) SKIP_RELEASE=1; shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$VERSION" ] || VERSION="$(node -p "require('./src-tauri/tauri.conf.json').version" 2>/dev/null || echo '0.1.0')"

say() { printf '\n\033[1;34m▶ %s\033[0m\n' "$*"; }

# ---- signing identity (resolved to a hash to avoid ambiguity) ----
# Two "Developer ID Application: Khalid Mills (G98TZJ75HL)" certs coexist in the
# keychain; codesign --sign "<name>" fails "ambiguous", so pick the first hash.
SIGN_ID="$(security find-identity -v -p codesigning \
  | awk '/Developer ID Application: Khalid Mills \(G98TZJ75HL\)/{print $2; exit}')"
[ -n "$SIGN_ID" ] || { echo "error: no 'Developer ID Application: Khalid Mills (G98TZJ75HL)' identity in the keychain" >&2; exit 1; }
echo "signing identity: $SIGN_ID"
export APPLE_SIGNING_IDENTITY="$SIGN_ID"

# ---- notarization credentials (Tauri reads APPLE_PASSWORD) -------------------
: "${APPLE_ID:?APPLE_ID missing}"
: "${APPLE_TEAM_ID:?APPLE_TEAM_ID missing}"
: "${APPLE_APP_SPECIFIC_PASSWORD:?APPLE_APP_SPECIFIC_PASSWORD missing}"
export APPLE_PASSWORD="$APPLE_APP_SPECIFIC_PASSWORD"

# ---- updater signing key (Tauri signs the update artifacts with it) ----------
# Prefer a secret string (CI / org secrets); locally fall back to the key file.
# The build step reads TAURI_SIGNING_PRIVATE_KEY (the key *content*), not a path.
if [ -n "${KHAOTIK_UPDATER_PRIVATE_KEY:-}" ]; then
  export TAURI_SIGNING_PRIVATE_KEY="$KHAOTIK_UPDATER_PRIVATE_KEY"
elif [ -f "$HOME/.tauri/khaotik-catalog.key" ]; then
  export TAURI_SIGNING_PRIVATE_KEY="$(cat "$HOME/.tauri/khaotik-catalog.key")"
else
  echo "error: no updater private key (set KHAOTIK_UPDATER_PRIVATE_KEY or create ~/.tauri/khaotik-catalog.key)" >&2
  exit 1
fi
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="${KHAOTIK_UPDATER_KEY_PASSWORD:?KHAOTIK_UPDATER_KEY_PASSWORD missing}"

# ---- build the .app only (Tauri signs + notarizes + staples it) --------------
say "Tauri build v$VERSION (.app — sign + notarize + staple)"
npx tauri build --bundles app

APP="$ROOT/src-tauri/target/release/bundle/macos/khaotik-catalog.app"
[ -d "$APP" ] || { echo "error: $APP not found after build" >&2; exit 1; }

# ---- package the DMG ourselves (hdiutil; create-dmg is unreliable here) -------
say "Package DMG"
DMG_DIR="$ROOT/src-tauri/target/release/bundle/dmg"
mkdir -p "$DMG_DIR"
DMG="$DMG_DIR/khaotik-catalog-${VERSION}.dmg"
STAGING="$(mktemp -d)"
cp -R "$APP" "$STAGING/"
ln -s /Applications "$STAGING/Applications"
hdiutil create -volname "Khaotik Catalog $VERSION" -srcfolder "$STAGING" -ov -format UDZO "$DMG" >/dev/null
rm -rf "$STAGING"

# ---- sign + notarize + staple the DMG ----------------------------------------
say "Sign DMG"
codesign --force --timestamp --sign "$SIGN_ID" "$DMG"
say "Notarize + staple DMG"
xcrun notarytool submit "$DMG" \
  --apple-id "$APPLE_ID" --password "$APPLE_APP_SPECIFIC_PASSWORD" --team-id "$APPLE_TEAM_ID" \
  --wait
xcrun stapler staple "$DMG"

# ---- checksum + published release -------------------------------------------------
say "Checksum"
( cd "$DMG_DIR" && shasum -a 256 "$(basename "$DMG")" | tee "$(basename "$DMG").sha256" )

# ---- updater manifest (createUpdaterArtifacts produced the .tar.gz + .sig) ----
MACOS_DIR="$ROOT/src-tauri/target/release/bundle/macos"
UPD_TGZ="$MACOS_DIR/khaotik-catalog.app.tar.gz"
UPD_SIG="$MACOS_DIR/khaotik-catalog.app.tar.gz.sig"
[ -f "$UPD_TGZ" ] && [ -f "$UPD_SIG" ] || { echo "error: updater artifacts missing at $MACOS_DIR" >&2; exit 1; }

say "Generate latest.json"
case "$(uname -m)" in
  arm64) PLATFORM="darwin-aarch64" ;;
  x86_64) PLATFORM="darwin-x86_64" ;;
  *) echo "error: unsupported arch $(uname -m)" >&2; exit 1 ;;
esac
SIGNATURE="$(cat "$UPD_SIG")"
URL="https://updates.loswf.com/khaotik-catalog/v$VERSION/khaotik-catalog.app.tar.gz"
jq -n \
  --arg version "$VERSION" \
  --arg platform "$PLATFORM" \
  --arg signature "$SIGNATURE" \
  --arg url "$URL" \
  --arg pub_date "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{version: $version, notes: ("Khaotik Catalog " + $version), pub_date: $pub_date, platforms: {($platform): {signature: $signature, url: $url}}}' \
  > "$ROOT/latest.json"
echo "latest.json → $PLATFORM → $URL"

# ---- publish to updates.loswf.com (shared LOSWF update host: S3 + CloudFront) ---
# The repo is private, so GitHub release assets are not publicly fetchable — the
# updater endpoint and artifacts live on this public host instead. Product-scoped
# under /khaotik-catalog/ so other LOSWF products can share the same subdomain.
AWS_PROFILE="${AWS_PROFILE:-personal}"
if [ -n "${AWS_ACCESS_KEY_ID:-}" ]; then
  # CI: org-secret creds (no ~/.aws profile on the runner)
  AWS_OPTS=()
else
  AWS_OPTS=(--profile "$AWS_PROFILE")
fi
S3_BUCKET="loswf-updates-web"
S3_PREFIX="khaotik-catalog"
# Account guard — refuse to publish anywhere but the account that owns the buckets.
AWS_ACCOUNT="$(aws sts get-caller-identity "${AWS_OPTS[@]}" --query Account --output text)"
[ "$AWS_ACCOUNT" = "997901679385" ] || {
  echo "error: refusing to publish — AWS account $AWS_ACCOUNT is not 997901679385 (the $S3_BUCKET owner)" >&2
  exit 1
}
say "Publish to updates.loswf.com (s3://$S3_BUCKET/$S3_PREFIX)"
aws s3 cp "$UPD_TGZ"  "s3://$S3_BUCKET/$S3_PREFIX/v$VERSION/khaotik-catalog.app.tar.gz"     "${AWS_OPTS[@]}" --content-type application/octet-stream --cache-control "max-age=31536000" >/dev/null
aws s3 cp "$UPD_SIG"  "s3://$S3_BUCKET/$S3_PREFIX/v$VERSION/khaotik-catalog.app.tar.gz.sig" "${AWS_OPTS[@]}" --content-type application/octet-stream --cache-control "max-age=31536000" >/dev/null
aws s3 cp "$DMG"     "s3://$S3_BUCKET/$S3_PREFIX/v$VERSION/khaotik-catalog-$VERSION.dmg"    "${AWS_OPTS[@]}" --content-type application/octet-stream --cache-control "max-age=31536000" >/dev/null
aws s3 cp "$DMG.sha256" "s3://$S3_BUCKET/$S3_PREFIX/v$VERSION/khaotik-catalog-$VERSION.dmg.sha256" "${AWS_OPTS[@]}" --content-type text/plain --cache-control "max-age=31536000" >/dev/null
aws s3 cp "$ROOT/latest.json" "s3://$S3_BUCKET/$S3_PREFIX/latest.json" "${AWS_OPTS[@]}" --content-type application/json --cache-control "max-age=300" >/dev/null
echo "published → https://updates.loswf.com/$S3_PREFIX/latest.json"

if [ "$SKIP_RELEASE" -eq 1 ]; then
  say "SKIP release. Artifact: $DMG"
else
  # Tag first, so the release carries the tag. This mattered acutely while the
  # release was drafted — `gh release create --draft` on a brand-new tag lands
  # "untagged", which reads as a failure and forces a delete/recreate dance —
  # and it is still the right order now that it publishes.
  if ! git rev-parse "v$VERSION" >/dev/null 2>&1; then
    say "Tag v$VERSION"
    git tag "v$VERSION"
    git push origin "v$VERSION"
  fi

  say "Draft GitHub release v$VERSION"
  NOTES="Developer-ID signed and notarized Khaotik component catalog (Tauri) — the device-playtest app for khaotik-ui.

A minor rather than a patch: one new component, one new prop, and four fixes.
Every issue behind them came from khaos-app wiring this library to live khaosd
data, so they are field reports rather than speculation.

FilterField — the sidebar filter box and its result count. Authored rather than
adopted: Ark's Field orchestrates a label, helper text and an error message
around an input, and a filter box wants none of the three. The count is the
point — 22 of 201 reads as a filter, where a bare list of 22 reads as an empty
project. It exists because the same box had been hand-rolled twice in one app
and the two copies had already drifted on three behaviours.

Launcher engine plates — the rail's engine readings were one run-on line that
wrapped mid-fact in a narrow rail. They are now labelled rows in bordered
plates with a status pill, and an unknown reading renders an em-dash rather
than a guess.

SceneList and DialogueList take paginate={false} — list everything, filter to
find it. Reaching that mode previously meant passing the collection length as
the sole page size and hiding the bar with an override, two reaches into
component internals. CharacterList and LocationList never paginated, so a
surface showing several lists could not present them coherently.

ProjectCard no longer claims 'synced' from fields the daemon does not return.
The counts being absent meant 'the engine did not say', not 'zero either way',
and every card asserted a clean tree it could not verify.

The inspectors document which data shape they expect. ProjectCard reads the
engine row verbatim while the inspectors need the mapped shape, and feeding
them the raw payload rendered an empty panel with no error at all.

The scene and location hero placeholder is capped. At full width it took 52%
of the reading area before a word of analysis, and grew with the pane.

Real-data pipeline: the catalog is driven entirely by the live data — the
voice catalog (371 voices, casting, availability) and the
KSPD project data (scenes/characters/locations/dialogues/analyses/casting/
coverage) fetched from khaosd + khaos-tools and committed as the build-time
source. Real counts, casting assignments, and honest empty states — no canned
data; gaps are reported, not fabricated.

In-app auto-update: signed artifacts + latest.json served from
updates.loswf.com/khaotik-catalog."

  # CREATE AS A DRAFT, THEN PUBLISH HERE, THEN ASSERT. Three steps rather than
  # one flag, because the two obvious fixes each break something.
  #
  # The bug being fixed: this created with `--draft` and printed "Publish with:
  # gh release edit --draft=false". A manual step that made sense when a person
  # ran this script and reviewed before announcing, and that nobody performs in
  # CI — so every tagged release left an invisible draft. v0.14.0 and v0.15.0 sat
  # that way for two weeks while AGENTS.md claimed 0.15.0 was published.
  #
  # Fix 1, "drop --draft": the release is visible from creation, but `gh release
  # create` uploads assets AFTER creating, so a failed upload leaves a PUBLISHED
  # release with missing or partial assets that consumers can resolve and
  # download. That is worse than invisible.
  #
  # Fix 2, "publish from the workflow" (khaos-app scripts/release.sh:367 +
  # release.yml:302): keeps the draft window short and a failed upload strands a
  # draft nobody downloaded — but the MANUAL path stays broken. Anyone running
  # this script by hand still produces an invisible release, which is precisely
  # how this defect went unnoticed here.
  #
  # So: draft (assets land while invisible) → publish from the script (the manual
  # path works too) → assert (neither a comment nor a green tick can substitute).
  gh release create "v$VERSION" "$DMG" "$DMG.sha256" \
    --draft --title "Khaotik Catalog $VERSION" \
    --notes "$NOTES"

  # Both assets, before anything is made visible. `gh release create` exits 0
  # having created the release even if an upload fails.
  ASSET_COUNT="$(gh release view "v$VERSION" --json assets --jq '.assets | length')"
  if [ "$ASSET_COUNT" -ne 2 ]; then
    echo "FAIL: v$VERSION has $ASSET_COUNT of 2 assets; leaving it as a draft." >&2
    echo "      The updater feed is ALREADY LIVE at $S3_PREFIX/v$VERSION — that" >&2
    echo "      divergence is the thing to resolve, not this draft." >&2
    exit 1
  fi

  # `--latest` explicitly. GitHub resolves "latest" repo-wide by publish time and
  # this repo carries two tag families (`v*` catalog, `lib-*` library), so the
  # next lib release silently takes `latest` from the catalog. Measured three
  # times in one day. khaos-foundation's build gate reads exactly that field.
  gh release edit "v$VERSION" --draft=false --latest >/dev/null
  say "Published v$VERSION"

  # THE INVARIANT, asserted rather than described: the updater feed went live at
  # :121-142, ABOVE this block, so from here the feed and the Release must not
  # diverge. Tonight they did — a fully green workflow, both jobs success, and an
  # invisible release. A green tick proved nothing; this check would have failed
  # loudly in the same run.
  #
  # `gh release view` without --json resolves only PUBLISHED releases the same
  # way a consumer's tooling does, which is the property being tested.
  PUBLISHED_DRAFT="$(gh release view "v$VERSION" --json isDraft --jq .isDraft)"
  RESOLVED_LATEST="$(gh release view --json tagName --jq .tagName)"
  if [ "$PUBLISHED_DRAFT" != "false" ]; then
    echo "FAIL: v$VERSION is still a draft after publishing. The updater feed is" >&2
    echo "      live and the Release is not — the exact divergence this guards." >&2
    exit 1
  fi
  if [ "$RESOLVED_LATEST" != "v$VERSION" ]; then
    echo "FAIL: latest resolves to $RESOLVED_LATEST, not v$VERSION." >&2
    echo "      A consumer asking this repo for latest gets the wrong artifact." >&2
    exit 1
  fi
  say "Verified: v$VERSION published, 2 assets, resolves as latest"
fi

# ---- deploy the browsable catalog to khaotik-catalog.loswf.com ---------------------------
# The static catalog is rebuilt + synced to S3 + invalidated in CloudFront so the
# online copy tracks this release. (deploy-web.sh re-runs `npm run build`, which
# is cheap — the release build already produced the same dist/.)
if [ "$SKIP_RELEASE" -eq 0 ]; then
  say "Deploy catalog to khaotik-catalog.loswf.com"
  bash scripts/deploy-web.sh
fi

say "Done. v$VERSION → $DMG"
