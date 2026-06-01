create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  plan text not null default 'template',
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into tenants (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Demo B2B Company', 'demo')
on conflict (id) do nothing;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'editor',
  profile jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  role text not null,
  name text not null,
  description text,
  provider text not null default 'openrouter',
  model text,
  policy_refs text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  agent_role text not null,
  task_type text not null,
  target_type text,
  target_id uuid,
  status text not null default 'queued',
  priority integer not null default 0,
  payload jsonb not null default '{}',
  result jsonb not null default '{}',
  created_by uuid,
  assigned_to uuid,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists task_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  provider text not null,
  model text,
  status text not null default 'started',
  input jsonb not null default '{}',
  output jsonb not null default '{}',
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists task_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  scope text not null,
  target_type text not null,
  target_id uuid not null,
  status text not null default 'pending',
  summary text,
  risk_flags text[] not null default '{}',
  requested_by uuid,
  decided_by uuid,
  decision_note text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  provider text not null,
  status text not null default 'configured',
  config jsonb not null default '{}',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  website_url text,
  profile jsonb not null default '{}',
  positioning text,
  tone_of_voice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  name text not null,
  category text,
  description text,
  pricing_notes text,
  differentiators jsonb not null default '[]',
  integrations jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists icp_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  segment text,
  firmographics jsonb not null default '{}',
  buying_triggers jsonb not null default '[]',
  disqualifiers jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists personas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  icp_profile_id uuid references icp_profiles(id) on delete set null,
  name text not null,
  role text,
  goals jsonb not null default '[]',
  pains jsonb not null default '[]',
  objections jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  severity text,
  description text,
  evidence_required text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists use_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  buyer_stage text,
  description text,
  success_metrics jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists objections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  response text,
  proof_needed text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists proof_points (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  proof_type text not null default 'claim',
  source_url text,
  source_note text,
  confidence text not null default 'needs_review',
  approved_for_public_use boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists case_studies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  customer_name text,
  anonymized boolean not null default true,
  industry text,
  before_state text,
  after_state text,
  metrics jsonb not null default '[]',
  narrative jsonb not null default '{}',
  approval_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  website_url text,
  positioning text,
  pricing_notes text,
  watch_level text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists forbidden_claims (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  claim text not null,
  reason text,
  replacement_guidance text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tone_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  rule text not null,
  examples jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists demand_map_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  item_type text not null,
  title text not null,
  slug text,
  intent text,
  audience text,
  product_id uuid references products(id) on delete set null,
  status text not null default 'idea',
  priority integer not null default 0,
  evidence_requirements jsonb not null default '[]',
  notes jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  demand_map_item_id uuid references demand_map_items(id) on delete set null,
  title text not null,
  content_type text not null,
  channel text not null default 'website',
  status text not null default 'idea',
  owner_id uuid,
  target_url text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_briefs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid not null references content_items(id) on delete cascade,
  version integer not null default 1,
  brief_md text not null,
  research jsonb not null default '{}',
  created_by_agent text,
  created_at timestamptz not null default now()
);

create table if not exists content_drafts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid not null references content_items(id) on delete cascade,
  version integer not null default 1,
  draft_md text not null,
  qa_notes jsonb not null default '{}',
  created_by_agent text,
  created_at timestamptz not null default now()
);

create table if not exists content_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid not null references content_items(id) on delete cascade,
  version integer not null,
  body_md text not null,
  change_note text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists content_comments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid not null references content_items(id) on delete cascade,
  user_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists content_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid references content_items(id) on delete cascade,
  asset_type text not null,
  title text,
  uri text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists internal_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  source_content_item_id uuid references content_items(id) on delete cascade,
  target_content_item_id uuid references content_items(id) on delete cascade,
  anchor_text text,
  rationale text,
  status text not null default 'suggested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists seo_keywords (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  keyword text not null,
  locale text not null default 'ru-RU',
  intent text,
  volume_estimate integer,
  difficulty_estimate integer,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists search_intents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  expected_assets jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists page_clusters (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  cluster_type text not null,
  parent_content_item_id uuid references content_items(id) on delete set null,
  notes jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists schema_recommendations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid references content_items(id) on delete cascade,
  schema_type text not null,
  json_ld jsonb not null,
  status text not null default 'suggested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_answer_blocks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid references content_items(id) on delete cascade,
  question text not null,
  answer text not null,
  citations jsonb not null default '[]',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists llms_txt_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  version integer not null default 1,
  body text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists publishing_channels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  channel text not null,
  mode text not null default 'manual_export',
  config jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, channel)
);

