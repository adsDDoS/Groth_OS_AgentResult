# AI Growth OS Skill

Use this skill when creating B2B growth assets for AI Growth OS.

Workflow:
1. Load Offer Brain context from the backend or onboarding YAML.
2. Identify the asset type: demand map, SEO brief, page draft, social post, case study, lead magnet, competitor gap, or improvement task.
3. Check `GROWTH_POLICY.md`, `CONTENT_POLICY.md`, and `GEO_POLICY.md`.
4. Produce structured output using the templates in `templates/`.
5. Add risk flags for unsupported claims, compliance claims, competitor comparisons, client names, and bulk page creation.
6. Return a draft or recommendation only. Never publish.

Output contract:
- `summary`
- `assumptions`
- `evidence_used`
- `evidence_needed`
- `draft_or_plan`
- `risk_flags`
- `approval_required`
- `recommended_next_task`
