# PortManager Debian 12 Diagnostics Proof Capture

Updated: 2026-04-21
Version: v0.1.0

## English

### Purpose
Freeze one concrete diagnostics proof-capture guide for `debian-12-systemd-tailscale`.
This document does not mark diagnostics parity as passed.
It defines the minimum diagnostics artifact bundle that must exist before `/second-target-policy-pack` can move diagnostics parity beyond review-prep.

### Inputs
- Candidate host already completed one bounded bootstrap rehearsal and one steady-state mutation capture.
- `docs/operations/portmanager-debian-12-steady-state-proof-capture.md` already anchors post-bootstrap transport evidence.
- `pnpm acceptance:verify` remains green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`, `docs/operations/portmanager-debian-12-review-packet-template.md`, and `docs/operations/portmanager-backup-rollback-policy.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm diagnostics parity still blocks review.
2. Trigger one bounded controller-side diagnostics run for the candidate host and rule:
   - `curl -fsS -X POST http://<controller-host>:<controller-port>/snapshots/diagnostics -H 'content-type: application/json' -d '{"hostId":"<host-id>","ruleId":"<rule-id>","port":<listen-port>,"scheme":"http","captureSnapshot":true}'`
   - Use any equivalent bounded controller-driven diagnostics trigger only if it preserves the same controller artifact and event model.
3. Record the resulting controller operation detail:
   - `portmanager operation get <diagnostics-operation-id> --json`
4. Capture the diagnostics artifact bundle from the same run:
   - `portmanager diagnostics list --host-id <host-id> --rule-id <rule-id> --json`
5. Record one linked controller audit or replay reference:
   - `portmanager operations audit-index --host-id <host-id> --rule-id <rule-id> --limit 5 --json`
6. Record one short operator drift note from the same packet:
   - preserve the explicit no-drift conclusion if verification stayed healthy
   - preserve the explicit degraded or rollback-required note if drift remained
7. Copy every captured value into `docs/operations/portmanager-debian-12-review-packet-template.md`.

### Required artifacts
- diagnostics controller operation id
- diagnostics artifact paths from the same run
- controller audit-index or replay reference linked to the same run
- short operator note for any drift or verified no-drift outcome

### Exit rule
Keep diagnostics parity blocked until one review packet links all four artifacts back to the same diagnostics run.

## 中文

### 目的
冻结一份 `debian-12-systemd-tailscale` 的具体 diagnostics 证明采集指南。
本文档不表示 diagnostics parity 已通过。
它只定义在 `/second-target-policy-pack` 能把 diagnostics parity 从 review-prep 向前推进之前，最少必须真实存在的 diagnostics 产物包。

### 输入条件
- 候选主机已经完成一次有边界 bootstrap 预演和一次 steady-state mutation 采集。
- `docs/operations/portmanager-debian-12-steady-state-proof-capture.md` 已经作为 bootstrap 后 transport 证据锚点存在。
- 当前主线上的 `pnpm acceptance:verify` 继续为绿。
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`、`docs/operations/portmanager-debian-12-review-packet-template.md` 与 `docs/operations/portmanager-backup-rollback-policy.md` 继续作为配套真相面。

### 采集流程
1. 先读取 `portmanager operations second-target-policy-pack`，确认 diagnostics parity 仍然是阻塞项。
2. 为候选主机和规则触发一次有边界的 controller-side diagnostics：
   - `curl -fsS -X POST http://<controller-host>:<controller-port>/snapshots/diagnostics -H 'content-type: application/json' -d '{"hostId":"<host-id>","ruleId":"<rule-id>","port":<listen-port>,"scheme":"http","captureSnapshot":true}'`
   - 只有在保持同一套 controller artifact 与 event 模型时，才可以改用等价的有边界 controller-driven diagnostics 触发方式。
3. 记录对应 controller operation 详情：
   - `portmanager operation get <diagnostics-operation-id> --json`
4. 采集同一轮 diagnostics 的 artifact bundle：
   - `portmanager diagnostics list --host-id <host-id> --rule-id <rule-id> --json`
5. 记录一条对应的 controller audit 或 replay 引用：
   - `portmanager operations audit-index --host-id <host-id> --rule-id <rule-id> --limit 5 --json`
6. 为同一份 packet 记录一条简短的 operator drift 备注：
   - 如果验证保持健康，就保留显式 no-drift 结论
   - 如果 drift 仍存在，就保留显式 degraded 或 rollback-required 备注
7. 把采集结果逐项回填进 `docs/operations/portmanager-debian-12-review-packet-template.md`。

### 必需产物
- diagnostics 的 controller operation id
- 同一轮 diagnostics 的 artifact 路径
- 指向同一轮 diagnostics 的 controller audit-index 或 replay 引用
- 任意 drift 或 verified no-drift 结果的简短 operator 备注

### 退出规则
在同一份 review packet 把四类产物都链接回同一次 diagnostics run 之前，diagnostics parity 继续保持阻塞。
