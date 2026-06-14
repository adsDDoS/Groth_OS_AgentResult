import { pool } from "./client.js";

type Row = Record<string, unknown>;
type ColumnInfo = {
  column_name: string;
  data_type: string;
};

const demoTenantId = process.env.AGENTRESULT_DEMO_TENANT_ID ?? "10000000-0000-4000-8000-000000000001";
const demoOwnerId = process.env.AGENTRESULT_DEMO_OWNER_ID ?? "10000000-0000-4000-8000-000000000101";
const defaultTenantId = "00000000-0000-0000-0000-000000000001";
const now = new Date().toISOString();

const ids = {
  company: "10000000-0000-4000-8000-000000000201",
  demand: "10000000-0000-4000-8000-000000000301",
  pendingContent: "10000000-0000-4000-8000-000000000401",
  pendingVersion: "10000000-0000-4000-8000-000000000402",
  pendingApproval: "10000000-0000-4000-8000-000000000403",
  publishedContent: "10000000-0000-4000-8000-000000000501",
  publishedCalendar: "10000000-0000-4000-8000-000000000502",
  analytics: "10000000-0000-4000-8000-000000000601",
  taskSource: "10000000-0000-4000-8000-000000000701",
  taskSignal: "10000000-0000-4000-8000-000000000702"
};

