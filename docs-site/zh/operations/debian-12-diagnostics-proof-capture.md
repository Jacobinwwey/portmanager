---
title: "Debian 12 诊断证明采集"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-diagnostics-proof-capture.md"
status: active
---
> 真源文档：`docs/operations/portmanager-debian-12-diagnostics-proof-capture.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.1.0
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
