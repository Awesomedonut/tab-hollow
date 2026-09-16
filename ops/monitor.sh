#!/usr/bin/env bash
set -u
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="${CLOVER_MONITOR_RUNTIME:-/tmp/clover-hollow-monitor}"
INTERVAL="${CLOVER_MONITOR_INTERVAL:-1200}"
MAX_SECONDS="${CLOVER_MONITOR_MAX_SECONDS:-21600}"
mkdir -p "$RUNTIME_DIR"
exec 9>"$RUNTIME_DIR/monitor.lock"
flock -n 9 || exit 0
cd "$PROJECT_ROOT" || exit 1
printf '%s\n' "$$" > "$RUNTIME_DIR/monitor.pid"
sleep_pid=''
cleanup() {
  if [[ -n "$sleep_pid" ]]; then
    kill "$sleep_pid" 2>/dev/null || true
  fi
  rm -f "$RUNTIME_DIR/monitor.pid"
}
trap 'cleanup; exit 0' TERM INT
check_progress() {
  local stamp branch head tracked remote_head
  stamp="$(date -u +%FT%TZ)"
  branch="$(git branch --show-current)"
  head="$(git rev-parse --short HEAD)"
  printf '\n=== %s | branch=%s HEAD=%s ===\n' "$stamp" "$branch" "$head"
  git status --short
  git log -3 --format='%h %s'
  tracked="$(git rev-parse --abbrev-ref '@{upstream}' 2>/dev/null || true)"
  if [[ -n "$tracked" ]]; then
    printf 'Local/tracking ahead-behind: '
    git rev-list --left-right --count "HEAD...$tracked"
  fi
  remote_head="$(timeout 20 git ls-remote origin "refs/heads/$branch" 2>/dev/null | cut -f1)"
  if [[ -z "$remote_head" ]]; then
    printf 'Remote check unavailable.\n'
  elif [[ "$remote_head" == "$(git rev-parse HEAD)" ]]; then
    printf 'Remote branch matches local HEAD.\n'
  else
    printf 'Remote differs from local HEAD: %s\n' "$remote_head"
  fi
  if [[ -f src/main.js && -f src/game.js && -f src/render.js && -f index.html && -d node_modules ]]; then
    printf 'Production build: '
    if timeout 90 npm run build -- --outDir "$RUNTIME_DIR/build" >"$RUNTIME_DIR/build.log" 2>&1; then
      printf 'PASS\n'
    else
      printf 'FAIL (see %s/build.log)\n' "$RUNTIME_DIR"
      tail -n 12 "$RUNTIME_DIR/build.log"
    fi
  else
    printf 'Build deferred: integration files not ready.\n'
  fi
  if compgen -G 'tests/*.test.js' >/dev/null; then
    printf 'Gameplay tests: '
    if timeout 60 npm test >"$RUNTIME_DIR/tests.log" 2>&1; then
      printf 'PASS\n'
    else
      printf 'FAIL (see %s/tests.log)\n' "$RUNTIME_DIR"
      tail -n 12 "$RUNTIME_DIR/tests.log"
    fi
  else
    printf 'Tests deferred: gameplay tests not ready.\n'
  fi
  if [[ -f ops/monitor-capture.mjs && -d node_modules/@playwright ]]; then
    printf 'Browser evidence capture: '
    timeout 90 node ops/monitor-capture.mjs || printf 'Capture failed; inspect output above.\n'
  fi
  for port in 4173 5173; do
    if curl --silent --fail --max-time 3 "http://127.0.0.1:$port/" >/dev/null; then
      printf 'Local HTTP service on %s: reachable\n' "$port"
    else
      printf 'Local HTTP service on %s: not reachable\n' "$port"
    fi
  done
}
started="$(date +%s)"
while (( $(date +%s) - started < MAX_SECONDS )); do
  if [[ -f ops/RELEASE_COMPLETE ]]; then
    printf '%s Release completion marker found; monitor stopped.\n' "$(date -u +%FT%TZ)"
    break
  fi
  check_progress
  [[ "${1:-}" == '--once' ]] && break
  sleep "$INTERVAL" 9>&- &
  sleep_pid=$!
  wait "$sleep_pid" || break
  sleep_pid=''
done
cleanup
