---
title: Agent Quickstart
---

# Agent Quickstart

完整产品实现尚未发布，但第一条 CLI read path 现在已经进入仓库。

## 状态

`Partial`

## 目标命令形态

```bash
portmanager operation get op_123 --json --wait
```

## 必须满足的行为

- 当存在 `--json` 时输出必须机器可读
- `--wait` 语义必须显式，而不是隐藏轮询
- 成功、degraded 与 failure 需要有稳定退出码
- 非交互模式不能出现隐藏提示

## 下一步阅读

- [非交互工作流](/zh/agent/non-interactive)
- [OpenAPI 参考](/zh/reference/openapi)
- [契约基线](/zh/reference/contracts-baseline)
