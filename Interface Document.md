# Interface Document

Updated: 2026-04-17
Version: v0.3.2-m2-confidence-history

## English

This document summarizes the V1 public interface boundary for PortManager.
It is a compact companion to `packages/contracts/README.md`, not a replacement for the contracts themselves.

### Controller API resources
- `hosts`
- `bridge-rules`
- `exposure-policies`
- `health-checks`
- `operations`
- `rollback-points`
- `backups`
- `snapshots/diagnostics`

### Protocol rules
- Controller API: `REST + SSE`
- Controller-agent steady state: `HTTP over Tailscale`
- Bootstrap and rescue: `SSH`
- Human-maintained configuration: `TOML`
- Protocol payloads, snapshots, and exports: `JSON`
- Shared contracts: `OpenAPI + JSON Schema + code generation`

### Public consumers
- Web
- CLI
- TypeScript SDK
- Rust crate
- future agent-driven automation

### Current implementation parity snapshot

| Surface | Contract expectation | Verified current status |
| --- | --- | --- |
| `hosts` | V1 managed-host resource | Controller, CLI, and Web implemented. `apps/controller/src/controller-server.ts` exposes `/hosts`, `/hosts/{hostId}`, `/hosts/{hostId}/probe`, and `/hosts/{hostId}/bootstrap`; `crates/portmanager-cli/src/main.rs` mirrors list/get/create/probe/bootstrap; `apps/web/src/main.ts` now renders controller-backed `overview`, `host-detail`, and dedicated `Hosts` views. |
| `bridge-rules` | CRUD plus verification and drift handling | Controller, CLI, and Web implemented. Controller exposes list/detail/create/update/delete plus `/bridge-rules/{ruleId}/drift-check`; CLI mirrors list/get/create/update/delete; Web now renders controller-backed `Bridge Rules` topology, verification, and linked recovery evidence. |
| `exposure-policies` | Host-level policy read/write surface | Controller and CLI implement the write surface, and Web now consumes live effective policy data in overview, host detail, and bridge-rule views. `GET/PUT /exposure-policies/{hostId}` remain the source of truth. |
| `health-checks` | Shared inspection surface for host/rule health evidence | Implemented for controller and CLI reads. Web now renders live host and bridge-rule health evidence from controller-backed `health-checks` data. |
| `operations` | Shared audit record plus detail and replay | Implemented for controller and CLI reads, including detail and replay URLs. Web operations and console surfaces now consume live controller data, replay URLs, and selected diagnostic detail. |
| `rollback-points` | Recovery inventory plus apply flow | Implemented for controller and CLI list/apply flows. Web now renders live rollback readiness and linked recovery evidence in host-detail and backups views. |
| `backups` | Backup inventory plus backup execution | Implemented for controller list/run and CLI list. Web now renders live backup inventory, manifest paths, and related recovery operations in dedicated `Backups` and controller-backed host views. When `PORTMANAGER_GITHUB_BACKUP_ENABLED`, `PORTMANAGER_GITHUB_BACKUP_REPO`, and `PORTMANAGER_GITHUB_BACKUP_TOKEN` are configured, controller also uploads the backup bundle JSON through the GitHub Contents API and publishes `succeeded` / `failed` / `not_configured` remote status across API, CLI, and Web. |
| `snapshots/diagnostics` | Diagnostics run/list plus snapshot evidence | Implemented for controller run/list and CLI list. Controller `GET /diagnostics` now also accepts `state` for degraded-versus-recovery history filtering, and Web host detail now renders latest diagnostics, degraded diagnostics history, and recovery-ready successful evidence inside controller-backed host-level surfaces. |
| Controller-agent steady state | `HTTP over Tailscale` | Implemented. `crates/portmanager-agent/src/main.rs` now exposes long-lived `serve` with `/health`, `/runtime-state`, `/apply`, `/snapshot`, and `/rollback`; controller uses `apps/controller/src/agent-client.ts` to push desired state, collect runtime state, and explicitly degrade unreachable hosts and rules. |

### Verification boundary
- The repository now has a repeatable mainline verification gate: `pnpm acceptance:verify`.
- The repository now also has one canonical Milestone 2 confidence routine: `pnpm milestone:verify:confidence`.
- The main branch CI mirror for that gate is `.github/workflows/mainline-acceptance.yml`.
- That workflow keeps `pnpm acceptance:verify` on the standing PR path and runs `pnpm milestone:verify:confidence` on `push main` plus `workflow_dispatch`.
- The confidence routine now writes `.portmanager/reports/milestone-confidence-report.json`, and the confidence job uploads that same report as a CI artifact for developer inspection.
- Unit 0 is already achieved and should be treated as mandatory baseline discipline through `pnpm acceptance:verify`, `mainline-acceptance`, and `docs-pages`.
- This gate proves current code health across tests, type checks, Rust workspace tests, contract drift checks, docs-site build, and milestone verification.
- Fresh local proof on `2026-04-17`: `pnpm acceptance:verify` passes after the Unit 4 agent-service delivery and Unit 5 docs sync.
- The confidence routine extends that baseline with the remote-backup replay proof on the same accepted live slice. It does **not** mean Milestone 2 reliability hardening is complete yet; repeated green history is still required.

