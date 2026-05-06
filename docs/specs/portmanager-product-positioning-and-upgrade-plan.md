# PortManager Product Positioning and Upgrade Plan

Updated: 2026-05-06
Version: v0.1.0-product-positioning-realignment

## English

### Purpose
This document freezes the product-positioning correction that became necessary after deeper comparison with nearby open-source projects.
It exists to stop PortManager from drifting into two failure modes:

- being misread as a generic local port utility
- becoming a review/evidence machine whose implementation center of gravity no longer serves operator value

### Comparative baseline
The most useful comparison is not “which repo has more port features.”
The useful comparison is which operational problem each repo actually solves.

#### PortsWhisper-Rust
- Product class: local CLI for port/process ownership, inspection, logs, and termination.
- Strengths worth absorbing:
  - extremely clear scope
  - dense CLI value per command
  - release hygiene and packaging discipline
  - direct operator affordances instead of conceptual ceremony
- Boundaries not to copy:
  - local-machine-first problem framing
  - process/port introspection as the product center
  - single-user workstation assumptions

#### PortMaster
- Product class: local desktop console for dev-service start/stop/logs/project memory.
- Strengths worth absorbing:
  - operator-first UX
  - service lifecycle coherence
  - practical “what can I do next” orientation
  - tighter relationship between discovery, action, and logs
- Boundaries not to copy:
  - Electron desktop as the product center
  - local project launcher mental model
  - workstation orchestration scope

#### PortManager
- Product class: remote localhost exposure control plane over Tailscale.
- Core problem:
  - safely expose selected remote localhost services
  - preserve backup-before-mutation and rollback semantics
  - make diagnostics, degraded state, and operational evidence first-class
  - keep Web, CLI, API, and agent aligned on the same truth model

### Product truth: what PortManager is
PortManager is not primarily about “port management.”
Its actual product value is a remote-exposure governance plane with bounded mutation and verifiable evidence.

The strongest differentiators today are:
- remote localhost exposure as a managed desired state
- backup-before-mutation as a hard rule rather than a convention
- rollback points as first-class recoverability primitives
- diagnostics and snapshots as evidence, not decoration
- explicit `degraded` semantics rather than generic failure collapse
- one truth model shared across Web, CLI, API, and agent

### Product truth: what PortManager is not
- not a local port/process inspector
- not a local dev-service launcher
- not a generic SSH automation wrapper
- not an all-platform fleet manager
- not an internal review system whose primary value is producing more packets about itself

### Critical diagnosis of current repo direction
The repo has real engineering progress.
The main risk is not lack of implementation, but direction drift.

#### Drift 1: naming mismatch
`PortManager` sounds like a local port utility.
The implemented system is closer to a remote exposure control plane.

Implication:
- docs and UI must keep reasserting the remote-control-plane framing
- we should avoid absorbing roadmap work that strengthens the wrong mental model

#### Drift 2: runtime core pollution by review surfaces
The codebase now contains substantial review/evidence/decision-pack surfaces.
Some of that is justified.
Too much of it risks moving the runtime center from “operate remote exposure safely” to “prepare review artifacts.”

Implication:
- review and evidence remain valuable
- but they must not become the dominant product behavior
- operator golden paths must stay shorter and more obvious than review-prep paths

#### Drift 3: Scheme C prepayment
Docs say Toward C is earned.
The repo already spends meaningful complexity budget preparing for C.

Implication:
- future C work needs stronger gates
- no new meta-surface should land unless it shortens or hardens a real operator path

#### Drift 4: unrealistic network semantics
The controller-to-agent steady-state client previously used `AbortSignal.timeout(500)`.
That is too aggressive for a remote control-plane boundary and creates synthetic instability.

Implication:
- network semantics must assume real remote jitter
- failures should represent meaningful reachability problems, not self-inflicted impatience

### Critical product conclusion
PortManager is worth continuing only if it remains focused on the narrow but high-value problem it actually solves.

