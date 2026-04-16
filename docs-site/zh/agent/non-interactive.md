---
title: Non-Interactive Flows
---

# Non-Interactive Flows

这个页面定义自动化、agent consumer 与未来 SDK 包装层所期待的契约姿态。
仓库里现在已经有第一条真正实现的 CLI read path。

## CLI 预期

```bash
portmanager operation get op_123 --json --wait
```

- `--json` 只返回结构化输出
- `--wait` 持续阻塞直到 operation 进入终态或超时
- transport failure 会返回显式、可机读的错误载荷
- degraded operation state 会被保留下来，而不是被折叠成泛化 transport error

## API 预期

- REST 负责请求 / 响应式的变更入口
- SSE 负责实时 operation 进度与事件流更新
- operation id 是 CLI、API 与 Web 之间共享的连接键

## 失败语义

- transport failure 不能和 degraded state 混为一谈
- timeout 必须显式报告，不能改写成泛化错误
- rollback 是否可用必须进入结果契约
