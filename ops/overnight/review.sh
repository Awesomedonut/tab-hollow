#!/usr/bin/env bash
set -euo pipefail
project=/home/codex/projects/clover-hollow
runtime=/home/codex/research/clover-overnight
mkdir -p "$runtime/reviews" "$runtime/character" "$runtime/world"
[[ ! -e "$runtime/STOP" && ! -e "$runtime/ACCEPTED" ]] || exit 0
exec 9>"$runtime/review.lock"
flock -n 9 || exit 0
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
report="$runtime/reviews/$stamp.json"
printf '%s review starting\n' "$stamp"
timeout --signal=TERM --kill-after=30s 1680 codex exec --ignore-user-config --ephemeral -s danger-full-access -c 'approval_policy="never"' -C "$project" --output-schema "$project/ops/overnight/review-schema.json" -o "$report" - < "$project/ops/overnight/reviewer-prompt.md" > "$runtime/reviews/$stamp.log" 2>&1
python3 - "$runtime" "$report" "$stamp" <<'PY'
import json,sys
from pathlib import Path
runtime,report,stamp=map(Path,sys.argv[1:])
r=json.loads(report.read_text())
(runtime/'latest-review.json').write_text(json.dumps(r,indent=2)+'\n')
for role in ['character','world']:
 task=r[role+'_task']
 if task.strip():
  target=runtime/role/'task.md';temp=target.with_suffix('.tmp')
  temp.write_text(f'\nIteration: {stamp}\n\n{task}\n');temp.replace(target)
streak_path=runtime/'acceptance-streak.json'
try:
 previous=json.loads(streak_path.read_text())
except (FileNotFoundError,ValueError):
 previous={'count':0}
count=(previous.get('count',0)+1) if r['accepted'] and (runtime/'HANDOFF').exists() else 0
streak_path.write_text(json.dumps({'count':count,'report':str(report)},indent=2)+'\n')
if count >= 2:
 (runtime/'ACCEPTED').write_text(report.as_posix()+'\nTwo consecutive visual reviews accepted.\n'+r['summary']+'\n')
print(r['summary'])
PY
printf '%s review finished\n' "$(date -u +%FT%TZ)"