That problem is:
- safe remote localhost exposure
- bounded mutation
- recoverability
- diagnostics visibility
- same truth everywhere

If it drifts into generic port tooling, it loses against simpler products.
If it drifts into architecture theater, it loses against its own operator value.

### Value absorption plan from the reference projects

#### Absorb from PortsWhisper-Rust
- CLI density:
  - PortManager CLI commands should stay short, composable, and evidence-oriented.
  - standardize the primary executable prefix as `pmg` so operator commands stay compact and visually distinct from product/repo naming.
- release hygiene:
  - keep acceptance and packaging discipline visible.
- scope clarity:
  - every command and page should reinforce “remote exposure control plane,” not generic port tooling.

#### Absorb from PortMaster
- operator-first surfaces:
  - fewer abstract review nouns on primary pages
  - stronger “current status -> next action -> evidence” loops
- lifecycle coherence:
  - host/rule actions, diagnostics, rollback, and backup status should feel like one operational narrative
- practical observability:
  - if a host or rule is degraded, the shortest recovery path should be obvious

### Comparative capability matrix

| Capability axis | PortsWhisper-Rust | PortMaster | PortManager target posture |
| --- | --- | --- | --- |
| Primary scope | local port/process inspection | local service lifecycle desktop console | remote localhost exposure governance |
| Main operator question | who owns this port right now | how do I start/stop/revisit this local service | can I safely expose, verify, degrade, and roll back this remote localhost path |
| Control boundary | local machine | local workstation and Docker context | remote host over Tailscale with bounded mutation |
| Evidence model | direct command output | dashboard plus logs | contract-backed operations, diagnostics, backups, rollback points, degraded semantics |
| Good value to absorb | CLI sharpness, packaging discipline, scope clarity | actionability, lifecycle continuity, recovery-oriented UX | keep as product core |
| Boundary to reject | process inspector becoming the product center | desktop launcher becoming the product center | do not drift away from remote exposure control |

### Concrete absorption workstreams

#### Workstream 1: CLI density from PortsWhisper-Rust
- keep verbs short and deterministic
- keep the primary command prefix short and stable: `pmg`
- keep `--json` output first-class and stable
- prefer direct task language over internal control-plane jargon
- improve “one command to next action” paths:
  - inspect host degradation
  - inspect rule verification state
  - inspect backup/rollback evidence
  - replay operation/event context

Implementation implication:
- new CLI surface area should bias toward tighter reads and follow-up actions, not more resource nouns
- if a command cannot answer “what should the operator do next,” it is probably too abstract

#### Workstream 2: operator loop from PortMaster
- make Overview and Host Detail answer three questions immediately:
  - what is broken
  - what is safe to do next
  - what evidence supports that recommendation
- keep host/rule/backup/diagnostics/rollback on one operational narrative instead of split review islands

Implementation implication:
- primary web surfaces should privilege status, next action, and last proof
- review and decision-pack links stay available, but secondary

#### Workstream 3: release and packaging discipline
- borrow the release hygiene standard, not the product scope
- formalize install/test/release contracts for CLI, controller, web, and docs publication
- keep checksum, acceptance, and artifact verifiability visible

Implementation implication:
- every future distribution surface should be acceptance-backed
- “works on my machine” paths are not sufficient for a control-plane product

### Explicit rejection list

- do not add local process-kill or local port-owner inspection into the controller core
- do not turn the web app into a generic workstation launcher
- do not add Electron as a product shell just to copy PortMaster interaction style
- do not let diagnostic/review packet generation outrun the shortest operator recovery path
- do not treat more surfaces or more nouns as proof of product maturity

### Product upgrade tracks

#### Track A: operator golden path hardening
- make `create host -> bootstrap -> apply one rule -> diagnose -> rollback` the shortest and best-supported path
- keep degraded causes explicit and actionable
- tighten controller-agent timeout and retry posture only where it reduces false instability

