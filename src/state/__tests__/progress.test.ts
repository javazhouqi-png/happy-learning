// 进度域 reducer 纯逻辑测试：幂等、积分、按年级追踪、奖励兑换边界。
import { describe, it, expect } from 'vitest'
import { progressReducer } from '../reducers/progress'
import { rewardsReducer } from '../reducers/rewards'
import { defaultState } from '../storage'

describe('progressReducer', () => {
  it('COMPLETE_LESSON 幂等：重复完成同一课不重复加分', () => {
    const s0 = defaultState()
    const s1 = progressReducer(s0, {
      type: 'COMPLETE_LESSON',
      lessonId: 'cn-1',
      subjectId: 'chinese',
      durationMin: 8,
    })
    expect(s1.points).toBe(15)
    expect(s1.completedLessons['cn-1']).toBe(true)
    // 重复完成：分数不变且原样返回（引用相等，便于 React 跳过渲染）。
    const s2 = progressReducer(s1, {
      type: 'COMPLETE_LESSON',
      lessonId: 'cn-1',
      subjectId: 'chinese',
      durationMin: 8,
    })
    expect(s2.points).toBe(15)
    expect(s2).toBe(s1)
  })

  it('ANSWER_QUIZ 答对正确积分并更新学科统计', () => {
    const s0 = defaultState()
    const s1 = progressReducer(s0, {
      type: 'ANSWER_QUIZ',
      subjectId: 'math',
      correct: 2,
      total: 3,
    })
    expect(s1.points).toBe(20) // 2 * 10
    expect(s1.quizBySubject.math).toEqual({ correct: 2, total: 3 })
  })

  it('ANSWER_QUIZ 答错不加分但计入总数，并按当前年级独立追踪', () => {
    const s0 = { ...defaultState(), grade: 2 }
    const s1 = progressReducer(s0, {
      type: 'ANSWER_QUIZ',
      subjectId: 'math',
      correct: 0,
      total: 2,
    })
    expect(s1.points).toBe(0)
    expect(s1.quizBySubject.math).toEqual({ correct: 0, total: 2 })
    // 年级分层：当前年级(2)的答题进度被独立记录，互不串台。
    expect(s1.quizByGrade[2].math).toEqual({ correct: 0, total: 2 })
  })
})

describe('rewardsReducer', () => {
  it('ADD_POINTS 正常加分，amount<=0 视为无效、原样返回', () => {
    const s0 = defaultState()
    const s1 = rewardsReducer(s0, { type: 'ADD_POINTS', amount: 50, reason: 'game' })
    expect(s1.points).toBe(50)
    const s2 = rewardsReducer(s1, { type: 'ADD_POINTS', amount: 0, reason: 'game' })
    expect(s2.points).toBe(50)
    const s3 = rewardsReducer(s1, { type: 'ADD_POINTS', amount: -5 })
    expect(s3.points).toBe(50)
  })

  it('REDEEM_REWARD 积分不足 / 已拥有时静默忽略，不误扣', () => {
    // 积分不足：cost=60 但 points=0，不应扣分。
    const poor = defaultState()
    const r1 = rewardsReducer(poor, { type: 'REDEEM_REWARD', id: 'hat-star', cost: 60 })
    expect(r1.points).toBe(0)

    // 积分充足且未拥有：正常扣减并记入已兑换。
    const rich = { ...defaultState(), points: 100, redeemedRewards: [] }
    const r2 = rewardsReducer(rich, { type: 'REDEEM_REWARD', id: 'hat-star', cost: 60 })
    expect(r2.points).toBe(40)
    expect(r2.redeemedRewards).toContain('hat-star')

    // 已拥有：再次兑换不重复扣费。
    const r3 = rewardsReducer(r2, { type: 'REDEEM_REWARD', id: 'hat-star', cost: 60 })
    expect(r3.points).toBe(40)
  })
})
