// 状态层纯函数测试：本地日期 / 连签 / 今日时长跨天清零。
import { describe, it, expect } from 'vitest'
import { localDateStr, yesterdayStr, addDays, bumpStreak, addTodayStudy } from '../helpers'
import { defaultState } from '../storage'

describe('helpers 日期工具', () => {
  it('localDateStr 使用本地时区生成 YYYY-MM-DD', () => {
    // 同一“本地时刻”跨午夜也不能被当成 UTC 而错位。
    expect(localDateStr(new Date(2026, 0, 5, 23, 0, 0))).toBe('2026-01-05')
    expect(localDateStr(new Date(2026, 11, 31, 0, 30, 0))).toBe('2026-12-31')
  })

  it('addDays 在本地日期串上正确叠加（跨月/闰年）', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28') // 2026 非闰年
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29') // 2024 闰年
  })
})

describe('helpers bumpStreak', () => {
  it('今天已记→连击不变；昨天→+1；更早→清零为 1', () => {
    const today = localDateStr()
    const yest = yesterdayStr()
    const earlier = addDays(today, -2)

    const sToday = { ...defaultState(), lastActiveDate: today, streakDays: 5 }
    expect(bumpStreak(sToday)).toBe(5)

    const sYest = { ...defaultState(), lastActiveDate: yest, streakDays: 5 }
    expect(bumpStreak(sYest)).toBe(6)

    const sEarly = { ...defaultState(), lastActiveDate: earlier, streakDays: 5 }
    expect(bumpStreak(sEarly)).toBe(1)
  })
})

describe('helpers addTodayStudy', () => {
  it('跨天先清零，同日累加', () => {
    const otherDay = { ...defaultState(), todayDate: '2020-01-01', todayStudySec: 100 }
    const r1 = addTodayStudy(otherDay, 50)
    expect(r1.todayStudySec).toBe(50) // 跨天清零

    const today = localDateStr()
    const sameDay = { ...defaultState(), todayDate: today, todayStudySec: 100 }
    const r2 = addTodayStudy(sameDay, 50)
    expect(r2.todayStudySec).toBe(150)
  })
})
