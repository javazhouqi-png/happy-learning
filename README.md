# 快乐学园 · 小学生在线学习平台前端

> 一个面向小学生的在线学习网站前端，包含语文 / 数学 / 英语等基础学科模块、互动式练习题、趣味动画教学视频、学习进度跟踪与家长查看面板。界面色彩明亮、操作简洁，内置积分与徽章等游戏化激励元素，并完整支持桌面端与移动端响应式体验。

本项目由设计稿（Ardot）落地为可运行的前端工程，采用 **React 18 + Vite 5 + CSS Modules** 构建，组件划分清晰、状态管理规范、交互真实可用。

---

## ✨ 功能特性

- **三大基础学科模块**：语文、数学、英语学科卡片，含独立配色与学习进度条
- **互动式练习题**：选择答案 → 提交 → 对错判定与动画反馈，答对自动 +10 积分
- **趣味动画教学视频**：视频卡片含缩略图、播放按钮与时长徽章
- **游戏化激励**：成长面板（等级 / 积分 / 连续学习天数）+ 徽章墙（已获得 / 锁定状态）
- **学习进度跟踪**：本周学习时长柱状图 + 三科掌握度可视化
- **家长查看面板**：孩子档案、今日动态时间线、护眼与时长管理开关（实时切换）
- **响应式适配**：桌面三栏在移动端自动塌缩为单列，点击区适配触控
- **真实交互**：移动端汉堡抽屉导航、平滑锚点滚动、状态驱动的 Tab 切换
- **趣味层（见下）**：庆祝动效、音效、悬浮吉祥物、彩蛋与更丰富的勋章墙

---

## 🎉 趣味层

应用根部（`src/main.jsx`：`AppProvider` → `FunProvider` → `App`）挂载了一层轻量「趣味层」，对外只暴露一个 `useFun()` Hook，业务组件保持干净、核心 reducer 不被触碰。

- **`FunProvider` / `useFun()`**（`src/components/fun/FunContext.jsx`）：统一的庆祝与反馈 API——`celebrate({ title, emoji, confetti, tone })` 吐司提示、`sound(type)` 音效、`setMood(mood, duration)` 驱动吉祥物、`unlockSecret()`。
- **`CelebrationLayer`**（`src/components/fun/CelebrationLayer.jsx`）：固定全屏、非阻塞吐司 + 纯 CSS 礼花（36 片随机配色），在 `prefers-reduced-motion` 下自动关闭。
- **`Mascot`**（「星宝」，右下角）：轻柔漂浮，随情绪切换表情与气泡；连续快速点击 7 次解锁神秘徽章。
- **`FunWatchers`**（`src/components/fun/FunWatchers.jsx`）：纯副作用监听，在升级、新徽章解锁、连击达标时触发庆祝 + 音效，不改动应用状态。
- **音效**（`src/utils/sound.js`）：原生 Web Audio API（无第三方库），内置 `correct / wrong / ding / fanfare / levelup / egg` 配方；尊重家长音效开关，无音频环境静默失败。
- **彩蛋**：连点吉祥物 7 次 → 神秘探索者徽章 + 礼花；2 秒内连点顶部 Logo 5 次 → 礼花爆发。
- **`AchievementWall`**（`src/components/sections/AchievementWall.jsx`）：勋章墙，解锁秘密后追加 `SECRET_BADGE`。
- **趣味文案**集中在 `src/data/fun.js`（`PRAISE`、`ENCOURAGE`、`LEVEL_UP`、`BADGE_UNLOCK`、`EGG_MESSAGES`、`MASCOT_LINES`）。

---

## 🛠 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | React 18（纯函数组件 + Hooks） |
| 构建工具 | Vite 5 |
| 样式方案 | CSS Modules（组件级作用域） |
| 状态管理 | React Context + `useReducer`（集中式） |
| 语言 | JavaScript (JSX) |
| 字体 | Fredoka（标题）/ Quicksand（正文），圆润活泼、清晰友好 |
| 图标 | 全内联 SVG，零 emoji / Unicode 符号 |

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173/）
npm run dev

# 生产构建，输出到 dist/
npm run build

