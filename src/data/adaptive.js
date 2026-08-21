// 自适应难度：基于历史正确率给出难度档（1 基础 / 2 巩固 / 3 挑战），
// 并对题目做「错题优先」排序，供练习引擎智能组卷。
// 纯函数、零副作用，便于单测；不新增数据表，仅消费既有 getQuiz 题库结构。

// 由正确/总题数算正确率（0~1），无数据时返回 null（表示“尚未练习”）。
export function accuracyOf(correct, total) {
  if (!total || total <= 0) return null
  return correct / total
}

// 由正确率映射到难度档：>=0.8 挑战、>=0.5 巩固、其余基础；无数据默认巩固。
export function selectDifficulty(accuracy) {
  if (accuracy == null || Number.isNaN(accuracy)) return 2
  if (accuracy >= 0.8) return 3
  if (accuracy >= 0.5) return 2
  return 1
}

export function difficultyLabel(level) {
  return { 1: '基础', 2: '巩固', 3: '挑战' }[level] || '巩固'
}

// 错题知识点题优先，其余保持原顺序；返回排序后的题目数组。
// wrongIds 为「题 id -> true」的错题集合（来自 derived.wrongBySubject）。
export function sortByAdaptive(questions, { wrongIds = {} } = {}) {
  const wrong = []
  const rest = []
  for (const q of questions) {
    if (wrongIds[q.id]) wrong.push(q)
    else rest.push(q)
  }
  return [...wrong, ...rest]
}
