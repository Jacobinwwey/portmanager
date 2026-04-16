---
title: Non-Interactive Flows
---

# Non-Interactive Flows

这个页面定义自动化、agent consumer 与未来 SDK 包装层所期待的契约姿态。

## CLI 预期

```bash
pmctl bridge apply --host alpha --file desired-state.toml --json --wait
```

- `--json` 只返回结构化输出
- `--wait` 持续阻塞直到 operation 进入终态或超时
- 命令结果必须暴露 operation id 与 rollback point，而不是把它们藏起来

## API 预期

- REST 负责请求 / 响应式的变更入口
- SSE 负责实时 operation 进度与事件流更新
- operation id 是 CLI、API 与 Web 之间共享的连接键

## 失败语义

- transport failure 不能和 degraded state 混为一谈
- timeout 必须显式报告，不能改写成泛化错误
- rollback 是否可用必须进入结果契约
