# GrothOS Public Dashboard

Static AgentResult/GrothOS dashboard deployed to Vercel project `adsddosss-4657s-projects/dashboard`.

## Source Of Truth

This directory is the durable source for the current public dashboard deployment:

- Static UI: `index.html`, `app.js`, `styles.css`, `styles/`, `modules/`
- Demo API: `api/os-demo.js`
- Vercel routing: `vercel.json`
- Production alias: `https://dashboard-orpin-mu-26.vercel.app`

## Local Checks

```sh
npm run check
npm run build
npm run vercel:build
```

For manual browser QA:

```sh
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/?demo=reset&v=local#/publications
http://localhost:4173/?demo=pilot-execution&v=local#/overview
```

## Publications Smoke

Use `/?demo=reset` before each manual run.

1. Open `#/publications`.
2. Confirm there is one pending topic approval and no stale `p3`/manual package item asking for approval.
3. Click `Согласовать пакет недели`.
4. Confirm route moves to `#/content-pipeline`.
5. Click `QA пройден`.
6. Confirm the item appears in release queue with QA evidence `5/5`.
7. Click `К проверке выхода`.
8. Click `Подтвердить результат` or `Отметить: вышло`.
9. Confirm release queue count is `0`, published count increments, and next action is `Открыть результаты`.

## Deploy

### GitHub/Vercel Git Deployment

Current monorepo remote:

```sh
git remote -v
# origin git@github.com:adsDDoS/Groth_OS_AgentResult.git
```

Target source repo:

```text
git@github.com:adsDDoS/Groth_OS_AgentResult.git
```

To make production update from commits/PRs:

1. Use the existing GitHub repo `adsDDoS/Groth_OS_AgentResult`.
2. Push dashboard changes to `main`:

```sh
git push -u origin main
```

3. Add a GitHub Login Connection to the Vercel account/team `adsddosss-4657s-projects`.
4. Connect the Vercel project to `adsDDoS/Groth_OS_AgentResult` with root directory `apps/dashboard`.
5. If using the CLI, connect the linked Vercel project:

```sh
npm run git:connect
```

6. Verify the project is Git-backed:

```sh
npx vercel project inspect dashboard --scope adsddosss-4657s-projects
```

After this, use GitHub commits/PRs as the production deploy path. Keep prebuilt deploy as an emergency fallback only.

### Prebuilt Fallback

The folder must be linked to the existing Vercel project:

```sh
npx vercel link --yes --scope adsddosss-4657s-projects --project dashboard
npx vercel pull --yes --environment production --scope adsddosss-4657s-projects
```

Build and deploy:

```sh
npm run build
npm run vercel:build
npm run deploy
```

After deploy, verify:

```sh
npx vercel inspect https://dashboard-orpin-mu-26.vercel.app --scope adsddosss-4657s-projects
```

Then run the publications smoke on:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=reset&v=prod-smoke#/publications
```

## Current Production Fix

The publications flow includes two safeguards:

- `app.js` reconciles approved `publishing_calendar_item` approvals into scheduled calendar items without overwriting `scheduled`, `handed_off`, or `published`.
- `modules/publications.js` only shows calendar items in the `Темы недели` decision column when a matching pending calendar approval exists.
