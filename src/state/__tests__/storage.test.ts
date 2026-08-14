// 持久化迁移测试：v1→v2 字段兜底、坏数据回退默认、嵌套数值收敛。
import { describe, it, expect } from 'vitest'
import { migrate, defaultState } from '../storage'

describe('storage.migrate', () => {
  it('v1→v2 缺字段自动补默认，且保留已有进度', () => {
    const s = migrate({ version: 1, points: 100, completedLessons: { 'cn-1': true } })
    expect(s.version).toBe(2)
    expect(s.points).toBe(100)
    expect(s.quizBySubject.chinese).toEqual({ correct: 0, total: 0 })
    expect(s.parent.dailyLimitMin).toBe(30)
    expect(s.completedLessons['cn-1']).toBe(true)
  })

  it('坏数据（null）回退默认 state', () => {
    const s = migrate(null)
    expect(s.version).toBe(2)
    expect(s.points).toBe(0)
    expect(s.history).toEqual([])
  })

  it('坏数据（非对象）回退默认 state', () => {
    const s = migrate('garbage' as unknown as Parameters<typeof migrate>[0])
    expect(s.points).toBe(0)
    expect(s.version).toBe(2)
  })

  it('嵌套数值字段兜底为有限数字（字符串→数字）', () => {
    const s = migrate(
      { quizBySubject: { math: { correct: '5', total: '8' } } } as unknown as Parameters<typeof migrate>[0]
    )
    expect(s.quizBySubject.math).toEqual({ correct: 5, total: 8 })
  })

  it('默认 state 结构完整（含各年级答题进度骨架）', () => {
    const d = defaultState()
    expect(d.version).toBe(2)
    expect(d.quizByGrade[6].english).toEqual({ correct: 0, total: 0 })
    expect(d.reviewSchedule.chinese).toEqual({ box: 0, next: null })
  })
})
