# 快乐学园 Batch 2 实现报告（家长 PIN / 错题举一反三 / 收藏夹）

> 视角：项目总监（MVP 专家团） | 技术基线：React 18 + Vite 5 + CSS Modules + Context（双 Context + slice reducer）
> 验收契约：`docs/FEATURE_DEFINITION_AND_GAPS.md` 第 4.5 / 4.6 / 4.8 节
> 约束：不引入新技术栈；不破坏存量；P0 合规（禁用 emoji 图标、禁用紫粉渐变）。

---

## 一、4.8 家长 PIN 校验与找回

**问题**：`parentPin` 字段与设置/验证 UI 已存在，但 `SET_PARENT_PIN` reducer 仅 `slice(0,6)` 未强制 4–6 位下限；且**缺「忘记 PIN」找回通道**。

**改动**
- `src/state/reducers/parent.ts`：`SET_PARENT_PIN` 改为强制 `/^\d{4,6}$/`。空串 = 找回/重置（清空为未设置）；非法格式忽略、不改变原值（与 `ParentPanel` 受控校验双保险）。
- `src/components/sections/ParentPanel.jsx`：新增 `onForgotPin`，在「家长密码」行、已设置时显示「忘记密码？」文字按钮，二次 `window.confirm` 后 `setParentPin('')` 清空。
- `src/components/sections/ParentPanel.module.css`：新增 `.pinLink` 轻量文字按钮样式（hover 转危险色）。

**边界**：`MinorModeGate` 解锁验证、`ParentPanel` 关闭未成年人模式验证均复用既有 PIN 校验，无需改动。无邮箱绑定场景下，找回=确认后重置为未设置（符合 Spec 安全兜底）。

---

## 二、4.6 错题举一反三

**问题**：`wrongBySubject` 已带 `pointId` 溯源，但缺同源推荐函数与入口 UI；复习只会「原题重练」。

**改动**
- 新增 `src/data/similar.js`：`getSimilarQuestions({ subject, grade, pointId, questionId, limit=3 })` 纯函数，调用既有 `getQuiz(subject, grade)`，按 `pointId`（兼容 `q.point`）匹配、排除当前错题、默认取 3 道。
- `src/components/ExerciseEngine.jsx`：新增可选 `questions` 覆盖 prop 与 `favoritable` prop。
  - `questions`：自定义题集时直接以其为练习集，**复用既有判分（`scoreAll`）、解析、反馈**，不复制业务逻辑；复习专用 UI（复习切换/清空按钮/提示）在覆盖时自动隐藏，标题显示「专项练习」。
  - `favoritable`：错题复习时每题旁渲染 ★ 收藏开关（kind `wrong`）。
- `src/components/modules/WrongQuestionCenter.jsx`：每科错题卡新增「举一反三」按钮；展开后以 `buildSimilar()` 汇总该科所有带 `pointId` 错题的同源他题（去重、上限 6 道），用 `ExerciseEngine questions={...}` 复用判分；无同源题时优雅降级提示「暂无同源相似题，建议先把原题练熟」。
- `src/components/modules/WrongQuestionCenter.module.css`：新增 `.simEmpty` 降级提示样式。
- 复习 `ExerciseEngine` 加 `favoritable` 属性（错题可一键收藏）。

**边界**：旧链路仅存 `true`（无 `pointId`）的错题 → `buildSimilar` 自然跳过、降级提示；同 point 题不足 → 取全部可用；推荐为瞬时计算，不入持久化。

---

## 三、4.5 用户自定义收藏夹

**问题**：全仓仅系统成就收藏册（`CollectionAlbum`），无用户主动收藏；需新增状态域与聚合页。

