# 第一批功能实现完成报告（零/极低风险 · 不破坏存量）

> 实施日期：2026-08-17
> 范围：emoji 修复 → 导航统一 → 护眼弹窗 → 主题应用 → 语音朗读
> 质量门禁：lint 通过、33 个单元测试通过、生产构建通过（144 模块）。

---

## 1. emoji P0 修复（记忆翻牌游戏）

**问题**：`content.js` 的 `MATCH_WORDS` 用 emoji（☀️🌙⭐🍎📚🐱）作牌面，违反项目“禁止 emoji 作功能图标”铁律。

**改动**：
- `src/data/content.js`：`MATCH_WORDS` 改为 `word + icon` 字段，图标全部取自锁定 `Icon` 库（book / moon / star / heart / flame / sparkle）。
- `src/components/modules/GameCenter.jsx`：渲染 `<Icon name={c.icon} />` 替代 emoji。
- `src/components/modules/GameCenter.module.css`：`.emoji` → `.faceIcon`（移除字体尺寸，改用 SVG currentColor）。

**验证**：构建通过；配对逻辑（`pairId`）未变，仅展示层替换。

---

## 2. 导航配置统一 + /videos 入导航

**问题**：`content.js:NAV_ITEMS`（7 项，过时）与 `Header.jsx:NAV`（8 项）双份配置漂移；`/videos` 路由存在但不在主导航。

**改动**：
- `src/data/content.js`：`NAV_ITEMS` 设为全站唯一数据源，补齐「教材」(`/textbook`) 与「动画」(`/videos`)，更新注释。
- `src/components/sections/Header.jsx`：`NAV = NAV_ITEMS`，删除本地重复定义；`isActive` 已正确处理 `/` 精确匹配。

**验证**：`/videos` 现可从 Header 直达；单一数据源，新增/删除路由只改一处。

---

## 3. 护眼提醒真实弹窗（补全半成品）

**问题**：`parent.eyeRest` 开关存在但全代码无定时器/弹窗读取它，是死字段。

**改动**：
- 新增 `src/components/EyeRestWatcher.jsx`：挂载于 `App.jsx`（位于 AppProvider/FunProvider 内）。
  - 家长开启护眼提醒后，当日累计学习（`state.todayStudySec`）每满 20 分钟，经 `useFun().celebrate` 弹出一次温和提示（tone=warn，图标 bulb）。
  - 用 `useRef` 跟踪已提醒阈值；跨天（`todayDate` 变化）自动清零；刚开启时把已累计时长视作“已提醒”，避免立即弹出。
  - 复用既有的非阻断庆祝层，不阻断学习流。

**验证**：构建/测试通过；`eyeRest` 开关从死字段变为有效功能。

---

## 4. 主题皮肤应用（补全半成品）

**问题**：`skin-sunset` 奖励可兑换，但 `kind==='theme'` 无任何代码消费，兑换“花了积分却无变化”。

**改动**：
- `src/state/types.ts`：新增 `theme: string | null`（null=自动跟随拥有状态 / 'sunset'=强制暖阳 / 'none'=强制默认）。
- `src/state/storage.ts`：`defaultState` 与 `migrate` 补齐 `theme` 字段（向后兼容）。
- `src/state/reducers/parent.ts`：新增 `SET_THEME` case。
- `src/state/reducers/rewards.ts`：兑换 `skin-*` 且 `theme===null` 时自动应用该皮肤。
- `src/state/AppContext.jsx`：新增 `setTheme` action；新增 effect 按 `theme`/拥有状态在 `<html>` 上挂载 `data-theme="sunset"`。
- `src/index.css`：新增 `[data-theme='sunset']` 暖色令牌覆盖块（暖橙/暖红，无紫粉渐变，保留 `--c-ink` 文字对比）。
- `src/components/modules/RewardStore.jsx`：主题类奖励已拥有时显示「应用主题 / 恢复默认」切换按钮。

**验证**：兑换暖阳皮肤后界面即时变色并跨刷新保持；「恢复默认」可关闭；不破坏既有 Token 对比度。

---

## 5. 语音朗读 TTS（新增高价值能力）

**问题**：全代码无真实朗读，TextbookPage 仅有手动“朗读打卡”按钮。

**改动**：
- 新增 `src/utils/speech.js`：封装浏览器原生 `SpeechSynthesis`（普通话 zh-CN，语速 0.9），含 `speechSupported / speak / cancelSpeech`；自动选中文嗓音、异步 `voiceschanged` 兼容、组件卸载防串音、异常静默降级。零依赖。
- 新增 `Icon` 字形 `volume`（外放喇叭+声波）用于朗读按钮。
- `src/components/pages/TextbookPage.jsx`：每篇课文新增「听一听」按钮（不支持 TTS 的环境自动隐藏）；朗读标题 + 课后题中引号内的诗句；播报中按钮变为「停止」；卸载时 `cancelSpeech` 防串音。

**验证**：支持的设备点击可朗读并可停止；不支持设备按钮隐藏；不引入新依赖、不破坏存量。

---

## 6. 顺带修复

- `src/components/MinorModeGate.jsx`：修正中英混排文案“休息 time”→“休息时间”；删除重复注释。

---

## 7. 已知遗留（非本次范围）

- `src/components/exercise/score.test.ts` 存在**预先存在**的类型错误（`'fill'` 不匹配 `Question.type: 'single'`），与本次改动无关；`npm run typecheck` 会报该文件错误，但 `lint`/`test`/`build` 均通过。建议单独排查 score 模块类型定义，不在本批次处理。
