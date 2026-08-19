# 第三批功能实现报告（N1 / N2 / N4）

> 对应功能机会契约：`docs/NEXT_FEATURE_OPPORTUNITIES.md`
> 技术栈：React 18 + Vite 5 + CSS Modules + Context（双 Context + slice reducer），不引入新技术。
> 质量门禁：`tsc --noEmit` 0 error / `eslint` 0 error / `vitest` 37 通过 / `vite build` 成功。

---

## N1 · 多题型引擎真正落地（连线 / 填空）

**问题定位（探查而非假设）**
`src/data/subjects.js` 的课文课后习题含 `type:'fill'`（选字填空，数据已是 `options+answer` 下标形式）与 `type:'connect'`（连一连，`pairs:[{left,right}]`）。
此前 `src/components/modules/LessonTexts.jsx` 的渲染存在「潜伏坏 UI」：
- `FillExercise` 仅「显示答案」被动揭示，孩子无法先练后判；
- `ConnectExercise` 完全静态展示左右配对，并提示「自己连、家长核对」，无任何交互与反馈；
- `src/components/exercise/score.ts` 的 `QuestionType` 联合类型虽含 `'fill'`，但 `REGISTRY` 未登记 `fill` 判分器，导致填空一旦进入评分路径会被恒判错。

**实现**
1. `score.ts`
   - 登记 `registerScorer('fill', scoreSingle)`：填空为下标匹配，判分逻辑与单选一致，消除「fill 恒错」隐患；同步更新类型注释说明题型扩展方式。
2. `LessonTexts.jsx`
   - `FillExercise` 升级为「先选后判」：点击选项 → 「检查」→ 即时高亮正确/错误项并给出解析，提供「再试一次」。
   - `ConnectExercise` 升级为可交互连线：左侧固定、右侧洗牌，点左再点右完成配对，「检查连线」逐对判定，提供「重新连线」；含洗牌工具函数（不影响判分）。
3. `LessonTexts.module.css`：新增交互态样式（选中/正确/错误、连线两列与箭头、说明反馈色），并把 `.optChip` 改为按钮友好样式。

**边界**
- 填空/连线为课文课后习题，走 `TextExercises` 渲染路径，**不进入** `ExerciseEngine` 题库（题库为 `single` 单选），故改动零侵入既有答题流程。
- 连线判分基于「左项对应的正确右项在打乱数组中的位置」比对，数据右值唯一，判定准确。

---

## N2 · 每日学习任务单（今日三件事）

**实现**
1. 状态层
   - `types.ts`：新增 `DailyTask` / `DailyTasks` 接口；`AppState.dailyTasks`；动作 `SET_DAILY_TASKS` / `TOGGLE_DAILY_TASK`。
   - `storage.ts`：`defaultState` 增加 `dailyTasks:{date:'',items:[]}`；`migrate` 增加 `mergeDailyTasks`（结构兜底，旧档自动回到空任务，由 App 重新生成）。
   - `reducers/dailyTasks.ts`（新增）：处理整体替换与按 id 幂等勾选。
   - `reducer.ts`：注册两个动作到 `dailyTasksReducer`。
   - `AppContext.jsx`：新增 `setDailyTasks` / `toggleDailyTask` 动作；挂载时若 `dailyTasks.date !== 今日` 则按当前状态生成任务（仅 date 变化时触发，无循环）。
2. 生成逻辑 `data/dailyTasks.js`（纯函数）
   - `generateDailyTasks(state)`：依据错题数产出三项稳定槽位——`review-wrong`（有错题）或 `practice`（无错题）、`read-text`、`watch-video`，id 固定保证跨渲染勾选持久。
   - `todayStr()` 本地日期工具。
3. UI `sections/DailyTasks.jsx` + `.module.css`（新增）
   - 首页 `Home` 在 `SubjectModules` 之后挂载；展示日期、三项勾选清单、完成进度条、全勤鼓励。

**边界**
- 任务单按天生成、跨天重置；旧档无该字段时 `migrate` 兜底为 `''`，加载即触发重新生成。
- 「去做」为路由跳转，完成以勾选框为准（避免误标完成）。

---

## N4 · 错题 ↔ 知识点闭环（分组 + 跳回）

**实现**
1. `WrongQuestionCenter.jsx`
   - 新增 `groupWrongByPoint(sub, state)`：按 `pointId` 将错题分组，带知识点名、题数、代表年级；无溯源的归入「未归类知识点」。
   - 新增 `PointPractice` 子组件：取该知识点对应全部题目（`questionsOfPoint` 复用 `getQuiz`，兼容 `pointId/point` 字段），复用 `ExerciseEngine` 判分；答对即移出错题本、答错保留溯源（沿用 `ANSWER_QUIZ` 既有逻辑），形成「错题 → 知识点 → 针对性练习」闭环。
   - 分组视图：列出各知识点 + 题数 + 「练这组」按钮（未归类仅提示「复习模式巩固」）；顶部「回教材」跳 `/textbook`，补上「跳回」入口。
2. `WrongQuestionCenter.module.css`：新增分组列表、`练这组`/`收起`/回教材 等样式。

**边界**
- `练这组` 在 `getQuiz` 取不到该知识点题目时降级提示并保留「回教材」入口，不崩溃。
- 错题溯源依赖 `pointId`；旧链路仅存 `true` 的错题自然落入「未归类知识点」，仍可在复习模式巩固。

---

## 文件清单

新增：
- `src/components/modules/LessonTexts.jsx`（改写 fill/connect）
- `src/components/modules/LessonTexts.module.css`
- `src/state/reducers/dailyTasks.ts`
- `src/data/dailyTasks.js`
- `src/components/sections/DailyTasks.jsx`
- `src/components/sections/DailyTasks.module.css`
- `src/state/__tests__/dailyTasks.test.ts`
- `docs/BATCH3_IMPLEMENTATION.md`

修改：
- `src/components/exercise/score.ts`
- `src/state/types.ts`、`storage.ts`、`reducer.ts`、`AppContext.jsx`
- `src/components/modules/WrongQuestionCenter.jsx` + `.module.css`
- `src/components/pages/Home.jsx`

## 验收要点
1. 教材同步页 / 课程页的「填空」「连一连」习题可交互、可即时判分。
2. 首页出现「今日学习任务」，三项可勾选、进度条更新；刷新后同一天勾选保留。
3. 错题复习中心按知识点分组，「练这组」进入针对性练习并可「回教材」。
4. `npm run build` 通过；`tsc`/`eslint`/`vitest` 全绿。

## 遗留 / 待用户定夺
- **GitHub 推送仍被 token 只读权限阻断**（同第二批）：需在 GitHub 将 token 改为对本库 `Contents: Read and write`（或换 `repo` 权限 token 重存凭据）。权限到位后一条 `git push origin main` 即可上推。
- N3（家长诊断报告）、N5（互动学习模式）、N6（全站年级分层入口）留待第四批冲刺「顶级产品」差异化。
