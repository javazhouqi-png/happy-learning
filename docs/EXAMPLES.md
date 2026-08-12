# 快乐学园 · 组件与状态使用示例

> 面向二次开发 / 接手维护者的实战片段。所有示例均基于现有 `src/` 结构，可直接复制使用。

---

## 1. 读取状态与派生数据

```jsx
import { useApp } from '../state/AppContext.jsx'
import { getSubject, formatStudyTime } from '../data/content.js'

export default function StatBar() {
  const { state, derived, actions } = useApp()
  return (
    <div>
      {/* 等级与积分 */}
      <p>{derived.levelTitle}（Lv.{derived.level}）· {derived.points} 积分</p>
      {/* 各科掌握度（0-100） */}
      <p>数学掌握度 {derived.mastery.math}%</p>
      {/* 今日屏幕时间（已按自然日归零） */}
      <p>今日已学 {formatStudyTime(state.todayStudySec)}，还可学 {derived.dailyRemainingMin} 分钟</p>
    </div>
  )
}
```

要点：
- `state` 是原始数据（如 `state.completedLessons`、`state.videosWatched`）；
- `derived` 是 `useMemo` 算好的结果（等级、徽章、掌握度、今日时长等），**直接用，不要再自己算**；
- 组件一律通过 `actions.*` 改变状态，禁止直接修改 `state`。

---

## 2. 派发动作（积分 / 进度）

```jsx
// 学完课程（幂等：重复点击不会重复加分）
actions.completeLesson('ma-1', 'math', 8)

// 提交答题：correct=答对题数, total=本题量, wrongIds/correctIds 用于维护错题本
actions.answerQuiz('math', 3, 4, {
  wrongIds: ['maq-3'],          // 本轮答错的题目 id
  correctIds: ['maq-1', 'maq-2', 'maq-4'],
})

// 观看视频（幂等）
actions.watchVideo('vid-2', 245, 'math')

// 更新家长设置（浅合并，只传要改的字段）
actions.updateParent({ dailyLimitMin: 45, eyeRest: false })

// 清空某科错题本
actions.clearWrong('math')

// 重置全部进度（危险操作，调用前应二次确认）
actions.reset()
```

---

## 3. 在组件里嵌入答题引擎

`ExerciseEngine` 是数据驱动的，传入 `subjectId` 即可，内部自动读取题库、判分、计积分、维护错题本：

```jsx
import ExerciseEngine from '../ExerciseEngine.jsx'

export default function MathPractice() {
  return <ExerciseEngine subjectId="math" />
}
```

错题本复习是内置能力：某科存在答错记录时，引擎顶部会出现「复习错题 (n)」按钮，进入后只练错过的题，答对即从错题本移除。

---

## 4. 视频卡片 + 弹窗

```jsx
import { useState } from 'react'
import VideoCard from '../ui/VideoCard.jsx'
import VideoModal from '../VideoModal.jsx'
import { VIDEOS } from '../data/content.js'

export default function VideoList() {
  const [active, setActive] = useState(null)
  return (
    <>
      {VIDEOS.map((v) => (
        <VideoCard key={v.id} video={v} watched={false} onPlay={setActive} />
      ))}
      {active && <VideoModal video={active} onClose={() => setActive(null)} />}
    </>
  )
}
```

`VideoModal` 内部用模拟进度条播放，播完自动调用 `actions.watchVideo` 计 +5 分并标记为已看。

---

## 5. 扩展：新增一门学科（纯数据，无需改组件）

只需在 `src/data/content.js` 补齐四处数据，组件与路由会自动适配：

```js
// 1) 学科定义（id 必须唯一且稳定）
export const SUBJECTS = [
  /* ...现有三科... */
  { id: 'science', name: '科学', color: '#2bb3c0', icon: 'sparkle', tagline: '探索 · 实验 · 发现', desc: '从自然现象到小小实验。' },
]

// 2) 课程
export const LESSONS = {
  /* ... */
  science: [
    { id: 'sc-1', title: '水的三态', duration: 7, paragraphs: ['固态、液态、气态……'] },
  ],
}

// 3) 题库（answer 为 options 下标）
export const QUIZZES = {
  /* ... */
  science: [
    { id: 'scq-1', q: '冰是水的什么状态？', options: ['固态', '液态', '气态'], answer: 0, explanation: '冰是固态的水。' },
  ],
}

// 4) 视频（subject 填新学科 id）
export const VIDEOS = [
  /* ... */
  { id: 'vid-7', subject: 'science', title: '彩虹是怎么来的', duration: '3:10', desc: '光的折射小实验。' },
]
```

> 注意：`BADGES` 中“学完某科全部课程”的判定依赖 `LESSONS[subjectId]`，新增学科后如需专属徽章，按同样结构补一项即可。

---

## 6. 无浏览器环境下验证渲染（CI / 调试）

`scripts/ssr-check.mjs` 用 Vite SSR 渲染全部路由，可在没有 headless 浏览器的环境里快速捕获“首屏崩溃”类问题（如把对象当 React 子节点渲染）：

```bash
node scripts/ssr-check.mjs
# 输出示例：
# SSR_OK / length= 42738
# SSR_OK /learn/math length= 8288
# SSR_OK /videos length= 9109
```

如某路由抛错，会打印 `SSR_ERROR:` 与堆栈，定位对应组件即可。

---

## 7. 边界场景速查

| 场景 | 处理方式 |
| --- | --- |
| localStorage 被清空 / 损坏 / 旧版本 | `loadState` 类型兜底 + 回退默认，应用不白屏 |
| 同一课程 / 视频重复点击“完成” | reducer 幂等，不重复计分 |
| 跨天后再学习 | `todayStudySec` 按本地自然日归零，每日上限重新计算 |
| 连续打卡断签 | 昨天活跃 +1，更早则重置为 1 |
| 答题含未答项 | 提交按钮禁用，直到全部作答 |
| 输入的积分/时长为负数或 NaN | `safeInt` 收敛为 0，累加不串味 |
| 复习时把错题答对 | 自动从错题本移除 |
| 家长把每日上限调到很低 | 今日时长条变红并提示“已超过上限” |