#### Track B: CLI ergonomics and agent usability
- keep machine-readable output contract-stable
- improve follow-up inspection commands before adding broad new domains
- make agent-facing automation flows deterministic instead of conversational

#### Track C: web actionability
- elevate last successful proof, current blocking delta, and recommended next action on overview/detail surfaces
- reduce primary-screen cognitive weight spent on review-pack mechanics

#### Track D: release and acceptance operations
- keep `acceptance:verify` and docs publication green as non-negotiable branch discipline
- require packaging/release additions to prove parity with the same control-plane truth model

### Engineering pitfalls to avoid

- If we import local-tool verbs without changing the product boundary, we create naming and expectation debt.
- If we import dashboard density without preserving action hierarchy, we create a pretty but indecisive control plane.
- If we keep adding review surfaces before shortening recovery loops, we create review tax rather than operational value.
- If we broaden targets before Ubuntu/Tailscale support is boringly stable, we lose truth density and debuggability.

### Upgrade plan

#### Priority 1: re-center the product narrative
- tighten root docs around remote exposure governance
- explicitly distinguish PortManager from local port tools
- reduce language that over-emphasizes review machinery as the product center

#### Priority 2: harden the operator golden path
- create and protect the shortest path for:
  - create host
  - probe/bootstrap host
  - apply one bridge rule
  - verify diagnostics
  - inspect degradation
  - rollback
- every new milestone task should be judged against whether it helps this path

#### Priority 3: isolate review/evidence from runtime critical path
- review artifacts remain first-class outputs
- but review-specific complexity should stop leaking into ordinary operator flows unless it prevents a real failure mode
- ordinary implementation slices should not require new review/evidence surfaces unless they change public wording, touch a high-risk mutation path, or close a demonstrated failure mode

#### Priority 4: harden remote-network semantics
- replace unrealistic controller-agent timeout assumptions with configurable, evidence-based defaults
- audit all controller-agent calls for jitter tolerance, failure classification, and retry posture

#### Priority 5: tighten Toward C gates
- no new C-oriented abstraction unless one of the following is true:
  - it unlocks a blocked operator path
  - it removes an already-proven runtime bottleneck
  - it prevents a demonstrated contract divergence

### Implementation implications

#### Near-term
- keep Milestone 2 as guardrail, not as product center
- keep Milestone 3 bounded to seam extraction and real blocking deltas
- fix network semantics that create false degraded behavior

#### Medium-term
- improve CLI ergonomics and operational density
- improve Overview and Host Detail actionability
- keep review surfaces readable but secondary to the operator task flow

#### Longer-term
- if the product keeps proving value, reconsider naming/positioning language in UI and docs
- only then earn stronger C-style distribution work

### Best-practice rules going forward
- operator paths beat meta-surfaces
- `pmg` stays the primary CLI entrypoint; the product name remains `PortManager`
- fewer nouns, more executable outcomes
- evidence supports runtime truth; it does not replace it
- remote-control semantics must tolerate real-world latency
- do not expand host/platform scope until current support semantics are boringly reliable

## 中文

### 用途
这份文档冻结一次必要的产品定位纠偏。
触发原因是：在与邻近开源项目进行更深入对比后，我们已经不能继续接受当前这两种漂移风险：

- 被误读为一个通用本地端口工具
- 逐步演化成“评审/证据系统”，而不是继续服务操作者真实价值

### 对比基线
真正有意义的比较方式，不是“谁的端口功能更多”。
真正有意义的是：每个项目实际在解决什么运维问题。

#### PortsWhisper-Rust
- 产品类别：本地 CLI，解决端口/进程归属、检查、日志与终止。
- 值得吸收的优点：
  - 范围极清晰
  - 单条命令价值密度高
  - 发布与打包纪律强
  - 面向操作者的直接能力，而不是概念层包装
- 不应复制的边界：
  - 以本地机器为中心的问题定义
  - 把进程/端口检查当成产品中心
  - 默认单机开发工作站心智

