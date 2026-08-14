// 派生状态计算（纯函数）：由 AppState 计算等级、徽章、掌握度、时长等展示数据。
// 从 AppContext 抽离，便于单测与按需 memo；不依赖 React，可在 Node 环境直接调用。
import type { AppState, WrongMap } from './types'
import { BADGES, LESSONS, LEVEL_STEP, levelFromPoints, levelTitle } from '../data/subjects.js'
import { emptySubject } from './helpers'

/**
 * 由当前 state 计算所有派生展示数据。
 * 纯函数：相同输入必得相同输出，无副作用，便于测试与缓存（AppContext 中以 useMemo 包裹）。
 */
export function computeDerived(state: AppState) {
  const totalQuizzes = Object.values(state.quizBySubject).reduce((a, s) => a + s.total, 0)
  const totalCorrect = Object.values(state.quizBySubject).reduce((a, s) => a + s.correct, 0)
  const videosWatchedCount = Object.keys(state.videosWatched).length

  const level = levelFromPoints(state.points)
  const nextLevelPoints = level * LEVEL_STEP
  const levelProgress = state.points % LEVEL_STEP

  const userInfo = {
    points: state.points,
    totalQuizzes,
    totalCorrect,
    videosWatchedCount,
    completedLessons: state.completedLessons,
    videosWatched: state.videosWatched,
    studySeconds: state.studySeconds,
    streakDays: state.streakDays,
  }

  // 徽章：把每个徽章的 check 作用在 userInfo 上，得到解锁状态。BADGES 用幂等判定，
  // 即使重复计分也不会“解锁后又掉回”。
  const badges = BADGES.map((b) => ({ ...b, unlocked: b.check(userInfo) }))
  const unlockedCount = badges.filter((b) => b.unlocked).length

  // 错题本：每科错题数量。
  const wrongCountBySubject: Record<string, number> = {}
  const wrongBySubject: Record<string, WrongMap> = {}
  ;['chinese', 'math', 'english'].forEach((sub: string) => {
    const set = state.wrongBySubject[sub] || {}
    wrongBySubject[sub] = set
    wrongCountBySubject[sub] = Object.keys(set).length
  })

  // 掌握度：课程完成率(60%) + 答题正确率(40%)，四舍五入到整数百分比。
  const mastery: Record<string, number> = {}
  ;['chinese', 'math', 'english'].forEach((sub: string) => {
    const lessons = LESSONS[sub] || []
    const done = lessons.filter((l) => state.completedLessons[l.id]).length
    const q = state.quizBySubject[sub] || emptySubject()
    const quizRate = q.total ? q.correct / q.total : 0
    const lessonRate = lessons.length ? done / lessons.length : 0
    mastery[sub] = Math.round((lessonRate * 0.6 + quizRate * 0.4) * 100)
  })

  // 按年级独立掌握度：仅依据该年级自身的答题正确率（课程非按年级划分，故不混入完成率），
  // 用于「年级分层学习」按年级展示各科的答题进度与掌握情况，互不串台。
  // 遍历 state.quizByGrade 的现有年级键，避免从大体积 data 层引入年级常量污染主包。
  const progressByGrade: Record<number, Record<string, { correct: number; total: number; mastery: number }>> = {}
  Object.keys(state.quizByGrade || {}).forEach((kg: string) => {
    const g = Number(kg)
    progressByGrade[g] = {}
    ;['chinese', 'math', 'english'].forEach((sub: string) => {
      const q = (state.quizByGrade && state.quizByGrade[g] && state.quizByGrade[g][sub]) || emptySubject()
      const rate = q.total ? q.correct / q.total : 0
      progressByGrade[g][sub] = {
        correct: q.correct,
        total: q.total,
        mastery: Math.round(rate * 100),
      }
    })
  })

  // 今日学习时长 / 家长每日上限（分钟）。
  // 未成年人模式下，每日上限强制不超过家长设定的“未成年人上限”（默认 40 分钟），
  // 复用既有每日时长统计与进度条，无需新增状态字段。
  const todayStudyMin = Math.round(state.todayStudySec / 60)
  const minorCap = state.parent.minorMode
    ? Math.min(state.parent.dailyLimitMin, state.parent.minorDailyCapMin || 40)
    : state.parent.dailyLimitMin
  const dailyLimitMin = minorCap
  const dailyRemainingMin = Math.max(0, dailyLimitMin - todayStudyMin)
  const dailyOverLimit = todayStudyMin > dailyLimitMin

  return {
    ...userInfo,
    level,
    levelTitle: levelTitle(level),
    nextLevelPoints,
    levelProgress,
    levelStep: LEVEL_STEP,
    badges,
    unlockedCount,
    mastery,
    progressByGrade,
    wrongBySubject,
    wrongCountBySubject,
    todayStudySec: state.todayStudySec,
    todayStudyMin,
    dailyLimitMin,
    dailyRemainingMin,
    dailyOverLimit,
  }
}
