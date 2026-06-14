#!/usr/bin/env node

import {
  APPROVAL_STATUSES,
  CONTENT_STATUSES,
  DISTRIBUTION_SIGNAL_STATUSES,
  DOMAIN_ENTITIES,
  DOMAIN_TRANSITIONS,
  PUBLISHING_CALENDAR_STATUSES,
  canTransition,
  isKnownStatus,
  nextStatuses
} from "../packages/shared/dist/domain.js";

const expectedEntities = ["approval", "content_item", "publishing_calendar_item", "distribution_signal"];
const expectedStatusSets = {
  approval: APPROVAL_STATUSES,
  content_item: CONTENT_STATUSES,
  publishing_calendar_item: PUBLISHING_CALENDAR_STATUSES,
  distribution_signal: DISTRIBUTION_SIGNAL_STATUSES
};

const allowedTransitions = [
  ["approval", "pending", "approved"],
  ["approval", "changes_requested", "pending"],
  ["content_item", "review", "approved"],
  ["content_item", "approved", "qa_ready"],
  ["content_item", "handed_off", "published"],
  ["publishing_calendar_item", "review", "scheduled"],
  ["publishing_calendar_item", "scheduled", "handed_off"],
  ["publishing_calendar_item", "handed_off", "published"],
  ["distribution_signal", "expected", "awaiting_confirmation"],
  ["distribution_signal", "awaiting_confirmation", "confirmed"],
  ["distribution_signal", "confirmed", "actionable"]
];

const blockedTransitions = [
  ["approval", "approved", "pending"],
  ["approval", "rejected", "approved"],
  ["content_item", "review", "published"],
  ["content_item", "handed_off", "scheduled"],
  ["publishing_calendar_item", "published", "scheduled"],
  ["publishing_calendar_item", "archived", "published"],
  ["distribution_signal", "dismissed", "confirmed"],
  ["distribution_signal", "expected", "actionable"]
];

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(message);
}

for (const entity of expectedEntities) {
  if (!DOMAIN_ENTITIES.includes(entity)) fail(`missing entity: ${entity}`);
  const statuses = expectedStatusSets[entity];
  const transitionStatuses = Object.keys(DOMAIN_TRANSITIONS[entity] ?? {});
  for (const status of statuses) {
    if (!transitionStatuses.includes(status)) fail(`missing transition row: ${entity}.${status}`);
    if (!isKnownStatus(entity, status)) fail(`status not recognized: ${entity}.${status}`);
  }
}

for (const [entity, from, to] of allowedTransitions) {
  if (!canTransition(entity, from, to)) fail(`allowed transition rejected: ${entity}.${from}->${to}`);
  if (!nextStatuses(entity, from).includes(to)) fail(`nextStatuses missing: ${entity}.${from}->${to}`);
}

for (const [entity, from, to] of blockedTransitions) {
  if (canTransition(entity, from, to)) fail(`blocked transition allowed: ${entity}.${from}->${to}`);
}

if (failures > 0) process.exit(1);

console.log("Domain state machine check passed");
