---
title: Agent Quickstart
---

# Agent Quickstart

产品实现尚未发布，所以这个页面冻结的是目标中的非交互入口形态，而不是假装这条命令已经可以运行。

## 状态

`Planned`

## 目标命令形态

```bash
pmctl host probe --host demo-host --json --wait
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
