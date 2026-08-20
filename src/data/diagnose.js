// 家长诊断报告：由错题本聚合薄弱知识点，生成「薄弱点 + 陪学动作」的可落地诊断。
// 纯函数、无 React、可在 Node 直接调用与单测；文案复用 GRADE_LEARNING 的 why/scene/core。
import { getGradeLearning, getGradeKnowledge } from './grade.js'

const SUBJECTS = ['chinese', 'math', 'english']

// 由错题本按 pointId（兜底 pointTitle / 未分类）聚合错次，返回降序排列的薄弱点列表。
// 旧链路错题仅存 true（无 pointId）会被归入「未分类知识点」，仍参与计数，不丢失。
export function aggregateWeakPoints(state) {
  const map = new Map()
  SUBJECTS.forEach((sub) => {
    const set = (state.wrongBySubject && state.wrongBySubject[sub]) || {}
    Object.values(set).forEach((entry) => {
      const e = entry && entry !== true ? entry : null
      const pointId = e?.pointId || null
      const key = pointId || `title:${e?.pointTitle || 'unknown'}`
      const cur =
        map.get(key) ||
        {
          pointId,
          pointTitle: e?.pointTitle || '未分类知识点',
          subject: sub,
          grade: e?.grade ?? state.grade,
          wrongCount: 0,
        }
      cur.wrongCount += 1
      map.set(key, cur)
    })
  })
  return Array.from(map.values()).sort((a, b) => b.wrongCount - a.wrongCount)
}

// 取单个薄弱点对应的知识点文案：why/scene 来自 GRADE_KNOWLEDGE（与 GRADE_LEARNING 标题一致），
// analysis/core 来自 GRADE_LEARNING。两源按标题对齐，任一缺失都用空串兜底，绝不编造。
function adviceFor(grade, subject, pointId, pointTitle) {
  const learnPoints = (getGradeLearning(grade)?.subjects?.[subject]?.points) || []
  const knowItems = (getGradeKnowledge(grade)?.subjects?.[subject]?.items) || []
  const lp = learnPoints.find((p) => p.id === pointId) || learnPoints.find((p) => p.title === pointTitle)
  const ki = knowItems.find((p) => p.title === (lp?.title || pointTitle))
  return {
    title: lp?.title || pointTitle,
    why: ki?.why || '',
    scene: ki?.scene || '',
    core: lp?.analysis || ki?.core || '',
  }
}

// 生成诊断报告：Top3 薄弱知识点 + 恰好 3 条陪学动作。
// 薄弱点不足 3 条时，陪学动作用通用建议补足，绝不编造具体知识点。
export function buildDiagnosis(state) {
  const top3 = aggregateWeakPoints(state).slice(0, 3)
  const weakPoints = top3.map((w) => {
    const adv = adviceFor(w.grade, w.subject, w.pointId, w.pointTitle)
    return {
      title: adv ? adv.title : w.pointTitle,
      subject: w.subject,
      grade: w.grade,
      wrongCount: w.wrongCount,
      why: adv ? adv.why : '',
      scene: adv ? adv.scene : '',
      core: adv ? adv.core : '',
    }
  })
  return { weakPoints, actions: buildActions(weakPoints), hasData: weakPoints.length > 0 }
}

// 由薄弱点生成 3 条「今晚 5 分钟陪学动作」：优先来自真实知识点 scene，不足则补通用建议。
function buildActions(weakPoints) {
  const acts = []
  weakPoints.forEach((w) => {
    if (w.scene) acts.push(`今晚用「${w.scene}」的方式，陪孩子再练一次「${w.title}」`)
    else acts.push(`陪孩子复习「${w.title}」，再做 3 道同类练习巩固`)
  })
  const fallback = [
    '选 1 首古诗，和孩子轮流朗读、说说意思，培养语感',
    '用生活场景出 2 道口算题（如分水果、算零钱），轻松练计算',
    '陪孩子翻一翻今天收藏的内容，说说学会了什么',
  ]
  let i = 0
  while (acts.length < 3 && i < fallback.length) {
    acts.push(fallback[i])
    i += 1
  }
  return acts.slice(0, 3)
}