# 本地预览生产构建产物
npm run preview
```

---

## 📁 项目结构

```
happy-learning/
├─ index.html                 # HTML 入口
├─ vite.config.js             # Vite 配置（React 插件）
├─ scripts/
│  └─ ssr-check.mjs           # 无浏览器下的渲染冒烟测试（捕获首屏崩溃）
├─ docs/
│  └─ EXAMPLES.md             # 组件 / 状态使用与扩展示例
├─ public/
│  └─ star.svg                # 吉祥物 / 品牌图标资源
├─ src/
│  ├─ main.jsx                # React 渲染入口（HashRouter + AppProvider）
│  ├─ index.css               # 全局设计令牌（:root CSS 变量）
│  ├─ App.jsx                 # 路由装配：组合页面与公共区块
│  ├─ data/
│  │  ├─ content.js           # 内容与业务数据 + 纯函数工具（数据/视图分离）
│  │  └─ fun.js               # 趣味文案与彩蛋文案（表扬 / 鼓励 / 徽章 / 表情）
│  ├─ state/
│  │  └─ AppContext.jsx       # 全局状态：reducer + derived + actions + 持久化
│  ├─ utils/
│  │  └─ sound.js             # Web Audio API 音效（无第三方库）
│  └─ components/
│     ├─ ExerciseEngine.jsx    # 答题引擎（逐题判分 + 错题本复习）
│     ├─ VideoModal.jsx        # 视频播放弹窗（模拟进度 + 观看计分）
│     ├─ fun/                  # 趣味层
│     │  ├─ FunContext.jsx     # FunProvider + useFun()
│     │  ├─ FunWatchers.jsx    # 升级 / 徽章 / 连击 副作用监听
│     │  ├─ CelebrationLayer.jsx
│     │  ├─ CelebrationLayer.module.css
│     │  ├─ Mascot.jsx
│     │  └─ Mascot.module.css
│     ├─ ui/                  # 可复用 UI 原语
│     │  ├─ Icon.jsx           # 内联 SVG 图标集
│     │  ├─ Button.jsx         # 按钮（含主/次/幽灵变体）
│     │  ├─ ProgressBar.jsx    # 进度条
│     │  ├─ Pill.jsx           # 积分 / 徽章药丸
│     │  ├─ SectionHeading.jsx # 区块标题
│     │  ├─ SubjectCard.jsx    # 学科卡片
│     │  └─ VideoCard.jsx      # 视频卡片
│     ├─ sections/            # 首页业务区块（从上到下）
│     │  ├─ Header.jsx         # 顶部导航（含移动端抽屉）
│     │  ├─ Hero.jsx           # 主视觉 + 吉祥物
│     │  ├─ SubjectModules.jsx # 三大基础学科
│     │  ├─ InteractiveExercises.jsx # 互动练习题（答题 + 积分）
│     │  ├─ AnimatedVideos.jsx # 趣味动画视频
│     │  ├─ Gamification.jsx   # 游戏化激励
│     │  ├─ ProgressTracking.jsx # 学习进度跟踪
│     │  ├─ AchievementWall.jsx # 勋章墙（含神秘徽章）
│     │  ├─ ParentPanel.jsx    # 家长查看面板（今日屏幕时间 / 开关）
│     │  ├─ ResponsiveShowcase.jsx # 响应式手机样机
│     │  ├─ FinalCTA.jsx       # 底部行动号召
│     │  └─ Footer.jsx         # 页脚
│     └─ pages/               # 路由级页面
│        ├─ Home.jsx           # 首页（组装各业务区块）
│        ├─ SubjectPage.jsx    # 学科页（课程 / 练习 / 视频 Tab）
│        └─ VideoLibrary.jsx   # 动画课堂（学科筛选）
```

---

## 🎨 设计系统

设计令牌集中在 `src/index.css` 的 `:root` 变量，与原始设计稿保持一致，便于统一调整主题。

### 配色

| 用途 | 颜色 | 值 |
| --- | --- | --- |
| 主色（蓝） | Primary | `#4D96FF` |
| 语文（粉） | Chinese | `#FF6B9D` |
| 英语 / 进度（绿） | English | `#3DCA6E` |
| 数学 / 强调（橙） | Math | `#FF9F45` |
| 游戏化（紫） | Game | `#7A5CFF` |
| 背景暖白 | Bg | `#FFF8F0` |

### 圆角与阴影

- 卡片圆角：`--radius-card: 24px`
- 按钮圆角：`--radius-btn: 999px`
- 阴影：`--shadow-soft` / `--shadow-card` 两级柔和投影

### 字体

- 标题：`Fredoka`（圆润活泼）
- 正文：`Quicksand`（清晰友好）

> 在本地未安装字体时，浏览器会回退到系统无衬线字体；上线时建议通过 `@font-face` 或字体 CDN 引入。

---

## 🧩 状态管理

全局状态由 `src/state/AppContext.jsx` 统一管理，采用 **Context + useReducer** 的单向数据流：

- `useApp()` 暴露 `{ state, derived, actions }` 三部分：原始状态、派生计算结果、稳定动作函数；
- 组件只通过 `actions` 派发意图，不直接改 `state`；派生数据由 `useMemo` 集中计算，避免散落各处的重复逻辑；
- 状态在每次变更后写入 `localStorage`（键 `happy-learning-state-v1`），刷新不丢；隐私模式等写入失败会被静默忽略，不影响使用。

