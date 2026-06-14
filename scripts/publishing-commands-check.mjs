#!/usr/bin/env node

import { existsSync, unlinkSync } from "node:fs";
import { randomUUID } from "node:crypto";
import fastify from "fastify";

const tenantId = "00000000-0000-0000-0000-000000000001";
const localDataFile = `/tmp/agentresult-publishing-commands-${Date.now()}.json`;

process.env.AI_GROWTH_OS_STORAGE = "local";
process.env.AI_GROWTH_OS_LOCAL_DATA_FILE = localDataFile;

const { authPlugin } = await import("../apps/backend/dist/modules/auth/plugin.js");
const { registerRoutes } = await import("../apps/backend/dist/routes.js");
const { insertJson } = await import("../apps/backend/dist/modules/common/repository.js");
const { query } = await import("../apps/backend/dist/db/client.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const app = fastify({ logger: false });
await authPlugin(app);
await registerRoutes(app);
app.setErrorHandler((error, _request, reply) => {
  const normalizedError = error instanceof Error ? error : new Error("Unknown error");
  const statusCode = Number(normalizedError.statusCode ?? 500);
  reply.status(statusCode).send({
    error: normalizedError.name,
    message: normalizedError.message,
    code: normalizedError.code
  });
});

try {
  const content = await insertJson("content_items", {
    title: `Publishing command check ${randomUUID()}`,
    content_type: "telegram_post",
    channel: "telegram",
    status: "scheduled",
    metadata: {}
  }, tenantId);

  const directCalendar = await insertJson("publishing_calendar_items", {
    content_item_id: content.id,
    channel: "telegram",
    title: "Direct publish should fail",
    status: "scheduled",
    scheduled_for: null,
    timezone: "Europe/Moscow",
    export_path: null,
    metadata: {}
  }, tenantId);

  const directPublish = await app.inject({
    method: "POST",
    url: `/publishing/items/${directCalendar.id}/confirm-live`,
    payload: {}
  });
  assert(directPublish.statusCode === 409, `scheduled -> published should be rejected, saw ${directPublish.statusCode}`);

  const calendar = await insertJson("publishing_calendar_items", {
    content_item_id: content.id,
    channel: "telegram",
    title: "Publishing command should pass",
    status: "scheduled",
    scheduled_for: null,
    timezone: "Europe/Moscow",
    export_path: null,
    metadata: {}
  }, tenantId);

  const handoff = await app.inject({
    method: "POST",
    url: `/publishing/items/${calendar.id}/handoff`,
    payload: { note: "Manager moved to live check" }
  });
  assert(handoff.statusCode === 200, `handoff command failed: ${handoff.statusCode} ${handoff.body}`);
  const handedOff = handoff.json().data;
  assert(handedOff.status === "handed_off", `handoff status mismatch: ${handedOff.status}`);
  assert(handedOff.metadata?.handoff_note === "Manager moved to live check", "handoff note missing");

  const confirmLive = await app.inject({
    method: "POST",
    url: `/publishing/items/${calendar.id}/confirm-live`,
    payload: {
      note: "Owner confirmed live result",
      publicationUrl: "https://t.me/agentresult/100",
      format: "telegram_post",
      primaryReactions: {
        comments: 2,
        reposts: 1,
        saves: 3,
        reactions: 8
      },
      nextStep: "reuse",
      nextStepNote: "Reuse the strongest angle in the next material."
    }
  });
  assert(confirmLive.statusCode === 200, `confirm-live command failed: ${confirmLive.statusCode} ${confirmLive.body}`);
  const published = confirmLive.json().data;
  assert(published.status === "published", `confirm-live status mismatch: ${published.status}`);
  assert(published.metadata?.result_note === "Owner confirmed live result", "result note missing");
  assert(published.metadata?.publication_result?.publication_url === "https://t.me/agentresult/100", "publication URL missing");
  assert(published.metadata?.publication_result?.next_step === "reuse", "publication next step missing");

  const contentRows = await query("select * from content_items where id = $1 and tenant_id = $2", [content.id, tenantId]);
  assert(contentRows.rows[0]?.status === "published", `linked content should be published, saw ${contentRows.rows[0]?.status}`);

  const distributionSignals = await app.inject({
    method: "GET",
    url: "/distribution-signals"
  });
  assert(distributionSignals.statusCode === 200, `distribution-signals failed: ${distributionSignals.statusCode} ${distributionSignals.body}`);
  const signal = distributionSignals.json().data.find((item) => item.calendar_item_id === calendar.id);
  assert(signal?.status === "confirmed", `distribution signal should be confirmed, saw ${signal?.status}`);
  assert(signal?.signal_type === "distribution_signal.confirmed", `distribution signal type mismatch: ${signal?.signal_type}`);
  assert(signal?.note === "Owner confirmed live result", "distribution signal note missing");

  const compatibilitySignals = await app.inject({
    method: "GET",
    url: "/result-signals"
  });
  assert(compatibilitySignals.statusCode === 200, `result-signals compatibility failed: ${compatibilitySignals.statusCode} ${compatibilitySignals.body}`);

  const publicationResults = await app.inject({
    method: "GET",
    url: "/publication-results"
  });
  assert(publicationResults.statusCode === 200, `publication-results failed: ${publicationResults.statusCode} ${publicationResults.body}`);
  const publicationResult = publicationResults.json().data.find((item) => item.calendar_item_id === calendar.id);
  assert(publicationResult?.channel === "telegram", `publication result channel mismatch: ${publicationResult?.channel}`);
  assert(publicationResult?.format === "telegram_post", `publication result format mismatch: ${publicationResult?.format}`);
  assert(publicationResult?.publication_url === "https://t.me/agentresult/100", `publication result URL mismatch: ${publicationResult?.publication_url}`);
  assert(Number(publicationResult?.primary_reactions?.comments) === 2, "publication result comments mismatch");
  assert(publicationResult?.next_step === "reuse", `publication result next step mismatch: ${publicationResult?.next_step}`);

  const reuse = await app.inject({
    method: "POST",
    url: `/publication-results/${publicationResult.id}/reuse`,
    payload: { note: "Reuse as Telegram follow-up." }
  });
  assert(reuse.statusCode === 200, `publication result reuse failed: ${reuse.statusCode} ${reuse.body}`);
  const reuseData = reuse.json().data;
  assert(reuseData.action?.type === "reuse", "reuse action type mismatch");
  assert(reuseData.action?.target_type === "content_item", "reuse target type mismatch");
  assert(reuseData.target?.content_type === "telegram_post", `reuse content type mismatch: ${reuseData.target?.content_type}`);
  assert(reuseData.publication_result?.metadata?.calendar?.publication_result?.next_step_action?.target_id === reuseData.target.id, "reuse action not persisted");

  const reuseAgain = await app.inject({
    method: "POST",
    url: `/publication-results/${publicationResult.id}/reuse`,
    payload: { note: "Should not duplicate." }
  });
  assert(reuseAgain.statusCode === 200, `publication result reuse idempotency failed: ${reuseAgain.statusCode} ${reuseAgain.body}`);
  assert(reuseAgain.json().data.action?.target_id === reuseData.target.id, "reuse command should be idempotent");

  const expand = await app.inject({
    method: "POST",
    url: `/publication-results/${publicationResult.id}/expand`,
    payload: { note: "Expand into a longer article." }
  });
  assert(expand.statusCode === 200, `publication result expand failed: ${expand.statusCode} ${expand.body}`);
  const expandData = expand.json().data;
  assert(expandData.action?.type === "expand", "expand action type mismatch");
  assert(expandData.target?.content_type === "article_outline", `expand content type mismatch: ${expandData.target?.content_type}`);
  assert(expandData.target?.channel === "website", `expand channel mismatch: ${expandData.target?.channel}`);

  const update = await app.inject({
    method: "POST",
    url: `/publication-results/${publicationResult.id}/update`,
    payload: { note: "Update the published material with first reactions." }
  });
  assert(update.statusCode === 200, `publication result update failed: ${update.statusCode} ${update.body}`);
  const updateData = update.json().data;
  assert(updateData.action?.type === "update", "update action type mismatch");
  assert(updateData.action?.target_type === "task", "update target type mismatch");
  assert(updateData.target?.task_type === "publication_result_update", `update task type mismatch: ${updateData.target?.task_type}`);
  assert(updateData.target?.payload?.publicationResultId === publicationResult.id, "update task should reference publication result");

  const analytics = await app.inject({
    method: "GET",
    url: "/analytics/overview"
  });
  assert(analytics.statusCode === 200, `analytics overview failed: ${analytics.statusCode} ${analytics.body}`);
  assert(Number(analytics.json().data.distribution_signals) >= 1, "analytics should count distribution_signals");
  assert(Number(analytics.json().data.result_signals) >= 1, "analytics should keep result_signals compatibility count");

  console.log("Publishing commands check passed");
} finally {
  await app.close();
  if (existsSync(localDataFile)) unlinkSync(localDataFile);
}
