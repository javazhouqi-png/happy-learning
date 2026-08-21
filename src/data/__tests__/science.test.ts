import { describe, it, expect } from 'vitest'
import { getQuiz } from '../grade.js'

// science 学科此前仅在 GRADE_LEARNING 内置了练习题，却未注册到 SUBJECTS，
// 导致学科页/学习中心无法进入、getQuiz('science') 永不被调用。
// 本测试守护：science 作为正式学科，每个年级都能取到带溯源字段的练习题。
describe('science 纳入 getQuiz', () => {
  for (let g = 1; g <= 6; g++) {
    it(`年级 ${g} 的 science 能取到练习题`, () => {
      const q = getQuiz('science', g)
      expect(q.length).toBeGreaterThan(0)
      // 每道 science 题都来自年级分层（带 pointId），可被错题本溯源
      q.forEach((item) => {
        expect(item.pointId).toBeTruthy()
        expect(item.grade).toBe(g)
      })
    })
  }
})
