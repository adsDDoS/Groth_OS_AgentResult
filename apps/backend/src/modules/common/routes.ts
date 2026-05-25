import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { insertJson, listRows, patchJson } from "./repository.js";

const createPayload = z.record(z.unknown());

export function registerCrudRoutes(
  app: FastifyInstance,
  options: {
    prefix: string;
    table: string;
    tenantScoped?: boolean;
    routes?: {
      list?: string;
      create?: string;
      patch?: string;
    };
  }
) {
  const listPath = options.routes?.list ?? options.prefix;
  const createPath = options.routes?.create ?? options.prefix;
  const patchPath = options.routes?.patch;

  app.get(listPath, async (request) => {
    const tenantId = options.tenantScoped ? request.tenantId : undefined;
    return { data: await listRows(options.table, { tenantId }) };
  });

  app.post(createPath, async (request) => {
    const body = createPayload.parse(request.body ?? {});
    return { data: await insertJson(options.table, body, options.tenantScoped ? request.tenantId : undefined) };
  });

  if (patchPath) {
    app.patch(patchPath, async (request) => {
      const params = z.object({ id: z.string().uuid() }).parse(request.params);
      const body = createPayload.parse(request.body ?? {});
      return { data: await patchJson(options.table, params.id, body) };
    });
  }
}
