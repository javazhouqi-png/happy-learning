import { describe, it, expect } from 'vitest'
import { aggregateWeakPoints, buildDiagnosis } from '../diagnose.js'

// 构造最小 state：仅提供诊断所需的 wrongBySubject 与 grade。
function makeState(wrongBySubject, grade = 1) {
  return { grade, wrongBySubject }
}

describe('aggregateWeakPoints', () => {
  it('无错题时返回空数组', () => {
    expect(aggregateWeakPoints(makeState({}))).toEqual([])
  })

  it('按 pointId 聚合错次（同点累加）', () => {
    const state = makeState({
      chinese: {
        q1: { grade: 1, subject: 'chinese', pointId: 'g1-cn-pinyin', pointTitle: '汉语拼音' },
        q2: { grade: 1, subject: 'chinese', pointId: 'g1-cn-pinyin', pointTitle: '汉语拼音' },
        q3: { grade: 1, subject: 'chinese', pointId: 'g1-cn-zi', pointTitle: '识字与写字' },
      },
    })
    const list = aggregateWeakPoints(state)
    const pinyin = list.find((w) => w.pointId === 'g1-cn-pinyin')
    expect(pinyin.wrongCount).toBe(2)
    expect(list[0].wrongCount).toBeGreaterThanOrEqual(list[list.length - 1].wrongCount)
  })

  it('旧链路仅存 true 的错题归入未分类且不报错', () => {
    const list = aggregateWeakPoints(makeState({ chinese: { q1: true } }))
    expect(list).toHaveLength(1)
    expect(list[0].pointTitle).toBe('未分类知识点')
  })
})

describe('buildDiagnosis', () => {
  it('无错题时诚实返回 hasData=false，并补满 3 条通用陪学动作', () => {
    const d = buildDiagnosis(makeState({}))
    expect(d.hasData).toBe(false)
    expect(d.weakPoints).toHaveLength(0)
    expect(d.actions).toHaveLength(3)
  })

  it('真实知识点错题能命中文案并生成派生陪学动作', () => {
    const d = buildDiagnosis(
      makeState({
        chinese: { q1: { grade: 1, subject: 'chinese', pointId: 'g1-cn-pinyin', pointTitle: '汉语拼音' } },
      })
    )
    expect(d.hasData).toBe(true)
    expect(d.weakPoints[0].title).toBe('汉语拼音')
    expect(d.weakPoints[0].scene).toContain('拼音')
    expect(d.actions[0]).toContain('汉语拼音')
  })

  it('薄弱点不超过 3 条', () => {
    const state = makeState({
      chinese: { a: { grade: 1, subject: 'chinese', pointId: 'g1-cn-pinyin', pointTitle: '汉语拼音' } },
      math: { b: { grade: 1, subject: 'math', pointId: 'g1-mt-num', pointTitle: '0–20 数与加减' } },
      english: { c: { grade: 1, subject: 'english', pointId: 'g1-en-letter', pointTitle: '26 个字母认读' } },
      science: { d: { grade: 1, subject: 'chinese', pointId: 'g1-cn-other', pointTitle: '其他' } },
    })
    expect(buildDiagnosis(state).weakPoints.length).toBeLessThanOrEqual(3)
  })
})
