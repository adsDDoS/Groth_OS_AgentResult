#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/agentresult-os/app}"
original_command="${SSH_ORIGINAL_COMMAND:-}"

case "$original_command" in
  "")
    ;;
  EXPECTED_OWNER_IMAGE_TAG=*)
    EXPECTED_OWNER_IMAGE_TAG="${original_command#EXPECTED_OWNER_IMAGE_TAG=}"
    case "$EXPECTED_OWNER_IMAGE_TAG" in
      ""|*[!A-Za-z0-9_.-]*)
        echo "unsupported EXPECTED_OWNER_IMAGE_TAG" >&2
        exit 64
        ;;
    esac
    export EXPECTED_OWNER_IMAGE_TAG
    ;;
  *)
    echo "unsupported forced command" >&2
    exit 64
    ;;
esac

cd "$APP_DIR"
AGENTRESULT_VPS_HEALTH_LOCAL=1 npm run vps:agentresult-health