### Current delivery status
- `Unit 1`: complete. Controller `hosts`, `bridge-rules`, and `exposure-policies` now exist as real source-of-truth resources.
- `Unit 2`: complete. CLI now inspects and mutates those same controller-backed resources with the existing `--json` and wait-aware conventions.
- `Unit 3`: complete. Web now renders controller-backed routes and diagnostics detail.
- `Unit 4`: complete. Controller and agent now communicate through the locked `HTTP over Tailscale` steady-state boundary without breaking current evidence artifacts.
- `Unit 5`: complete. Acceptance was replayed and milestone language updated only after the proof stayed green.
- `Milestone 2 slice shipped`: agent `/health` + `/runtime-state`, controller host summary/detail, CLI host output, and Web host detail now share `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics.
- `Milestone 2 slice shipped`: controller `GET /diagnostics` now filters by `state`, and Web host detail now groups degraded diagnostics history with recovery-ready successful evidence.
- `Milestone 2 slice shipped`: controller backup bundles now upload through the GitHub Contents API when configured, and required-mode success/failure stays explicit across API, CLI, Web, and milestone proof.
- `Milestone 2 slice shipped`: repeated remote-backup replay now exercises local-only, configured-success, and configured-failure required backups on the same live agent-backed host / rule flow across API, CLI, Web backup views, and agent runtime proof.
- `Milestone 2 slice shipped`: `pnpm milestone:verify:confidence` now composes the standing acceptance gate with the remote-backup replay proof, and the mainline workflow now collects that heavier routine on `push main` and `workflow_dispatch`.
- `Milestone 2 slice shipped`: the canonical confidence routine now emits a durable JSON report at `.portmanager/reports/milestone-confidence-report.json`, and CI uploads that report for developers so green-history review stops depending on raw job logs alone.
- `Next lane`: Milestone 2 confidence-routine maintenance on the same live host / rule / policy slice by keeping the canonical routine green long enough for the current wording to stop needing qualification.

## 中文

本文档汇总 PortManager V1 的公共接口边界。
它是 `packages/contracts/README.md` 的紧凑配套说明，而不是契约本体的替代品。

### Controller API 资源
- `hosts`
- `bridge-rules`
- `exposure-policies`
- `health-checks`
- `operations`
- `rollback-points`
- `backups`
- `snapshots/diagnostics`

### 协议规则
- Controller API：`REST + SSE`
- controller-agent 稳态通信：`HTTP over Tailscale`
- bootstrap 与救援：`SSH`
- 人类维护配置：`TOML`
- 协议载荷、快照与导出：`JSON`
- 共享契约：`OpenAPI + JSON Schema + 代码生成`

### 公共使用方
- Web
- CLI
- TypeScript SDK
- Rust crate
- 未来的 agent 驱动自动化

### 当前实现一致性快照

| 表面 | 契约预期 | 当前已验证状态 |
| --- | --- | --- |
| `hosts` | V1 受管主机资源 | controller、CLI、Web 已实现。`apps/controller/src/controller-server.ts` 已暴露 `/hosts`、`/hosts/{hostId}`、`/hosts/{hostId}/probe`、`/hosts/{hostId}/bootstrap`；`crates/portmanager-cli/src/main.rs` 已补齐 list/get/create/probe/bootstrap；`apps/web/src/main.ts` 现在也已渲染 controller-backed 的 `overview`、`host-detail` 与独立 `Hosts` 视图。 |
| `bridge-rules` | CRUD 加验证与漂移处理 | controller、CLI、Web 已实现。controller 已暴露 list/detail/create/update/delete 以及 `/bridge-rules/{ruleId}/drift-check`；CLI 已补齐 list/get/create/update/delete；Web 现在也有 controller-backed 的 `Bridge Rules` 拓扑、验证与恢复证据页面。 |
| `exposure-policies` | 主机级 policy 读写面 | controller 与 CLI 负责真实写入面；Web 现在已经在 overview、host detail、bridge-rule 视图中消费 live effective policy 数据。`GET/PUT /exposure-policies/{hostId}` 仍然是真源。 |
| `health-checks` | 跨界面共享的 host/rule 健康证据面 | controller 与 CLI 的读取能力已实现；Web 现在也会从 controller-backed `health-checks` 渲染 live host / rule 健康证据。 |
| `operations` | 共享审计记录、详情与回放入口 | controller 与 CLI 的读取能力已实现，包括 detail 与 replay URL；Web 的 operations 与 console 页面现在也会消费 live controller 数据、replay URL 与 diagnostics detail。 |
| `rollback-points` | 恢复点清单与 apply 流程 | controller 与 CLI 的 list/apply 已实现；Web 现在也会在 host-detail 与 backups 页面中渲染 live rollback readiness 与恢复证据。 |
| `backups` | 备份清单与执行入口 | controller 的 list/run 与 CLI 的 list 已实现；Web 现在也已经在独立 `Backups` 与 controller-backed host 视图里渲染 live backup inventory、manifest 路径与恢复操作。当 `PORTMANAGER_GITHUB_BACKUP_ENABLED`、`PORTMANAGER_GITHUB_BACKUP_REPO`、`PORTMANAGER_GITHUB_BACKUP_TOKEN` 已配置时，controller 还会通过 GitHub Contents API 上传 backup bundle JSON，并把 `succeeded` / `failed` / `not_configured` 远端状态同步暴露给 API、CLI 与 Web。 |
| `snapshots/diagnostics` | 诊断执行、列表与快照证据 | controller 的 run/list 与 CLI 的 list 已实现；controller `GET /diagnostics` 现在还支持 `state` 过滤 degraded 与 recovery 历史，Web host detail 也已经在 controller-backed host 证据面里分组渲染最新诊断、degraded 诊断历史与 recovery-ready 成功证据。 |
| controller-agent 稳态通信 | `HTTP over Tailscale` | 已实现。`crates/portmanager-agent/src/main.rs` 现在已经提供长驻 `serve` 以及 `/health`、`/runtime-state`、`/apply`、`/snapshot`、`/rollback`；controller 会通过 `apps/controller/src/agent-client.ts` 推送 desired state、收集 runtime state，并在 agent 不可达时显式把 host / rule 置为 degraded。 |

### 验证边界
- 当前仓库已经具备可重复执行的主线验证 gate：`pnpm acceptance:verify`。
- 当前仓库也已经具备一条规范的 Milestone 2 confidence routine：`pnpm milestone:verify:confidence`。
- 该 gate 在主分支上的 CI 镜像为 `.github/workflows/mainline-acceptance.yml`。
- 这条 workflow 会继续把 `pnpm acceptance:verify` 保留在 PR 路径上，并在 `push main` 与 `workflow_dispatch` 上运行 `pnpm milestone:verify:confidence`。
- 这条 confidence routine 现在还会写出 `.portmanager/reports/milestone-confidence-report.json`，而 confidence job 也会把同一份报告上传成 CI artifact 供开发者核对。
- Unit 0 现在已经成立，应通过 `pnpm acceptance:verify`、`mainline-acceptance` 与 `docs-pages` 被视为必须持续保持的基线纪律。
- 它覆盖当前代码的测试、类型检查、Rust workspace 测试、契约漂移检查、docs-site 构建与 milestone 验证。
- 本地最新证明也发生在 `2026-04-17`：Unit 4 agent-service 交付与 Unit 5 文档同步之后，`pnpm acceptance:verify` 已重新通过。
- 这条 confidence routine 会在同一条已验收 live 切片上继续叠加 remote-backup replay proof，但它**并不**意味着 Milestone 2 可靠性加固已经完成；仍然需要持续为绿的历史。

### 当前交付状态
- `Unit 1`：已完成。controller 的 `hosts`、`bridge-rules`、`exposure-policies` 真源资源已经落地。
- `Unit 2`：已完成。CLI 已补齐这些 controller-backed 资源，并继续沿用现有 `--json` 与等待轮询约定。
- `Unit 3`：已完成。Web 现在已经渲染 controller-backed 路由与 diagnostics detail。
- `Unit 4`：已完成。在不破坏现有证据产物的前提下，controller 与 agent 已通过锁定的 `HTTP over Tailscale` 稳态边界接通。
- `Unit 5`：已完成。只有在证明链保持为绿之后，验收才被重跑，里程碑状态表述也才被更新。
- `Milestone 2 切片已交付`：controller `GET /diagnostics` 现在支持 `state` 过滤，Web host detail 也已经把 degraded diagnostics history 与 recovery-ready 成功证据成组展示出来。
- `Milestone 2 切片已交付`：当配置存在时，controller backup bundle 现在会通过 GitHub Contents API 上传，required-mode 成功/失败路径也已经在 API、CLI、Web 与 milestone proof 中保持显式一致。
- `Milestone 2 切片已交付`：remote-backup replay 现在会在同一条 live agent-backed host / rule 流程上重放 local-only、configured-success、configured-failure 三类 required backup，并把 API、CLI、Web backup 视图与 agent runtime 证据对齐。
- `Milestone 2 切片已交付`：`pnpm milestone:verify:confidence` 现在已经把既有 acceptance gate 与 remote-backup replay proof 收敛成一条规范 routine，主线 workflow 也会在 `push main` 与 `workflow_dispatch` 上收集这条更重的证明。
- `Milestone 2 切片已交付`：规范 confidence routine 现在还会写出 `.portmanager/reports/milestone-confidence-report.json`，CI 也会上传同一份报告，让开发者核对持续转绿历史时不再只依赖原始 job 日志。
- `下一主线`：继续在同一条 live host / rule / policy 切片上推进 Milestone 2 的 confidence-routine 维护：让规范 routine 持续保持为绿，直到当前里程碑表述不再需要附带限定语。
