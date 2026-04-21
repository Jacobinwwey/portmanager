# PortManager Real-Machine Verification Report

Updated: 2026-04-21
Version: v0.2.8-confidence-refresh-maintenance

## English

### Purpose
This document freezes the current real-machine verification report for PortManager.
It exists so that acceptance truth, confidence truth, and docs-publication truth are recorded in one place instead of being inferred from scattered progress notes.

### Verification session
The latest recorded verification session for this report happened on `2026-04-21`.
It combined a fresh local replay of the standing acceptance gate, an explicit tracked-artifact refresh through `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact` against already-synced local confidence history, the latest imported qualified `mainline-acceptance` evidence at run `24707884501/1`, and the last published `docs-pages` proof before this refresh at run `24707884469`.

Commands executed:
- `corepack pnpm acceptance:verify`
- `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact`
- Latest imported `mainline-acceptance` evidence: `24707884501/1`
- Last published `docs-pages` proof before this refresh: `24707884469`

### What each command proves
- `corepack pnpm acceptance:verify`
  - proves the standing local acceptance gate still passes across tests, type checks, Rust workspace checks, contract drift checks, docs build, and milestone verification
- `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact`
  - reuses the already-synced local `.portmanager/reports/` bundle instead of re-importing history again
  - writes `.portmanager/reports/milestone-confidence-review.md` through the existing review-digest path
  - writes `.portmanager/reports/milestone-wording-review.md` as the local wording-review checklist for human milestone-language decisions, including `Public claim class`, `Source surface status`, and `Required next action`
  - intentionally republishes the tracked docs artifact `docs-site/data/milestone-confidence-progress.ts` only through the explicit refresh contract behind the helper flag
  - proves the synced local review and the published confidence snapshot now match on the same reviewed evidence bundle
  - proves the tracked public artifact now carries latest qualified run `24707884501/1` and `23/7` qualified runs
- `pnpm milestone:review:promotion-ready -- --skip-sync`
  - reuses the current local confidence history/report/summary without reaching back to older completed workflow runs
  - writes the same `.portmanager/reports/milestone-confidence-review.md` and `.portmanager/reports/milestone-wording-review.md` pair for the current run
  - is the mode `mainline-acceptance` now uses before uploading `milestone-confidence-bundle-*`
- Latest imported `mainline-acceptance` evidence `24707884501/1`
  - proves the synced local history now reaches the latest reviewed qualified mainline run before this refresh
  - proves the heavier confidence collection lane stayed healthy through the latest imported mainline evidence
- Last published `docs-pages` proof before this refresh `24707884469`
  - proves the docs publication workflow remained healthy on the last published snapshot before this deliberate refresh
  - marks the publication baseline that should be rechecked again after this refreshed artifact lands on `main`

### Evidence frozen by this report
- Local acceptance gate: passed
- Helper sync and explicit refresh: passed
- Imported qualified workflow runs now tracked: `24595022905/1`, `24645377989/1`, `24645746838/1`, `24645898239/1`, `24646210070/1`, `24646810439/1`, `24647442700/1`, `24648118236/1`, `24648519364/1`, `24648911705/1`, `24650868231/1`, `24699338529/1`, `24699564258/1`, `24701682768/1`, `24702539213/1`, `24702941958/1`, `24703457084/1`, `24704483563/1`, `24705233374/1`, `24705969182/1`, `24706180264/1`, `24706987559/1`, `24707884501/1`
- Imported qualified workflow: `mainline-acceptance`
- Imported qualified events: `push`, `schedule`
- Current published readiness state: `promotion-ready`
- Current published qualified runs: `23/7`
- Current published qualified consecutive passes: `23/3`
- Current published remaining qualified runs: `0`
- Current published tracked runs: `29`
- Current published local visibility-only runs: `6`
- Current published latest qualified run: `24707884501/1`
- Current published latest qualified SHA: `ca6dbe919157`
- Latest imported `mainline-acceptance` run: `24707884501` passed
- Last published `docs-pages` run before this refresh: `24707884469` passed
- Prior Node 24 forced-action trial: still passed
- Remaining warning source: GitHub official action metadata still declaring `node20`
- Review digest after explicit refresh: aligned

### Current conclusion
- Milestone 1 accepted public-surface truth still holds.
- The standing acceptance contract is now complete and currently healthy across both the local gate and the GitHub-hosted gate.
- The docs publication gate remained healthy on the last published snapshot before this refresh, and the refreshed snapshot is now ready to be rechecked after it lands on `main`.
- Milestone 2 confidence maintenance is real and operational, and promotion criteria are now met.
- The current truthful public wording is now `promotion-ready` after the helper-driven explicit refresh path republished the tracked artifact to the latest reviewed `23/7` snapshot.
- Human milestone-language review is now allowed because the helper posture is `promotion-ready-reviewed`; the remaining public lane is deliberate wording tightening plus sustained gate health, guided by `.portmanager/reports/milestone-wording-review.md`, `Public claim class`, `Source surface status`, and `Required next action`.
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
- Default current-run CI review-pack sequence:
  - `pnpm milestone:fetch:review-pack`
