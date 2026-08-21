// 学期报告：汇总阶段性学习成果，给家长一份可分享的总览。
// 纯函数、只读 state；复用 diagnose 的薄弱点聚合，避免重复造轮子。
import { SUBJECTS } from './content.js'
import { aggregateWeakPoints } from './diagnose.js'

// 由全量状态生成学期报告：积分、完成课程、练习正确率、各科掌握度、薄弱点。
// 所有字段缺失都以 0 / 空兜底，绝不因旧数据缺字段而崩溃。
export function buildTermReport(state) {
  const quizBySubject = state.quizBySubject || {}
  const totalCorrect = SUBJECTS.reduce((a, s) => a + (quizBySubject[s.id]?.correct || 0), 0)
  const totalQuized = SUBJECTS.reduce((a, s) => a + (quizBySubject[s.id]?.total || 0), 0)
  const accuracy = totalQuized > 0 ? Math.round((totalCorrect / totalQuized) * 100) : 0
  const perSubject = SUBJECTS.map((s) => {
    const st = quizBySubject[s.id] || { correct: 0, total: 0 }
    return {
      id: s.id,
      name: s.name,
      correct: st.correct,
      total: st.total,
      mastery: st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0,
    }
  })
  const weak = aggregateWeakPoints(state).slice(0, 5)
  const lessonsDone = Object.keys(state.completedLessons || {}).length
  const favorites = (state.favorites || []).length
  return {
    points: state.points || 0,
    lessonsDone,
    favorites,
    accuracy,
    totalCorrect,
    totalQuized,
    perSubject,
    weak,
    hasWeak: weak.length > 0,
  }
}
