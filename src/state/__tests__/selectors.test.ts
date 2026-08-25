import { describe, it, expect } from 'vitest'
import { computeDerived } from '../selectors'
import { defaultState } from '../storage'

// 守卫：science 学科化后，派生统计必须包含 science，不能因写死三科而漏算。
describe('computeDerived · science 科目统计', () => {
  it('science 错题计入 wrongCountBySubject', () => {
    const s = defaultState()
    s.wrongBySubject.science = {
      'q-s1': { grade: 2, subject: 'science', pointId: 'p-plant', pointTitle: '植物' },
    }
    const d = computeDerived(s)
    expect(d.wrongCountBySubject.science).toBe(1)
    expect(d.wrongCountBySubject.chinese).toBe(0)
    expect(d.wrongBySubject.science).toBeDefined()
  })

  it('science 掌握度仅来自答题率（无课文完成度，lessonRate 归零）', () => {
    const s = defaultState()
    s.quizBySubject.science = { total: 10, correct: 7 }
    const d = computeDerived(s)
    // 公式：round((0 * 0.6 + (7/10) * 0.4) * 100) = round(28) = 28
    expect(d.mastery.science).toBe(28)
  })

  it('science 进入按年级进度统计', () => {
    const s = defaultState()
    s.quizByGrade[2] = {
      chinese: { total: 0, correct: 0 },
      math: { total: 0, correct: 0 },
      english: { total: 0, correct: 0 },
      science: { total: 4, correct: 3 },
    }
    const d = computeDerived(s)
    expect(d.progressByGrade[2].science.total).toBe(4)
    expect(d.progressByGrade[2].science.correct).toBe(3)
    expect(d.progressByGrade[2].science.mastery).toBe(75)
  })
})
