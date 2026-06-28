#!/usr/bin/env bash
# Budget/reserve guard. Emits `skip=true` to $GITHUB_OUTPUT if the Max plan's
# 7-day utilization is at/over RESERVE_CEILING. Default ceiling 1.0 = no reserve
# (spend everything) → no probe call is made, zero extra spend. Fails OPEN
# (proceeds) on any error so the fleet is never silently stalled by this guard.
set -uo pipefail

CEIL="${RESERVE_CEILING:-1.0}"

# No reserve configured → never probe, always run.
if awk "BEGIN{exit !(${CEIL} >= 1.0)}"; then
  echo "reserve disabled (ceiling ${CEIL}) — proceeding"
  echo "skip=false" >> "$GITHUB_OUTPUT"
  exit 0
fi

hdrs=$(curl -sS -D - -o /dev/null https://api.anthropic.com/v1/messages \
  -H "authorization: Bearer ${ANTHROPIC_TOKEN}" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: oauth-2025-04-20" \
  -H "content-type: application/json" \
  -d '{"model":"claude-haiku-4-5-20251001","max_tokens":1,"system":"You are Claude Code, Anthropic'"'"'s official CLI for Claude.","messages":[{"role":"user","content":"hi"}]}' \
  2>/dev/null || true)

util=$(printf '%s' "$hdrs" | tr -d '\r' \
  | awk -F': ' 'tolower($1)=="anthropic-ratelimit-unified-7d-utilization"{print $2}')

echo "Max-plan 7d utilization: ${util:-unknown} | reserve ceiling: ${CEIL}"

if [ -n "${util:-}" ] && awk "BEGIN{exit !(${util} >= ${CEIL})}"; then
  echo "over reserve ceiling — skipping this run"
  echo "skip=true" >> "$GITHUB_OUTPUT"
else
  echo "skip=false" >> "$GITHUB_OUTPUT"
fi
exit 0
