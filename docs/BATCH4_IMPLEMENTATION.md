# 第四批功能实现报告（N3 诊断报告 · N5 互动学习 · N6 年级分层）

> 基线：第三批（N1 多题型引擎 / N2 每日任务单 / N4 错题闭环）已本地提交 `c20dec0`。
> 技术约束：React 18 + Vite 5 + CSS Modules + Context（双 Context + slice reducer）；不引入新技术栈、不破坏存量。
> 验收契约：`docs/NEXT_FEATURE_OPPORTUNITIES.md`（N3 / N5 / N6 节）。

---

## 一、N3 · 家长诊断报告（对比免费 AI 的核心差异化资产）

**改动**：扩展 `ParentWeeklyReport.jsx`（挂载于 `ParentCenter`），新增「学习诊断报告」区块。

- 新增纯函数 `src/data/diagnose.js`：
  - `aggregateWeakPoints(state)`：按 `pointId`（兜底 `pointTitle` / 未分类）聚合错题本错次，降序返回。旧链路仅存 `true` 的错题归入「未分类知识点」，仍参与计数，不丢数据。
  - `buildDiagnosis(state)`：取 Top3 薄弱点 + 恰好 3 条陪学动作；薄弱点不足 3 条时用通用建议**诚实补足**，绝不编造具体知识点。
  - `adviceFor`：文案 `why`/`scene` 取自 `GRADE_KNOWLEDGE`（与 `GRADE_LEARNING` 标题一致），`analysis` 取自 `GRADE_LEARNING`，按标题对齐两源。
- 报告 UI：3 张薄弱点卡片（知识点名 + 学科/年级/错次 + 为什么重要 + 生活场景）+「今晚 5 分钟陪学动作」清单。
- 导出：保留原「复制周报」；新增「复制诊断报告」（纯文本）+「打印 / 导出」（独立窗口渲染并 `window.print()`，被弹窗拦截时降级为复制）。
- 诚实边界：无错题时显示「本周暂无明显薄弱点，保持节奏」，不编造数据。

**集成点**：复用错题四溯源字段（`WrongEntry.pointId/pointTitle/grade`）、`getGradeLearning` / `getGradeKnowledge`；派生计算不持久化。

---

## 二、N5 · 互动学习模式（沉浸互动）

**改动**：重写 `GameCenter.jsx`（挂载于 `PlayCenter`），由单一记忆翻牌升级为四模式切换（记忆翻牌 / 知识点闪卡 / 口算闯关 / 听写跟读）。

- **记忆翻牌**：原实现完整保留。
- **知识点闪卡** `FlashCardGame`：卡组由当前年级 `GRADE_LEARNING` 各知识点生成（正面标题、背面核心），「认识 / 不认识」分流；不认识进本轮「待巩固」列表，结束页可一键「收藏」。
- **口算闯关** `ArithmeticGame`：按年级生成题目（1–2 年级 ±20 内；3–4 年级 +−×；5–6 年级 +−×÷），60 秒计时，实时计分 + 连击（连对 3 题额外加分），结束结算并经 `addPoints` 发积分、撒花庆祝。
- **听写跟读** `DictationGame`：复用 TTS `speak()` 朗读语/英知识点，可重听、可看答案。**诚实边界**：不评分、不造假，仅陪练（设备不支持语音时友好降级）。
- 全部模式复用 `useFun`（庆祝/音效）、`actions.addPoints` / `toggleFavorite`，移动端可触。

**集成点**：`speech.js` 的 `speak/cancelSpeech/speechSupported`；`getGradeLearning`；不新增状态字段。

---

## 三、N6 · 全站年级分层入口 + 分龄护栏

**改动**：新增 `src/components/sections/GradeSwitcher.jsx`（+css），接入 `SubjectPage`。

- `GradeSwitcher`：1–6 年级分段控件，**常驻学科页内**（不放全局顶栏，避免低龄误触）；仅派发 `SET_GRADE`。
- `SET_GRADE` 经 `parentReducer` 返回 `{...state, grade}`，**不清除任何学习数据**（错题 / 掌握度按年级独立保留，符合 `quizByGrade` 设计）。
- 切换后练习题库已按 `state.grade` 过滤（`ExerciseEngine` → `getQuiz(subjectId, state.grade)`），全站内容随之联动。
- **英语分龄口径**：`subject==='english'` 时显示该年级 `english.note`（落实「一/二年级预备级听说启蒙，三年级起国家统一起始年级」的合规标注）。

**集成点**：复用 `state.grade` + `actions.setGrade` + `GRADES`；`getGradeLearning(grade).subjects.english.note`。

---

## 四、文件清单

新增：
- `src/data/diagnose.js`
- `src/data/__tests__/diagnose.test.ts`
- `src/components/sections/GradeSwitcher.jsx`
- `src/components/sections/GradeSwitcher.module.css`

修改：
- `src/components/modules/ParentWeeklyReport.jsx` + `.module.css`
- `src/components/modules/GameCenter.jsx` + `.module.css`
- `src/components/pages/SubjectPage.jsx` + `.module.css`
- `docs/BATCH4_IMPLEMENTATION.md`

---

## 五、质量门禁（全绿）

| 门禁 | 结果 |
|---|---|
| `tsc --noEmit` | 0 error |
| `eslint` | 0 error / 0 warning |
| `vitest run` | 43 passed（新增 6 例 diagnose） |
| `vite build` | ✓ built（17 chunks，3.81s） |

---

## 六、边界与遗留

- 诊断报告为派生计算，进入即实时算，不写持久化；打印依赖浏览器弹窗，被拦截自动降级复制。
- 闪卡「不认识」收藏的 key 为 `point:<id>`（kind `text`），在收藏页「前往」指向 /textbook，可能无对应锚点——属温和降级，后续可在收藏页对 `point:` 前缀做专项跳转。
- N6 暂未将 `science` 纳入 `getQuiz`（现有 science 知识点缺 `exercises`，纳入即返回空，价值低且易误导），列为后续内容债。
- 推送：本地已累积未推送 commit `c81608e`(第二批) + `c20dec0`(第三批) + 本批；GitHub token 仅读权限问题未解，需用户在 GitHub 侧授予本库写权限后 `git push origin main`。
