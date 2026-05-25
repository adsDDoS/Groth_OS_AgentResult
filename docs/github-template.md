# GitHub Template Repository

Use these steps to publish AI Growth OS as a GitHub template.

## Create Repository

```bash
cd ai-growth-os
git init
git add .
git commit -m "Initial AI Growth OS template"
git branch -M main
git remote add origin git@github.com:YOUR_ORG/ai-growth-os.git
git push -u origin main
```

## Enable Template Mode

1. Open the repository on GitHub.
2. Go to `Settings`.
3. Enable `Template repository`.
4. Add topics:
   - `b2b`
   - `growth`
   - `seo`
   - `geo`
   - `ai-agents`
   - `content-operations`
   - `postgres`
   - `fastify`
   - `docker-compose`

## Recommended Repository Description

```text
Approval-first AI Growth OS for B2B demand maps, SEO/GEO content operations, agent workflows, proof assets, and manual-first publishing packs.
```

## First Release

Create a release tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Release notes:
- Backend API skeleton.
- Postgres schema.
- Hermes-compatible agent template.
- Manual-first content exports.
- SEO/GEO and content templates.
- VPS Docker deployment.

## Customer Fork Flow

Customers should click `Use this template`, create a private repository, edit `.env`, fill `templates/company-profile/offer-brain.example.yaml`, and follow `docs/customer-onboarding.md`.
