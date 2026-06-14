import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../../db/client.js";
import { createApprovalRequest, decideApproval, reconcileApprovedCalendarApprovals } from "./service.js";

const paramsSchema = z.object({ id: z.string().uuid() });
const noteSchema = z.object({ note: z.string().optional() });
const createBodySchema = z.object({
  scope: z.string(),
  targetType: z.string(),
  targetId: z.string().uuid(),
  riskFlags: z.array(z.string()).optional(),
  summary: z.string().optional()
});

export async function approvalsRoutes(app: FastifyInstance) {
  app.get("/approvals", async (request) => {
    await reconcileApprovedCalendarApprovals(request.tenantId);
    const result = await query("select * from approvals where tenant_id = $1 order by created_at desc limit 200", [
      request.tenantId
    ]);
    return { data: result.rows };
  });

  app.post("/approvals", async (request) => {
    const body = createBodySchema.parse(request.body ?? {});
    return {
      data: await createApprovalRequest({
        tenantId: request.tenantId,
        scope: body.scope,
        targetType: body.targetType,
        targetId: body.targetId,
        requestedBy: request.userId,
        riskFlags: body.riskFlags,
        summary: body.summary
      })
    };
  });

  app.post("/approvals/:id/approve", async (request) => {
    const { id } = paramsSchema.parse(request.params);
    const { note } = noteSchema.parse(request.body ?? {});
    return { data: await decideApproval({ id, tenantId: request.tenantId, status: "approved", decidedBy: request.userId, decisionNote: note }) };
  });

  app.post("/approvals/:id/reject", async (request) => {
    const { id } = paramsSchema.parse(request.params);
    const { note } = noteSchema.parse(request.body ?? {});
    return { data: await decideApproval({ id, tenantId: request.tenantId, status: "rejected", decidedBy: request.userId, decisionNote: note }) };
  });

  app.post("/approvals/:id/request-changes", async (request) => {
    const { id } = paramsSchema.parse(request.params);
    const { note } = noteSchema.parse(request.body ?? {});
    return { data: await decideApproval({ id, tenantId: request.tenantId, status: "changes_requested", decidedBy: request.userId, decisionNote: note }) };
  });
}
