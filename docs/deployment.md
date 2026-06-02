# Deployment

## Local Docker

```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d --build
```

## Dashboard Vercel

Use the smoke-gated deploy command from the repository root:

```bash
npm run dashboard:deploy
```

This runs the owner-flow smoke suite before production deploy:

- Today cockpit
- Strategy
- Company setup
- Publications manual handoff
- Results handoff signal
- release confirmation
- RU/ENG switch

For a local check without deploy:

```bash
npm run dashboard:smoke
```

The GitHub Actions workflow `.github/workflows/dashboard-smoke.yml` runs the same smoke suite on pull requests and pushes to `main`.

## VPS

1. Create a Linux VPS.
2. Install Docker and Docker Compose plugin.
3. Clone your repository.
4. Copy `.env.example` to `.env`.
5. Set production values:
   - `DATABASE_URL`
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - `OPENROUTER_API_KEY`
   - `CADDY_DOMAIN`
   - optional Telegram and SMTP values
6. Point DNS to the VPS.
7. Start services:

```bash
docker compose -f infra/docker-compose.yml up -d --build
```

8. Check health:

```bash
curl https://your-domain.example/health
```

## Backups

```bash
bash scripts/backup-postgres.sh
```

Store backups outside the VPS as well.

## Production Notes

- Replace dev tenant auth with proper authentication before customer use.
- Rotate secrets.
- Restrict database ports.
- Use API keys for agent workers.
- Enable logs and monitoring.
- Test restore from backup.
