# PortManager Real-Machine Verification Report

Updated: 2026-04-21
Version: v0.2.6-confidence-progress-refresh

## English

### Purpose
This document freezes the current real-machine verification report for PortManager.
It exists so that acceptance truth, confidence truth, and docs-publication truth are recorded in one place instead of being inferred from scattered progress notes.

### Verification session
The latest recorded verification session for this report happened on `2026-04-21`.
It combined a fresh local replay of the standing acceptance gate, a latest-main helper refresh that used `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` to sync completed `mainline-acceptance` history, write the review digest, and republish the tracked confidence-progress artifact from the same completed workflow evidence, plus a GitHub-hosted confirmation pair after that refreshed artifact landed on `main`.

Commands executed:
- `corepack pnpm acceptance:verify`
- `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`
- GitHub Actions run `24702539213` for `mainline-acceptance`
- GitHub Actions run `24702539212` for `docs-pages`

### What each command proves
- `corepack pnpm acceptance:verify`
  - proves the standing local acceptance gate still passes across tests, type checks, Rust workspace checks, contract drift checks, docs build, and milestone verification
- `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`
  - syncs completed `mainline-acceptance` confidence bundles from GitHub Actions into local `.portmanager/reports/`
  - writes `.portmanager/reports/milestone-confidence-review.md` through the existing review-digest path
  - intentionally republishes the tracked docs artifact `docs-site/data/milestone-confidence-progress.ts` only through the explicit refresh contract behind the helper flag
  - proves the synced local review and the published confidence snapshot now match on the same completed workflow evidence
  - proves the tracked public artifact now carries latest qualified run `24702539213/1` and `15/7` qualified runs
- GitHub Actions run `24702539213` for `mainline-acceptance`
  - proves the standing CI acceptance gate still passes after the refreshed confidence-progress artifact lands on `main`
  - proves the heavier confidence collection lane remains healthy alongside the refreshed public snapshot
- GitHub Actions run `24702539212` for `docs-pages`
  - proves the published docs build and Pages deployment still succeed after the refreshed confidence-progress artifact lands on `main`
  - proves the docs publication workflow remains operational alongside the standing acceptance gate

### Evidence frozen by this report
- Local acceptance gate: passed
- Helper sync and explicit refresh: passed
- Imported qualified workflow runs now tracked: `24595022905/1`, `24645377989/1`, `24645746838/1`, `24645898239/1`, `24646210070/1`, `24646810439/1`, `24647442700/1`, `24648118236/1`, `24648519364/1`, `24648911705/1`, `24650868231/1`, `24699338529/1`, `24699564258/1`, `24701682768/1`, `24702539213/1`
- Imported qualified workflow: `mainline-acceptance`
- Imported qualified events: `push`, `schedule`
- Current published readiness state: `promotion-ready`
- Current published qualified runs: `15/7`
- Current published qualified consecutive passes: `15/3`
- Current published remaining qualified runs: `0`
- Current published tracked runs: `21`
- Current published local visibility-only runs: `6`
- Current published latest qualified run: `24702539213/1`
- Current published latest qualified SHA: `6ecfa79b98d5`
- GitHub-hosted `mainline-acceptance` run: `24702539213` passed
- GitHub-hosted `docs-pages` run: `24702539212` passed
- Prior Node 24 forced-action trial: still passed
- Remaining warning source: GitHub official action metadata still declaring `node20`
- Review digest after explicit refresh: aligned

### Current conclusion
- Milestone 1 accepted public-surface truth still holds.
- The standing acceptance contract is now complete and currently healthy across both the local gate and the GitHub-hosted gate.
- The docs publication gate is also complete and currently healthy on GitHub Pages after the refreshed artifact replay.
- Milestone 2 confidence maintenance is real and operational, and promotion criteria are now met.
- The current truthful public wording is now `promotion-ready` after the helper-driven explicit refresh path republished the tracked artifact to the latest synced `15/7` snapshot.
- Human milestone-language review is now allowed; the remaining public lane is deliberate wording tightening plus sustained gate health.
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
  - use `pnpm milestone:review:promotion-ready -- --limit 20` as the default helper before deciding whether publication should move; use `pnpm milestone:review:confidence` directly only when local history is already synced and you want the digest alone
