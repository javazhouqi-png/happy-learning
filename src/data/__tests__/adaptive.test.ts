import { describe, it, expect } from 'vitest'
import { accuracyOf, selectDifficulty, difficultyLabel, sortByAdaptive } from '../adaptive.js'

describe('自适应难度', () => {
  it('accuracyOf 正确率与空数据处理', () => {
    expect(accuracyOf(8, 10)).toBeCloseTo(0.8)
    expect(accuracyOf(0, 10)).toBe(0)
    expect(accuracyOf(1, 0)).toBeNull()
    expect(accuracyOf(5, undefined)).toBeNull()
  })

  it('selectDifficulty 按正确率分档', () => {
    expect(selectDifficulty(0.9)).toBe(3) // 挑战
    expect(selectDifficulty(0.8)).toBe(3)
    expect(selectDifficulty(0.65)).toBe(2) // 巩固
    expect(selectDifficulty(0.5)).toBe(2)
    expect(selectDifficulty(0.3)).toBe(1) // 基础
    expect(selectDifficulty(null)).toBe(2) // 未练习默认巩固
  })

  it('difficultyLabel 文案', () => {
    expect(difficultyLabel(1)).toBe('基础')
    expect(difficultyLabel(3)).toBe('挑战')
  })

  it('sortByAdaptive 错题优先且其余保序', () => {
    const qs = [
      { id: 'a', q: 'a' },
      { id: 'b', q: 'b' },
      { id: 'c', q: 'c' },
      { id: 'd', q: 'd' },
    ]
    const sorted = sortByAdaptive(qs, { wrongIds: { b: true, d: true } })
    expect(sorted.map((q) => q.id)).toEqual(['b', 'd', 'a', 'c'])
  })
})
