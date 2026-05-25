#!/usr/bin/env bash
set -euo pipefail

echo "VPS deployment checklist:"
echo "1. Install Docker and Docker Compose plugin."
echo "2. Copy .env.example to .env and set production values."
echo "3. Point DNS A record to the VPS."
echo "4. Set CADDY_DOMAIN in .env."
echo "5. Run: docker compose -f infra/docker-compose.yml up -d --build"
echo "6. Run migrations if needed: docker compose -f infra/docker-compose.yml exec backend node apps/backend/dist/db/migrate.js"