#### PortMaster
- 产品类别：本地桌面控制台，解决 dev service 启停、日志与项目记忆。
- 值得吸收的优点：
  - 强 operator-first UX
  - 服务生命周期连贯
  - 很强的“下一步可以做什么”导向
  - discovery、action 与 logs 之间关系紧密
- 不应复制的边界：
  - 以 Electron 桌面端为产品中心
  - 以本地项目启动器为核心心智
  - 以工作站编排为范围

#### PortManager
- 产品类别：通过 Tailscale 进行远端 localhost 暴露的控制平面。
- 核心问题：
  - 安全地暴露选定的远端 localhost 服务
  - 保留变更前备份与回滚语义
  - 把诊断、降级状态与操作证据做成一等能力
  - 让 Web、CLI、API 与 agent 共用同一份真相

### 产品真相：PortManager 是什么
PortManager 的核心并不是“端口管理”。
它真正的产品价值是：一个带边界变更能力、可恢复性和可验证证据的远端暴露治理平面。

当前最强的差异化价值是：
- 把远端 localhost 暴露建模为受控 desired state
- 把 backup-before-mutation 作为硬规则，而不是约定
- 把 rollback point 做成一等恢复原语
- 把 diagnostics 与 snapshots 作为证据，而不是装饰
- 用显式 `degraded` 语义替代泛化失败
- 让 Web、CLI、API 与 agent 共享同一份真相模型

### 产品真相：PortManager 不是什么
- 不是本地端口/进程检查工具
- 不是本地开发服务启动器
- 不是通用 SSH 自动化壳
- 不是全平台 fleet manager
- 不是主要价值在于“给自己制造更多评审包”的内部评审系统

### 对当前仓库方向的关键诊断
这个仓库已经有了真实工程进展。
当前最大的风险不是没有实现，而是方向漂移。

#### 漂移 1：命名与产品心智不一致
`PortManager` 这个名字听起来像一个本地端口工具。
但当前真实实现更接近远端暴露控制平面。

含义：
- 文档和 UI 必须不断重申 remote control plane 的问题定义
- 不要吸收会强化错误心智的路线工作

#### 漂移 2：review surface 污染 runtime core
当前代码里已经有相当多 review/evidence/decision-pack 表面。
其中一部分是合理的。
但如果继续放大，就会把运行时重心从“安全操作远端暴露”转移为“准备评审产物”。

含义：
- review 与 evidence 仍然有价值
- 但它们不能成为主要产品行为
- operator golden path 必须始终比 review-prep path 更短、更直接

#### 漂移 3：过早为 Scheme C 预付复杂度
文档里说 Toward C 是 earned 的。
但当前仓库已经在为 C 提前支付不少复杂度预算。

含义：
- 后续 C 工作必须加更强 gate
- 任何新的 meta-surface，如果不能缩短或加固真实操作者路径，就不该继续落

#### 漂移 4：网络语义过于乐观
controller 到 agent 的稳态客户端此前使用 `AbortSignal.timeout(500)`。
对于远端控制平面来说，这个值过于激进，会制造“系统看起来不稳定”的假象。

含义：
- 网络语义必须假设真实远端抖动
- 失败应代表有意义的 reachability 问题，而不是我们自己定义得过于急躁

### 关键产品结论
只有当 PortManager 继续聚焦它真正解决的那个高价值、狭范围问题时，这个项目才值得继续推进。

那个问题是：
- 安全的远端 localhost 暴露
- 有边界的 mutation
- 可恢复性
- 诊断可见性
- 全表面同一真相

如果它漂移成通用端口工具，会输给更简单的产品。
如果它漂移成架构表演，则会输给它自己已经证明的 operator 价值。

### 从参考项目中吸收价值的计划

#### 吸收自 PortsWhisper-Rust
- CLI 价值密度：
  - PortManager 的 CLI 必须保持简短、可组合、面向证据。
  - 主执行入口前缀标准化为 `pmg`，让操作者命令保持紧凑，并与产品/仓库命名分层。
