# Interface Document

Updated: 2026-04-17
Version: v0.2.2-mainline-progress-sync

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
| `hosts` | V1 managed-host resource | Contract-only. `apps/controller/src/controller-server.ts` does not yet expose `/hosts`, `crates/portmanager-cli/src/main.rs` has no host command, and `apps/web/src/main.ts` has no real `Hosts` page. |
| `bridge-rules` | CRUD plus verification and drift handling | Partial. Controller exposes only `/bridge-rules/{ruleId}/drift-check`; list/detail/create/update/delete flows are still missing across controller, CLI, and web. |
| `exposure-policies` | Host-level policy read/write surface | Contract-only. No real controller, CLI, or web implementation yet. |
| `health-checks` | Shared inspection surface for host/rule health evidence | Implemented for controller and CLI reads. Web currently shows mock health cards only. |
| `operations` | Shared audit record plus detail and replay | Implemented for controller and CLI reads, including detail and replay URLs. Web operations screen remains mock-data driven. |
| `rollback-points` | Recovery inventory plus apply flow | Implemented for controller and CLI list/apply flows. Web references rollback evidence only through mock host detail cards. |
| `backups` | Backup inventory plus backup execution | Implemented for controller list/run and CLI list. Web backup surface is still a mock subsection, not a live page. |
| `snapshots/diagnostics` | Diagnostics run/list plus snapshot evidence | Implemented for controller run/list and CLI list. Web shows only mock diagnostics evidence; dedicated diagnostics detail is still missing. |
| Controller-agent steady state | `HTTP over Tailscale` | Not yet implemented. `crates/portmanager-agent/src/main.rs` is still a file-backed CLI skeleton, not a long-lived service. |

### Verification boundary
- The repository now has a repeatable mainline verification gate: `pnpm acceptance:verify`.
- The main branch CI mirror for that gate is `.github/workflows/mainline-acceptance.yml`.
- This gate proves current code health across tests, type checks, Rust workspace tests, contract drift checks, docs-site build, and milestone verification.
- This gate does **not** mean interface parity is complete. Missing `hosts`, `bridge-rules`, `exposure-policies`, live web parity, and the steady-state agent service remain delivery obligations.

### Recommended parity-closure order
- `Unit 1`: land controller `hosts`, `bridge-rules`, and `exposure-policies` as real source-of-truth resources first.
- `Unit 2`: extend CLI commands to inspect and mutate those same resources with the existing `--json` and wait-aware conventions.
- `Unit 3`: replace Web mock-only views with controller-backed routes and diagnostics detail.
- `Unit 4`: connect controller and agent through the locked `HTTP over Tailscale` steady-state boundary without breaking current evidence artifacts.
- `Unit 5`: rerun acceptance and update milestone language only after the parity gaps above are closed.

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
| `hosts` | V1 受管主机资源 | 仍停留在契约层。`apps/controller/src/controller-server.ts` 尚未暴露 `/hosts`，`crates/portmanager-cli/src/main.rs` 没有 host 命令，`apps/web/src/main.ts` 也没有真实 `Hosts` 页面。 |
| `bridge-rules` | CRUD 加验证与漂移处理 | 部分实现。controller 目前只暴露 `/bridge-rules/{ruleId}/drift-check`；list/detail/create/update/delete 在 controller、CLI、web 中都还缺失。 |
| `exposure-policies` | 主机级 policy 读写面 | 仍停留在契约层。controller、CLI、web 都没有真实实现。 |
| `health-checks` | 跨界面共享的 host/rule 健康证据面 | controller 与 CLI 的读取能力已实现；Web 目前只展示 mock health 卡片。 |
| `operations` | 共享审计记录、详情与回放入口 | controller 与 CLI 的读取能力已实现，包括 detail 与 replay URL；Web 的 operations 页面仍依赖 mock 数据。 |
| `rollback-points` | 恢复点清单与 apply 流程 | controller 与 CLI 的 list/apply 已实现；Web 目前只在 mock host detail 卡片中引用 rollback 证据。 |
| `backups` | 备份清单与执行入口 | controller 的 list/run 与 CLI 的 list 已实现；Web backup 仍只是 mock 子模块，不是 live 页面。 |
| `snapshots/diagnostics` | 诊断执行、列表与快照证据 | controller 的 run/list 与 CLI 的 list 已实现；Web 只显示 mock diagnostics 证据，独立 diagnostics detail 仍缺失。 |
| controller-agent 稳态通信 | `HTTP over Tailscale` | 尚未实现。`crates/portmanager-agent/src/main.rs` 仍是文件落盘式 CLI 骨架，而不是长驻服务。 |

### 验证边界
- 当前仓库已经具备可重复执行的主线验证 gate：`pnpm acceptance:verify`。
- 该 gate 在主分支上的 CI 镜像为 `.github/workflows/mainline-acceptance.yml`。
- 它覆盖当前代码的测试、类型检查、Rust workspace 测试、契约漂移检查、docs-site 构建与 milestone 验证。
- 但它**并不**意味着接口一致性已经闭环。`hosts`、`bridge-rules`、`exposure-policies`、live web parity 与稳态 agent service 仍然是必须补齐的交付项。

### 推荐闭环顺序
- `Unit 1`：先补齐 controller 的 `hosts`、`bridge-rules`、`exposure-policies` 真源资源。
- `Unit 2`：再把 CLI 扩到这些同名资源，并继续沿用现有 `--json` 与等待轮询约定。
- `Unit 3`：把 Web 从 mock-only 视图切到 controller 实时路由，并补齐 diagnostics detail。
- `Unit 4`：在不破坏现有证据产物的前提下，通过锁定的 `HTTP over Tailscale` 稳态边界接通 controller 与 agent。
- `Unit 5`：只有在以上一致性缺口补齐后，才重新跑验收并更新里程碑状态表述。