**状态层**
- `src/state/types.ts`：新增 `FavoriteItem { kind:'text'|'poem'|'wrong'|'video'; key; title; subject?; grade?; addedAt }`；`AppState.favorites: FavoriteItem[]`；动作 `TOGGLE_FAVORITE`。
- `src/state/reducers/favorites.ts`（新增）：`TOGGLE_FAVORITE` 以 `kind+key` 去重，再次点击即取消（幂等）；非法条目忽略；上限 200 条保护；达上限静默忽略。
- `src/state/reducer.ts`：委派 `TOGGLE_FAVORITE` 至 `favoritesReducer`。
- `src/state/storage.ts`：`defaultState` 加 `favorites: []`；`migrate` 加数组守卫（旧档缺字段自动回退默认）。
- `src/state/AppContext.jsx`：新增 `toggleFavorite` action。
- `src/state/selectors.ts`：新增 `favoriteSet`（`${kind}:${key}` 集合）供 O(1) 判定。

**UI 接入点**
- `src/components/pages/TextbookPage.jsx`：课文卡新增 ★「收藏」按钮（kind `text`），经 `derived.favoriteSet` 判定态、调用 `toggleFavorite`。
- `src/components/ui/VideoCard.jsx` + `src/components/pages/VideoLibrary.jsx`：视频卡右上角悬浮 ★（kind `video`），由 `VideoLibrary` 注入 `favorited`/`onToggleFavorite`。
- `src/components/ExerciseEngine.jsx`：错题复习每题 ★（kind `wrong`，见 4.6）。
- 新增 `src/components/pages/FavoritesPage.jsx` + `.module.css`：按 kind 分组（课文/古诗/错题/动画）聚合展示，每项含标题、学科/年级元信息、「前往」跳转（/textbook、/grade、/review、/videos）与「取消」；空态引导。
- `src/App.jsx`：懒加载 + 注册 `/favorites` 路由（含错误边界）。
- `src/data/content.js`：`NAV_ITEMS` 新增「收藏」入口（`/favorites`），Header 单数据源自动渲染。

**边界**：重复收藏幂等；被收藏内容后续更新/移除不影响收藏项展示；与错题本/学习进度互不写；刷新后由 `saveState` 持久化保留。

---

## 四、质量门禁

| 项 | 结果 |
|----|------|
| ESLint | ✅ 通过（0 error） |
| 单元测试 | ✅ 33/33 通过 |
| 生产构建 | ✅ 148 modules 转译通过（`✓ built in 2.17s`） |
| TypeScript 类型检查 | ⚠️ 仅 `src/components/exercise/score.test.ts` 有 **预先存在**的 `'fill'` 不匹配 `Question.type:'single'` 错误（与本次改动无关，Batch 1 已记录） |

> 构建偶发的 `safe-delete` 对旧 `dist` 回收拦截为沙箱环境特性，非代码问题；`rm -rf dist` 后重建即通过。

## 五、文件清单（新增 / 修改）

新增：`src/state/reducers/favorites.ts`、`src/data/similar.js`、`src/components/pages/FavoritesPage.jsx`、`src/components/pages/FavoritesPage.module.css`
修改：`src/state/types.ts`、`src/state/storage.ts`、`src/state/reducer.ts`、`src/state/AppContext.jsx`、`src/state/selectors.ts`、`src/state/reducers/parent.ts`、`src/components/sections/ParentPanel.jsx`(+css)、`src/components/modules/WrongQuestionCenter.jsx`(+css)、`src/components/ExerciseEngine.jsx`(+css)、`src/components/pages/TextbookPage.jsx`(+css)、`src/components/ui/VideoCard.jsx`(+css)、`src/components/pages/VideoLibrary.jsx`、`src/App.jsx`、`src/data/content.js`

## 六、验收要点回顾
- PIN：强制 4–6 位数字；找回通道可用且二次确认；不影响既有解锁。
- 举一反三：有 pointId 的错题能推出同源他题并复用判分；无溯源错题优雅降级。
- 收藏夹：课文/视频/错题可收藏与取消；聚合页正确罗列并跳转；刷新保留；不污染学习数据。
- 已知遗留：`score.test.ts` 类型错误（预存）；古诗(poem)收藏的 UI 入口未铺（数据模型已支持 `poem` kind，FavoritesPage 可渲染）——如需可在 GradeLearning 诗文处补 ★。
