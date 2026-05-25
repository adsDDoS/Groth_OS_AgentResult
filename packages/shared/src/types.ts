export const CONTENT_STATUSES = [
  "idea",
  "research",
  "brief",
  "draft",
  "review",
  "approved",
  "scheduled",
  "published",
  "improving",
  "archived",
  "blocked"
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const APPROVAL_SCOPES = [
  "publish",
  "live_update",
  "newsletter_send",
  "social_post",
  "bulk_programmatic_pages",
  "sensitive_claim"
] as const;

export type ApprovalScope = (typeof APPROVAL_SCOPES)[number];

export type Channel =
  | "website"
  | "telegram"
  | "vk"
  | "vc"
  | "habr"
  | "email"
  | "linkedin_style"
  | "partner"
  | "manual_export";

export type AgentRole =
  | "growth_orchestrator"
  | "offer_architect"
  | "seo_research"
  | "geo_ai_search"
  | "page_brief"
  | "content_writer"
  | "social_repurposing"
  | "proof_case"
  | "lead_magnet"
  | "analytics"
  | "competitor_watch"
  | "publishing_qa";

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ManualExportManifest {
  tenantId: string;
  exportId: string;
  period: string;
  createdAt: string;
  sections: string[];
}