function assertSafeDemoTenant() {
  if (process.env.AI_GROWTH_OS_STORAGE !== "postgres") {
    throw new Error("Refusing demo reset: set AI_GROWTH_OS_STORAGE=postgres.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("Refusing demo reset: DATABASE_URL is required.");
  }

  if (demoTenantId === defaultTenantId) {
    throw new Error("Refusing demo reset: demo tenant must not be the default pilot tenant.");
  }
}

function placeholders(row: Row) {
  return Object.keys(row).map((_, index) => `$${index + 1}`).join(", ");
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function getColumns(tableName: string) {
  const result = await pool.query<ColumnInfo>(
    `
      select column_name, data_type
      from information_schema.columns
      where table_schema = 'public' and table_name = $1
    `,
    [tableName]
  );
  return new Map(result.rows.map((column) => [column.column_name, column]));
}

function normalizeValue(value: unknown, column?: ColumnInfo) {
  if (value === undefined) return null;
  if (value === null) return null;

  if (column?.data_type === "json" || column?.data_type === "jsonb") {
    return typeof value === "string" ? value : JSON.stringify(value);
  }

  return value;
}

async function insert(table: string, row: Row) {
  const tableColumns = await getColumns(table);
  const columns = Object.keys(row);
  const values = columns.map((column) => normalizeValue(row[column], tableColumns.get(column)));
  await pool.query(
    `insert into ${quoteIdentifier(table)} (${columns.map(quoteIdentifier).join(", ")}) values (${placeholders(row)})`,
    values
  );
}

async function resetPilotDemo() {
  assertSafeDemoTenant();

  await pool.query("begin");
  try {
    await pool.query("delete from tenants where id = $1", [demoTenantId]);

    await insert("tenants", {
      id: demoTenantId,
      name: "AgentResult Pilot Demo",
      slug: "agentresult-pilot-demo",
      plan: "pilot-demo",
      settings: {
        mode: "demo",
        dashboard_state: {
          demoScript: "ready",
          activity: [
            {
              actor: "AgentResult",
              title: "Demo-сценарий подготовлен",
              time: now
            }
          ]
        }
      },
      created_at: now,
      updated_at: now
    });

    await insert("users", {
      id: demoOwnerId,
      tenant_id: demoTenantId,
      email: "owner.demo@agentresult.ru",
      name: "Собственник",
      role: "owner",
      profile: { title: "Owner demo" },
      created_at: now,
      updated_at: now
    });

    await insert("companies", {
      id: ids.company,
      tenant_id: demoTenantId,
      name: "Пилотная B2B-компания",
      website_url: "https://demo.agentresult.ru",
      positioning: "B2B-компания запускает регулярный выпуск материалов без хаоса в согласованиях.",
      tone_of_voice: "Коротко, делово, без обещаний магии.",
      profile: {
        positioning: "Помогаем собственнику видеть, что готово, что ждёт решения, что вышло и какой сигнал появился.",
        icp: "Собственники B2B-компаний с ручным контролем маркетинга и продаж.",
        pains: "Материалы готовятся, но зависают на согласовании; выпуск нерегулярный; результат не фиксируется.",
        proof: "Показываем approval-first контур на одном материале и одном сигнале.",
        approvalOwner: "Собственник согласует публичные утверждения и выпуск от имени компании.",
        releaseOwner: "Контент-ответственный получает согласованный текст и подтверждает выход.",
        firstSignalSource: "URL публикации, реакции канала, комментарии, репосты, сохранения или ручная отметка собственника."
      },
      created_at: now,
      updated_at: now
    });

    await insert("demand_map_items", {
      id: ids.demand,
      tenant_id: demoTenantId,
      item_type: "telegram_post",
      title: "Контроль выпуска без ручного хаоса",
      slug: "kontrol-vypuska-demo",
      intent: "proof",
      audience: "Собственник B2B-компании",
      status: "review",
      priority: 100,
      evidence_requirements: ["нет обещаний гарантированной выручки", "approval-first", "ручная передача"],
      notes: { demo: true },
      created_at: now,
      updated_at: now
    });

    await insert("content_items", {
      id: ids.pendingContent,
      tenant_id: demoTenantId,
      demand_map_item_id: ids.demand,
      title: "Пост: контроль выпуска без ручного хаоса",
      content_type: "telegram_post",
      channel: "telegram",
      status: "review",
      body_md:
        "Материалы не должны теряться между идеей, чатом и публикацией.\n\nВ рабочем контуре всё проще:\n- AgentResult готовит материал\n- собственник принимает решение\n- текст передаётся в выпуск\n- после выхода фиксируется результат\n\nТак видно, что готово, что ждёт решения, что передано команде и что уже вышло.\n\nСледующий шаг — согласовать этот пост и передать его в выпуск.",
      metadata: {
        demo: true,
        risk: "public claim"
      },
      created_at: now,
      updated_at: now
    });

    await insert("content_versions", {
      id: ids.pendingVersion,
      tenant_id: demoTenantId,
      content_item_id: ids.pendingContent,
      version: 1,
      body_md:
        "Материалы не должны теряться между идеей, чатом и публикацией.\n\nВ рабочем контуре всё проще:\n- AgentResult готовит материал\n- собственник принимает решение\n- текст передаётся в выпуск\n- после выхода фиксируется результат",
      change_note: "Demo seed",
      created_by: demoOwnerId,
      created_at: now
    });

    await insert("approvals", {
      id: ids.pendingApproval,
      tenant_id: demoTenantId,
      scope: "social_post",
      target_type: "content_item",
      target_id: ids.pendingContent,
      status: "pending",
      summary: "Согласовать Telegram-пост про контроль выпуска",
      risk_flags: ["public claim"],
      requested_by: demoOwnerId,
      created_at: now,
      updated_at: now
    });

    await insert("content_items", {
      id: ids.publishedContent,
      tenant_id: demoTenantId,
      title: "Пост: почему одного черновика недостаточно",
      content_type: "telegram_post",
      channel: "telegram",
      status: "published",
      body_md:
        "Один черновик не создаёт регулярный рост. Нужен контур: решение, выпуск, подтверждение выхода и сигнал.",
      metadata: { demo: true },
      created_at: now,
      updated_at: now
    });

    await insert("publishing_calendar_items", {
      id: ids.publishedCalendar,
      tenant_id: demoTenantId,
      content_item_id: ids.publishedContent,
      channel: "telegram",
      title: "Пост: почему одного черновика недостаточно",
      status: "published",
      scheduled_for: now,
      timezone: "Europe/Moscow",
      export_path: null,
      metadata: {
        demo: true,
        signal: "3 заявки после публикации"
      },
      created_at: now,
      updated_at: now
    });

    await insert("analytics_imports", {
      id: ids.analytics,
      tenant_id: demoTenantId,
      source: "pilot_demo",
      period_start: "2026-06-01",
      period_end: "2026-06-07",
      payload: {
        leads: 3,
        tasks_created: 2,
        published_materials: 1
      },
      created_at: now,
      updated_at: now
    });

    await insert("tasks", {
      id: ids.taskSource,
      tenant_id: demoTenantId,
      agent_role: "growth_control",
      task_type: "connect_signal_source",
      target_type: "analytics_import",
      target_id: ids.analytics,
      status: "queued",
      priority: 80,
      payload: {
        title: "Подключить источник заявок",
        owner: "Продажи",
        status: "queued",
        note: "Связать форму, CRM или таблицу, чтобы заявки после публикаций попадали в контур."
      },
      result: {},
      created_by: demoOwnerId,
      created_at: now,
      updated_at: now
    });

    await insert("tasks", {
      id: ids.taskSignal,
      tenant_id: demoTenantId,
      agent_role: "growth_control",
      task_type: "check_signal_quality",
      target_type: "analytics_import",
      target_id: ids.analytics,
      status: "queued",
      priority: 70,
      payload: {
        title: "Проверить качество трёх заявок",
        owner: "Собственник",
        status: "queued",
        note: "Понять, какие заявки пришли после выпуска и что стоит усилить в следующем материале."
      },
      result: {},
      created_by: demoOwnerId,
      created_at: now,
      updated_at: now
    });

    await pool.query("commit");
  } catch (error) {
    await pool.query("rollback");
    throw error;
  }
}

resetPilotDemo()
  .then(() => {
    console.log(JSON.stringify({
      demoTenantId,
      demoOwnerId,
      dashboardPath: `/?demo=reset&tenant=${demoTenantId}#/overview`,
      telegramSmoke: [
        "что готово",
        "покажи первый",
        "согласую",
        "передал в выпуск",
        "вышло",
        "что по результату"
      ]
    }, null, 2));
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
