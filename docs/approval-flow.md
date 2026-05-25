# Approval Flow

Human approval is mandatory before:

- Publishing to any channel.
- Updating live website content.
- Sending newsletters.
- Posting to Telegram, VK, VC.ru, Habr, or partner channels.
- Creating large batches of programmatic pages.
- Making claims involving revenue, guarantees, legal/compliance, client names, or competitor comparisons.

## Statuses

- `idea`
- `research`
- `brief`
- `draft`
- `review`
- `approved`
- `scheduled`
- `published`
- `improving`
- `archived`
- `blocked`

## Approval Records

The `approvals` table stores:
- scope
- target type
- target id
- status
- risk flags
- requested by
- decided by
- decision note

Publishing endpoints call approval checks before creating jobs.

## Recommended QA Checklist

- Is the claim supported?
- Is the source approved for public use?
- Are client names approved?
- Is the competitor comparison factual and sourced?
- Is the content useful and specific?
- Is the channel format correct?
- Are links, UTM tags, and metadata ready?
