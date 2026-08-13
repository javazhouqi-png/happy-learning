# 快乐学园（happy-learning）改造方案 · 三文档整合版

> 生成日期：2026-08-12
> 基于：PRD（docs/prd-product-research.md）＋ 架构方案（docs/architecture/ARCH-REFACTOR-PLAN.md）＋ 设计调研（设计师回传）
> 状态：待用户确认
> 配套依据文档：docs/curriculum-roadmap.md（课标对齐知识图谱，定为唯一内容源）

---

## 0. 本轮边界（用户已确认）
- **范围**：前端精品化，不引入后端；保持纯前端 + localStorage。
- **定位**：课标同步 + 家校共育（小学 1-6 年级）。
- **技术**：全量 TypeScript 化。
- **首要焦点**：内容深度扩充 / UX 与交互 / 架构与性能。

---

## 1. 产品定位与差异化（PM）
**一句话价值主张**：对齐课标的每日 15 分钟——孩子自己愿意练，家长一页看懂哪里不会、今晚怎么陪。**不注册、不上传、无广告、无内购、无销售电话。**

**三大差异化优势（竞品结构上无法跟进）**：
1. **零账号零上传 = 把技术约束变营销主张**。在"退费难/电话轰炸/过度索权"是头号差评（黑猫投诉共性）的市场里，纯本地存储是合规与信任卖点，竞品的续费模式依赖账号，无法复制。
2. **家长要"诊断"不要"时长"**。家长焦虑是"他哪里不会、我怎么讲"，而非"学了 23 分钟"。把现有错题本 + SRS + 掌握度翻译成"三个薄弱点 + 三条今晚怎么陪"。
3. **3-6 年级 × 三科 × 课标同步的轻量自学工具**。识字类集体卡在二年级，素养类不对齐课标，官方平台是仓库不是工具。

**目标用户（双角色）**：
- 学生 6-12 岁，分三段：1-2 年级（识字量不足，题干朗读+拼音是"能否自主使用"的生死线）；3-4 年级（学业分化）；5-6 年级（目标驱动、厌恶幼稚化视觉）。
- 家长 28-45 岁双职工，每晚 15-30 分钟且被打断，双减后被推向"自己陪"却没工具，对自动续费高度警惕。
- 次要：教师/家委，需可打印周报。

---

## 2. 市场空白与竞品结论（PM）
- 直接竞品：斑马AI学（3-6 年级课标弱）、洪恩识字（只到二年级、单科）、悟空识字（无数学英语）、叫叫（偏素养非课标）、洋葱学园（动画微课标杆，视频形态参照）。
- 最强替代：**国家中小学智慧教育平台**（免费权威，我们绝不在资源量上竞争，改为外链补给）。
- 头号差评与"教得好不好"无关，全是**商业模式与可靠性**——这正是我们零账号零上传定位可正面回应的。

---

## 3. 内容策略（PM 主笔，含协同）
### 3.1 核心洞察：先接电，再扩充
- 现状：`LESSONS` 9 节 + `QUIZZES` 36 题进闭环；但 `GRADE_LEARNING` 的 **69 知识点 / 138 练习 / 138 易错点完全只读**，孩子做完不入错题本、不计掌握度、不给积分、家长周报看不到。
- `SubjectPage` 只 import `getLessons`，一年级和六年级看到同一批 9 课 36 题，两套内容体系互不打通。
- **裁决（推荐路径）**：首要焦点从"内容扩充"微调为"先接上电、再扩充"——接通 138 题入闭环，题库 **0 成本 36→174**；不接通就扩，新增内容同样落在闭环外。

### 3.2 内容扩充路线图（课标依据：2022 年版义务教育课程方案/标准；唯一内容源 = docs/curriculum-roadmap.md）
- **P0**：知识点 69→108（数学缺口最大）；题库 36→540（每点 5 题：1 识记+2 理解+1 应用+1 易错辨析）；题型 1→6（现全单选，对识字/计算/笔顺失真；`LESSONS[].texts` 已实现 read/recite/think/fill/connect 五型，是现成契约）；补 `grade/point/type/level` 四个溯源字段。
- **P1**：每点补 misconceptions 3 条（对比免费 AI 的护城河——AI 能答题但不会主动告诉家长"错的'的得地'混用"）+ 生活应用 + 学段衔接；单元诊断卷；英语语音（跟读降级为自评+录音回放，不假装 AI 打分）。
- **P2 真实视频三路线（按成本排序）**：① 自绘 SVG/CSS 动画课（零版权零带宽，100% 自研）→ ② 官方名师微课外链（跳转 basic.smartedu.cn，不内嵌不转存）→ ③ 自制录屏。**绝不做占位视频 + 假播放。**

