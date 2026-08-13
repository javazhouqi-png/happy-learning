# 快乐学园 · 架构改造方案（Phase 1 交付）

作者：高见远（首席架构师） | 范围：前端精品化，不引入后端 | 基线提交：`src` 89 文件 / 10,997 行

---

## 0. 实测基线（改造前）

```
dist/assets/index-*.css   67.26 kB │ gzip:  13.13 kB
dist/assets/index-*.js   318.02 kB │ gzip: 132.94 kB   ← 单一 chunk，无分包
✓ 120 modules transformed
```

| 事实 | 证据 | 影响 |
|---|---|---|
| `content.js` 161,166 B 单文件 | `wc -c src/data/content.js` | 全量进首屏 |
| 其中 `GRADE_LEARNING` 102,845 B（64%） | `content.js:1075-2483` | 仅 `/grade` 一条路由使用 |
| 其中 `GRADE_KNOWLEDGE` 21,208 B（13%） | `content.js:831-1066` | 仅 `/grade`、`GradeKnowledge` 使用 |
| 合计 124 KB 源码 ≈ JS 包 39% | 上两项之和 | **首屏为一条路由付费** |
| 无 lazy / Suspense / ErrorBoundary | `grep -rn "lazy(\|Suspense\|ErrorBoundary" src/` → 0 命中 | 白屏风险 + 首屏臃肿 |

**结论**：性能问题的主因不是渲染，而是**数据层组织**——把 6 个年级的全量教学内容静态打进主包。

---

## 1. 全量 TypeScript 迁移路线

### 原则
- **不做一次性 `find -exec mv` 批量改名**。89 文件同时转换会产生数千条错误，无法收敛。
- **类型先行、叶子优先、严格度棘轮（ratchet）**：每一步都保持可构建、可运行。
- **禁止 `any` 兜底**。临时逃逸只用 `@ts-expect-error`（修好后它自己会报"多余的抑制"，天然自清理）；确实未知用 `unknown` + 收窄。

### Phase A｜基础设施（0.5 天，不动业务代码）

```bash
npm i -D typescript @types/react @types/react-dom
```

`tsconfig.json`：
```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "noEmit": true,
    "allowJs": true,        // JS/TS 混存，逐文件迁移
    "checkJs": false,       // 暂不检查 JS，否则老代码全红
    "strict": false,        // 棘轮起点
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,   // 强制 import type，利于 tree-shaking
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

**必做易漏项** —— `src/vite-env.d.ts`，否则 `*.module.css` 导入无法通过类型检查：
```ts
/// <reference types="vite/client" />
```

`package.json`：
```jsonc
"scripts": {
  "typecheck": "tsc --noEmit",
  "typecheck:watch": "tsc --noEmit --watch"
}
```

### Phase B｜领域类型 + 叶子迁移（2-3 天）

先建 `src/types/domain.ts`（**本次迁移最高价值的一步**）：
```ts
export type SubjectId = 'chinese' | 'math' | 'english';
export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
export type HistoryType = 'lesson' | 'quiz' | 'video' | 'game' | 'reward';

export interface SubjectScore { correct: number; total: number }
export interface HistoryEntry {
  ts: number; type: HistoryType; detail: string;
  points: number; seconds: number;
}
export interface ReviewBox { box: 0 | 1 | 2 | 3; next: string | null }

export interface AppState {
  points: number;
  completedLessons: Record<string, true>;
  quizBySubject: Record<SubjectId, SubjectScore>;
  wrongBySubject: Record<SubjectId, Record<string, true>>;
  videosWatched: Record<string, true>;
  studySeconds: number;
  streakDays: number;
  lastActiveDate: string | null;
  todayDate: string | null;
  todayStudySec: number;
  parent: { dailyLimitMin: number; eyeRest: boolean; sound: boolean };
  history: HistoryEntry[];
  redeemedRewards: string[];
  reviewSchedule: Record<SubjectId, ReviewBox>;
}
```

`AppAction` 判别联合 —— 当前 `reducer(state, action)` 里 `action.lessonId` / `action.patch` 全无约束，是这套代码最大的类型空洞：
```ts
export type AppAction =
  | { type: 'COMPLETE_LESSON'; lessonId: string; subjectId: SubjectId; durationMin: number }
  | { type: 'ANSWER_QUIZ'; subjectId: SubjectId; correct: number; total: number;
      wrongIds?: string[]; correctIds?: string[] }
  | { type: 'WATCH_VIDEO'; videoId: string; durationSec: number; subjectId: SubjectId }
  | { type: 'RECORD_STUDY'; seconds: number }
  | { type: 'UPDATE_PARENT'; patch: Partial<AppState['parent']> }
  | { type: 'CLEAR_WRONG'; subjectId: SubjectId }
  | { type: 'ADD_POINTS'; amount: number; reason?: string }
  | { type: 'REDEEM_REWARD'; id: string; cost: number }
  | { type: 'RECORD_REVIEW'; subjectId: SubjectId; allCorrect: boolean }
  | { type: 'RESET' };
```
配合 `noFallthroughCasesInSwitch` + `default: assertNever(action)`，新增 action 漏处理会在编译期报错。

迁移顺序（依赖倒序，每步跑 `npm run typecheck && npm run build`）：
1. `src/utils/date.js → .ts`、`src/utils/sound.js → .ts`（纯叶子，零依赖）
2. `src/data/*`（拆分见 §3，边拆边转）
3. `src/state/*`（见 §2）
4. `src/components/ui/*`（原子组件，被引用最多）
5. `src/components/sections/*` → `modules/*` → `pages/*`
6. `App.jsx`、`main.jsx` 最后转

组件类型写法（**不用 `React.FC`**，它会隐式带上 `children`）：
```tsx
interface ButtonProps {
  variant?: 'primary' | 'ghost';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}
export default function Button({ variant = 'primary', ...rest }: ButtonProps) { /* ... */ }
```

### Phase C｜严格度棘轮（1 天，逐档开启，每档单独提交）

```
noImplicitAny → strictNullChecks → strictFunctionTypes → strict: true → checkJs: true
```
`strict: true` 达成后移除 `allowJs`，并加 `noUnusedLocals` / `noUnusedParameters` / `noUncheckedIndexedAccess`。
> `noUncheckedIndexedAccess` 对本项目收益特别高：`LESSONS[sub]`、`state.wrongBySubject[subjectId]` 等索引访问遍布代码，开启后强制显式兜底。

### 迁移期防倒退
```jsonc
// eslint.config.mjs 片段：禁止新增 .jsx
{ files: ["**/*.jsx"], rules: { "no-restricted-syntax": ["warn", {
    selector: "Program", message: ".jsx 为迁移遗留，新文件请用 .tsx" }] } }
