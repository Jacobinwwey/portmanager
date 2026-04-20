# PortManager Real-Machine Verification Report

Updated: 2026-04-20
Version: v0.2.1-confidence-countdown-sync

## English

### Purpose
This document freezes the current real-machine verification report for PortManager.
It exists so that acceptance truth, confidence truth, and docs-publication truth are recorded in one place instead of being inferred from scattered progress notes.

### Verification session
The latest recorded verification session for this report happened on `2026-04-20`.
It combined a Windows development-machine replay against the latest local `main` with a GitHub-hosted confirmation pass after forcing JavaScript-based workflow actions onto Node 24, then a latest-main sync refresh that republished the tracked confidence-progress artifact from the completed `mainline-acceptance` history.

Commands executed:
- `corepack pnpm acceptance:verify`
- `pnpm milestone:verify:confidence`
- `pnpm milestone:sync:confidence-history -- --limit 20`
- `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- GitHub Actions run `24645898239` for `mainline-acceptance`
- GitHub Actions run `24645898212` for `docs-pages`

### What each command proves
- `corepack pnpm acceptance:verify`
  - proves the standing local acceptance gate still passes across tests, type checks, Rust workspace checks, contract drift checks, docs build, and milestone verification
- `pnpm milestone:verify:confidence`
  - proves the heavier Milestone 2 confidence routine still passes on top of the accepted live slice
  - writes `.portmanager/reports/milestone-confidence-report.json`
  - appends `.portmanager/reports/milestone-confidence-history.json`
  - renders `.portmanager/reports/milestone-confidence-summary.md`
- `pnpm milestone:sync:confidence-history -- --limit 20`
  - imports completed `mainline-acceptance` confidence bundles from GitHub Actions into local `.portmanager/reports/`
  - keeps local developer review aligned with mainline evidence rather than local-only reruns
- `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
  - intentionally republishes the tracked docs artifact `docs-site/data/milestone-confidence-progress.ts` from the synced local history
  - records the current published readiness snapshot without letting normal docs builds drift every time local `.portmanager` history changes
- GitHub Actions run `24645898239` for `mainline-acceptance`
  - proves the standing CI acceptance gate still passes after the workflow migration away from `pnpm/action-setup`
  - proves `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` does not break the accepted control-plane proof or the confidence routine
- GitHub Actions run `24645898212` for `docs-pages`
  - proves the published docs build and Pages deployment still succeed after the same Node 24 forcing change
  - proves the docs publication workflow remains operational alongside the standing acceptance gate

### Evidence frozen by this report
- Local acceptance gate: passed
- Local confidence routine: passed
- Synced mainline evidence: imported successfully
- Imported qualified workflow runs now tracked: `24595022905/1`, `24645377989/1`, `24645746838/1`, `24645898239/1`, `24646210070/1`
- Imported qualified workflow: `mainline-acceptance`
- Imported qualified event: `push`
- Current published readiness state: `building-history`
- Current published qualified runs: `5/7`
- Current published qualified consecutive passes: `5/3`
- Current published remaining qualified runs: `2`
- Current published tracked runs: `11`
- Current published local visibility-only runs: `6`
- Current published latest qualified run: `24646210070/1`
- Current published latest qualified SHA: `1338fb8998d1`
- GitHub-hosted `mainline-acceptance` run: `24645898239` passed
- GitHub-hosted `docs-pages` run: `24645898212` passed
- Node 24 forced-action trial: passed
- Remaining warning source: GitHub official action metadata still declaring `node20`

### Current conclusion
- Milestone 1 accepted public-surface truth still holds.
- The standing acceptance contract is now complete and currently healthy across both the local gate and the GitHub-hosted gate.
- The docs publication gate is also complete and currently healthy on GitHub Pages after the Node 24 forcing trial.
- Milestone 2 confidence maintenance is real and operational, but promotion criteria are not yet met.
- The current truthful public wording remains `building-history`, not `promotion-ready`.
- The consecutive-pass gate is already satisfied; the remaining public countdown is `2` more qualified mainline runs.
- The latest visible local run is intentionally separated from the latest qualified mainline run, so local reruns no longer erase mainline review evidence.
- The remaining Node 20 deprecation annotations are now upstream-only warning debt in GitHub official actions; they no longer indicate a repo-local acceptance or publication failure.

### Docs publication contract for confidence progress
- Default docs generation must reuse the committed artifact at `docs-site/data/milestone-confidence-progress.ts`.
- Normal commands:
  - `pnpm --dir docs-site --ignore-workspace run docs:generate`
  - `pnpm --dir docs-site --ignore-workspace run docs:build`
