# VM overnight agents

Two implementation agents run in separate Git worktrees (`overnight/character` and `overnight/world` branches). A systemd timer invokes a real Codex visual-review/integration agent every 30 minutes. The review agent inspects actual reference and game screenshots, records failures and assigns the next work. This replaces the earlier 20-minute screenshot-only monitor. All processes, worktrees, browser tests and image processing run on the Azure VM using its existing authenticated Codex CLI. Model requests use the account's remote service; the Mac runs no game build or worker process.

Runtime state and logs: `/home/codex/research/clover-overnight`. References: `/home/codex/research/clover-reference`. Runtime is kept outside `/tmp` so it survives temporary-directory cleanup.

During the interactive team's current edits the `HANDOFF` marker is absent: the monitor is read-only with respect to project source, and implementation services wait. The coordinator creates `HANDOFF` after completing current commits. After handoff, workers push their isolated branches and the monitor integrates appropriate changes into main, tests the stable build, inspects images, then deploys/pushes. No worker deploys independently. The timer will not overlap two reviews; each call is capped at 28 minutes and each worker call at 25 minutes. Failed invocations are logged for a later attempt.

Visual acceptance requires a screenshot-supported result in all six categories recorded by the reviewer, not merely passing tests or resembling any farming game. The reviewer must approve two consecutive thirty-minute reviews before the script writes an `ACCEPTED` record after deployment and validation. Every review also checks actual worker processes, logs and commits; merely active services do not count as progress. This is a judgment of recognizably modded Stardew appearance, not a claim of identical pixels or guaranteed success. If permissions, authentication, model availability or source quality prevent progress, the logs must say so.

VM commands:

```sh
systemctl --user status clover-art-worker@character clover-art-worker@world clover-visual-review.timer
systemctl --user list-timers clover-visual-review.timer
cat /home/codex/research/clover-overnight/latest-review.json
journalctl --user -u clover-visual-review.service -n 30
# Stop only this project's overnight agents:
touch /home/codex/research/clover-overnight/STOP
systemctl --user stop clover-art-worker@character clover-art-worker@world clover-visual-review.timer clover-visual-review.service
```

An active service or a written prompt is not proof of completed work. Inspect timestamped worker results, review reports and Git commits for actual progress. No third-party notifications are sent.