### 3.3 合规底线（非可选项）
《未成年人网络保护条例》+ 中央网信办《移动互联网未成年人模式建设指南》(2024-11-15) + GB/T 47694—2026：连续 30 分钟休息提醒、每日建议 1 小时、22:00-6:00 不服务、退出须家长验证。正面回应"久坐伤眼"家长核心顾虑。

---

## 4. 架构与工程方案（架构师）
### 4.1 全量 TS 化（三段棘轮，约 4 人日）
- A：`npm i -D typescript @types/react @types/react-dom`；`tsconfig.json` 起点 `allowJs/checkJs:false/strict:false/noEmit:true/jsx:react-jsx/moduleResolution:bundler/verbatimModuleSyntax:true`；必须建 `src/vite-env.d.ts`。
- B：先建 `src/types/domain.ts`，**最高价值单点 = `AppAction` 判别联合**（现 reducer 的 `action.lessonId`/`action.patch` 零约束）；按依赖倒序转 `utils→data→state→ui→sections/modules/pages→App/main`。
- C：`noImplicitAny→strictNullChecks→strictFunctionTypes→strict→checkJs`，每档单独提交；`noUncheckedIndexedAccess` 收益尤高。逃逸只用 `@ts-expect-error`，禁 `any` 兜底。

### 4.2 AppContext 拆分（按"动作域"拆，非"状态子树"）
- `ANSWER_QUIZ` 一次写 6 字段，横跨学习+游戏化+复习三域。若按子树切会被割裂成多次 dispatch，破坏原子性与幂等。
- 做法：保留单一 state 对象，reducer 拆域处理器 `(state,action)=>state`，`rootReducer` 用查找表组合。目录：`state/{types,storage,helpers,rootReducer,selectors,actions,AppProvider,useApp}.ts` + `state/slices/{learning,gamify,review,parent}.ts`。
- 拆 `AppStateContext`/`AppActionsContext` 避免任何变化都重渲染全部消费者；`useApp()` 保留为兼容层（不破坏 40+ 调用点）。**`storage.migrate(v1→v2)` 必须与本次拆分同批上线**，否则存量用户进度清零。

### 4.3 content.js 拆分 + 路由懒加载（真瓶颈在数据层）
- 实测：主 chunk 318 KB 中约 **39% 是被 `/grade` 独占的年级数据**（GRADE_LEARNING 102 KB + GRADE_KNOWLEDGE 21 KB）。按域拆 9 文件 + `data/grade/{knowledge,learning}/g1..g6.ts`；`BADGES.check()` 含函数，保持 `.ts`。
- ⚠️ `src/data/index.ts` 绝不可静态 `export *` 年级数据（否则 Rollup 拉回主 chunk，分包白做）；CI 加主 chunk < 180 KB 体积断言。
- 路由：`Home` 静态，其余 8 条 `React.lazy` + 各自 Suspense/ErrorBoundary；`manualChunks` 拆 react-vendor；预期主 chunk 318→120~150 KB，`/grade` 约 130 KB 按需。

### 4.4 六处重复消除（含 2 意外）
- `addDays` 同名不同型（`AppContext` 返回 string vs `utils/date.js` 返回 Date）→ 另加 `addDaysStr()` 区分并存。
- `ParentPanel.jsx` 的 `TYPE_ICON` 缺 `game` 键（存量 bug，游戏动态图标错落 star）→ 合并到 `constants/historyIcons.ts` 时一并修。
- 其余归口：`localDateStr/yesterdayStr/todayStr`→`utils/date.ts`；`SECRET_BADGE`→`data/badges.ts`；掌握度速率重算统一到 `selectors.ts`（`lessonRateOf/quizRateOf/masteryOf`）。