```

---

## 2. AppContext 拆分（454 行 → 分片）

### 关键判断：按「动作域」拆，不能按「状态子树」拆

`ANSWER_QUIZ` 一次写入 6 个字段（`quizBySubject` / `wrongBySubject` / `points` / `streakDays` / `lastActiveDate` / `history`），横跨学习、游戏化、复习三个域。**若用 Redux 式 `combineReducers` 按子树切割，这个动作会被割裂、必须拆成多个 dispatch，破坏原子性与幂等**。

正确做法：保留**单一 state 对象**，把 reducer 拆成若干 `(state, action) => state` 的域处理器，由 `rootReducer` 用查找表组合。

```
src/state/
├── types.ts            # AppState / AppAction（从 types/domain.ts re-export）
├── storage.ts          # STORAGE_KEY / loadState / saveState / migrate
├── helpers.ts          # bumpStreak / addTodayStudy / pushHistory / safeInt
├── slices/
│   ├── learning.ts     # COMPLETE_LESSON / ANSWER_QUIZ / WATCH_VIDEO / RECORD_STUDY
│   ├── gamify.ts       # ADD_POINTS / REDEEM_REWARD
│   ├── review.ts       # CLEAR_WRONG / RECORD_REVIEW
│   └── parent.ts       # UPDATE_PARENT
├── rootReducer.ts      # 组合 + RESET
├── selectors.ts        # 派生：level / badges / mastery / daily（纯函数，最佳单测目标）
├── actions.ts          # dispatch 包装
├── AppProvider.tsx     # 只装配，≤80 行
└── useApp.ts
```

```ts
// rootReducer.ts
const handlers = { ...learning, ...gamify, ...review, ...parent } as const;
export function rootReducer(state: AppState, action: AppAction): AppState {
  if (action.type === 'RESET') return defaultState();
  const h = handlers[action.type];
  return h ? h(state, action as never) : state;
}
```

### 顺带修掉一次重渲染放大
当前 `value = { state, derived, actions }`，任何状态变化都会让**所有**消费者重渲染。拆成两个 Context，只用 actions 的组件（按钮类）不再随分数变化重渲染：
```tsx
<AppStateContext.Provider value={stateValue}>
  <AppActionsContext.Provider value={actions}>   {/* actions 引用恒定 */}
```
保留 `useApp()` 作为兼容层同时读两个 Context，迁移期不破坏 40+ 处调用点。

---

## 3. content.js 拆分（2,523 行 → 按域 + 按年级）

```
src/data/
├── subjects.ts    # SUBJECTS / SUBJECT_IDS / getSubject      (19-49)
├── lessons.ts     # LESSONS + getLessons                     (58-337)
├── quizzes.ts     # QUIZZES + getQuiz                        (345-660)
├── videos.ts      # VIDEOS + getVideo                        (665-676)
├── badges.ts      # BADGES + SECRET_BADGE（含 check 函数）    (680-747)
├── rewards.ts     # REWARDS + getReward                      (747-756)
├── level.ts       # LEVEL_STEP / levelFromPoints / LEVEL_TITLES / formatStudyTime
├── nav.ts         # NAV_ITEMS / PARENT_TIPS / brand / footerColumns
├── games.ts       # MATCH_WORDS                              (780-790)
├── grade/
│   ├── index.ts             # GRADES + 动态加载器（不静态 re-export 数据！）
│   ├── knowledge/g1..g6.ts  # 拆自 GRADE_KNOWLEDGE  21 KB
│   └── learning/g1..g6.ts   # 拆自 GRADE_LEARNING  103 KB
└── index.ts       # barrel：仅 re-export 同步小数据，保持既有 import 兼容
```

> `BADGES` 含 `check(userInfo)` 函数，**不能**外置为 JSON，保持 `.ts`。

年级数据按需加载 —— 这是拿回 39% 首屏体积的关键：
```ts
// src/data/grade/index.ts
import type { Grade } from '@/types/domain';
const learning = {
  1: () => import('./learning/g1'), 2: () => import('./learning/g2'),
  3: () => import('./learning/g3'), 4: () => import('./learning/g4'),
  5: () => import('./learning/g5'), 6: () => import('./learning/g6'),
} as const;
export const loadGradeLearning = (g: Grade) => learning[g]().then(m => m.default);
```

**⚠️ 最容易让这次重构静默失效的一点**：`src/data/index.ts` 绝不可写 `export * from './grade/learning/g1'`。一旦静态 re-export，Rollup 会把年级数据重新拉回主 chunk，分包白做。CI 里用体积断言守住（见 §6）。

消费侧（`GradeLearning.jsx:63`、`GradeKnowledge.jsx:23`）改为异步 + 骨架态：
```tsx
const [data, setData] = useState<GradeLearning | null>(null);
useEffect(() => { let alive = true;
  loadGradeLearning(grade).then(d => { if (alive) setData(d) });
  return () => { alive = false };   // 防快速切换年级的竞态写入
}, [grade]);
```

---

## 4. 路由懒加载与构建分包

`Home` 保持静态导入（着陆页，懒加载反而多一次往返）；其余 8 条路由全部 lazy：
```tsx
// src/routes.tsx
import { lazy } from 'react';
import Home from './components/pages/Home';          // 首屏，静态
const LearnCenter   = lazy(() => import('./components/pages/LearnCenter'));
const SubjectPage   = lazy(() => import('./components/pages/SubjectPage'));
const ReviewCenter  = lazy(() => import('./components/pages/ReviewCenter'));
const GrowthCenter  = lazy(() => import('./components/pages/GrowthCenter'));
const GradeLearning = lazy(() => import('./components/modules/GradeLearning'));
const PlayCenter    = lazy(() => import('./components/pages/PlayCenter'));
const ParentCenter  = lazy(() => import('./components/pages/ParentCenter'));
const VideoLibrary  = lazy(() => import('./components/pages/VideoLibrary'));
```

`App.tsx` 里每条路由**各自**包 Suspense + ErrorBoundary（而非全局一个），单页失败不拖垮整站：
```tsx
<main>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/grade" element={
      <RouteBoundary><GradeLearning /></RouteBoundary>
    } />
    {/* ... */}
  </Routes>