- Why this rule exists:
  - local `.portmanager` history is machine-local and intentionally ignored by Git
  - allowing every docs build to rewrite the tracked confidence artifact from local history causes noisy diffs and publication drift
  - the tracked docs artifact must change only when publication intent is explicit

### Default developer review helper
- Default local review sequence after completed mainline runs:
  - `pnpm milestone:review:promotion-ready -- --limit 20`
- What the helper adds:
  - syncs completed `mainline-acceptance` history back into local `.portmanager/reports/`
  - writes `.portmanager/reports/milestone-confidence-review.md` through the existing `pnpm milestone:review:confidence` path
  - reports countdown alignment separately from full local visibility-only drift
  - keeps tracked-artifact publication behind the explicit `--refresh-published-artifact` flag
- Publication rule after that helper review:
  - when the helper exposes countdown drift and human review agrees, rerun `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`; this exact order republished the aligned `promotion-ready` snapshot on `2026-04-21`

### Review protocol
- Read the GitHub Actions `mainline-acceptance` summary first when reviewing readiness accumulation.
- Run `pnpm milestone:review:promotion-ready -- --limit 20` so completed mainline history syncs back into local `.portmanager/reports/` and `.portmanager/reports/milestone-confidence-review.md` records whether the published countdown is aligned or only visibility-drifted.
- If the public snapshot should move, rerun the same helper with `--refresh-published-artifact`.
- Compare the synced local summary, the tracked docs confidence artifact, and the public development-progress page together.
- Use `Latest Qualified Run` plus the visibility breakdown for milestone-language review, not raw local rerun recency.

## 中文

### 用途
这份文档用于冻结 PortManager 当前的真机验证报告。
它的目标是把 acceptance 真相、confidence 真相与 docs 发布真相收束到同一个位置，而不是继续散落在不同的进度说明里。

### 验证会话
本报告对应的最新验证会话发生在 `2026-04-21`。
这次会话同时包含一轮针对最新本地 `main` 的常驻 acceptance gate 重放、一轮通过 `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` 完成的 helper 刷新，用同一组已完成 workflow 证据同步 history、写出 digest 并重发被跟踪 confidence-progress artifact，以及一轮在刷新产物落到 `main` 之后的 GitHub 托管确认性验证。

本次执行命令：
- `corepack pnpm acceptance:verify`
- `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`
- `mainline-acceptance` 的 GitHub Actions run `24702539213`
- `docs-pages` 的 GitHub Actions run `24702539212`

### 各命令分别证明什么
- `corepack pnpm acceptance:verify`
  - 证明当前常驻本地主线验收 gate 仍然通过，覆盖 tests、type checks、Rust workspace checks、contract drift checks、docs build 与 milestone verification
- `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`
  - 会把 GitHub Actions 已完成的 `mainline-acceptance` confidence bundle 导入本地 `.portmanager/reports/`
  - 会通过既有 review-digest 路径写出 `.portmanager/reports/milestone-confidence-review.md`
  - 只会在 helper 显式刷新 flag 允许时，按原有发布契约重发 `docs-site/data/milestone-confidence-progress.ts`
  - 证明同步后的本地复核与公开 confidence 快照现在已经建立在同一份已完成 workflow 证据之上
  - 证明被跟踪公开 artifact 现在已经携带最新 qualified run `24702539213/1` 与 `15/7` qualified runs
- GitHub Actions run `24702539213`
  - 证明在刷新 confidence-progress artifact 落到 `main` 之后，常驻 CI acceptance gate 仍然通过
  - 证明更重的 confidence 收集路径在这次公开快照刷新之后仍然保持健康
