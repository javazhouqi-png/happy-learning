# 逐页设计提示词 · 供前端（`mvp-dev-expert-team-frontend`）

> 配套：`DESIGN.md`（9 节）、`design-tokens.json`（四层 token）、`docs/design/icon-spec.md`（10 图标）、`docs/design/grade-incentive.md`（年级梯度）。
> 铁律：所有颜色走 token；图标仅来自 `src/components/ui/Icon.jsx`；P0 五条绝对规则全程生效。
> 年级梯度表达默认按**首批 3–4 克制皮肤**（见 grade-incentive.md §3）。

## 通用基线（每页复用）
- **按钮**：Primary `background:var(--c-primary)` + 白字（`#fff` 豁免）；Secondary 透明 + 1px `var(--c-line)` + `var(--c-primary)` 字；Ghost 极低透明。尺寸 lg/md/sm；内联图标 20px（`--font-mono` 用于数字）。按压 `--motion-fast`(150ms) 缩放反馈。
- **9 态矩阵**：每个交互组件覆盖 Default / Hover / Focus(`--focus-ring`) / Active / Disabled / Loading(骨架或 spinner) / Error(近字段 + 重试) / Empty / Success。
- **动效**：DESIGN.md §8（150–250ms，全量 `prefers-reduced-motion`）。
- **响应式**：移动端底部 TabBar + ActionSheet；桌面左侧 Sidebar；触摸目标 ≥44×44px；栅格 12/8/4。

---

## 1. 首页 Hero（landing）
- **布局**：左文案 / 右真实产品卡（`container` + `section`，非对称，非居中口号）。
- **真实内容**：右侧展示「学习中心」感卡片（星宝 SVG + "+10 积分" sticker），非抽象 3D / 空洞 Hero。
- **CTA 文案**：具体动词——"免费开始学习" / "观看介绍"（**"观看介绍"为外链**，非假按钮，见 §4）。
- **图标**：Pill `sparkle`（蓝）、Button `play`（`fill="currentColor"`）。
- **年级**：Hero **不放置年级切换**（grade-incentive §1）。

## 2. 学习中心 LearningCenter
- **年级切换**：区块内"三年级 ▾"（`chevronRight` + 下拉），**非全局顶栏**；常驻入口，跳过首访后仍可见。
- **三科入口**：语文 / 数学 / 英语 卡片，学科色仅作标签（`--c-chinese` / `--c-math` / `--c-english`），不用于大块填充。
- **进度**：3–4 档用进度环 + 成就徽章（真实完成驱动）。
- **空态**：未选年级 → 引导卡（非"暂无数据"），插画取 `--garden-*`（白名单）。

## 3. 练习 / 闯关 ExerciseEngine
- **真实计分**：提交 → 判定 → `medal` / `muscle` 反馈；错题入错题本。
- **年级梯度字号**：题干随档（1–2 ≥18px + 拼音；5–6 15–16px）。
- **空态**：错题本空 → SVG 插画（白名单）+ "去做一题"按钮。

## 4. 视频微课卡（P2）
- **外链卡**：缩略图 + 标题 + "前往官方微课 ↗"（`arrowRight`）。**无播放器、无计分、无完成态**。
- **禁用**："已完成 / 已掌握"勾选、进度环（PM 规则 3）。
- **最多**："上次看到这里"定位标记（非激励、非勾选）。

## 5. 每日打卡 DailyCheckIn
- **打卡**：点击 → `muscle` 鼓励 + 连续天数；破坏性"重置"走家长门控（DESIGN.md §6：算术题 / 长按 3 秒 → 二次确认）。
- **视频不计入**打卡连续天数（PM 规则 3）。

## 6. 游戏化闭环（成就墙 / 收藏册 / 奖励商店 / 魔法花园）
- **年级梯度表达**：grade-incentive §2 / §3（3–4 档：成就徽章并存、庆祝克制、星宝降频）。
- **收藏册 CollectionAlbum**：徽章贴纸网格，`lock` 未解锁；魔法花园随收集成长（`--garden-1/2/3`，白名单）。
- **奖励商店**：3–4 档称"成就兑换 / 学习装备"。

## 7. 家长空间 ParentSpace
- **视觉**：中性收敛，`--parent-calm` 为主，去圆体降饱和（DESIGN.md §6）。
- **文案与禁用词（PM 验收标准）**：
  - 对外称 **"用眼与时长提醒"** / **"家长验证示意"** / **"家长确认"**。
  - **禁用**：「强管控」「家长锁」「无法绕过」「保险箱」（诚实边界：PIN 存 localStorage，DevTools 可绕过，非密码学强验证）。
  - 视觉语言 = "温和的门"，非"保险箱"。
- **家长门控**（破坏性操作）：算术题 / 长按 3 秒 → 二次确认（Dialog/ActionSheet，`aria-modal` + 焦点陷阱 + ESC/遮罩关闭 + 禁滚动穿透）。
- **呈现**：三个薄弱点 + 三条今晚怎么陪（诊断式），可打印周报。
- **视频不进周报成就项**（PM 规则 3）。

## 8. 通用：加载 / 错误 / 空态 / 弹窗
- **骨架屏**：组件级，保留目标高度防 CLS，`shimmer` 微光（reduced-motion 静态）——DESIGN.md §4。
- **ErrorBoundary**：按模块隔离；星宝插画（白名单）+ **具体**错误文案（"这一页加载失败了，点下方重试"）+ 重试按钮，不暴露技术栈——DESIGN.md §5。
- **空态 8 处**：错题本 / 掌握度未生成 / 收藏空 / 奖励未解锁 / 周报无数据 / 搜索无结果 / 年级未选 / 导入无档案，各配 SVG 插画（白名单）+ 引导文案 + 行动钮——DESIGN.md §7。
- **移动端 Dialog/ActionSheet**：DESIGN.md §6。

## 9. P0 前端自测清单
- [ ] 无 emoji 图标（仅 `Icon.jsx`；`mood-*` 替代原 emoji）
- [ ] 无紫粉渐变（主蓝 `--c-primary`，禁 `#7C3AED→#EC4899` 类）
- [ ] 无色值硬编码（功能 UI 走 token；仅白名单插画 + `#fff`/`#000` 豁免）
- [ ] 无空洞文案（具体动词；Hero / 空态展示真实内容）
- [ ] 无千篇一律 Hero（真实产品卡，非口号 + 抽象图形）
