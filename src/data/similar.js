// 错题举一反三：基于错题的 pointId 溯源，从同知识点下取其他练习题推给儿童强化。
// 纯函数、零副作用，便于单测；不新增数据表，仅消费既有 getQuiz 题库结构。
import { getQuiz } from './grade.js'

/**
 * 取与某道错题同源（同一 pointId）的其他练习题。
 * @param {object} args
 * @param {string} args.subject   学科 id
 * @param {number} args.grade     年级（用于定位该年级题库）
 * @param {string} args.pointId  错题溯源得到的知识点 id（缺则无结果）
 * @param {string} args.questionId 当前错题 id，需排除，避免“又练自己”
 * @param {number} [args.limit=3] 最多返回题数
 * @returns {Array} 同源且非当前的题目数组（不足则取全部可用）
 */
export function getSimilarQuestions({ subject, grade, pointId, questionId, limit = 3 } = {}) {
  if (!pointId || !subject) return []
  const all = getQuiz(subject, grade) || []
  const same = all.filter((q) => (q.pointId ?? q.point) === pointId && q.id !== questionId)
  return limit ? same.slice(0, limit) : same
}
