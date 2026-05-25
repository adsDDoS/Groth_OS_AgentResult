# Customer Onboarding

This guide helps any B2B company configure AI Growth OS.

## 1. Fill Offer Brain

Copy:

```text
templates/company-profile/offer-brain.example.yaml
```

Create a customer-specific file and fill:
- company profile
- products
- ICP profiles
- personas
- pains
- use cases
- objections
- proof points
- case studies
- competitors
- forbidden claims
- tone rules
- regions
- industries

## 2. Define Approval Owners

At minimum:
- content owner
- product/offer owner
- legal/compliance reviewer if needed
- publishing owner

## 3. Create Demand Map

Start with 20-50 high-quality opportunities:
- product pages
- pain pages
- comparison pages
- industry pages
- integration pages
- case pages
- FAQ pages
- calculator or audit pages

Do not create broad region batches until there is real local substance.

## 4. Build First Content Pack

Choose one weekly theme.

Generate:
- 1 SEO page or brief
- 2 Telegram posts
- 1 VC.ru or Habr-style article draft
- 1 email
- 1 lead magnet or checklist
- publishing calendar CSV

Use:

```bash
bash scripts/export-content-pack.sh 2026-05-week-1
```

## 5. Review And Approve

Before publication:
- verify proof
- remove unsupported claims
- confirm client names and competitor mentions
- check channel format
- approve in the backend

## 6. Add Integrations Gradually

Recommended order:
1. Telegram approval notifications.
2. Analytics import.
3. Website CMS export or API.
4. Email provider.
5. Social/community APIs where available.

Manual-first mode should remain available as the fallback.
