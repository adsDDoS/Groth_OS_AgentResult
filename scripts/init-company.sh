#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="${1:-$ROOT_DIR/templates/company-profile/offer-brain.example.yaml}"

echo "Initialize a company from: $PROFILE"
echo "Next implementation step: parse YAML and POST normalized records into the backend."
echo "For now, copy this file, edit it, then use the API endpoints in docs/api.md."
