---
title: "真机验证报告"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-real-machine-verification-report.md"
status: active
---
> 真源文档：`docs/operations/portmanager-real-machine-verification-report.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.2.7-confidence-progress-refresh
### 用途
这份文档用于冻结 PortManager 当前的真机验证报告。
它的目标是把 acceptance 真相、confidence 真相与 docs 发布真相收束到同一个位置，而不是继续散落在不同的进度说明里。

### 验证会话
本报告对应的最新验证会话发生在 `2026-04-21`。
这次会话同时包含一轮针对最新本地 `main` 的常驻 acceptance gate 重放、一轮通过 `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` 完成的 helper 刷新，用同一组已完成 workflow 证据同步 history、写出 digest 并重发被跟踪 confidence-progress artifact，以及一轮在刷新产物落到 `main` 之后的 GitHub 托管确认性验证。

本次执行命令：
- `corepack pnpm acceptance:verify`
- `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`
- `mainline-acceptance` 的 GitHub Actions run `24702941958`
- `docs-pages` 的 GitHub Actions run `24702941963`

### 各命令分别证明什么
- `corepack pnpm acceptance:verify`
  - 证明当前常驻本地主线验收 gate 仍然通过，覆盖 tests、type checks、Rust workspace checks、contract drift checks、docs build 与 milestone verification
- `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`
  - 会把 GitHub Actions 已完成的 `mainline-acceptance` confidence bundle 导入本地 `.portmanager/reports/`
  - 会通过既有 review-digest 路径写出 `.portmanager/reports/milestone-confidence-review.md`
  - 还会写出 `.portmanager/reports/milestone-wording-review.md`，把人工里程碑文案复核需要的清单、`Public claim class`、`Source surface status` 与 `Required next action` 一起冻结在本地
  - 只会在 helper 显式刷新 flag 允许时，按原有发布契约重发 `docs-site/data/milestone-confidence-progress.ts`
  - 证明同步后的本地复核与公开 confidence 快照现在已经建立在同一份已完成 workflow 证据之上
  - 证明被跟踪公开 artifact 现在已经携带最新 qualified run `24702941958/1` 与 `16/7` qualified runs
- GitHub Actions run `24702941958`
  - 证明在刷新 confidence-progress artifact 落到 `main` 之后，常驻 CI acceptance gate 仍然通过
  - 证明更重的 confidence 收集路径在这次公开快照刷新之后仍然保持健康
- GitHub Actions run `24702941963`
  - 证明在刷新 confidence-progress artifact 落到 `main` 之后，公开 docs build 与 Pages 部署仍然成功
  - 证明 docs 发布工作流与常驻 acceptance gate 现在依然可以同时保持健康

### 本报告冻结的证据
- 本地 acceptance gate：已通过
- helper 同步与显式刷新：已通过
- 已导入并纳入跟踪的 qualified workflow runs：`24595022905/1`、`24645377989/1`、`24645746838/1`、`24645898239/1`、`24646210070/1`、`24646810439/1`、`24647442700/1`、`24648118236/1`、`24648519364/1`、`24648911705/1`、`24650868231/1`、`24699338529/1`、`24699564258/1`、`24701682768/1`、`24702539213/1`、`24702941958/1`
- 已导入 qualified workflow：`mainline-acceptance`
- 已导入 qualified events：`push`、`schedule`
- 当前公开 readiness 状态：`promotion-ready`
- 当前公开 qualified runs：`16/7`
- 当前公开 qualified consecutive passes：`16/3`
- 当前公开 remaining qualified runs：`0`
- 当前公开 tracked runs：`22`
- 当前公开 local visibility-only runs：`6`
- 当前公开 latest qualified run：`24702941958/1`
- 当前公开 latest qualified SHA：`e296ca97dd48`
- GitHub 托管 `mainline-acceptance` run：`24702941958` 已通过
- GitHub 托管 `docs-pages` run：`24702941963` 已通过
- 既有 Node 24 强制 action 试跑：仍已通过
- 剩余 warning 来源：GitHub 官方 action 元数据仍声明 `node20`
- 显式刷新后的 review digest：已对齐

### 当前结论
- Milestone 1 的 accepted public-surface 真相仍然成立。
- 常驻 acceptance 契约现在已经在本地 gate 与 GitHub 托管 gate 两端同时闭环，并且当前健康。
- docs 发布 gate 也已经在最新这轮公开快照重放之后继续保持完整与健康。
- Milestone 2 的 confidence 维护已经真实落地且可操作，而且 promotion 条件现在已经满足。
- 当前对外公开的真实表述已经在 helper 驱动的显式刷新之后进入最新同步的 `promotion-ready` `16/7` 快照。
- 当前已经允许人工里程碑文案复核；剩余公开主线是参考带 `Public claim class` 与 `Source surface status` 的 `.portmanager/reports/milestone-wording-review.md` 谨慎收窄文案并持续保持 gate 健康。
- 最新可见 local run 现在被刻意与最新 qualified mainline run 分离，因此本地 rerun 不会再抹掉主线复核证据。
- 当前剩余的 Node 20 退役 annotation 已经收敛为 GitHub 官方 action 的上游 warning debt，不再代表 repo 本地 acceptance 或 docs publication 失败。

### 关于 confidence progress 的 docs 发布契约
- 默认 docs 生成必须复用已提交的产物 `docs-site/data/milestone-confidence-progress.ts`。
- 普通命令：
  - `pnpm --dir docs-site --ignore-workspace run docs:generate`
  - `pnpm --dir docs-site --ignore-workspace run docs:build`
- 显式刷新命令：
  - `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- 发布规则：
  - 只有在一次有意的 verification 或 sync 之后，才运行这条显式刷新命令，把那次证据提升为新的公开快照
  - 默认应先执行 `pnpm milestone:review:promotion-ready -- --limit 20` 这条 helper 再决定公开快照是否前进；只有在本地 history 已经同步完成、且只需要 digest 时，才直接执行 `pnpm milestone:review:confidence`
