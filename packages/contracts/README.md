# PortManager Contracts

Updated: 2026-04-16
Version: v0.1.0-docs-baseline

## English

### Purpose
This directory contains the shared public contract baseline for PortManager V1.
It exists so the future controller, web, CLI, agent, and SDKs all grow from one reviewed interface definition.

### Contents
- `openapi/openapi.yaml`: controller REST + SSE contract draft
- `jsonschema/runtime-state.schema.json`: agent-reported runtime state
- `jsonschema/apply-desired-state.schema.json`: desired state payload applied to a host
- `jsonschema/snapshot-manifest.schema.json`: backup / artifact manifest
- `jsonschema/rollback-result.schema.json`: rollback execution result
- `jsonschema/operation-result.schema.json`: operation status and summary result
- `jsonschema/port-diagnostic-result.schema.json`: port connectivity and HTTP/TLS diagnostic result
- `jsonschema/web-snapshot-result.schema.json`: webpage screenshot result metadata

### Ownership rules
- OpenAPI owns controller API resources and SSE events.
- JSON Schema owns agent payloads and artifact/result documents.
- Future code generation must treat these files as the canonical interface baseline.

## 中文

### 用途
这个目录保存 PortManager V1 的共享公共契约基线。
它的存在是为了让未来的 controller、web、CLI、agent 与 SDK 从同一份已评审接口定义中生长出来。

### 内容
- `openapi/openapi.yaml`：controller REST + SSE 契约草案
- `jsonschema/runtime-state.schema.json`：agent 上报的运行态
- `jsonschema/apply-desired-state.schema.json`：应用到主机上的期望状态载荷
- `jsonschema/snapshot-manifest.schema.json`：备份 / 产物 manifest
- `jsonschema/rollback-result.schema.json`：回滚执行结果
- `jsonschema/operation-result.schema.json`：operation 状态与摘要结果
- `jsonschema/port-diagnostic-result.schema.json`：端口连通性与 HTTP/TLS 诊断结果
- `jsonschema/web-snapshot-result.schema.json`：网页截图结果元数据

### 归属规则
- OpenAPI 负责 controller API 资源与 SSE 事件。
- JSON Schema 负责 agent 载荷与产物 / 结果文档。
- 后续代码生成必须把这些文件视为规范接口的基线真源。