</main>
```

`vite.config.ts`：
```ts
build: {
  chunkSizeWarningLimit: 250,
  rollupOptions: { output: { manualChunks: {
    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  } } },
},
```
配 `rollup-plugin-visualizer` 出 `dist/stats.html` 做体积回归。

**预期**：主 chunk 318 KB → **约 120-150 KB**；`/grade` 独立 chunk 约 130 KB 按需加载；`react-vendor` 长期缓存，业务改动不再让用户重下 React。

---

## 5. 六处重复代码 —— 单一来源

| # | 重复项 | 现状位置 | 处置 |
|---|---|---|---|
| 1 | `localDateStr` | `AppContext.jsx:57` ↔ `utils/date.js:4`（实现相同） | 删 AppContext 内私有版，改 import |
| 2 | **`addDays` 签名冲突** ⚠️ | `AppContext.jsx:71` `(dateStr,n)=>string` ↔ `utils/date.js:17` `(Date,n)=>Date` | **同名不同型，直接合并会炸运行时**。在 `utils/date.ts` 增 `addDaysStr(dateStr,n): string`，两者并存但命名区分；TS 严格模式可确保调用点不串 |
| 3 | `yesterdayStr` | `AppContext.jsx:64` 私有 | 上提 `utils/date.ts` |
| 4 | `todayStr` | `WrongQuestionCenter.jsx:11` 函数 + `DailyCheckIn.jsx:42` 局部变量 | 统一 `utils/date.ts` 导出 `todayStr()` |
| 5 | `TYPE_ICON` ×3 | `DailyCheckIn.jsx:14`、`ParentWeeklyReport.jsx:10`、`ParentPanel.jsx:8` | 上提 `src/constants/historyIcons.ts`。**顺带修 bug**：`ParentPanel` 版本缺 `game` 键，游戏动态图标错落到 `star` |
| 6 | `SECRET_BADGE` ×2 | `CollectionAlbum.jsx:9`、`AchievementWall.jsx:7` | 上提 `src/data/badges.ts` 导出 |
| 7 | 掌握度口径 | 权重仅在 `AppContext.jsx:393`；`SubjectMastery.jsx:51-52` 另行重算 `lessonRate`/`quizRate` | 统一到 `state/selectors.ts`：导出 `lessonRateOf` / `quizRateOf` / `masteryOf`，两处共用同一口径 |

> 审计所述"掌握度公式重复"需修正：权重 `0.6/0.4` 只有一处；真正重复的是**其输入速率的重算**。类型化后由 selectors 单点提供。

---

## 6. 质量门禁

```bash
npm i -D eslint@^9 @eslint/js typescript-eslint globals \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y \
  eslint-config-prettier prettier husky lint-staged
npx husky init
```

`eslint.config.mjs`（Flat Config）关键片段 —— 其中三条 `no-restricted-syntax` 用于**把 P0 规则做成机器可执行的**：
```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'docs/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': hooks, 'jsx-a11y': a11y },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',      // 本项目有 setInterval/effect，提到 error
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',                    // TS 接管
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],

      // ⛔ P0-1：禁止 emoji 充当功能图标
      'no-restricted-syntax': ['error',
        { selector: 'JSXText[value=/[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}]/u]',
          message: 'P0：禁用 emoji 图标，请用 src/components/ui/Icon.tsx 的 SVG 图标' },
        { selector: 'Literal[value=/[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}]/u]',
          message: 'P0：禁用 emoji 图标，请用 Icon 组件（name 已是联合类型，编译期校验）' },
      ],
    },
  },
  prettier,
);
```

`.lintstagedrc.json` —— **pre-commit 不放 `tsc`**（全量类型检查慢，开发者会绕过钩子），类型检查交给 CI：
```json
{
  "*.{ts,tsx,js,jsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
  "*.{json,md,yml,css}": ["prettier --write"]
}
```
`.husky/pre-commit` → `npx lint-staged`

`scripts/check-design-tokens.sh` —— 守 P0-3（硬编码色，混合裁决见 §7.2）与 §3 的分包退化：

```bash
#!/usr/bin/env bash
# 配色门禁（混合裁决，见方案 §7.2）：
#  - 白名单路径（docs/design/illustration-whitelist.json 的 match）整体跳过硬编码色检查
#  - 其余源码文件：仅允许 #fff/#000，其余硬编码色一律失败（功能 UI 必须走 var(--token)）
#  - 令牌字典 src/index.css 本身豁免（它是令牌定义，不是使用）
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"

