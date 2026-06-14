export const APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "changes_requested"
] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const CONTENT_STATUSES = [
  "idea",
  "draft",
  "review",
  "changes_requested",
  "approved",
  "qa_ready",
  "scheduled",
  "handed_off",
  "published",
  "archived",
  "rejected"
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const PUBLISHING_CALENDAR_STATUSES = [
  "draft",
  "review",
  "scheduled",
  "handed_off",
  "published",
  "archived",
  "rejected"
] as const;

export type PublishingCalendarStatus = (typeof PUBLISHING_CALENDAR_STATUSES)[number];

export const DISTRIBUTION_SIGNAL_STATUSES = [
  "expected",
  "awaiting_confirmation",
  "confirmed",
  "actionable",
  "dismissed"
] as const;

export type DistributionSignalStatus = (typeof DISTRIBUTION_SIGNAL_STATUSES)[number];

export const RESULT_SIGNAL_STATUSES = DISTRIBUTION_SIGNAL_STATUSES;
export type ResultSignalStatus = DistributionSignalStatus;

export const DOMAIN_ENTITIES = [
  "approval",
  "content_item",
  "publishing_calendar_item",
  "distribution_signal"
] as const;

export type DomainEntity = (typeof DOMAIN_ENTITIES)[number];

export type DomainStatusByEntity = {
  approval: ApprovalStatus;
  content_item: ContentStatus;
  publishing_calendar_item: PublishingCalendarStatus;
  distribution_signal: DistributionSignalStatus;
};

export const DOMAIN_STATUSES = {
  approval: APPROVAL_STATUSES,
  content_item: CONTENT_STATUSES,
  publishing_calendar_item: PUBLISHING_CALENDAR_STATUSES,
  distribution_signal: DISTRIBUTION_SIGNAL_STATUSES
} as const;

export const DOMAIN_TRANSITIONS = {
  approval: {
    pending: ["approved", "rejected", "changes_requested"],
    approved: [],
    rejected: [],
    changes_requested: ["pending"]
  },
  content_item: {
    idea: ["draft"],
    draft: ["review"],
    review: ["approved", "changes_requested"],
    changes_requested: ["draft"],
    approved: ["qa_ready", "archived"],
    qa_ready: ["scheduled"],
    scheduled: ["handed_off", "archived"],
    handed_off: ["published"],
    published: ["archived"],
    archived: [],
    rejected: ["archived"]
  },
  publishing_calendar_item: {
    draft: ["review", "rejected"],
    review: ["scheduled", "rejected"],
    scheduled: ["handed_off", "archived"],
    handed_off: ["published", "archived"],
    published: ["archived"],
    archived: [],
    rejected: []
  },
  distribution_signal: {
    expected: ["awaiting_confirmation"],
    awaiting_confirmation: ["confirmed"],
    confirmed: ["actionable", "dismissed"],
    actionable: ["dismissed"],
    dismissed: []
  }
} as const satisfies {
  [Entity in DomainEntity]: {
    [Status in DomainStatusByEntity[Entity]]: readonly DomainStatusByEntity[Entity][];
  };
};

export type DomainStatus<Entity extends DomainEntity = DomainEntity> = DomainStatusByEntity[Entity];

type DomainTransitionMap<Entity extends DomainEntity> = Record<
  DomainStatusByEntity[Entity],
  readonly DomainStatusByEntity[Entity][]
>;

export function isKnownStatus<Entity extends DomainEntity>(
  entity: Entity,
  status: string
): status is DomainStatusByEntity[Entity] {
  return (DOMAIN_STATUSES[entity] as readonly string[]).includes(status);
}

export function canTransition<Entity extends DomainEntity>(
  entity: Entity,
  from: DomainStatusByEntity[Entity],
  to: DomainStatusByEntity[Entity]
) {
  const transitions = DOMAIN_TRANSITIONS[entity] as DomainTransitionMap<Entity>;
  return transitions[from].includes(to);
}

export function nextStatuses<Entity extends DomainEntity>(
  entity: Entity,
  from: DomainStatusByEntity[Entity]
) {
  const transitions = DOMAIN_TRANSITIONS[entity] as DomainTransitionMap<Entity>;
  return transitions[from];
}

export const APPROVAL_SCOPES = [
  "publish",
  "live_update",
  "newsletter_send",
  "social_post",
  "bulk_programmatic_pages",
  "sensitive_claim"
] as const;

export type ApprovalScope = (typeof APPROVAL_SCOPES)[number];
