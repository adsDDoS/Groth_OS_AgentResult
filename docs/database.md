# Database

Postgres is the source of truth.

The initial schema is in:

```text
apps/backend/src/db/migrations/0001_initial.sql
```

## Core

- `tenants`
- `users`
- `agents`
- `tasks`
- `task_comments`
- `task_runs`
- `task_events`
- `approvals`
- `integrations`

## Offer Brain

- `companies`
- `products`
- `icp_profiles`
- `personas`
- `pains`
- `use_cases`
- `objections`
- `proof_points`
- `case_studies`
- `competitors`
- `forbidden_claims`
- `tone_rules`

## Demand / Content

- `demand_map_items`
- `content_items`
- `content_briefs`
- `content_drafts`
- `content_versions`
- `content_comments`
- `content_assets`
- `internal_links`

## SEO/GEO

- `seo_keywords`
- `search_intents`
- `page_clusters`
- `schema_recommendations`
- `ai_answer_blocks`
- `llms_txt_versions`

## Publishing

- `publishing_channels`
- `publishing_calendar_items`
- `publishing_jobs`
- `published_urls`

## Lead Magnets

- `lead_magnets`
- `calculators`
- `downloadable_assets`

## Analytics

- `analytics_imports`
- `page_metrics`
- `channel_metrics`
- `conversion_events`
- `improvement_tasks`

## Competitor Watch

- `competitor_snapshots`
- `competitor_content_items`
- `content_gaps`

## Notes

The schema intentionally uses `jsonb` for evolving agent outputs, research payloads, metadata, formulas, and channel configs. Stable workflow state is kept in normal columns so approvals, tasks, and publishing can be queried reliably.
