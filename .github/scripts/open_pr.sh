#!/usr/bin/env bash
# Opens the worker's PR from the files it wrote (/tmp/pr_title.txt, pr_body.md,
# pr_trivial.txt). Writes the PR url to /tmp/pr_url.txt for the Telegram step.
# Adds the `trivial` label only for trivial changes in `work`-tier repos.
set -uo pipefail
: > /tmp/pr_url.txt

TITLE="$(cat /tmp/pr_title.txt 2>/dev/null || true)"
if [[ "$TITLE" == "NO_CHANGE" || -z "$(git status --porcelain)" ]]; then
  echo "No change produced this run — nothing to PR."
  exit 0
fi
[[ -z "$TITLE" ]] && TITLE="chore: autonomous improvement"
[[ -f /tmp/pr_body.md ]] || echo "Autonomous worker change." > /tmp/pr_body.md

git config user.email "fleet@vebjorn-os"
git config user.name "Autonomous Fleet"
BRANCH="auto/work-${GITHUB_RUN_ID}"
git checkout -b "$BRANCH"
git add -A
git commit -m "$TITLE"
git push -u origin "$BRANCH"

LABELS=(--label autonomous)
if [[ "$(cat /tmp/pr_trivial.txt 2>/dev/null || echo no)" == "yes" && "${TIER:-work}" == "work" ]]; then
  LABELS+=(--label trivial)
fi

URL="$(gh pr create --title "$TITLE" --body-file /tmp/pr_body.md \
        --base main --head "$BRANCH" "${LABELS[@]}" 2>/dev/null \
     || gh pr create --title "$TITLE" --body-file /tmp/pr_body.md \
        --base main --head "$BRANCH")"
echo "Opened PR: $URL"
printf '%s' "$URL" > /tmp/pr_url.txt