- What the helper adds:
  - syncs completed `mainline-acceptance` history back into local `.portmanager/reports/`
  - writes `.portmanager/reports/milestone-confidence-review.md` through the existing `pnpm milestone:review:confidence` path
  - writes `.portmanager/reports/milestone-wording-review.md` so human wording review sees the latest gate, guardrails, `Source surface status`, source surfaces, and claim posture in one local artifact
  - reports countdown alignment separately from full local visibility-only drift
  - keeps tracked-artifact publication behind the explicit `--refresh-published-artifact` flag
- What the CI review-pack mode adds:
  - downloads the latest completed uploaded `milestone-confidence-bundle-*` into `.portmanager/reports/current-ci-review-pack/`
  - stages `.portmanager/reports/milestone-confidence-review.md`, `.portmanager/reports/milestone-wording-review.md`, and companion summary/history/report files when present
  - writes `.portmanager/reports/current-ci-review-pack/review-pack-manifest.json` so developers who need the current run before a local sync keep run metadata plus local file paths
- Publication rule after that helper review:
  - when the helper exposes countdown drift and human review agrees, rerun `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`; this exact order republished the aligned `promotion-ready` snapshot on `2026-04-21`

### Review protocol
- Read the GitHub Actions `mainline-acceptance` summary first when reviewing readiness accumulation.
- Run `pnpm milestone:fetch:review-pack` and read `.portmanager/reports/current-ci-review-pack/` when the first question is the current CI run rather than a locally synced view.
- Run `pnpm milestone:review:promotion-ready -- --limit 20` so completed mainline history syncs back into local `.portmanager/reports/`, `.portmanager/reports/milestone-confidence-review.md` records whether the published countdown is aligned or only visibility-drifted, and `.portmanager/reports/milestone-wording-review.md` freezes the wording-review checklist plus `Public claim class` and `Source surface status`.
- If the helper reports `promotion-ready-refresh-required` and the public snapshot should move, rerun the same helper with `--refresh-published-artifact`.
- Compare the synced local summary, the wording-review checklist, the tracked docs confidence artifact, and the public development-progress page together.
- Use `Latest Qualified Run` plus the visibility breakdown for milestone-language review, not raw local rerun recency.

## 中文

### 用途
这份文档用于冻结 PortManager 当前的真机验证报告。
它的目标是把 acceptance 真相、confidence 真相与 docs 发布真相收束到同一个位置，而不是继续散落在不同的进度说明里。

### 验证会话
本报告对应的最新验证会话发生在 `2026-04-21`。
这次会话同时包含一轮针对最新本地 `main` 的常驻 acceptance gate 重放、一轮通过 `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact` 完成的 helper 刷新，直接复用已经同步到本地的 confidence history 来重发被跟踪 confidence-progress artifact，并冻结最新导入的 qualified `mainline-acceptance` 证据 `24707884501/1` 与这次刷新前最后一次已发布的 `docs-pages` 证明 `24707884469`。

本次执行命令：
- `corepack pnpm acceptance:verify`
- `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact`
- 最新导入的 `mainline-acceptance` 证据：`24707884501/1`
- 这次刷新前最后一次已发布的 `docs-pages` 证明：`24707884469`

### 各命令分别证明什么
- `corepack pnpm acceptance:verify`
  - 证明当前常驻本地主线验收 gate 仍然通过，覆盖 tests、type checks、Rust workspace checks、contract drift checks、docs build 与 milestone verification
- `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact`
  - 会直接复用已经同步到本地 `.portmanager/reports/` 的 confidence bundle，而不是再次导入 history
  - 会通过既有 review-digest 路径写出 `.portmanager/reports/milestone-confidence-review.md`
  - 还会写出 `.portmanager/reports/milestone-wording-review.md`，把人工里程碑文案复核需要的清单、`Public claim class`、`Source surface status` 与 `Required next action` 一起冻结在本地
  - 只会在 helper 显式刷新 flag 允许时，按原有发布契约重发 `docs-site/data/milestone-confidence-progress.ts`
  - 证明同步后的本地复核与公开 confidence 快照现在已经建立在同一份最新评审过的证据 bundle 之上
  - 证明被跟踪公开 artifact 现在已经携带最新 qualified run `24707884501/1` 与 `23/7` qualified runs
- 最新导入的 `mainline-acceptance` 证据 `24707884501/1`
  - 证明同步后的本地 history 已经推进到这次刷新前最新一条 qualified mainline run
  - 证明更重的 confidence 收集路径在最新导入证据处仍然保持健康
- 这次刷新前最后一次已发布的 `docs-pages` 证明 `24707884469`
  - 证明 docs 发布工作流在上一个已发布快照上仍然健康
  - 也标记了这次刷新落到 `main` 之后需要再次复核的发布基线