### 原始状态（state）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `points` | number | 累计积分（学完课程 +15 / 答对题 +10 / 观看视频 +5） |
| `completedLessons` | `{ [lessonId]: true }` | 已学完课程索引 |
| `quizBySubject` | `{ [subjectId]: { correct, total } }` | 各科答题累计 |
| `wrongBySubject` | `{ [subjectId]: { [questionId]: true } }` | 错题本（支持复习模式） |
| `videosWatched` | `{ [videoId]: true }` | 已观看视频索引 |
| `studySeconds` | number | 累计学习秒数（全期） |
| `todayStudySec` | number | 今日学习秒数（跨天自动清零） |
| `todayDate` | string | 今日时长对应的日期，用于按自然日归零 |
| `streakDays` | number | 连续学习天数 |
| `lastActiveDate` | string | 最近活跃日期（本地日期） |
| `parent` | `{ dailyLimitMin, eyeRest, sound }` | 家长设置 |
| `history` | `Array<{ ts, type, detail }>` | 学习动态，最多 50 条，最新在前 |

### 动作（actions）

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `completeLesson` | `(lessonId, subjectId, durationMin)` | 学完课程（幂等，重复不计分） |
| `answerQuiz` | `(subjectId, correct, total, { wrongIds, correctIds })` | 提交答题，维护错题本 |
| `watchVideo` | `(videoId, durationSec, subjectId)` | 观看视频（幂等） |
| `recordStudy` | `(seconds)` | 追加学习时长（跨天清零） |
| `updateParent` | `(patch)` | 更新家长设置（浅合并） |
| `clearWrong` | `(subjectId)` | 清空某科错题本 |
| `reset` | `()` | 清空全部进度 |

### 派生数据（derived，组件直接取用）

`level` / `levelTitle`（等级与称号）、`nextLevelPoints` / `levelProgress`（升级进度）、
`badges` / `unlockedCount`（徽章墙）、`mastery`（三科掌握度百分比）、
`wrongCountBySubject`（各科错题数）、`todayStudyMin` / `dailyLimitMin` / `dailyRemainingMin` / `dailyOverLimit`（今日屏幕时间）。

### 边界场景与处理

- **存储损坏 / 旧版本**：`loadState` 对 `points` 等强制转数字，缺失字段回退默认；解析异常整体回退默认状态，**绝不抛错白屏**。
- **重复计分**：课程 / 视频完成均做幂等保护，重复点击不再加分。
- **跨天归零**：`todayStudySec` 按本地自然日归零，家长每日上限按“天”生效而非累计全生涯。
- **连续打卡**：今天已记过不重复 +1；昨天活跃 +1；更早断签重置为 1。使用本地日期，避免 UTC 凌晨错算。
- **答题防呆**：`safeInt` 把 `undefined`/负数/NaN 收敛为安全值；未答完不允许提交。
- **错题本自清理**：复习时答对即移出错题本，改对即清。

---

## 📚 组件与状态使用示例

更多可运行示例见 [`docs/EXAMPLES.md`](./docs/EXAMPLES.md)。常用片段：

```jsx
import { useApp } from '../state/AppContext.jsx'
import { getSubject, levelTitle } from '../data/content.js'

function MyComponent() {
  const { state, derived, actions } = useApp()
  // 读取派生数据
  console.log(derived.levelTitle, derived.points, derived.mastery.math)
  // 派发动作（幂等，组件无需关心 reducer 细节）
  actions.completeLesson('ma-1', 'math', 8)
  return <p>{getSubject('math').name} 掌握度 {derived.mastery.math}%</p>
}
```

新增一门学科（数据驱动，无需改组件）：

```js
// src/data/content.js —— 在 SUBJECTS 增加一项，并补上 LESSONS / QUIZZES / VIDEOS 对应 key
export const SUBJECTS = [ /* ... */ { id: 'science', name: '科学', color: '#2bb3c0', icon: 'sparkle', tagline: '…', desc: '…' } ]
```

使用趣味层：

```jsx
import { useFun } from '../components/fun/FunContext.jsx'

function ExerciseFooterView() {
  const { celebrate, sound, setMood } = useFun()
  const onAllCorrect = () => {
    celebrate({ title: '全对啦！', emoji: '🏆', confetti: true })
    sound('fanfare')
    setMood('cheer', 2200)
  }
  return <button onClick={onAllCorrect}>提交</button>
}
```

---

## ♿ 可访问性与最佳实践

- 语义化标签（`<header>` / `<main>` / `<section>` / `<footer>` / `<nav>`）
- 关键交互元素添加 `aria-label` 与 `role`
- `:focus-visible` 焦点环，键盘可达
- `prefers-reduced-motion` 下自动降级动画
- 色块统一走 `currentColor` 与 `color-mix`，便于主题化

---

## 📦 构建产物

`npm run build` 输出到 `dist/`，为静态资源，可部署到任意静态托管（如 Nginx、GitHub Pages、EdgeOne Pages 等）。

---

## 📄 开源协议

本项目基于 [MIT License](./LICENSE) 开源。详见 `LICENSE` 文件。
