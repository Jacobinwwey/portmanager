---
title: "安装与分发契约"
audience: shared
persona:
  - admin
  - automation
section: operations
sourcePath: "docs/specs/portmanager-install-distribution-contract.md"
status: active
---
> 真源文档：`docs/specs/portmanager-install-distribution-contract.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-16 | Version：v0.2.0-docs-site-baseline
### 用途
这份文档在产品实现尚未存在之前，先冻结最短安装与 bootstrap 入口的公共形态。
下面的命令属于分发契约，而不是“当前已经可用”的声明。
任何尚未实现的命令都必须在文档站中标记为 `Planned`。

### Human 快速开始契约
Human 文档站必须在顶层暴露两类 control plane 安装的一行入口：
- `Preferred`：更安全、可审计的一行安装形态
- `Fastest`：最短 bootstrap 形态，但必须明确标为更高风险

### 计划中的命令形态
Preferred：
```bash
# Planned

docker compose -f https://jacobinwwey.github.io/portmanager/install/control-plane.compose.yaml up -d
```

Fastest：
```bash
# Planned
curl -fsSL https://jacobinwwey.github.io/portmanager/install/bootstrap-control-plane.sh | bash
```

### Agent 快速开始契约
Agent 文档不能冒充“安装 control plane”。
它必须改为暴露非交互消费入口，例如：
```bash
portmanager operation get op_123 --json --wait
```

这个 operation read 形态现在已经作为 Milestone 1 CLI 基础命令进入仓库。
其他自动化入口在真正实现前仍然保持 `Planned`。

```bash
# Planned
curl -fsSL https://controller.example/api/operations/events
```

### 状态规则
只要某个安装或 bootstrap 路径尚未在仓库中真实存在且可测试，文档站就必须将其标记为 `Planned`。
不能把计划中的命令包装成已经可用的入口。
