#!/usr/bin/env bash
set -euo pipefail
role="${1:?character or world}"
[[ "$role" == character || "$role" == world ]] || exit 2
runtime=/home/codex/research/clover-overnight
checkout="/home/codex/projects/clover-worker-$role"
mkdir -p "$runtime/$role"
exec 9>"$runtime/$role/worker.lock"
flock -n 9 || exit 0
while [[ ! -e "$runtime/STOP" && ! -e "$runtime/ACCEPTED" ]]; do
  task="$runtime/$role/task.md"
  if [[ -e "$runtime/HANDOFF" && -s "$task" && -e "$checkout/.git" ]]; then
    digest="$(sha256sum "$task" | cut -d' ' -f1)"
    previous="$(cat "$runtime/$role/last-task" 2>/dev/null || true)"
    if [[ "$digest" != "$previous" ]]; then
      stamp="$(date -u +%Y%m%dT%H%M%SZ)"
      cat /home/codex/projects/clover-hollow/ops/overnight/worker-prompt.md "$task" > "$runtime/$role/prompt-$stamp.md"
      printf '\nYour role is %s. Your branch is overnight/%s. Your checkout is %s.\n' "$role" "$role" "$checkout" >> "$runtime/$role/prompt-$stamp.md"
      printf '%s starting %s task %s\n' "$stamp" "$role" "$digest"
      timeout --signal=TERM --kill-after=30s 1500 codex exec --ignore-user-config --ephemeral -s danger-full-access -c 'approval_policy="never"' -C "$checkout" -o "$runtime/$role/result-$stamp.md" - < "$runtime/$role/prompt-$stamp.md" > "$runtime/$role/run-$stamp.log" 2>&1 || true
      printf '%s' "$digest" > "$runtime/$role/last-task"
      printf '%s finished %s task; see %s\n' "$(date -u +%FT%TZ)" "$role" "$runtime/$role/result-$stamp.md"
    fi
  fi
  sleep 30
done
