#!/usr/bin/env bash
set -euo pipefail

run_step() {
  printf '\n== %s ==\n' "$*"
  "$@"
}

run_step npm run build
run_step npm run approval-side-effects:check
run_step npm run publishing-commands:check
run_step npm run auth:tenant-guard:check
run_step npm run pilot:week-one-command:check
run_step npm run pilot:day-seven-review:check
run_step npm run pilot:week-two-execution:check
run_step npm run telegram:polling-invariant

if [ "${CONTENT_FACTORY_SKIP_TELEGRAM_REGRESSION:-0}" != "1" ]; then
  run_step npm run telegram:pilot-week-one-command:check
  run_step npm run telegram:day-seven-review:check
  run_step npm run telegram:regression
fi

if [ "${CONTENT_FACTORY_SKIP_DASHBOARD_SMOKE:-0}" != "1" ]; then
  run_step npm run dashboard:smoke
fi

printf '\nContent Factory Core check passed\n'
