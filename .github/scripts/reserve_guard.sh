#!/usr/bin/env bash
# Budget/reserve guard. Emits skip=true to $GITHUB_OUTPUT if the Max plan is near
# a ceiling, so the fleet leaves the USER interactive headroom (no more "empty
# when I want it"). Checks BOTH the 5h (interactive) and 7d (weekly) unified
# rate-limit windows. Ceiling >= 1.0 disables the guard (no probe, zero spend).
# Fails OPEN on any error so the fleet is never silently stalled.
set -uo pipefail
CEIL="${RESERVE_CEILING:-1.0}"            # 7-day weekly ceiling
CEIL_5H="${RESERVE_CEILING_5H:-0.70}"     # short-term interactive ceiling

if awk "BEGIN{exit !(${CEIL} >= 1.0)}"; then
  echo "reserve disabled (ceiling ${CEIL}) — proceeding"
  echo "skip=false" >> "$GITHUB_OUTPUT"; exit 0
fi

hdrs=$(curl -sS -D - -o /dev/null https://api.anthropic.com/v1/messages \
  -H "authorization: Bearer ${ANTHROPIC_TOKEN}" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: oauth-2025-04-20" \
  -H "content-type: application/json" \
  -d '{"model":"claude-haiku-4-5-20251001","max_tokens":1,"system":"You are Claude Code, Anthropic'"'"'s official CLI for Claude.","messages":[{"role":"user","content":"hi"}]}' \
  2>/dev/null || true)
h=$(printf '%s' "$hdrs" | tr -d '\r')
u7=$(printf '%s' "$h" | awk -F': ' 'tolower($1)=="anthropic-ratelimit-unified-7d-utilization"{print $2}')
u5=$(printf '%s' "$h" | awk -F': ' 'tolower($1)=="anthropic-ratelimit-unified-5h-utilization"{print $2}')
echo "5h util ${u5:-?} (ceil ${CEIL_5H}) | 7d util ${u7:-?} (ceil ${CEIL})"

skip=false
[ -n "${u7:-}" ] && awk "BEGIN{exit !(${u7} >= ${CEIL})}" && skip=true
[ -n "${u5:-}" ] && awk "BEGIN{exit !(${u5} >= ${CEIL_5H})}" && skip=true
if [ "$skip" = "true" ]; then
  echo "over a reserve ceiling — skipping this run (leaving you headroom)"
  echo "skip=true" >> "$GITHUB_OUTPUT"
else
  echo "skip=false" >> "$GITHUB_OUTPUT"
fi
exit 0
