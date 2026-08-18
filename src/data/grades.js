// 轻量年级常量层。
// 首屏导航（Header）用它渲染全局年级选择器，刻意不引用庞大的 grade.js 年级数据层，
// 以免把 126KB 的年级题库/知识点重新拉回首屏主包（grade.js 仅随「教材/年级」等懒加载页按需加载）。
export const GRADES = [1, 2, 3, 4, 5, 6]

const GRADE_LABELS = {
  1: '一年级',
  2: '二年级',
  3: '三年级',
  4: '四年级',
  5: '五年级',
  6: '六年级',
}

/** 是否为合法年级（1–6 整数）。用于校验存储值与用户选择，非法值交由调用方回退默认。 */
export function isGrade(value) {
  return Number.isInteger(value) && GRADES.includes(value)
}

/** 把任意输入收敛为合法年级：非法 / 缺失 -> fallback（默认 1）。 */
export function clampGrade(value, fallback = 1) {
  return isGrade(value) ? value : fallback
}

/** 年级 -> 中文标签；非法年级回退 '未知年级'，避免 UI 出现 undefined。 */
export function getGradeLabel(grade) {
  return GRADE_LABELS[grade] || '未知年级'
}