- 发布纪律：
  - 持续保持 acceptance 与 packaging discipline 可见。
- 范围清晰：
  - 每个命令与页面都要强化“远端暴露控制平面”，而不是“泛端口工具”。

#### 吸收自 PortMaster
- operator-first 表面：
  - 主页减少抽象 review 名词
  - 强化“当前状态 -> 下一步动作 -> 证据”的回路
- 生命周期连贯：
  - host/rule 操作、diagnostics、rollback、backup status 要形成一条统一操作叙事
- 实用可观测性：
  - 如果 host 或 rule degraded，最短恢复路径必须显而易见

### 对比能力矩阵

| 能力轴 | PortsWhisper-Rust | PortMaster | PortManager 目标姿态 |
| --- | --- | --- | --- |
| 主要范围 | 本地端口/进程检查 | 本地服务生命周期桌面控制台 | 远端 localhost 暴露治理 |
| 操作者核心问题 | 这个端口现在是谁占的 | 我怎么启动/停止/回到这个本地服务 | 这个远端 localhost 路径能否被安全暴露、验证、降级和回滚 |
| 控制边界 | 本机 | 本地工作站与 Docker 上下文 | 通过 Tailscale 管理远端主机上的有边界 mutation |
| 证据模型 | 直接命令输出 | dashboard 加 logs | 契约化 operations、diagnostics、backups、rollback points 与 degraded 语义 |
| 值得吸收的优点 | CLI 锐度、发布纪律、范围清晰 | actionability、生命周期连续性、恢复导向 UX | 继续保持为产品核心 |
| 需要拒绝的边界 | 让 process inspector 变成产品中心 | 让桌面启动器变成产品中心 | 不允许偏离 remote exposure control |

### 具体吸收工作流

#### 工作流 1：吸收自 PortsWhisper-Rust 的 CLI 密度
- 保持动词短、确定性强
- 保持主命令前缀短且稳定：`pmg`
- 持续把 `--json` 输出作为一等且稳定的契约
- 优先使用直接任务语言，而不是内部控制平面术语
- 强化“一条命令通向下一步动作”的链路：
  - 检查 host degradation
  - 检查 rule verification state
  - 检查 backup/rollback evidence
  - 回放 operation/event context

对实现的直接含义：
- 新 CLI 表面应优先收敛为更紧凑的读取与后续动作，而不是继续增加资源名词
- 如果一条命令回答不了“操作者下一步应该做什么”，那它大概率过于抽象

#### 工作流 2：吸收自 PortMaster 的 operator loop
- 让 Overview 与 Host Detail 先回答三个问题：
  - 现在坏了什么
  - 下一步安全动作是什么
  - 这个建议由什么证据支持
- 让 host/rule/backup/diagnostics/rollback 保持一条统一操作叙事，而不是裂成多个 review 岛

对实现的直接含义：
- Web 主表面优先强调 status、next action 与 last proof
- review 与 decision-pack 链接继续保留，但必须退居次要位置

#### 工作流 3：发布与打包纪律
- 吸收的是发布 hygiene 标准，而不是产品范围
- 正式化 CLI、controller、web 与 docs publication 的 install/test/release 契约
- 持续让 checksum、acceptance 与 artifact verifiability 可见

对实现的直接含义：
- 任何未来分发表面都必须有 acceptance 兜底
- 对于控制平面产品，“只在我的机器可用”不能算完成

### 显式拒绝清单

- 不要把本地进程 kill 或本地端口归属检查放进 controller core
- 不要把 Web 应用做成通用工作站启动器
- 不要为了复制 PortMaster 的交互风格而引入 Electron 产品壳
- 不要让 diagnostic/review packet 生成速度跑赢最短 operator recovery path
- 不要把“更多表面”或“更多名词”误当成产品成熟度

### 产品升级轨道