- 这条规则存在的原因：
  - 本地 `.portmanager` history 是 machine-local 文件，并且刻意被 Git 忽略
  - 如果允许每次 docs build 都直接用本地 history 改写已跟踪 confidence artifact，就会造成噪音 diff 与发布漂移
  - 已跟踪 docs artifact 只能在“明确有发布意图”的时候变化

### 默认开发者复核 helper
- completed mainline runs 之后的默认本地复核顺序：
  - `pnpm milestone:review:promotion-ready -- --limit 20`
- 当前 run 的默认 CI review-pack 顺序：
  - `pnpm milestone:review:promotion-ready -- --skip-sync`
- 这条 helper 补上的信息：
  - 把已完成 `mainline-acceptance` history 同步回本地 `.portmanager/reports/`
  - 通过既有 `pnpm milestone:review:confidence` 路径写出 `.portmanager/reports/milestone-confidence-review.md`
  - 写出 `.portmanager/reports/milestone-wording-review.md`，让人工文案复核在一份本地清单里看到最新 gate、护栏、`Source surface status`、source surfaces 与 claim posture
  - 把 countdown 对齐状态与完整本地 visibility-only 漂移拆开汇报
  - 只有显式加上 `--refresh-published-artifact` 时，才会推进被跟踪公开 artifact
- 这条 CI review-pack 模式补上的信息：
  - 复用当前 run 已经写出的本地 `.portmanager/reports/` 文件，而不再额外回拉远端 history
  - 把 `.portmanager/reports/milestone-confidence-review.md` 与 `.portmanager/reports/milestone-wording-review.md` 直接追加到 GitHub Actions job summary
  - 把同一组文件一并上传进 `milestone-confidence-bundle-*`，供开发者在本地同步前先查看当前 run
- helper 之后的发布规则：
  - 只有当 helper 结论与人工复核都认为公开快照应该变化时，才重新执行 `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`；`2026-04-21` 的这次对齐 `promotion-ready` 快照就是按这个顺序重发的

### 复核协议
- 在判断 readiness 累积时，先看 GitHub Actions `mainline-acceptance` summary。
- 如果第一问题是当前 CI run，而不是已同步的本地视图，就先读取上传的 `milestone-confidence-bundle-*` review pack。
- 先执行 `pnpm milestone:review:promotion-ready -- --limit 20`，让已完成 confidence history 回到本地 `.portmanager/reports/`，并让 `.portmanager/reports/milestone-confidence-review.md` 先记录公开倒计时是否真正对齐、还是只有 visibility-only 漂移，同时写出带 `Public claim class` 与 `Source surface status` 的 `.portmanager/reports/milestone-wording-review.md` 供人工文案复核。
- 如果 helper 报告 `promotion-ready-refresh-required` 且公开快照应该前进，就在人工复核同意后重跑同一条 helper 并加上 `--refresh-published-artifact`。
- 同时对比同步后的本地 summary、wording-review 清单、已跟踪 docs confidence artifact 与公开 development-progress 页面。
- 在评审里程碑文案时，应优先使用 `Latest Qualified Run` 与 visibility breakdown，而不是只看最近一次本地 rerun。
