import { describe, it, expect } from 'vitest'
import { buildTermReport } from '../termReport.js'

// 构造最小 state 片段（仅含 buildTermReport 消费的字段），避免依赖完整 AppState。
function makeState(overrides = {}) {
  return {
    points: 0,
    completedLessons: {},
    favorites: [],
    quizBySubject: {
      chinese: { correct: 0, total: 0 },
      math: { correct: 0, total: 0 },
      english: { correct: 0, total: 0 },
      science: { correct: 0, total: 0 },
    },
    wrongBySubject: { chinese: {}, math: {}, english: {}, science: {} },
    ...overrides,
  }
}

describe('学期报告 buildTermReport', () => {
  it('空数据进入安全默认（无崩溃、正确率 0）', () => {
    const r = buildTermReport(makeState())
    expect(r.accuracy).toBe(0)
    expect(r.points).toBe(0)
    expect(r.lessonsDone).toBe(0)
    expect(r.perSubject).toHaveLength(4)
    expect(r.hasWeak).toBe(false)
  })

  it('汇总积分、完成课程、练习正确率', () => {
    const r = buildTermReport(
      makeState({
        points: 120,
        completedLessons: { l1: true, l2: true },
        favorites: [{ kind: 'text', key: 'k' }],
        quizBySubject: {
          chinese: { correct: 8, total: 10 },
          math: { correct: 6, total: 10 },
          english: { correct: 0, total: 0 },
          science: { correct: 0, total: 0 },
        },
      })
    )
    expect(r.points).toBe(120)
    expect(r.lessonsDone).toBe(2)
    expect(r.favorites).toBe(1)
    expect(r.accuracy).toBe(70) // (8+6)/20
    const cn = r.perSubject.find((s) => s.id === 'chinese')
    expect(cn.mastery).toBe(80)
  })

  it('薄弱点聚合纳入 science 错题（来自 diagnose 的 SUBJECT_IDS 现含 science）', () => {
    const r = buildTermReport(
      makeState({
        wrongBySubject: {
          chinese: {},
          math: {},
          english: {},
          science: { 'sc-1': { pointId: 'g1-sc-observe', pointTitle: '观察与分类', grade: 1 } },
        },
      })
    )
    expect(r.hasWeak).toBe(true)
    expect(r.weak[0].subject).toBe('science')
  })
})
