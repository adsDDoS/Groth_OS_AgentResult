export * from "./domain.js";

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
