#!/usr/bin/env bash
# Credit governor. PAUSES this run (skip=true) when the Max plan's rolling 5-hour
# OR 7-day usage is at/over RESERVE_CEILING — leaving headroom for your own use and
# so the fleet never hard-fails on a maxed plan. The every-few-hours cron re-checks,
# so the fleet AUTO-RESUMES once a usage window resets. Ceiling >= 1.0 disables the
# governor (spend everything; no probe call). Fails OPEN (proceeds) on any probe error
# so a glitch never silently stalls the fleet. Emits skip/util5h/util7d to $GITHUB_OUTPUT.
set -uo pipefail

CEIL="${RESERVE_CEILING:-1.0}"

# Governor off -> never probe, always run.
if awk "BEGIN{exit !(${CEIL} >= 1.0)}"; then
  echo "credit governor off (ceiling ${CEIL}) — proceeding"
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

_get() { printf '%s' "$hdrs" | tr -d '\r' | awk -F': ' -v k="$1" 'tolower($1)==k{print $2}'; }
u5="$(_get anthropic-ratelimit-unified-5h-utilization)"
u7="$(_get anthropic-ratelimit-unified-7d-utilization)"

echo "Max plan usage: 5h=${u5:-?} 7d=${u7:-?} | pause threshold >= ${CEIL}"
echo "util5h=${u5:-}" >> "$GITHUB_OUTPUT"
echo "util7d=${u7:-}" >> "$GITHUB_OUTPUT"

over=false
[ -n "$u5" ] && awk "BEGIN{exit !(${u5} >= ${CEIL})}" && over=true
[ -n "$u7" ] && awk "BEGIN{exit !(${u7} >= ${CEIL})}" && over=true

if $over; then
  echo "credits low (>= ${CEIL}) — PAUSING this run; auto-resumes when a window resets"
  echo "skip=true" >> "$GITHUB_OUTPUT"
else
  echo "skip=false" >> "$GITHUB_OUTPUT"
fi
exit 0