#### 轨道 A：operator golden path 加固
- 让 `create host -> bootstrap -> apply one rule -> diagnose -> rollback` 成为最短且支持最强的路径
- 让 degraded 原因持续显式且可操作
- 只在确实能降低伪不稳定时，收紧 controller-agent timeout 与 retry posture

#### 轨道 B：CLI ergonomics 与 agent usability
- 继续保持 machine-readable output 契约稳定
- 在增加新领域前，优先补强 follow-up inspection commands
- 让 agent-facing automation flow 保持 deterministic，而不是对话式

#### 轨道 C：Web actionability
- 在 overview/detail 表面优先抬升 last successful proof、current blocking delta 与 recommended next action
- 减少主屏幕对 review-pack mechanics 的认知负担

#### 轨道 D：发布与验收操作
- 把 `acceptance:verify` 与 docs publication 转绿继续当作不可谈判的分支纪律
- 新的 packaging/release 能力必须证明自己与同一套 control-plane truth model 对齐

### 需要避免的工程坑点

- 如果引入了本地工具动词，却不改变产品边界，就会制造命名和预期债务。
- 如果只吸收 dashboard 密度，却没有保住 action hierarchy，就会得到“好看但迟疑”的控制平面。
- 如果在缩短 recovery loop 之前继续增加 review surface，就会产生 review tax，而不是操作价值。
- 如果在 Ubuntu/Tailscale 支持还没有稳定到“无聊”之前扩大目标范围，就会丢失真相密度与可调试性。

### 升级计划

#### 优先级 1：把产品叙事重新拉回中心
- 收紧根文档，明确 remote exposure governance
- 显式区分 PortManager 与本地端口工具
- 降低把 review machinery 写成产品中心的语言比例

#### 优先级 2：加固 operator golden path
- 创建并保护最短路径：
  - create host
  - probe/bootstrap host
  - apply one bridge rule
  - verify diagnostics
  - inspect degradation
  - rollback
- 任何新的里程碑任务，都要先看它是否在帮助这条路径

#### 优先级 3：把 review/evidence 与 runtime critical path 隔离
- review artifact 仍是一等输出
- 但 review 专属复杂度不应继续泄漏到普通 operator flow，除非它确实在防止真实故障
- 普通实现切片不应再默认要求新增 review/evidence 表面，除非它会改变公开文案、触及高风险 mutation 路径，或闭环一个已证明失败模式

#### 优先级 4：加固远端网络语义
- 用可配置、基于真实证据的默认值替换不现实的 controller-agent timeout 假设
- 审查所有 controller-agent 调用，检查 jitter tolerance、failure classification 和 retry posture

#### 优先级 5：收紧 Toward C 的进入门槛
- 任何新的 C-oriented abstraction，只有在满足以下任一条件时才允许继续：
  - 它解锁了被阻塞的 operator path
  - 它移除了一个已经被证明存在的 runtime bottleneck
  - 它防止了已经出现的 contract divergence

### 对实现的直接含义

#### 近期
- 继续把 Milestone 2 当作 guardrail，而不是产品中心
- 继续把 Milestone 3 限制在 seam extraction 与真实 blocking delta 上
- 先修掉那些会制造伪降级的网络语义问题

#### 中期
- 提升 CLI 的 ergonomics 与 operational density
- 提升 Overview 与 Host Detail 的 actionability
- 让 review surface 保持可读，但明确次于 operator task flow

#### 更长期
- 如果产品持续证明价值，再重新审视 UI 与文档中的 naming/positioning 表述
- 只有到那时，才真正赚到更强 C 风格分布式工作的资格

### 后续最佳实践规则
- operator path 优先于 meta-surface
- `pmg` 保持为主 CLI 入口；产品名称继续保持为 `PortManager`
- 少一些抽象名词，多一些可执行结果
- evidence 服务于 runtime truth，但不能替代 runtime truth
- 远端控制语义必须容忍真实世界延迟
- 当前支持边界在变得“无聊地稳定”之前，不要扩大 host/platform scope
