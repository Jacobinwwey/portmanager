# PortManager Agent Bootstrap

Updated: 2026-04-16
Version: v0.1.0-docs-baseline

## English

### Bootstrap objective
Convert a supported remote Ubuntu 24.04 host from unmanaged state into a `ready` PortManager host without making SSH the long-term control plane.

### Ordered bootstrap flow
1. Create a `Host` record in controller.
2. Run probe over SSH with read-only capability checks.
3. Refuse bootstrap if mandatory prerequisites fail.
4. Upload bootstrap bundle over SSH.
5. Install Rust agent binary and supporting unit files.
6. Write `/etc/portmanager/agent.toml`.
7. Initialize `/var/lib/portmanager/desired-state.toml`, runtime directories, and ownership.
8. Register and start the `systemd` service.
9. Verify HTTP reachability over Tailscale.
10. Collect first runtime state and persist it in controller.
11. Mark host `ready` only after validation passes.

### Probe requirements
- Ubuntu 24.04
- `systemd` available
- `sudo` available
- `tailscale` installed and operational
- packet-filter dependency available for V1 rule model
- target directories writable
- non-interactive SSH commands succeed
- host identity and Tailscale address discoverable

### Rescue boundary
- SSH remains the recovery path if the agent is not reachable.
- Rescue does not redefine the steady-state architecture.
- Rescue commands must still be surfaced as operations when executed through controller workflows later.

### Agent responsibilities after bootstrap
- expose minimal HTTP API over Tailscale
- apply desired bridge rules
- report runtime state
- create local snapshots and rollback primitives
- return machine-readable execution results

### Configuration split
- Human-maintained configuration: TOML under `/etc/portmanager`
- Runtime payloads, manifests, and diagnostics: JSON under `/var/lib/portmanager` and controller artifact paths

## 中文

### Bootstrap 目标
在不把 SSH 变成长期控制平面的前提下，将受支持的 Ubuntu 24.04 远端主机从未纳管状态转换为 `ready` 的 PortManager 主机。

### 按顺序的 bootstrap 流程
1. 在 controller 中创建 `Host` 记录。
2. 通过 SSH 进行只读能力探测。
3. 如果关键前置条件失败，则拒绝 bootstrap。
4. 通过 SSH 上传 bootstrap bundle。
5. 安装 Rust agent 二进制与配套 unit 文件。
6. 写入 `/etc/portmanager/agent.toml`。
7. 初始化 `/var/lib/portmanager/desired-state.toml`、运行目录与权限。
8. 注册并启动 `systemd` 服务。
9. 验证通过 Tailscale 的 HTTP 可达性。
10. 采集首次 runtime state 并持久化到 controller。
11. 只有在验证通过后才将主机标记为 `ready`。

### Probe 要求
- Ubuntu 24.04
- `systemd` 可用
- `sudo` 可用
- `tailscale` 已安装且工作正常
- V1 规则模型所需的数据包过滤依赖可用
- 目标目录可写
- 非交互 SSH 命令执行成功
- 主机身份与 Tailscale 地址可被发现

### 救援边界
- 当 agent 不可达时，SSH 仍然是恢复路径。
- 救援不应反过来重定义稳态架构。
- 后续如果通过 controller 工作流触发救援命令，也必须作为 operation 被显式记录。

### Bootstrap 后 agent 的职责
- 在 Tailscale 上暴露最小 HTTP API
- 应用期望 bridge rules
- 回报 runtime state
- 创建本地快照与回滚原语
- 返回机器可读的执行结果

### 配置拆分
- 人类维护配置：位于 `/etc/portmanager` 的 TOML
- 运行载荷、manifest 与诊断：位于 `/var/lib/portmanager` 与 controller artifact 路径中的 JSON
