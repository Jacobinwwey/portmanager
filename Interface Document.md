# Interface Document

Updated: 2026-04-16
Version: v0.1.0-docs-baseline

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
