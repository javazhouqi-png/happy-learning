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
├─ public/
│  └─ star.svg                # 吉祥物 / 品牌图标资源
├─ src/
│  ├─ main.jsx                # React 渲染入口
│  ├─ index.css               # 全局设计令牌（:root CSS 变量）
│  ├─ App.jsx                 # 页面装配：组合所有业务区块
│  ├─ data/
│  │  └─ content.js           # 内容与业务数据（数据/视图分离）
│  ├─ state/
│  │  └─ AppContext.jsx       # 全局状态：积分/答题/家长开关/Tab/移动导航
│  └─ components/
│     ├─ ui/                  # 可复用 UI 原语
│     │  ├─ Icon.jsx           # 内联 SVG 图标集
│     │  ├─ Button.jsx         # 按钮（含主/次/幽灵变体）
│     │  ├─ ProgressBar.jsx    # 进度条
│     │  ├─ Pill.jsx           # 积分 / 徽章药丸
│     │  ├─ SectionHeading.jsx # 区块标题
│     │  ├─ SubjectCard.jsx    # 学科卡片
│     │  └─ VideoCard.jsx      # 视频卡片
│     └─ sections/            # 业务区块（页面从上到下）
│        ├─ Header.jsx         # 顶部导航（含移动端抽屉）
│        ├─ Hero.jsx           # 主视觉 + 吉祥物
│        ├─ SubjectModules.jsx # 三大基础学科
│        ├─ InteractiveExercises.jsx # 互动练习题（答题 + 积分）
│        ├─ AnimatedVideos.jsx # 趣味动画视频
│        ├─ Gamification.jsx   # 游戏化激励
│        ├─ ProgressTracking.jsx # 学习进度跟踪
│        ├─ ParentPanel.jsx    # 家长查看面板
│        ├─ ResponsiveShowcase.jsx # 响应式手机样机
│        ├─ FinalCTA.jsx       # 底部行动号召
│        └─ Footer.jsx         # 页脚
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

全局状态由 `src/state/AppContext.jsx` 统一管理，使用 `useReducer` 管理以下维度：

- `points`：用户积分（互动练习题答对后累加）
- `answered` / `isCorrect`：当前答题状态与判定结果
- `toggles`：家长面板中的护眼 / 时长管理等开关
- `activeTab`：手机样机底部 Tab 高亮态
- `mobileNavOpen`：移动端抽屉导航开关

组件通过 `useApp()` 钩子消费状态、派发 `action`，彼此解耦、单向数据流。

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
