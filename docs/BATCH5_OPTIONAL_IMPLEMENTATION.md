# 可选项实现报告（批次五）

在前四批基础上，完成此前遗留的三个可选项：
① 闪卡「不认识」收藏在收藏页的跳转锚点修复；
② science（科学）正式纳入 getQuiz 题库与学科体系；
③ M2/M3 长期能力：离线 PWA、自适应难度、学期报告。

质量门禁全绿：tsc 0 error / eslint 0 / vitest 56 passed / vite build 成功（主包 40.7KB，gzip 15.9KB）。

---

## ① 闪卡「不认识」收藏跳转锚点修复

**问题**：`GameCenter` 闪卡模式把「不认识」的知识点以 `kind:'text'` 收藏，被错误归入收藏页的「课文」分组，且跳转 `/textbook`（课文页），与「知识点」语义不符、也无法回到对应学科。

**改动**：
- `GameCenter.jsx`：收藏改用 `kind:'point'` 并补 `subject` 字段。
- `FavoritesPage.jsx`：新增 `point` 收藏类型（标签「知识点」），并对 `point` 类型按 `subject` 精准跳转 `/learn/:subject`（无 subject 时回退 `/learn`）。

**文件**：`src/components/modules/GameCenter.jsx`、`src/components/pages/FavoritesPage.jsx`

---

## ② science 正式纳入 getQuiz（内容债清理）

**根因**：`GRADE_LEARNING` 每个年级都已内置 science 知识点与练习题，但 `content.js` 的 `SUBJECTS` 只注册了 chinese/math/english，导致：
- 学习中心 / 学科页无法进入 science；
- `getQuiz('science', grade)` 永不被调用，练习题被埋没；
- `diagnose.js` 等模块硬编码三科，science 错题不进诊断。

**改动**（共 4 处硬编码同步，避免类型/状态断层）：
- `content.js`：`SUBJECTS` 新增 science 学科（name/color/icon/tagline/desc）。
- `types.ts`：`SubjectId` 联合类型加入 `'science'`；`FavoriteItem.kind` 加入 `'point'`。
- `storage.ts`：状态层 `SUBJECTS` 常量、`defaultReview`、`quizBySubject`、`quizByGrade`、`wrongBySubject`、`emptyGradeQuiz` 全部补 science（保证 mastery / 错题 / 复习排程等状态对 science 正确初始化）。
- `diagnose.js`：改用 `content.js` 的 `SUBJECT_IDS`（含 science），使 science 错题进入薄弱点诊断。

**验证**：`src/data/__tests__/science.test.ts` 断言 1–6 年级 `getQuiz('science', g).length > 0` 且每题带 `pointId`/`grade`（已通过）。

**说明**：science 暂无 LESSONS / VIDEOS（与「以探究与练习为主」的定位一致），学科页课程/视频 tab 显示空态、练习 tab 正常出 GRADE_LEARNING 练习题。`textbook.js` 的 `SUBJECT_IDS` 保持三科（课本不含 science），不受影响。

---

## ③ M2/M3 长期能力

### ③-a 离线 PWA（零新依赖）
手写 `public/manifest.webmanifest` + `public/sw.js`，`index.html` 注册 Service Worker（注册失败静默降级，不阻塞首屏）。
- 导航请求 network-first 并写回缓存，离线时回退到缓存的 `index.html`（保证 SPA 可打开）；
- 其它静态资源 cache-first（带 hash 资源天然唯一）。

### ③-b 自适应难度
新增 `src/data/adaptive.js` 纯函数：`accuracyOf`、`selectDifficulty`（≥0.8 挑战 / ≥0.5 巩固 / 其余基础）、`difficultyLabel`、`sortByAdaptive`（错题优先排序）。
- 融入 `ExerciseEngine`：普通练习模式按「错题优先」排序（不破坏 override / 复习模式语义）；
- 头部展示「智能 Lv.X · 难度档」徽标，让家长/孩子感知自适应档位。
- `src/data/__tests__/adaptive.test.ts` 覆盖分档与排序。

### ③-c 学期报告
新增 `src/data/termReport.js`：`buildTermReport(state)` 汇总积分、完成课程、练习正确率、各科掌握度、薄弱点（复用 `diagnose.aggregateWeakPoints`）。
- 新增 `ParentTermReport.jsx` + CSS，挂载于 `ParentCenter`；提供一键复制分享、各科学掌握度进度条、薄弱点标签与空态。
- `src/data/__tests__/termReport.test.ts` 覆盖汇总与 science 错题聚合。

---

## 边界与后续
- 离线 PWA 的 SW 行为需在真机/生产构建下验证（沙箱无法模拟离线）；当前为渐进增强，注册失败不影响使用。
- 自适应难度为「Lv 分级 + 错题优先」的轻量落地，未引入完整 IRT 自适应；如需更细粒度可按 `accuracy` 动态调整口算题范围。
- 学期报告基于既有 `quizBySubject` / `wrongBySubject` 等状态，诚实汇总，不编造数据。
- 本地提交后 ahead 4（含此前三批），推送仍受 GitHub token 只读权限阻断，需用户在 GitHub 侧授予该仓库 Contents 写权限后执行 `git push origin main`。