create table if not exists publishing_calendar_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid references content_items(id) on delete set null,
  channel text not null,
  title text not null,
  status text not null default 'review',
  scheduled_for timestamptz,
  timezone text not null default 'UTC',
  export_path text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists publishing_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  calendar_item_id uuid references publishing_calendar_items(id) on delete cascade,
  channel text,
  status text not null default 'queued',
  requested_by uuid,
  result jsonb not null default '{}',
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists published_urls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid references content_items(id) on delete set null,
  channel text not null,
  url text not null,
  published_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_magnets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  type text not null,
  status text not null default 'idea',
  audience text,
  body_md text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists calculators (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  lead_magnet_id uuid references lead_magnets(id) on delete set null,
  name text not null,
  formula jsonb not null default '{}',
  fields jsonb not null default '[]',
  output_template text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists downloadable_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  lead_magnet_id uuid references lead_magnets(id) on delete set null,
  asset_type text not null,
  uri text,
  title text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists analytics_imports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  source text not null,
  period_start date,
  period_end date,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists page_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid references content_items(id) on delete set null,
  url text,
  metric_date date not null,
  impressions integer not null default 0,
  clicks integer not null default 0,
  conversions integer not null default 0,
  avg_position numeric,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists channel_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  channel text not null,
  metric_date date not null,
  reach integer not null default 0,
  engagements integer not null default 0,
  clicks integer not null default 0,
  conversions integer not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversion_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid references content_items(id) on delete set null,
  source text,
  event_type text not null,
  value numeric,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists improvement_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  content_item_id uuid references content_items(id) on delete set null,
  title text not null,
  rationale text,
  priority integer not null default 0,
  status text not null default 'idea',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists competitor_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  competitor_id uuid not null references competitors(id) on delete cascade,
  captured_at timestamptz not null default now(),
  source_url text,
  snapshot jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists competitor_content_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  competitor_id uuid references competitors(id) on delete cascade,
  title text not null,
  url text,
  content_type text,
  detected_at timestamptz not null default now(),
  notes jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_gaps (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  competitor_id uuid references competitors(id) on delete set null,
  title text not null,
  gap_type text not null,
  opportunity text,
  priority integer not null default 0,
  status text not null default 'idea',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_tenant_status on tasks (tenant_id, status);
create index if not exists idx_approvals_tenant_status on approvals (tenant_id, status);
create index if not exists idx_content_items_tenant_status on content_items (tenant_id, status);
create index if not exists idx_demand_map_tenant_type on demand_map_items (tenant_id, item_type);
create index if not exists idx_calendar_tenant_scheduled on publishing_calendar_items (tenant_id, scheduled_for);
create index if not exists idx_page_metrics_tenant_date on page_metrics (tenant_id, metric_date);

insert into agents (role, name, description, policy_refs)
values
  ('growth_orchestrator', 'Growth Orchestrator', 'Plans demand maps and coordinates agent workflows.', array['GROWTH_POLICY.md', 'CONTENT_POLICY.md']),
  ('offer_architect', 'Offer Architect Agent', 'Turns company input into reusable offer brain assets.', array['GROWTH_POLICY.md']),
  ('seo_research', 'SEO Research Agent', 'Builds intent, cluster, internal linking, and evidence plans.', array['CONTENT_POLICY.md']),
  ('geo_ai_search', 'GEO / AI Search Agent', 'Creates concise answer blocks, entity briefs, and llms.txt drafts.', array['GEO_POLICY.md']),
  ('page_brief', 'Page Brief Agent', 'Creates structured briefs before drafts.', array['CONTENT_POLICY.md']),
  ('content_writer', 'Content Writer Agent', 'Drafts useful B2B content from approved briefs and proof.', array['CONTENT_POLICY.md']),
  ('social_repurposing', 'Social Repurposing Agent', 'Repurposes approved ideas for social and community channels.', array['CONTENT_POLICY.md']),
  ('proof_case', 'Proof / Case Agent', 'Builds case studies, proof assets, and evidence checklists.', array['GROWTH_POLICY.md']),
  ('lead_magnet', 'Lead Magnet Agent', 'Creates calculators, checklists, audits, and templates.', array['CONTENT_POLICY.md']),
  ('analytics', 'Analytics Agent', 'Turns performance imports into improvement tasks.', array['GROWTH_POLICY.md']),
  ('competitor_watch', 'Competitor Watch Agent', 'Monitors competitor messaging and gaps.', array['GROWTH_POLICY.md']),
  ('publishing_qa', 'Publishing QA Agent', 'Checks drafts before approval and export.', array['CONTENT_POLICY.md', 'GEO_POLICY.md'])
on conflict do nothing;

insert into publishing_channels (tenant_id, channel, mode)
values
  ('00000000-0000-0000-0000-000000000001', 'website', 'manual_export'),
  ('00000000-0000-0000-0000-000000000001', 'telegram', 'manual_export'),
  ('00000000-0000-0000-0000-000000000001', 'vk', 'manual_export'),
  ('00000000-0000-0000-0000-000000000001', 'vc', 'manual_export'),
  ('00000000-0000-0000-0000-000000000001', 'habr', 'manual_export'),
  ('00000000-0000-0000-0000-000000000001', 'email', 'manual_export')
on conflict do nothing;