- Explicit refresh command:
  - `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- Publication rule:
  - only run the explicit refresh command after a deliberate verification or sync step whose evidence should become the new public snapshot
- Why this rule exists:
  - local `.portmanager` history is machine-local and intentionally ignored by Git
  - allowing every docs build to rewrite the tracked confidence artifact from local history causes noisy diffs and publication drift
  - the tracked docs artifact must change only when publication intent is explicit

### Review protocol
- Read the GitHub Actions `mainline-acceptance` summary first when reviewing readiness accumulation.
- Sync completed confidence history back into local `.portmanager/reports/`.
- Compare the synced local summary, the tracked docs confidence artifact, and the public development-progress page together.
- Use `Latest Qualified Run` plus the visibility breakdown for milestone-language review, not raw local rerun recency.

## 中文

### 用途
这份文档用于冻结 PortManager 当前的真机验证报告。
它的目标是把 acceptance 真相、confidence 真相与 docs 发布真相收束到同一个位置，而不是继续散落在不同的进度说明里。

### 验证会话
本报告对应的最新验证会话发生在 `2026-04-20`。
这次会话同时包含一轮针对最新本地 `main` 的 Windows 开发机重放，以及一轮在 GitHub 托管 runner 上、强制 JavaScript workflow actions 运行于 Node 24 之后的确认性验证。

本次执行命令：
- `corepack pnpm acceptance:verify`
- `pnpm milestone:verify:confidence`
- `pnpm milestone:sync:confidence-history -- --limit 20`
- `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- `mainline-acceptance` 的 GitHub Actions run `24645898239`
- `docs-pages` 的 GitHub Actions run `24645898212`

### 各命令分别证明什么
- `corepack pnpm acceptance:verify`
  - 证明当前常驻本地主线验收 gate 仍然通过，覆盖 tests、type checks、Rust workspace checks、contract drift checks、docs build 与 milestone verification
- `pnpm milestone:verify:confidence`
  - 证明建立在已验收 live 切片之上的更重 Milestone 2 confidence routine 仍然通过
  - 会写出 `.portmanager/reports/milestone-confidence-report.json`
  - 会追加 `.portmanager/reports/milestone-confidence-history.json`
  - 会渲染 `.portmanager/reports/milestone-confidence-summary.md`
- `pnpm milestone:sync:confidence-history -- --limit 20`
  - 会把 GitHub Actions 已完成的 `mainline-acceptance` confidence bundle 导入本地 `.portmanager/reports/`
  - 让本地开发者复核继续对齐主线证据，而不是被本地 rerun 噪声带偏
- `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
  - 会把同步后的本地 history 显式发布到已跟踪的 docs 产物 `docs-site/data/milestone-confidence-progress.ts`
  - 让当前公开 readiness 快照被有意刷新，而不是让普通 docs build 随着本地 `.portmanager` 历史变化不断漂移
- GitHub Actions run `24645898239`
  - 证明在 workflow 从 `pnpm/action-setup` 迁出之后，常驻 CI acceptance gate 仍然通过
  - 证明 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` 不会破坏已验收控制平面证明链路或 confidence routine
- GitHub Actions run `24645898212`
  - 证明在同一轮 Node 24 强制试跑之后，公开 docs build 与 Pages 部署仍然成功
  - 证明 docs 发布工作流与常驻 acceptance gate 现在可以同时保持健康

### 本报告冻结的证据
- 本地 acceptance gate：已通过
- 本地 confidence routine：已通过
- 主线 evidence 同步：已成功导入
- 已导入并纳入跟踪的 qualified workflow runs：`24595022905/1`、`24645377989/1`、`24645746838/1`、`24645898239/1`、`24646210070/1`
- 已导入 qualified workflow：`mainline-acceptance`
- 已导入 qualified event：`push`
- 当前公开 readiness 状态：`building-history`
- 当前公开 qualified runs：`5/7`
- 当前公开 qualified consecutive passes：`5/3`
- 当前公开 remaining qualified runs：`2`
- 当前公开 tracked runs：`11`
- 当前公开 local visibility-only runs：`6`
- 当前公开 latest qualified run：`24646210070/1`
- 当前公开 latest qualified SHA：`1338fb8998d1`
- GitHub 托管 `mainline-acceptance` run：`24645898239` 已通过
- GitHub 托管 `docs-pages` run：`24645898212` 已通过
- Node 24 强制 action 试跑：已通过
- 剩余 warning 来源：GitHub 官方 action 元数据仍声明 `node20`

### 当前结论
- Milestone 1 的 accepted public-surface 真相仍然成立。
- 常驻 acceptance 契约现在已经在本地 gate 与 GitHub 托管 gate 两端同时闭环，并且当前健康。
- docs 发布 gate 也已经在 Node 24 强制试跑之后继续保持完整与健康。
- Milestone 2 的 confidence 维护已经真实落地且可操作，但 promotion 条件仍未满足。
- 当前对外公开的真实表述仍然必须是 `building-history`，不能写成 `promotion-ready`。
- 连续 pass 门槛已经满足；当前对外公开的倒计时只剩 `2` 次 qualified mainline runs。
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
- 这条规则存在的原因：
  - 本地 `.portmanager` history 是 machine-local 文件，并且刻意被 Git 忽略
  - 如果允许每次 docs build 都直接用本地 history 改写已跟踪 confidence artifact，就会造成噪音 diff 与发布漂移
  - 已跟踪 docs artifact 只能在“明确有发布意图”的时候变化

### 复核协议
- 在判断 readiness 累积时，先看 GitHub Actions `mainline-acceptance` summary。
- 把已完成 confidence history 同步回本地 `.portmanager/reports/`。
- 同时对比同步后的本地 summary、已跟踪 docs confidence artifact 与公开 development-progress 页面。
- 在评审里程碑文案时，应优先使用 `Latest Qualified Run` 与 visibility breakdown，而不是只看最近一次本地 rerun。
