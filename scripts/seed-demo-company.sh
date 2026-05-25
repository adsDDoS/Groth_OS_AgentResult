#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"
TENANT_ID="${TENANT_ID:-00000000-0000-0000-0000-000000000001}"

curl -sS -X PUT "$API_URL/offer" \
  -H "content-type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "name": "Demo B2B Company",
    "profile": {
      "positioning": "Evidence-led B2B growth operations platform",
      "tone": ["practical", "specific", "no hype"]
    }
  }'

curl -sS -X POST "$API_URL/products" \
  -H "content-type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "name": "AI Growth OS",
    "category": "B2B Growth System",
    "description": "Approval-first operating system for demand maps, SEO/GEO content, proof assets, and publishing workflows."
  }'

echo
echo "Demo company seeded."
