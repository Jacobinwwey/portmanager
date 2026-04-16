---
title: "里程碑"
audience: shared
persona:
  - contributor
  - admin
  - operator
section: roadmap
sourcePath: "docs/specs/portmanager-milestones.md"
status: active
---
> 真源文档：`docs/specs/portmanager-milestones.md`
> Audience：`shared` | Section：`roadmap` | Status：`active`
> Updated：2026-04-16 | Version：v0.3.2-roadmap-solidification
### 路线排序规则
- 在扩展实现广度之前，先冻结契约、设计基线与发布规则。
- 在扩展可靠性或平台范围之前，先证明一条可信的最小运行切片。
- 可靠性工作优先于平台广度，因为不稳定的多主机扩展只会放大歧义。
- `Toward C` 不是一个占位口号，而是一个需要通过 `B` 验证状态“挣出来”的阶段。

### A / B / C 递进模型
- `A`：docs-first 基线。契约、设计基线、路由契约、安装契约与发布规则都已经冻结且可评审。
- `B`：可信验证状态。PortManager 端到端证明一条真实控制平面切片：one host、one rule、one rollback，并且完成当前 agent-service 设置与能力的最小迁移，不再停留在纸面方案。
- `C`：更广的平台状态。PortManager 从狭义的单主机 bridge 控制平面，成长为同时服务人类与 agent consumer 的更通用 terminal-side 管理基座，同时仍然保持 contract-first 治理。

### 里程碑 1：One Host, One Rule, One Rollback

#### 为什么需要这个里程碑
里程碑 1 必须刻意保持狭窄。
它的职责是证明 PortManager 是一个真实控制平面，而不是一组文档、shell 胶水、截图和未来承诺的组合。
这里也是 `B` 验证状态开始形成的地方：把当前 agent-service 行为最小且可信地迁移进新的控制平面模型。

#### 已锁定选择
- 服务拆分：`controller API + React SPA web`
- 执行层：`Rust CLI + Rust agent`
- `SQLite` 作为 V1 默认状态库
- `OpenAPI + JSON Schema + codegen` 作为公共契约基础
- 使用 controller-side 快照与诊断，而不是 agent-side 浏览器抓取
- bootstrap / rescue 走 SSH，稳态通信走 `HTTP over Tailscale`

#### 验收门槛
只有当以下条件全部满足时，里程碑 1 才算成立：
- 一台主机可以从 `draft` 进入 `ready`
- 一条 bridge rule 可以从 `desired` 进入 `active`
- destructive mutation 前总能先完成必需的本地备份
- 失败会留下 operation 记录与可用 rollback point
- diagnostics 同时产出机器可读结果与网页快照产物
- Web、CLI 与 API 对 host、rule、operation 与 degraded 状态的观察一致

#### 明确延后的内容
- PostgreSQL 作为默认状态库
- 批量编排与 fleet 管理
- 超出首个 Ubuntu 24.04 目标之外的广平台支持
- 让 agent 变成浏览器运行时或 shell 编排替身
- 在第一条可信切片真实存在之前，过早产品化所有 C 形态能力

### 里程碑 2：Engineering Reliability

#### 为什么需要这个里程碑
里程碑 2 的职责，是让 `B` 验证状态在反复真实使用中值得信任。
顺序是刻意的：当 backup、rollback、drift 可见性与 degraded 处理还很弱时，不应该先扩展范围。
这个里程碑的重点是 survivability、inspectability 与 operational confidence，而不是最“好看”的新表面。

#### 已锁定选择
- 可靠性被视为一等产品行为，而不只是内部工程 hygiene
- degraded 状态必须显式、可见，而不是被隐式吞掉
- backup policy 必须成为 operation 行为的一部分，而不是软约定
- GitHub 私有备份接入是附加安全层，不能替代必需的本地备份
- rollback UX 只有在证据链仍然可审计、与契约对齐时才有意义

#### 验收门槛
只有当以下条件全部满足时，里程碑 2 才算成立：
- degraded 状态在 Web、CLI 与 API 中显式存在，而不是被泛化失败文案掩盖
- `best_effort` / `required` 等备份策略既可见又真正影响行为
- drift detection 能在无语义歧义的情况下把资源推进 `degraded`
- rollback 更容易检查与执行，但不会削弱证据轨迹
- diagnostics、backups 与 operations 页面相较于里程碑 1 骨架有实质补全

#### 明确延后的内容
- 完整的广平台支持
- 跨多种异构主机类型的通用编排
- 在真实并发和可靠性压力出现前，把 PostgreSQL 迁移硬塞进默认路径
- 在可靠性尚未真正建立前，过早围绕 C 进行产品重心重排

### 里程碑 3：Toward C

#### C 代表什么
`C` 不是“更多功能”。
它更具体地指向 **方案 C：Agent-First Distributed Platform**。
在这套方案里：
- 从一开始就把 controller、agent、event stream、policy layer、audit layer 拆开
- UI、CLI、自动化接口统一面对 API gateway，而不是依赖临时本地表面
- 远端 agent 成为真正的一等架构参与者

C 的吸引力，在于架构完整性和长期扩展性。
但它的风险也同样明确：在空仓库起步阶段，很容易把时间消耗在基础设施形状上，而不是先把 PortManager 的第一条可靠价值链路做出来。

#### 为什么 C 不是里程碑 1 或 2
- 如果里程碑 1 不真实，C 就只是架构表演。
- 如果里程碑 2 不真实，C 只会把不可靠性复制到更多主机和更多界面。
- 所以 C 必须建立在可信 `B` 状态和显式可靠性工作之后，而不是跳过这些门槛。
- 之所以把 C 留在后面，就是因为它的上限是战略性的，而它在 V1 阶段的下限则是明显过度设计与价值交付延迟。

#### 进入 C 的前置门槛
只有当以下条件都成立时，里程碑 3 才能从口号变成真实执行阶段：
- `B` 验证状态已经在真实使用中被证明可信
- backup、rollback 与 degraded 处理已经足够稳定，不会在扩展范围时抹掉责任边界
- Web、controller、CLI、agent 与 SDK-facing 结构都已经受共享契约治理
- 最小 agent-service 迁移已经证明产品可以吸收现有行为，同时不丢失控制平面语义

#### C 中锁定的工作流
- 更强的 agent reporting 与 event semantics
- 批量主机管理与有边界的 orchestration primitive
- 当 SQLite 真正成为并发或可靠性瓶颈后，再推进 PostgreSQL 迁移或迁移就绪工作
- 更广的平台抽象，但仍然通过明确支持目标层推进
- 只有当抽象层可信之后，才为 macOS、移动端、更广 Linux、Windows 远端以及更通用 consumer surface 做准备
- 只有在价值交付与鲁棒性门槛已经达标之后，才逐步朝 Agent-First Distributed Platform 形态演进

#### C 的明确非目标
- C 不是把任意 shell 编排升格为产品运行模型
- C 不是一步跳成通用 MDM 平台的借口
- C 不是出于语言洁癖而要求把一切重写成单一语言
- C 不是在支持边界尚未明确前就同时支持所有平台
- C 不是以“速度”为名削弱契约评审纪律的许可
- C 不是空仓库 V1 的正确起手姿态，因为那会直接削弱你最看重的“实践与鲁棒性落地”