### 4.5 质量门禁
- ESLint 9 Flat + typescript-eslint + react-hooks + jsx-a11y + Prettier；husky + lint-staged。
- pre-commit 只跑 `lint-staged`（eslint --fix + prettier），`tsc --noEmit` 放 CI（避免开发者绕钩子）。
- **P0 规则机器化**：`no-restricted-syntax` 用 unicode 区间拦 JSXText/Literal 里的 emoji；`scripts/check-design-tokens.sh` 拦非 `#fff/#000` 硬编码色 + 主 chunk 体积断言。CI：`typecheck→lint→format:check→build→门禁脚本`。
- 测试立场：`tsc` 作 interim 安全网；建议 Phase 2 补 Vitest 测纯函数（约 15 例）覆盖 `slices/*`、`selectors.ts`、`utils/date.ts`（跨天打卡、Leitner 推进、积分幂等）。

### 4.6 ErrorBoundary（必须 class 组件）
- 懒加载后配套强制项：新版本署会让旧哈希 chunk 404。boundary 内识别 `ChunkLoadError|Loading chunk` 引导刷新，而非笼统"出错了"。加载态用保留高度的骨架屏（避免 CLS）。挂载：main 外层一个兜全局 + 每路由一个做隔离。

### 4.7 技术边界（如实标注，约束对外表述）
纯前端 + localStorage **不可实现**：多设备同步、云端排行榜、进度防篡改（DevTools 可改 `happy-learning-state-v1`，积分等级全可伪造）、账号找回。
- `parent.dailyLimitMin` 纯客户端，清缓存即绕过 → **不得宣传"家长控制"，只能定位"用眼提醒"**；多孩子只做本地档案切换。
- **iOS Safari ITP：7 天无交互站点 localStorage 可能被回收 → 进度归零**。本期缓解：① `storage.ts` 增 `exportProfile/importProfile`（家长中心加"导出学习档案"，纯前端唯一可靠保全）；② `migrate(v1→v2)` 与 AppContext 拆分同批。

---

## 5. 设计与体验方案（设计师）
### 5.1 真实视频闭环 UX
- 自研播放器：播放/暂停 + 进度拖拽 + 时间 + 倍速 0.75/1/1.25/1.5 + CC。
- 完成判定 = 真实监听 `timeupdate/ended`，进度 ≥95% 且累计真实观看时长达标（频繁 `seeked` 不计）才触发庆祝层 + 计分联动；防刷分写入 localStorage；播放中禁用"看介绍"假按钮。

### 5.2 加载态 / 骨架屏 + ErrorBoundary 视觉
- 组件级骨架屏（shimmer，reduced-motion 时静态），首屏/路由切换非阻塞 overlay；ErrorBoundary 按模块隔离——友好吉祥物插画 + 具体错误 + 重试按钮（不暴露技术栈），单模块崩溃不影响全局。

### 5.3 移动端统一弹窗（替代原生 confirm）
- 自研 Dialog/ActionSheet（移动底卡/桌面居中）。破坏性操作（打卡重置、错题清空）走家长门控（简单算术题或长按 3 秒）再二次确认；aria-modal + 焦点陷阱 + ESC/遮罩关闭 + 禁滚动穿透。

### 5.4 交互打磨清单
- 按钮按压 scale + 成功 toast 复用庆祝层；统一动效 token 150-250ms；列表空态用 SVG 插画 + 引导文案 + 行动钮（非"暂无数据"）；打卡弹性动画/徽章解锁/进度环。

### 5.5 Token 重构 + 图标库锁定（裁决）
- **图标库锁定 = 项目自有 `src/components/ui/Icon.jsx`**（架构师裁决，0 KB 依赖，底子好；TS 化后图标名写错即编译报错）。设计师补足约 10 个图标（5 表情 + confetti/rocket/medal/egg/muscle），尺寸锁 16/20/24px，不引入第三方库。
- Token 收敛：Hero/CollectionAlbum 内联色值（`#2D3142/#F59E0B/#FF8FB1/#4caf50...`）改 `var(--token)`；建议按 A1(identity)/A2(semantic)/B(slot)/C(extension: --mascot*/--garden*/--reward*/--parent*) 四层重构，导出 `design-tokens.json` 供 TS 引用。
- 对标基调：课标权威·亲切趣味 = Linear 克制层级 × 可汗儿童温情引导 × 洪恩 IP 趣味；复用现有 SVG 吉祥物作引导角色；浅色暖底、单一友好强调色（现有蓝 #4d96ff，避紫粉渐变）。

---

