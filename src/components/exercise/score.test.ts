// 判分引擎单测：覆盖单选判分、归一化防御、批量统计与边界（残缺题 / 未作答）。
import { describe, it, expect } from 'vitest'
import {
  scoreSingle,
  scoreQuestion,
  normalizeQuestion,
  scoreAll,
  registerScorer,
} from './score'
import type { Question } from './score'

const single = (over: Partial<Question> = {}): Question => ({
  id: 'q1',
  q: '1+1=?',
  options: ['1', '2', '3'],
  answer: 1,
  ...over,
})

describe('scoreSingle', () => {
  it('所选下标 === 答案下标 判对', () => {
    expect(scoreSingle(single(), 1)).toBe(true)
  })
  it('所选下标 !== 答案下标 判错', () => {
    expect(scoreSingle(single(), 0)).toBe(false)
  })
  it('未作答 (undefined) 判错', () => {
    expect(scoreSingle(single(), undefined)).toBe(false)
  })
})

describe('normalizeQuestion', () => {
  it('正常题 valid=true，并补全缺省 type=single', () => {
    const { question, valid } = normalizeQuestion({ id: 'x', q: '?', options: ['a'], answer: 0 })
    expect(valid).toBe(true)
    expect(question.type).toBe('single')
  })
  it('缺 options 时 valid=false', () => {
    expect(normalizeQuestion({ id: 'x', q: '?', answer: 0 }).valid).toBe(false)
  })
  it('options 为空数组时 valid=false', () => {
    expect(normalizeQuestion({ id: 'x', q: '?', options: [], answer: 0 }).valid).toBe(false)
  })
  it('answer 越界（≥ 选项数）时 valid=false', () => {
    expect(normalizeQuestion({ id: 'x', q: '?', options: ['a', 'b'], answer: 2 }).valid).toBe(false)
  })
  it('answer 为负数时 valid=false', () => {
    expect(normalizeQuestion({ id: 'x', q: '?', options: ['a'], answer: -1 }).valid).toBe(false)
  })
  it('answer 非整数时 valid=false', () => {
    expect(normalizeQuestion({ id: 'x', q: '?', options: ['a'], answer: 0.5 }).valid).toBe(false)
  })
})

describe('scoreQuestion 分发', () => {
  it('未知题型判错但不崩溃', () => {
    // 强行塞入未登记题型，验证降级为 false 而非抛错。
    const q = { ...single(), type: 'fill' as Question['type'] }
    expect(scoreQuestion(q, '2')).toBe(false)
  })

  it('注册的扩展题型可被 scoreQuestion 正确判分', () => {
    // 模拟未来新增「填空」题型：答案文本精确匹配。
    registerScorer('fill', (q, a) => String(a).trim() === String((q as Question & { answerText?: string }).answerText))
    const fillQ = { id: 'f1', type: 'fill' as const, q: '填空', options: [], answerText: '北京' }
    expect(scoreQuestion(fillQ, '北京')).toBe(true)
    expect(scoreQuestion(fillQ, '上海')).toBe(false)
  })
})

describe('scoreAll', () => {
  const questions: Question[] = [
    single({ id: 'a', answer: 0 }),
    single({ id: 'b', answer: 1 }),
    single({ id: 'c', answer: 2 }),
  ]

  it('全部答对', () => {
    const s = scoreAll(questions, { a: 0, b: 1, c: 2 })
    expect(s).toEqual({ correctCount: 3, total: 3, wrongIds: [], correctIds: ['a', 'b', 'c'] })
  })

  it('部分答对：未作答视为答错', () => {
    const s = scoreAll(questions, { a: 0 }) // b/c 未答
    expect(s.correctCount).toBe(1)
    expect(s.total).toBe(3)
    expect(s.wrongIds.sort()).toEqual(['b', 'c'])
    expect(s.correctIds).toEqual(['a'])
  })

  it('全部答错', () => {
    const s = scoreAll(questions, { a: 1, b: 0, c: 1 })
    expect(s.correctCount).toBe(0)
    expect(s.wrongIds.sort()).toEqual(['a', 'b', 'c'])
  })

  it('残缺题不计入 total，也不污染对错', () => {
    // 第三题缺 options -> valid=false，应被跳过；total 应为 2。
    const mixed: Question[] = [
      single({ id: 'a', answer: 0 }),
      single({ id: 'b', answer: 1 }),
      { id: 'bad', q: '坏题', options: [], answer: 0 },
    ]
    const s = scoreAll(mixed, { a: 0, b: 1 })
    expect(s.total).toBe(2)
    expect(s.correctCount).toBe(2)
    expect(s.correctIds).toEqual(['a', 'b'])
    expect(s.wrongIds).toEqual([])
  })

  it('空题集返回全 0，不抛错', () => {
    const s = scoreAll([], {})
    expect(s).toEqual({ correctCount: 0, total: 0, wrongIds: [], correctIds: [] })
  })
})
