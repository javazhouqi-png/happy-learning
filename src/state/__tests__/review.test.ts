// 复习域 reducer 测试：Leitner 间隔重复阶梯推进 / 答错归零 / 间隔天数。
import { describe, it, expect } from 'vitest'
import { reviewReducer } from '../reducers/review'
import { defaultState } from '../storage'
import { addDays, localDateStr } from '../helpers'

// 构造一个仅 chinese 学科复习槽被覆盖的基线状态。
function withSchedule(box: number, next: string | null) {
  return {
    ...defaultState(),
    reviewSchedule: { ...defaultState().reviewSchedule, chinese: { box, next } },
  }
}

describe('reviewReducer RECORD_REVIEW', () => {
  it('全对推进 Leitner 盒（+1）且间隔天数变化', () => {
    const s0 = withSchedule(0, null)
    const s1 = reviewReducer(s0, {
      type: 'RECORD_REVIEW',
      subjectId: 'chinese',
      allCorrect: true,
    })
    expect(s1.reviewSchedule.chinese.box).toBe(1)
    // box1 对应间隔 3 天（[1,3,7,7]）。
    expect(s1.reviewSchedule.chinese.next).toBe(addDays(localDateStr(), 3))
  })

  it('答错归零到 box0，但 next 仍安排为明天', () => {
    const s0 = withSchedule(2, '2026-01-01')
    const s1 = reviewReducer(s0, {
      type: 'RECORD_REVIEW',
      subjectId: 'chinese',
      allCorrect: false,
    })
    expect(s1.reviewSchedule.chinese.box).toBe(0)
    expect(s1.reviewSchedule.chinese.next).not.toBeNull()
    expect(s1.reviewSchedule.chinese.next).toBe(addDays(localDateStr(), 1))
  })

  it('Leitner 盒封顶为 3，不因连续全对越界', () => {
    const s0 = withSchedule(3, null)
    const s1 = reviewReducer(s0, {
      type: 'RECORD_REVIEW',
      subjectId: 'chinese',
      allCorrect: true,
    })
    expect(s1.reviewSchedule.chinese.box).toBe(3)
    expect(s1.reviewSchedule.chinese.next).toBe(addDays(localDateStr(), 7))
  })
})
