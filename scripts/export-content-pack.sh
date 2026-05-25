#!/usr/bin/env bash
set -euo pipefail

PERIOD="${1:-$(date +%Y-%m-week-%V)}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPORT_DIR="$ROOT_DIR/exports/$PERIOD"

mkdir -p "$EXPORT_DIR/seo-pages" \
  "$EXPORT_DIR/telegram-posts" \
  "$EXPORT_DIR/vc-articles" \
  "$EXPORT_DIR/email-newsletter" \
  "$EXPORT_DIR/lead-magnet"

cat > "$EXPORT_DIR/publishing-calendar.csv" <<CSV
date,channel,title,status,approval_owner,source_content_id
CSV

cat > "$EXPORT_DIR/README.md" <<MD
# Manual Content Pack: $PERIOD

This pack is generated for manual-first distribution.

Required before publication:
- Human approval in AI Growth OS.
- Publishing QA review.
- Claim and proof check.
- UTM/link check.

Folders:
- seo-pages/
- telegram-posts/
- vc-articles/
- email-newsletter/
- lead-magnet/
- publishing-calendar.csv
MD

echo "Created $EXPORT_DIR"
