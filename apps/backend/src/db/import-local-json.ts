import { readFile } from "node:fs/promises";
import { pool } from "./client.js";

type JsonRow = Record<string, unknown>;

type ColumnInfo = {
  column_name: string;
  data_type: string;
  udt_name: string;
};

const tableOrder = [
  "tenants",
  "users",
  "companies",
  "products",
  "icp_profiles",
  "personas",
  "pains",
  "use_cases",
  "objections",
  "proof_points",
  "case_studies",
  "competitors",
  "forbidden_claims",
  "tone_rules",
  "demand_map_items",
  "content_items",
  "content_briefs",
  "content_drafts",
  "content_versions",
  "content_comments",
  "content_assets",
  "internal_links",
  "seo_keywords",
  "search_intents",
  "page_clusters",
  "schema_recommendations",
  "ai_answer_blocks",
  "llms_txt_versions",
  "publishing_channels",
  "publishing_calendar_items",
  "publishing_jobs",
  "published_urls",
  "lead_magnets",
  "calculators",
  "downloadable_assets",
  "analytics_imports",
  "page_metrics",
  "channel_metrics",
  "conversion_events",
  "improvement_tasks",
  "agents",
  "tasks",
  "task_comments",
  "task_runs",
  "task_events",
  "approvals",
  "integrations",
  "competitor_snapshots",
  "competitor_content_items",
  "content_gaps"
];

function usage() {
  return [
    "Usage:",
    "  AI_GROWTH_OS_STORAGE=postgres DATABASE_URL=postgres://... node apps/backend/dist/db/import-local-json.js /runtime/agentresult-os.local-data.json --apply",
    "",
    "Without --apply the importer runs in dry-run mode and prints table counts only."
  ].join("\n");
}

function isRowArray(value: unknown): value is JsonRow[] {
  return Array.isArray(value) && value.every((row) => row && typeof row === "object" && !Array.isArray(row));
}

function normalizeValue(value: unknown, column: ColumnInfo) {
  if (value === undefined) return null;
  if (value === null) return null;

  if (column.data_type === "json" || column.data_type === "jsonb") {
    return typeof value === "string" ? value : JSON.stringify(value);
  }

  return value;
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function getColumns(tableName: string) {
  const result = await pool.query<ColumnInfo>(
    `
      select column_name, data_type, udt_name
      from information_schema.columns
      where table_schema = 'public' and table_name = $1
      order by ordinal_position
    `,
    [tableName]
  );
  return result.rows;
}

async function importTable(tableName: string, rows: JsonRow[], apply: boolean) {
  const columns = await getColumns(tableName);
  if (!columns.length) return { table: tableName, rows: rows.length, imported: 0, skipped: true };

  const columnsByName = new Map(columns.map((column) => [column.column_name, column]));
  const hasId = columnsByName.has("id");
  let imported = 0;

  for (const row of rows) {
    const rowColumns = Object.keys(row).filter((key) => columnsByName.has(key));
    if (!rowColumns.length) continue;
    if (!apply) {
      imported += 1;
      continue;
    }

    const values = rowColumns.map((columnName) => normalizeValue(row[columnName], columnsByName.get(columnName)!));
    const columnSql = rowColumns.map(quoteIdentifier).join(", ");
    const valueSql = rowColumns.map((_, index) => `$${index + 1}`).join(", ");
    const updates = rowColumns
      .filter((columnName) => columnName !== "id")
      .map((columnName) => `${quoteIdentifier(columnName)} = excluded.${quoteIdentifier(columnName)}`)
      .join(", ");

    const conflictSql = hasId && rowColumns.includes("id")
      ? updates
        ? ` on conflict (id) do update set ${updates}`
        : " on conflict (id) do nothing"
      : "";

    await pool.query(`insert into ${quoteIdentifier(tableName)} (${columnSql}) values (${valueSql})${conflictSql}`, values);
    imported += 1;
  }

  return { table: tableName, rows: rows.length, imported, skipped: false };
}

async function main() {
  const filePath = process.argv[2];
  const apply = process.argv.includes("--apply");

  if (!filePath || process.argv.includes("--help")) {
    console.log(usage());
    process.exitCode = filePath ? 0 : 1;
    return;
  }

  if (process.env.AI_GROWTH_OS_STORAGE !== "postgres") {
    throw new Error("Refusing import: set AI_GROWTH_OS_STORAGE=postgres.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("Refusing import: DATABASE_URL is required.");
  }

  const parsed = JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
  const tables = new Map<string, JsonRow[]>();

  for (const [key, value] of Object.entries(parsed)) {
    if (isRowArray(value)) tables.set(key, value);
  }

  const orderedTables = [
    ...tableOrder.filter((tableName) => tables.has(tableName)),
    ...[...tables.keys()].filter((tableName) => !tableOrder.includes(tableName)).sort()
  ];

  const summary = [];
  await pool.query("begin");

  try {
    for (const tableName of orderedTables) {
      summary.push(await importTable(tableName, tables.get(tableName) ?? [], apply));
    }

    if (apply) {
      await pool.query("commit");
    } else {
      await pool.query("rollback");
    }
  } catch (error) {
    await pool.query("rollback");
    throw error;
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", tables: summary }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
