import pg from "pg";
import { config } from "../config.js";

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  connectionTimeoutMillis: 500
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, values: unknown[] = []) {
  if (config.storageMode === "local") {
    const { memoryQuery } = await import("./memory.js");
    return memoryQuery<T>(text, values) as Promise<pg.QueryResult<T>>;
  }

  try {
    const result = await pool.query<T>(text, values);
    return result;
  } catch (error) {
    if (config.storageMode === "auto" && shouldUseMemoryFallback(error)) {
      const { memoryQuery } = await import("./memory.js");
      return memoryQuery<T>(text, values) as Promise<pg.QueryResult<T>>;
    }
    throw error;
  }
}

function shouldUseMemoryFallback(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
  const message = error instanceof Error ? error.message : String(error);
  return ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET"].includes(code) || message.includes("Connection terminated");
}
