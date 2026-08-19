// 每日学习任务单生成（纯函数，无副作用）。
// 依据当前学习状态产出「今日三件事」，作为首页留存引擎；跨天由 App 触发重新生成。

/** 本地日期串 YYYY-MM-DD。 */
export function todayStr() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// 统计当前各学科的错题总数（用于决定首条任务是「复习错题」还是「做练习」）。
function countWrong(state) {
  const bySubject = state.wrongBySubject || {}
  return Object.values(bySubject).reduce(
    (n, set) => n + (set && typeof set === 'object' ? Object.keys(set).length : 0),
    0
  )
}

/**
 * 生成当日任务单。三项稳定槽位（id 固定），便于跨渲染持久化勾选：
 *  1) review-wrong / practice —— 有错题则复习，否则做新练习；
 *  2) read-text —— 朗读一篇课文并打卡；
 *  3) watch-video —— 看一个教学视频。
 * 任务内容随状态微调，但 id 不变，保证「今天勾掉就一直是勾掉」。
 */
export function generateDailyTasks(state) {
  const wrong = countWrong(state)
  const items = [
    wrong > 0
      ? { id: 'review-wrong', title: `复习 ${wrong} 道错题，把薄弱点练会`, route: '/review', done: false }
      : { id: 'practice', title: '做 5 道练习题，巩固今天的知识', route: '/learn', done: false },
    { id: 'read-text', title: '朗读一篇课文并打卡', route: '/textbook', done: false },
    { id: 'watch-video', title: '看一个教学视频，听得懂记得牢', route: '/videos', done: false },
  ]
  return { date: todayStr(), items }
}