- GitHub Actions run `24702539212`
  - 证明在刷新 confidence-progress artifact 落到 `main` 之后，公开 docs build 与 Pages 部署仍然成功
  - 证明 docs 发布工作流与常驻 acceptance gate 现在依然可以同时保持健康

### 本报告冻结的证据
- 本地 acceptance gate：已通过
- helper 同步与显式刷新：已通过
- 已导入并纳入跟踪的 qualified workflow runs：`24595022905/1`、`24645377989/1`、`24645746838/1`、`24645898239/1`、`24646210070/1`、`24646810439/1`、`24647442700/1`、`24648118236/1`、`24648519364/1`、`24648911705/1`、`24650868231/1`、`24699338529/1`、`24699564258/1`、`24701682768/1`、`24702539213/1`
- 已导入 qualified workflow：`mainline-acceptance`
- 已导入 qualified events：`push`、`schedule`
- 当前公开 readiness 状态：`promotion-ready`
- 当前公开 qualified runs：`15/7`
- 当前公开 qualified consecutive passes：`15/3`
- 当前公开 remaining qualified runs：`0`
- 当前公开 tracked runs：`21`
- 当前公开 local visibility-only runs：`6`
- 当前公开 latest qualified run：`24702539213/1`
- 当前公开 latest qualified SHA：`6ecfa79b98d5`
- GitHub 托管 `mainline-acceptance` run：`24702539213` 已通过
- GitHub 托管 `docs-pages` run：`24702539212` 已通过
- 既有 Node 24 强制 action 试跑：仍已通过
- 剩余 warning 来源：GitHub 官方 action 元数据仍声明 `node20`
- 显式刷新后的 review digest：已对齐

### 当前结论
- Milestone 1 的 accepted public-surface 真相仍然成立。
- 常驻 acceptance 契约现在已经在本地 gate 与 GitHub 托管 gate 两端同时闭环，并且当前健康。
- docs 发布 gate 也已经在最新这轮公开快照重放之后继续保持完整与健康。
- Milestone 2 的 confidence 维护已经真实落地且可操作，而且 promotion 条件现在已经满足。
- 当前对外公开的真实表述已经在 helper 驱动的显式刷新之后进入最新同步的 `promotion-ready` `15/7` 快照。
- 当前已经允许人工里程碑文案复核；剩余公开主线是谨慎收窄文案并持续保持 gate 健康。
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
- 这条 helper 补上的信息：
  - 把已完成 `mainline-acceptance` history 同步回本地 `.portmanager/reports/`
  - 通过既有 `pnpm milestone:review:confidence` 路径写出 `.portmanager/reports/milestone-confidence-review.md`
  - 把 countdown 对齐状态与完整本地 visibility-only 漂移拆开汇报
  - 只有显式加上 `--refresh-published-artifact` 时，才会推进被跟踪公开 artifact
- helper 之后的发布规则：
  - 只有当 helper 结论与人工复核都认为公开快照应该变化时，才重新执行 `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`；`2026-04-21` 的这次对齐 `promotion-ready` 快照就是按这个顺序重发的

### 复核协议
- 在判断 readiness 累积时，先看 GitHub Actions `mainline-acceptance` summary。
- 先执行 `pnpm milestone:review:promotion-ready -- --limit 20`，让已完成 confidence history 回到本地 `.portmanager/reports/`，并让 `.portmanager/reports/milestone-confidence-review.md` 先记录公开倒计时是否真正对齐、还是只有 visibility-only 漂移。
- 如果公开快照应该前进，就在人工复核同意后重跑同一条 helper 并加上 `--refresh-published-artifact`。
- 同时对比同步后的本地 summary、已跟踪 docs confidence artifact 与公开 development-progress 页面。
- 在评审里程碑文案时，应优先使用 `Latest Qualified Run` 与 visibility breakdown，而不是只看最近一次本地 rerun。