### 本报告冻结的证据
- 本地 acceptance gate：已通过
- helper 同步与显式刷新：已通过
- 已导入并纳入跟踪的 qualified workflow runs：`24595022905/1`、`24645377989/1`、`24645746838/1`、`24645898239/1`、`24646210070/1`、`24646810439/1`、`24647442700/1`、`24648118236/1`、`24648519364/1`、`24648911705/1`、`24650868231/1`、`24699338529/1`、`24699564258/1`、`24701682768/1`、`24702539213/1`、`24702941958/1`、`24703457084/1`、`24704483563/1`、`24705233374/1`、`24705969182/1`、`24706180264/1`、`24706987559/1`、`24707884501/1`
- 已导入 qualified workflow：`mainline-acceptance`
- 已导入 qualified events：`push`、`schedule`
- 当前公开 readiness 状态：`promotion-ready`
- 当前公开 qualified runs：`23/7`
- 当前公开 qualified consecutive passes：`23/3`
- 当前公开 remaining qualified runs：`0`
- 当前公开 tracked runs：`29`
- 当前公开 local visibility-only runs：`6`
- 当前公开 latest qualified run：`24707884501/1`
- 当前公开 latest qualified SHA：`ca6dbe919157`
- 最新导入的 `mainline-acceptance` run：`24707884501` 已通过
- 这次刷新前最后一次已发布的 `docs-pages` run：`24707884469` 已通过
- 既有 Node 24 强制 action 试跑：仍已通过
- 剩余 warning 来源：GitHub 官方 action 元数据仍声明 `node20`
- 显式刷新后的 review digest：已对齐

### 当前结论
- Milestone 1 的 accepted public-surface 真相仍然成立。
- 常驻 acceptance 契约现在已经在本地 gate 与 GitHub 托管 gate 两端同时闭环，并且当前健康。
- docs 发布 gate 在这次刷新前最后一个已发布快照上仍然保持健康，而这次刷新后的新快照现在已经准备好在落到 `main` 后再次复核。
- Milestone 2 的 confidence 维护已经真实落地且可操作，而且 promotion 条件现在已经满足。
- 当前对外公开的真实表述已经在 helper 驱动的显式刷新之后进入最新评审过的 `promotion-ready` `23/7` 快照。
- 当前已经因为 helper posture 为 `promotion-ready-reviewed` 而允许人工里程碑文案复核；剩余公开主线是参考带 `Public claim class` 与 `Source surface status` 的 `.portmanager/reports/milestone-wording-review.md` 谨慎收窄文案并持续保持 gate 健康。
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
  - `pnpm milestone:fetch:review-pack`
- 这条 helper 补上的信息：
  - 把已完成 `mainline-acceptance` history 同步回本地 `.portmanager/reports/`
  - 通过既有 `pnpm milestone:review:confidence` 路径写出 `.portmanager/reports/milestone-confidence-review.md`
  - 写出 `.portmanager/reports/milestone-wording-review.md`，让人工文案复核在一份本地清单里看到最新 gate、护栏、`Source surface status`、source surfaces 与 claim posture
  - 把 countdown 对齐状态与完整本地 visibility-only 漂移拆开汇报
  - 只有显式加上 `--refresh-published-artifact` 时，才会推进被跟踪公开 artifact
- 这条 CI review-pack 模式补上的信息：
  - 把最新已完成的 `milestone-confidence-bundle-*` 下载到 `.portmanager/reports/current-ci-review-pack/`
  - 稳定落盘 `.portmanager/reports/milestone-confidence-review.md`、`.portmanager/reports/milestone-wording-review.md` 与存在时的 summary/history/report 文件
  - 额外写出 `.portmanager/reports/current-ci-review-pack/review-pack-manifest.json`，让开发者在本地同步前先保留 run 元数据与本地文件路径
- helper 之后的发布规则：
  - 只有当 helper 结论与人工复核都认为公开快照应该变化时，才重新执行 `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`；`2026-04-21` 的这次对齐 `promotion-ready` 快照就是按这个顺序重发的

### 复核协议
- 在判断 readiness 累积时，先看 GitHub Actions `mainline-acceptance` summary。
- 如果第一问题是当前 CI run，而不是已同步的本地视图，就先执行 `pnpm milestone:fetch:review-pack` 并读取 `.portmanager/reports/current-ci-review-pack/`。
- 先执行 `pnpm milestone:review:promotion-ready -- --limit 20`，让已完成 confidence history 回到本地 `.portmanager/reports/`，并让 `.portmanager/reports/milestone-confidence-review.md` 先记录公开倒计时是否真正对齐、还是只有 visibility-only 漂移，同时写出带 `Public claim class` 与 `Source surface status` 的 `.portmanager/reports/milestone-wording-review.md` 供人工文案复核。
- 如果 helper 报告 `promotion-ready-refresh-required` 且公开快照应该前进，就在人工复核同意后重跑同一条 helper 并加上 `--refresh-published-artifact`。
- 同时对比同步后的本地 summary、wording-review 清单、已跟踪 docs confidence artifact 与公开 development-progress 页面。
- 在评审里程碑文案时，应优先使用 `Latest Qualified Run` 与 visibility breakdown，而不是只看最近一次本地 rerun。
