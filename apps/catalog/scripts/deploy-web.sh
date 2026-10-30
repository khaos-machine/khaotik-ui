#!/usr/bin/env bash
# deploy-web.sh — build the catalog and publish dist/ to khaotik-catalog.loswf.com.
#
# The browsable catalog is a static Svelte build served from S3 + CloudFront
# (bucket loswf-khaotik-catalog-web, distribution E3URVGW9EHJQI7, alias khaotik-catalog.loswf.com).
# The repo is private, so this public host is the only way to browse it online.
#
# Usage:
#   scripts/deploy-web.sh
#
# Env:
#   AWS_PROFILE   defaults to `personal` (the account that owns the bucket)
set -euo pipefail

cd "$(dirname "$0")/.."
export PATH="$HOME/.cargo/bin:$PATH"

AWS_PROFILE="${AWS_PROFILE:-personal}"
BUCKET="loswf-khaotik-catalog-web"
CLOUDFRONT="E3URVGW9EHJQI7"

# Account guard — refuse to publish anywhere but the account that owns the bucket.
if [ -n "${AWS_ACCESS_KEY_ID:-}" ]; then AWS_OPTS=(); else AWS_OPTS=(--profile "$AWS_PROFILE"); fi
AWS_ACCOUNT="$(aws sts get-caller-identity "${AWS_OPTS[@]}" --query Account --output text)"
[ "$AWS_ACCOUNT" = "997901679385" ] || {
  echo "error: refusing to publish — AWS account $AWS_ACCOUNT is not 997901679385 (the $BUCKET owner)" >&2
  exit 1
}

say() { printf '\n\033[1;34m▶ %s\033[0m\n' "$*"; }

say "Build"
npm run build

say "Publish to s3://$BUCKET"
# Hashed assets get a long cache; index.html is re-read so new asset hashes load.
aws s3 sync dist/ "s3://$BUCKET/" "${AWS_OPTS[@]}" --delete \
  --exclude "index.html" --cache-control "max-age=31536000" >/dev/null
aws s3 cp dist/index.html "s3://$BUCKET/index.html" "${AWS_OPTS[@]}" \
  --content-type "text/html" --cache-control "no-cache" >/dev/null

say "Invalidate CloudFront"
aws cloudfront create-invalidation "${AWS_OPTS[@]}" \
  --distribution-id "$CLOUDFRONT" --paths "/*" >/dev/null

say "Deployed → https://khaotik-catalog.loswf.com/"