## 6. 三文档一致性校验（团队总监）
| 维度 | 对齐结论 |
|------|----------|
| PRD 功能 ↔ 架构 | 接通 138 题入闭环（PRD）需架构在 `data/slices` + `ExerciseEngine` 接线，已纳入实施；导出/导入档案（PRD）↔ `storage.exportProfile/importProfile`（架构）一致 |
| 架构 ↔ 设计 | 图标库冲突已裁决（见 5.5）；`ErrorBoundary` 双方一致；懒加载分包与骨架屏/错误边界视觉配套 |
| PRD ↔ 设计 | 分龄视觉（PRD 三段）+ 家长诊断页 + 8 处空状态 + 护眼提醒（设计）一致；合规底线双方对齐 |
| 冲突 | 仅图标库选型一处，已裁决为"项目自有 Icon.jsx" |

---

## 7. 项目总监裁决的待定项
1. **焦点微调**：采纳 PM"先接电、再扩充"——接通 138 题入闭环为 P0 首要，内容扩充为 P1。原用户所选"内容深度扩充"保留为第二阶段重心。
2. **插画 SVG 配色门禁豁免（混合裁决，最终）**：① 易令牌化的装饰色先收进令牌体系——花园绿 `#4caf50/#66bb6a/#81c784`→`--garden-1/2/3`（已在 design-tokens.json）；Hero 暖色 `#FFB020/#FFE08A`→新增 `--hero-accent-1/2`，`#e8f1ff/#fff3e9`→复用 `--surface-warm`/新增 `--surface-tint`；② 纯品牌装饰插画（吉祥物/庆祝彩带/魔法花园/空状态）走**限定白名单**（`docs/design/illustration-whitelist.json` 显式登记），门禁脚本读取后跳过；③ 功能 UI 一律走 token，无任何豁免。门禁脚本 `scripts/check-design-tokens.sh` 须加白名单豁免分支读取该 JSON。
3. **图标排期前置**：设计师补足约 10 个 SVG 图标为 Phase 2 最早项，先于 emoji 移除（否则 P0 修复无图标可替换）。
4. **图标库**：锁定项目自有 `Icon.jsx`，不引第三方（已裁决）。

---

## 8. 明确不做（Out-of-Scope）
| 不做 | 原因 | 何时考虑 |
|------|------|----------|
| 真实后端 / 账号体系 / 云同步 | 用户确认纯前端；纯前端无法做防篡改/多端同步 | 独立立项是真实产品的前提 |
| 云端排行榜 / 社交 | 需后端 + 防作弊，纯前端不可行 | 同上 |
| 假装 AI 打分（语音/作文） | 无后端模型，假 AI 损害信任 | 接入模型 API 时 |
| 占位视频 + 假播放 | P0 内容诚信红线 | 拿到真实视频资产 |

---

## 9. 实施排期（约 12 人日，门禁先行）
1. **质量门禁先行**（ESLint9+Prettier+husky+CI+门禁脚本）——全程回归保护。
2. 图标库补全（设计师 10 图标）→ P0 修复（emoji 图标移除 + 硬编码色收敛）。
3. 全量 TS 化（三段棘轮）+ `AppAction` 判别联合。
4. `storage.migrate(v1→v2)` 与 AppContext 按动作域拆分**同批**。
5. content.js 拆分 + 路由懒加载 + 主 chunk 体积断言。
6. **接通 GRADE_LEARNING 138 题入闭环**（错题本/掌握度/积分/家长周报）——"接电"。
7. ErrorBoundary + 骨架屏 + 移动端统一弹窗（家长门控）。
8. 真实视频闭环 + 导出/导入学习档案 + 未成年人模式合规（护眼提醒）。
9. 内容扩充 P0（题型多样化 + 溯源字段）+ 8 处空状态引导 + Vitest 纯函数测试。

---

## 10. 风险与开放决策
- **iOS Safari ITP 进度清零**：本期以导出/导入档案 + 存储迁移缓解，非根治（根治需后端）。
- **P0 修复范围**：现有 13 文件 24 处 emoji 图标 + 多处硬编码色，Phase 2 强制修。
- **闭环接电的数据契约**：错题记录须带 `grade/point/type/level` 四溯源字段，已在 MVP 前置（避免 P1 诊断报告返工）。
- **"行业一流"判据（PM 提议，供采纳）**：次日打开率 + 家长能否一屏说出孩子三个薄弱点——靠闭环完整度而非内容数量。