WHITELIST="docs/design/illustration-whitelist.json"
[[ -f "$WHITELIST" ]] || { echo "✗ 找不到插画白名单：$WHITELIST"; exit 1; }
mapfile -t PATTERNS < <(grep -oE '"src/[^"]+"' "$WHITELIST" | tr -d '"' | sed 's/\\//g')
((${#PATTERNS[@]})) || { echo "✗ 白名单未含任何 src/ 路径模式"; exit 1; }

is_whitelisted() {
  local f="$1" p prefix suffix
  for p in "${PATTERNS[@]}"; do
    if [[ "$p" == *"**"* ]]; then
      prefix="${p%%\*\*}"; suffix="${p##*\*\*}"
      [[ "$f" == "$prefix"* ]] && { [[ -z "$suffix" ]] || [[ "$f" == *"$suffix" ]]; } && return 0
    elif [[ "$p" == *"*"* ]]; then
      [[ "$f" == $p ]] && return 0
    else
      [[ "$f" == "$p" ]] && return 0
    fi
  done
  return 1
}

FAIL=0
while IFS= read -r f; do
  [[ "$f" == "src/index.css" ]] && continue
  is_whitelisted "$f" && continue
  if grep -niE '#[0-9a-fA-F]{3,8}' "$f" | grep -viE '#fff|#ffffff|#000|#000000' | grep -q .; then
    echo "✗ P0 违规：未令牌化硬编码色 in $f"
    grep -niE '#[0-9a-fA-F]{3,8}' "$f" | grep -viE '#fff|#ffffff|#000|#000000'
    FAIL=1
  fi
done < <(find src -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \) ! -path '*/assets/*' 2>/dev/null)

# 分包退化断言：主 chunk 不得超过 180 kB（防年级数据被静态 re-export 拉回主包）
if [[ -d dist/assets ]]; then
  MAIN=$(find dist/assets -name 'index-*.js' -exec wc -c {} + 2>/dev/null | head -1 | awk '{print $1}')
  if [[ -z "$MAIN" || "$MAIN" -ge 184320 ]]; then
    echo "✗ 主 chunk ${MAIN:-?} B 超阈值，年级数据可能被静态 re-export 拉回主包"
    FAIL=1
  fi
fi

[[ $FAIL -eq 0 ]] && { echo "✓ 配色门禁 + 分包断言通过"; exit 0; }
echo "门禁失败：功能 UI 出现未令牌化硬编码色。请改用 src/index.css 的 --c-* 令牌；纯品牌插画请加入白名单。"
exit 1
```

> 注意：本门禁为**前瞻约束**。当前代码 Hero/CollectionAlbum/Gamification/FinalCTA/VideoModal/LessonTexts 仍含非令牌硬编码色，运行会失败——这是预期的，须待 Phase 3 #6「色收敛」执行（按 §7.2 第 1 条收进令牌）后转绿。白名单内的吉祥物/彩带/魔法花园/空状态插画不受此限。

`.github/workflows/ci.yml`：
```yaml
name: CI
on: { pull_request: , push: { branches: [main] } }
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run typecheck          # ← interim 安全网，替代尚未建立的测试
      - run: npm run lint
      - run: npm run format:check
      - run: npm run build
      - run: bash scripts/check-design-tokens.sh
```

### 关于测试的明确立场
用户未选测试为本期重点，故以 **`tsc --noEmit` 作为 interim 安全网**：它能覆盖"字段拼错 / action 漏处理 / 索引访问未兜底"这类本项目最高频的缺陷，但**不能**验证业务规则正确性（如连续打卡跨天、Leitner 间隔推进、积分幂等）。

建议 Phase 2 补 Vitest，按 ROI 排序只测纯函数，约 15 个用例即可覆盖主要业务风险：
1. `state/slices/*`（幂等性、跨天清零、错题增删）
2. `state/selectors.ts`（等级、掌握度、每日上限）
3. `utils/date.ts`（跨月/跨年/夏令时边界、`addDaysStr`）

---

## 7. ErrorBoundary + 全局加载态

`ErrorBoundary` 必须是 class 组件（无 Hook 等价物）。**懒加载后必须配套**——新版本部署会让旧的哈希 chunk 404，这是 lazy 化最常见的生产事故：

```tsx
// src/components/system/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    // 分包 404（部署后旧 chunk 失效）→ 引导刷新，而非展示"出错了"
    const isChunkError = /ChunkLoadError|Loading chunk|dynamically imported module/i
      .test(error.message);
    return <ErrorFallback kind={isChunkError ? 'stale' : 'crash'}
                          onRetry={() => location.reload()} />;
  }
}
```

`RouteBoundary` 把两者合一，并用**保留高度的骨架屏**而非 "Loading…" 文本，避免 CLS：
```tsx
export const RouteBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
  </ErrorBoundary>
);
```
挂载点：`main.tsx` 外层一个（兜全局）+ 每条路由一个（隔离页面）。

### 7.2 插画配色门禁混合裁决（team-lead 2026-08-12 拍板）

纯前端无后端，P0-3「禁止硬编码色」对功能 UI 保持硬约束，但对品牌装饰插画做**限定豁免**，避免误伤艺术资产。三层规则：

1. **易令牌化装饰色先收进令牌**：花园绿 `#4caf50/#66bb6a/#81c784` → `--garden-1/2/3`；Hero 暖色 `#FFB020/#FFE08A` → 新增 `--hero-accent-1/2`；`#e8f1ff/#fff3e9` → 复用 `--surface-warm` / 新增 `--surface-tint`。（注意：`docs/design/icon-spec.md` §4 已建议一组 `--garden-*` 等令牌，其色值与上述 CollectionAlbum 绿不完全一致，色收敛执行时须统一命名，避免同名异色——见 §8 备注。）
2. **纯品牌装饰插画走白名单**：`docs/design/illustration-whitelist.json` 的 `match` 路径（吉祥物 / 庆祝彩带 / 魔法花园 / 通用插画 / 空状态）整体豁免硬编码色检查。
3. **功能 UI 一律 token，零豁免**：按钮/文字/边框/背景/卡片等功能性样式，硬编码色仅允许 `#fff/#000`，其余必须 `var(--token)`。

门禁脚本据此实现：白名单路径跳过硬编码色检查（见 §6 `check-design-tokens.sh` 豁免分支），非白名单文件出现非 `#fff/#000` 硬编码色即失败。

---

## 8. 图标库锁定（P0-1）

**结论：锁定项目自有 `src/components/ui/Icon.tsx`，不引入第三方图标依赖（额外 0 KB）。**

现状已相当好：26 个内联 SVG、`currentColor` 着色、`viewBox="0 0 24 24"`、`aria-hidden="true"`、无 emoji。TS 化时做一处强化，把"图标名写错静默回退成 star"变成编译期错误：
```ts
const paths = { star: (...), book: (...) /* ... */ } as const;
export type IconName = keyof typeof paths;      // ← 联合类型
interface IconProps { name: IconName; size?: number; /* ... */ }
```

需补充的图标（替换现存 emoji）：吉祥物 5 种表情（idle→`mood-calm`/cheer→`mood-happy`/sad→`mood-sad`/dance→`mood-wow`/think→`mood-think`）、游戏化/奖励类（`confetti`/`rocket`/`medal`/`egg`/`muscle`）。**已由设计师 -2 交付 `docs/design/icon-spec.md`（10 图标完整 JSX path + `isFilled` 处理说明），前端并入 `src/components/ui/Icon.jsx` 的 `paths` 即可，无需改组件逻辑。该交付解除了 Phase 2 第 8 项 emoji 清除的前置阻塞。** 图标均为线性描边，不进入 `Icon.jsx` 现有 `isFilled` 名单。

> 备注（色收敛执行提示 / 已定稿）：设计师已交付 `design-tokens.json`（C-extension 组），将 `--garden-1/2/3` 锁定为魔法花园插画色 `#7bdff2/#b8f2c8/#ffd6a5`，并含 `--c-success/--c-warn/--c-danger/--c-accent-amber/--mascot-*/--reward-*/--parent-calm/--hero-accent-1/2`（后者由 designer-2 补入：`#ffb020` 复用 accent-amber、`#ffe08a` 新增浅暖色，与 §7.2 第 1 条 Hero 暖色一致）。因此 §7.2 第 1 条中 **CollectionAlbum 绿 `#4caf50/#66bb6a/#81c784` 不得占用 `--garden-*`**。色收敛（Phase 3 #6）执行时将其改名（建议 `--garden-leaf-1/2/3` 或复用既有 `--c-gamify`），并把 `design-tokens.json` 的全部 `--c-*/--garden-*/--hero-*/--surface-*` 落进 `src/index.css :root`，门禁即从红转绿。同名异色冲突已依 token 字典裁定解除，`--hero-accent` 缺口已闭合，token 字典现可作为 Phase 3 落地完整源。

---

## 9. 技术约束与边界（如实标注，不可对外承诺）

### 纯前端 + localStorage 的硬边界 —— 以下功能**本期不可实现**

| 诉求 | 判定 | 原因 |
|---|---|---|
| 多设备/多端进度同步 | ❌ 不可行 | `localStorage` 按 origin+浏览器隔离，无服务端无从同步 |
| 多用户/多孩子账号 | ⚠️ 仅本地档案切换 | 可在单 key 内存多 profile 并切换，但**不跨设备、无鉴权、无法防冒用** |
| 进度防篡改 | ❌ 不可行 | DevTools 可任意改 `happy-learning-state-v1`，积分/等级/徽章均可伪造 |
| 家长每日时长管控 | ⚠️ 软提示 | `parent.dailyLimitMin` 纯客户端，清缓存或改存储即绕过。**不得宣传为"家长控制"，只能定位为"用眼提醒"** |
| 云端排行榜 / 班级对比 | ❌ 不可行 | 需服务端聚合 |
| 账号找回 / 换机继承 | ⚠️ 仅手动 | 只能靠"导出/导入学习档案 JSON" |

### 数据丢失风险（必须向用户明示）
- **iOS Safari ITP**：7 天内无交互的站点，其 `localStorage` 可能被系统回收 → 学习进度归零。这对"连续打卡 N 天"是致命体验。
- 无痕模式、清理浏览数据、跨浏览器访问均会丢进度。
- 配额约 5 MB；当前 `history` 已限 50 条（`AppContext.jsx:153`）是对的，需保持。

**约束内的缓解措施（建议纳入本期范围）**：
1. `src/state/storage.ts` 增 `exportProfile()` / `importProfile(json)`，家长中心提供"导出学习档案"按钮 —— 这是纯前端下唯一可靠的进度保全手段。
2. 存储版本迁移函数 `migrate(v1 → v2)`，替代现在"升版本号即丢弃旧数据"的做法（拆分 slice 后状态形状会变，不做迁移就是清零所有存量用户）。
3. 家长中心显式声明"进度保存在本机浏览器"。

### 其他技术性事实
- **`VideoModal.jsx` 用 `setInterval` 模拟播放、完成判定为假**（`WATCH_VIDEO` 仍照常加分）—— PM 已将其定为**必须执行项（RICE 16.0，最高，诚信红线）**，见 §11.8：移除伪播放，`VIDEOS` 改为"知识点动画脚本卡 + 官方微课外链（跳转 `basic.smartedu.cn`，不内嵌不转存）"，且不再为"看视频"加分。
- **"课标同步"定位会显著放大数据体量**：现有 6 年级内容已占首屏 39%，若按真实课标铺满，年级数据将成倍增长。§3 的按年级动态加载是该定位能否成立的**前置条件**，不是可选优化。
- **儿童隐私合规**：面向小学生，不建议接入任何第三方行为分析 SDK（《儿童个人信息网络保护规定》）。当前全本地存储反而是合规优势，应保持。

---

## 10. 排期建议（Phase 2 执行序，含依赖）

| 序 | 工作项 | 人日 | 依赖 | 交付验证 |
|---|---|---|---|---|
| 1 | 质量门禁落地（§6）+ tsconfig（§Phase A） | 1 | — | CI 绿 |
| 2 | 六处重复消除（§5）+ `utils/date.ts` | 0.5 | 1 | `typecheck` 通过 |
| 3 | `content.js` 拆分 + 年级动态加载（§3） | 2 | 1 | 主 chunk < 180 KB |
| 4 | 路由懒加载 + 分包（§4） | 0.5 | 3 | `stats.html` 复核 |
| 5 | ErrorBoundary + 骨架屏（§7） | 1 | 4 | 手工断网/改哈希验证 |
| 6 | AppContext 拆 slice + selectors（§2） | 2 | 2 | 行为回归 |
| 7 | 组件层 TS 化 + 严格棘轮（§Phase B/C） | 3 | 6 | `strict: true` 且 0 `any` |
| 8 | 图标补齐、清除 emoji（§8） | 1 | 设计师出图 | 门禁脚本通过 |
| 9 | 存储迁移 + 档案导出（§9） | 1 | 6 | 存量状态不丢 |

合计约 **12 人日**。顺序要点：门禁先行（否则改造过程无回归保护）；`storage.migrate` 必须与第 6 项同批上线，否则存量用户进度清零。

> 注：以上为架构基础改造估算，**未含 PM 内容盘点后追加的模块**（题库接电、档案、本地埋点、视频治理、未成年人模式）。修订后见 §11.10，合计约 **19 人日**。

---

## 11. 内容层数据契约与新增模块（基于 PM 盘点补充，2026-08-12）

PM 对 `content.js` 逐项实测盘点，核心结论：**内容不是少，是好内容被隔离在闭环外**——`GRADE_LEARNING` 的 138 道练习 / 138 条易错点完全不进错题本/掌握度/积分。以下修订 §1 域类型与 §3 数据组织，并新增 4 个模块。完整 PRD 见 `docs/prd-product-research.md`。

### 11.1 修订后的域类型（grade 升一等公民 + 四溯源字段）

```ts
// src/types/domain.ts（修订）
export type SubjectId = 'chinese' | 'math' | 'english';
export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
export type QuizType = 'single' | 'read' | 'recite' | 'think' | 'fill' | 'connect' | 'sort';  // 'sort'=排序；主引擎须全支持（见 §11.12）
export type QuizLevel = '识记' | '理解' | '应用' | '易错辨析';

// 统一题面：QUIZZES / GRADE_LEARNING.exercises / LESSONS[].texts[].exercises 全部归一化到此
export interface QuizItem {
  id: string;            // 确定性生成，见 11.2（必填，非可选）
  grade: Grade;          // 一等公民，必填
  subject: SubjectId;    // 一等公民，必填
  point: string;         // 课标知识点 id（如 g1-cn-pinyin）
  unit?: string;         // 单元（P0 预留空字段；P1 单元诊断卷下沉为 g{年级}/{学科}/{unit}.ts 时回填，见 11.5）
  type: QuizType;
  level: QuizLevel;
  q: string;
  options?: string[];          // single/read/recite/think 选项
  answer: string | string[];   // sort 型用 order 字段
  explanation?: string;
  pairs?: [string, string][];  // connect 题型
  order?: string[];            // sort 题型：正确顺序
}

// 错题记录：四溯源字段随记录持久化（PM 唯一要求 MVP 锁死的数据契约）
export interface WrongEntry {
  grade: Grade;
  subject: SubjectId;
  point: string;
  unit?: string;        // 与 QuizItem 同源，P1 单元诊断无需反查题库
  type: QuizType;
  level: QuizLevel;
  addedAt: number;
}
// AppState.wrongBySubject 由 Record<id, true> 改为 Record<id, WrongEntry>
export type WrongBySubject = Record<SubjectId, Record<string, WrongEntry>>;
```

### 11.2 138 道题确定性 id（P0 第一优先）

- **现状**：题形态 `{q, options, answer, explanation}`，无 `id`；错题本以 `question.id` 记录 → 这批题**物理上无法入错题本**。
- **方案**：一次性归一化脚本注入 `id = \`${pointId}-e${n}\``（如 `g1-cn-pinyin-e1`）。**关键约束：id 必须写成数据本身的稳定字段落盘，绝不能由运行时数组下标推导**——否则在题库中间插入一题，会令老用户错题记录错位指向别题。
- **脚本规则**（写入数据脚本注释 / CONTRIBUTING）：知识点内**只追加不插入**；若必须插入，须为该点重新生成全部 id，并视为一次 schema 升级（触发 §9 的 archive 迁移）。
- **收益**：接电后题库 36 → 174（36 QUIZZES + 43 LESSONS.texts 练习 + 138 GRADE_LEARNING 练习，去重后），**零内容成本**。

### 11.3 主学习流的 grade 维度

- **现状**：`SubjectPage.jsx` 仅 `import { getSubject, getLessons, VIDEOS }`——一年级与六年级看到同一批 9 课 36 题；年级化内容在 `GRADE_LEARNING` 另一条独立入口，两套体系互不通气。
- **类型**：`QuizItem`/`Lesson` 的 `grade` 为必填（非可选）。
- **取数接口**：`getQuiz(grade, subject)` / `getLessons(grade, subject)`——`grade` 来自 profile state（localStorage），**不进 URL 路由参数**（PM 裁决：单用户无分享场景，URL+profile 双真相源会打架，如收藏 `/learn/3/chinese` 后改四年级回到三年级）。
- **单一真相源 = profile**：路由保持学科维度 `/learn/:subjectId`，年级由 profile 提供；刷新/后退从 localStorage 恢复，不受影响。
- **UX 接线（PM 定稿）**：① 首次进入软引导卡选年级（1–6 + "先随便看看"跳过，跳过按一年级呈现，页面常驻"设置年级"入口，不反复弹窗）；② 切换入口两处——学习中心内（"三年级 ▾"）+ 家长空间，**明确不放全局顶栏**（低年级误触最高频区，避免六岁孩子误点"六年级"看到负数/圆柱体积）；③ 切换年级**不清空**错题与掌握度，仅切内容范围（配合 §9 `storage.migrate`）；切换无需家长验证，但置于需一次明确意图的位置。

### 11.4 四溯源字段进错题持久化

`WrongBySubject` 改为 `Record<SubjectId, Record<quizId, WrongEntry>>`（见 11.1）。收益：P1 家长诊断报告可**不反查题库**即按年级/知识点/题型/层级聚合正确率。
⚠️ 这会改变 `AppState` 形状 → **再次强调** `storage.migrate` 必须与 slice 拆分同批上线（§9 / §10 #9），否则存量错题记录全清。

### 11.5 题库加载粒度决策（回答 PM 提问）

**PM 问**：接入 138 题 + 扩到 540 题后，全量首屏是否成瓶颈？切分按年级 / 按年级+学科？

**结论：按 年级 + 学科 两级懒加载（grade+subject），附生成的清单索引；首屏 0 题库字节，540 题安全。**

```ts
// src/data/quiz/loaders.ts（显式 map，类型安全，避免过度碎片化）
const loaders: Record<`${Grade}-${SubjectId}`, () => Promise<{ default: QuizItem[] }>> = {
  '1-chinese': () => import('./g1/chinese'),
  '1-math':    () => import('./g1/math'),
  // ... 共 18 个
};
export const loadQuizChunk = (g: Grade, s: SubjectId) => loaders[`${g}-${s}`]();
```

- **组织**：`src/data/quiz/g{1..6}/{chinese,math,english}.ts`，每文件导出该 (grade,subject) 的 `QuizItem[]`。
- **反查题面**（错题复习/周报）：生成极小清单 `quiz/manifest.ts`（静态引入，仅 `id → {grade,subject}` 映射，千题约数百字节），先定位 chunk 再动态 `import` 取题面；而错题记录的 provenance 已自带，无需依赖清单。
- **容量测算**：540 题 ÷ 18 chunk ≈ 30 题/chunk ≈ 10–15 KB raw（gzip ~4–5 KB）。首屏仅拉 `react-vendor` + 着陆页 + manifest（~1 KB）。**即便扩到 540 题，首屏仍 0 题库字节**，与 §3 预估（主 chunk 120–150 KB）一致且独立于题量增长。
- **给 PM 的内容组织指令**：按 `g{年级}/{学科}.ts` 组织即可，年级+学科已是导航最小单元；若未来细到单元，再加一层 `g{年级}/{学科}/{unit}.ts`，加载器 map 同构扩展，无需改架构。

### 11.6 学习档案导出/导入（RICE 12.0，MVP 内）

- **痛点**：竞品第 5 大差评"崩溃/进度丢失/更新后奖励消失" → 纯前端唯一可靠保全 = 档案 JSON。
- **设计（`src/state/storage.ts`）**：
```ts
interface ArchiveEnvelope {
  schemaVersion: number;            // 必须 ≤ CURRENT；高于则整体拒绝
  exportedAt: number;
  state: AppState;
  events?: AnalyticsEvent[];         // 可选：连同本地埋点一并带出
}
export function exportArchive(): string { /* 序列化 AppState（含 WrongEntry 新结构） */ }
export type ImportResult =
  | { ok: true }
  | { ok: false; reason: 'VERSION_TOO_NEW' | 'PARSE_ERROR' | 'UNKNOWN_SCHEMA' };
export function importArchive(json: string): ImportResult {
  const env = JSON.parse(json);
  if (env.schemaVersion > CURRENT_SCHEMA_VERSION) return { ok: false, reason: 'VERSION_TOO_NEW' };
  const state = env.schemaVersion < CURRENT_SCHEMA_VERSION ? migrate(env.state, env.schemaVersion) : env.state;
  saveState(state); return { ok: true };
}
```
- **拒绝规则（PM 硬要求）**：`env.schemaVersion > CURRENT → 整体拒绝，不做部分导入。**
- 同时解决"换设备软同步"：家长把档案 JSON 发到另一台设备导入即可（非实时、非云端，但诚实可用）。

### 11.7 本地埋点，永不出网（MVP 内）

- **承诺**：纯前端 + 零上传。埋点写 localStorage，仅供家长周报与自查。
- **`src/analytics/logger.ts`**：
```ts
type AnalyticsEvent =
  | { t: number; kind: 'question_answered'; grade: Grade; subject: SubjectId; point: string; qtype: QuizType; qlevel: QuizLevel; correct: boolean }
  | { t: number; kind: 'storage_write_failed' }
  | { t: number; kind: 'import_rejected'; reason: string };
```
  - 环形缓冲，**容量上限 2000 条**，超出 FIFO 淘汰最旧；独立 key `happy-learning-events-v1`，不挤占主进度配额（主配额 ~5 MB；事件 ~200 B/条 → 上限 ~400 KB，留足余量）。
  - **绝不**调用 `fetch` / `navigator.sendBeacon` / `XMLHttpRequest`（门禁补一条外发禁令，见 11.9）。
  - `question_answered` 自带四溯源字段 + correct，直接喂 P1 家长诊断，无需反查题库。

### 11.8 视频治理（RICE 16.0，最高，诚信红线）

- **移除** `VideoModal.jsx` 的 `setInterval` 伪播放与基于伪时长的 `WATCH_VIDEO` 加分。
- **新模型**：
  - `VIDEOS` 从 `{id,subject,title,duration,desc}` 升级为"知识点动画脚本卡"：`{ id, subject, title, scriptSteps: ScriptStep[], officialUrl?: string }`。脚本卡为本地内容（文字/插画 SVG），无媒体源。
  - 官方微课外链：`officialUrl` 指向 `basic.smartedu.cn` 等，**跳转新标签打开，不内嵌 iframe、不转存**。点击即 `window.open`，不追踪、不计分。
  - 原 `WATCH_VIDEO` action 退役；视频区改为"资源库/参考"定位，**不再为"看视频"加分**（避免对点击行为发奖的诚信问题）。
  - **"已查看"标记（PM 定稿）**：仅允许一个无激励的 `viewedVideos` 集合（用于"回到上次看的地方"），且**不计积分、不计学习时长、不进掌握度、不进打卡连续天数、不进家长周报成就项**——点开即算"学过"的标记本质是假数据，会污染诊断报告可信度（诊断可信度是对比免费 AI 的核心资产，不能拿它换一个进度标记）。

### 11.9 未成年人模式（RICE 10.0，MVP 内，合规硬要求）

依据《未成年人网络保护条例》+ 中央网信办《移动互联网未成年人模式建设指南》(2024-11-15) + GB/T 47694—2026。
四条硬规：① 连续使用 30 分钟须休息提醒；② 不满 16 周岁每日建议总时长 1 小时；③ 22:00—6:00 默认不提供服务；④ 退出须家长验证。教育类服务不计入总时长统计，但休息提醒/分龄内容/家长验证门仍应实现。

- **`src/compliance/minor-mode.ts` + `MinorModeGate` 组件**：
  - **连续 30 分钟休息提醒**：基于现有 `studySeconds`/`todayStudySec` 累加 + 会话活跃计时（真实学习事件驱动，非伪计时），到点弹非阻塞提醒（可"稍后"）。
  - **每日建议 1 小时**：`parent.dailyLimitMin` 默认值 30 → 60（不满 16 岁），作为软上限（到点提醒 + 可选锁定，锁定需家长验证）。
  - **22:00—6:00 服务门**：应用启动/路由守卫检查本地时间，落在窗口内则渲染 `MinorModeGate` 锁屏，仅家长验证后可临时放行（记录放行时间）。
  - **家长验证**：本地 PIN（设置于家长中心）。**诚实边界**：纯前端 PIN 非密码学强验证——DevTools/localStorage 可绕过，本质是 UX 提醒而非真安全。对外表述须为"家长验证示意"（PRD 已全文统一 4 处"家长验证门"→"家长验证示意"，并加验收标准专卡"强管控/家长锁/无法绕过"等禁用措辞）；产品定位 = 给孩子一道"这是家长区域"的心理门槛 + 误触保护，非防破解。
  - **分龄内容**：依赖 11.3 的 `grade` 一等公民，按年级过滤/推荐。
- **门禁补强**：在 `scripts/check-design-tokens.sh` 或独立 lint 规则中，禁止埋点模块出现 `fetch`/`sendBeacon`/`XMLHttpRequest`，确保"永不出网"可机器验证。

### 11.10 对 §10 排期的修订

| 序 | 工作项 | 人日 | 依赖 |
|---|---|---|---|
| 10 | 题库归一化脚本（确定性 id 注入）+ `(grade,subject)` 重组（11.1/11.2/11.5） | 1.5 | 1 |
| 11 | 错题记录 provenance 改造 + WrongEntry（11.3/11.4） | 0.5 | 6 |
| 12 | 学习档案导出/导入 + schema 拒绝规则（11.6） | 1 | 9 |
| 13 | 本地埋点 logger + 容量环形（11.7） | 0.5 | 1 |
| 14 | 视频治理：去 setInterval、脚本卡+外链（11.8） | 1 | — |
| 15 | 未成年人模式 gate + 家长 PIN（11.9） | 2 | 13 |
| 16 | 多题型接入主答题引擎（single+read/recite/think/fill/connect+sort 共 7 型调度与渲染）（11.12） | 2 | 10 |

合计由 12 → **约 21 人日**。优先级提示：视频治理(14, RICE 16.0)、合规(15)、**多题型引擎(16)** 为 MVP 硬交付（缺 16 则填空/连线/排序题无处渲染，内容再次卡在闭环外）；题库接电(10) 是零成本增益，建议紧随门禁后做。

### 11.12 多题型接入主答题引擎（PM 抓出的 Gap，MVP 必做）

**问题**：`ExerciseEngine` 目前只认单选的 `q/options/answer/explanation` 渲染契约。而归一化后题库含 7 型——`single` 已支持；`read/recite/think/fill/connect` 在 `LESSONS[].texts[].exercises` 已有契约；`sort` 需新设计。**若不接，540 题里的填空/连线/排序题无处渲染，内容再次卡在闭环外——和 138 题现状同病。**（PM 标注 MVP 内必做）

**方案**：`ExerciseEngine` 改为按 `type` 调度的渲染分发器：
```tsx
// src/components/ExerciseEngine.tsx（修订骨架）
const renderers: Record<QuizType, QuestionRenderer> = {
  single:  SingleChoice,   // 现有，迁移
  read:    ReadAloud,      // 朗读/跟读（无标准答案，标记已完成）
  recite:  Recite,         // 背诵提示
  think:   ShortAnswer,    // 简答/开放题，需家长或自评判分
  fill:    FillBlank,      // 填空
  connect: Connect,        // 连线（用 pairs 字段）
  sort:    SortOrder,      // 排序（用 order 字段，新设计）
};
export default function ExerciseEngine({ item }: { item: QuizItem }) {
  const R = renderers[item.type];
  return <R item={item} onAnswer={/* 回传 {correct, answeredIds} */} />;
}
```
- **评分统一契约**：每个 renderer 产出 `{ correct: boolean, answeredIds: string[] }` 回传给现有 `answerQuiz` action（reducer 不变），沉到 slice 层。
- **开放题（read/recite/think）无自动判分**：用 `answeredIds` 标记"已作答"，正确率计入时按"已作答/未作答"处理，不伪造正确率（诚信）。
- **`sort` 型新契约**：`order: string[]`（正确顺序）+ 渲染端打乱后让用户排序，判分比对 `order`。
- **复用既有 5 型契约**：`LESSONS[].texts[].exercises` 的 `options/answer/explanation/pairs` 直接复用到统一 `QuizItem`，不重新设计。
- **验收**：用 `src/data/quiz/g{年级}/{学科}.ts` 的 6 型样例题各 1 道，跑通主引擎渲染+判分+入错题本闭环。

**工作量**：约 2 人日（见 §11.10 #16）。依赖题库归一化(#10) 提供多型样例。

### 11.11 裁决状态

- ✅ 年级存 profile、不进 URL；UX 接线三要点已落 §11.3（PM 裁决）。
- ✅ 视频"已查看"无激励标记，不污染诊断（PM 定稿，§11.8）。
- ✅ 家长 PIN 对外口径统一为"家长验证示意"（PRD 已改 4 处 + 加验收卡，§11.9）。
- ✅ `unit` 字段已加入 `QuizItem`/`WrongEntry`（P0 预留，§11.1）。
- ✅ 多题型引擎（§11.12）已补入排期 #16。
- ✅ 插画配色门禁混合裁决已定（§7.2）：白名单 `docs/design/illustration-whitelist.json` 路径豁免 + 功能 UI 零豁免；`check-design-tokens.sh` 豁免分支已写入。
- ✅ §8 的 10 个 SVG 图标已交付 `docs/design/icon-spec.md`（designer-2），emoji 清除前置解除。
- 设计师：脚本卡插画若需内联 SVG，配色须走 `--c-*` 令牌（§6/§7.2 门禁）。
