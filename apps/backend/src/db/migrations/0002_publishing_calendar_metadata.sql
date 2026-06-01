alter table publishing_calendar_items
  add column if not exists metadata jsonb not null default '{}';
