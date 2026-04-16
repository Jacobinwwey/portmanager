# PortManager Install and Distribution Contract

Updated: 2026-04-16
Version: v0.2.0-docs-site-baseline

## English

### Purpose
This document freezes the public shape of the shortest installation and bootstrap entrypoints before the product implementation exists.
The commands below are distribution contracts, not claims of current availability.
Any not-yet-implemented command must be labeled `Planned` in the docs site.

### Human quick-start contract
The human-facing docs site must expose two top-level one-line entrypoints for control-plane installation:
- `Preferred`: safe, auditable, one-command installation shape
- `Fastest`: shortest bootstrap shape, explicitly marked as higher-risk

### Planned command shapes
Preferred:
```bash
# Planned

docker compose -f https://jacobinwwey.github.io/portmanager/install/control-plane.compose.yaml up -d
```

Fastest:
```bash
# Planned
curl -fsSL https://jacobinwwey.github.io/portmanager/install/bootstrap-control-plane.sh | bash
```

### Agent quick-start contract
Agent-facing docs must not pretend to install the control plane.
They must instead expose non-interactive consumption shapes such as:
```bash
portmanager operation get op_123 --json --wait
```

This operation-read shape now exists in the repository as a Milestone 1 CLI foundation command.
Other automation entrypoints remain planned until implemented.

```bash
# Planned
curl -fsSL https://controller.example/api/operations/events
```

### Status rule
Until an install or bootstrap path truly exists in-repo and is testable, the docs site must mark it `Planned`.
It must not present planned commands as already available.

## 中文

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
