// 每日任务单：reducer 行为 + 生成逻辑。
import { describe, it, expect } from 'vitest'
import { dailyTasksReducer } from '../reducers/dailyTasks'
import { defaultState } from '../storage'
import { generateDailyTasks } from '../../data/dailyTasks.js'

describe('dailyTasksReducer', () => {
  it('SET_DAILY_TASKS 整体替换任务单', () => {
    const s0 = defaultState()
    const tasks = { date: '2026-08-19', items: [{ id: 'a', title: 'x', done: false }] }
    const s1 = dailyTasksReducer(s0, { type: 'SET_DAILY_TASKS', tasks })
    expect(s1.dailyTasks.date).toBe('2026-08-19')
    expect(s1.dailyTasks.items).toHaveLength(1)
  })

  it('TOGGLE_DAILY_TASK 按 id 幂等切换 done', () => {
    const s0 = {
      ...defaultState(),
      dailyTasks: { date: '2026-08-19', items: [{ id: 'a', title: 'x', done: false }, { id: 'b', title: 'y', done: false }] },
    }
    const s1 = dailyTasksReducer(s0, { type: 'TOGGLE_DAILY_TASK', id: 'a' })
    expect(s1.dailyTasks.items[0].done).toBe(true)
    expect(s1.dailyTasks.items[1].done).toBe(false)
    const s2 = dailyTasksReducer(s1, { type: 'TOGGLE_DAILY_TASK', id: 'a' })
    expect(s2.dailyTasks.items[0].done).toBe(false)
    // 不影响其他条目
    expect(s2.dailyTasks.items[1].done).toBe(false)
  })
})

describe('generateDailyTasks', () => {
  it('有错题时首条任务指向复习，否则指向练习', () => {
    const withWrong = { wrongBySubject: { chinese: { q1: { pointId: 'p1' } }, math: {}, english: {} } }
    const items1 = generateDailyTasks(withWrong).items
    expect(items1[0].route).toBe('/review')

    const noWrong = { wrongBySubject: { chinese: {}, math: {}, english: {} } }
    const items2 = generateDailyTasks(noWrong).items
    expect(items2[0].route).toBe('/learn')
  })

  it('始终产出三项且默认未完成；首条按错题情况在复习/练习间切换', () => {
    const { items } = generateDailyTasks({ wrongBySubject: {} })
    expect(items).toHaveLength(3)
    // 后两项槽位固定，首条在有/无错题时为 review-wrong / practice。
    expect(['review-wrong', 'practice']).toContain(items[0].id)
    expect(items[1].id).toBe('read-text')
    expect(items[2].id).toBe('watch-video')
    expect(items.every((i) => i.done === false)).toBe(true)
  })
})
