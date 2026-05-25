import { randomUUID } from "node:crypto";
import { query } from "../../db/client.js";

export interface ListOptions {
  tenantId?: string;
  limit?: number;
}

export async function listRows(table: string, options: ListOptions = {}) {
  const limit = Math.min(options.limit ?? 100, 500);
  if (options.tenantId) {
    const result = await query(`select * from ${table} where tenant_id = $1 order by created_at desc limit $2`, [
      options.tenantId,
      limit
    ]);
    return result.rows;
  }

  const result = await query(`select * from ${table} order by created_at desc limit $1`, [limit]);
  return result.rows;
}

export async function insertJson(table: string, payload: Record<string, unknown>, tenantId?: string) {
  const id = randomUUID();
  const body = tenantId ? { ...payload, tenant_id: tenantId } : payload;
  const keys = ["id", ...Object.keys(body)];
  const values = [id, ...Object.values(body)];
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
  const columns = keys.map((key) => `"${key}"`).join(", ");
  const result = await query(`insert into ${table} (${columns}) values (${placeholders}) returning *`, values);
  return result.rows[0];
}

export async function patchJson(table: string, id: string, payload: Record<string, unknown>) {
  const entries = Object.entries(payload).filter(([key]) => key !== "id");
  const setClause = entries.map(([key], index) => `"${key}" = $${index + 2}`).join(", ");
  const result = await query(`update ${table} set ${setClause}, updated_at = now() where id = $1 returning *`, [
    id,
    ...entries.map(([, value]) => value)
  ]);
  return result.rows[0] ?? null;
}
