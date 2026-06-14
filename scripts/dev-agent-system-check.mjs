#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const checks = [
  {
    file: "docs/dev-agent-system.md",
    tokens: ["Default Agent Loop", "Minimum Acceptance Gate", "Lead Product Engineer"]
  },
  {
    file: "docs/dev-agent-system/roles.md",
    tokens: [
      "Lead Product Engineer",
      "Repo Archaeologist",
      "Frontend Product Agent",
      "Backend Domain Agent",
      "QA Smoke Agent",
      "DevOps Deploy Agent",
      "Docs Runbook Agent"
    ]
  },
  {
    file: "docs/dev-agent-system/contracts.md",
    tokens: ["Task Brief", "Agent Report", "Acceptance Checklist", "Lead Decision Record"]
  },
  {
    file: "docs/dev-agent-system/workflows/production-fix.md",
    tokens: [
      "Investigate",
      "publishing_calendar_item",
      "dashboard-orpin-mu-26.vercel.app",
      "Vercel Security Checkpoint",
      "npm run dashboard:smoke"
    ]
  },
  {
    file: "docs/dev-agent-system/task-packets/domain-state-machine-v1.md",
    tokens: [
      "approval -> content_item -> publishing_calendar_item -> result_signal",
      "`result_signal` is now an explicit backend contract",
      "approved publishing_calendar_item approval",
      "Option A, then Option B",
      "Repo Archaeologist",
      "Backend Domain Agent",
      "Frontend Product Agent",
      "QA Smoke Agent",
      "DevOps Deploy Agent",
      "Docs Runbook Agent"
    ]
  }
];

let failures = 0;

for (const check of checks) {
  let content = "";
  try {
    content = await readFile(check.file, "utf8");
  } catch (error) {
    failures += 1;
    console.error(`missing ${check.file}: ${error.message}`);
    continue;
  }

  for (const token of check.tokens) {
    if (!content.includes(token)) {
      failures += 1;
      console.error(`missing token in ${check.file}: ${token}`);
    }
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log("Dev agent system check passed");
