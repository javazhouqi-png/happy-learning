// 答题判分引擎（R6 插件化题型）。
// 设计为「纯函数 + 与 React 解耦」，便于单测，也便于后续题型扩展：
// 当前题库全为「单选」，故仅内置 single；新增「填空 fill / 连线 match」等题型时，
// 只需补充对应 scorer 并调用 registerScorer 登记，ExerciseEngine 无需改动即自动支持。
//
// 健壮性（边界 / 错误处理）：
// - 题库为手写大表，偶发的缺 options / 缺 answer / answer 越界不应拖垮整页；
// - normalizeQuestion 负责识别「可被判分」的题，调用方据此过滤或跳过，绝不产生 NaN / 越界。

/** 已支持的题型。新增题型在此联合类型补一项即可。 */
export type QuestionType = 'single'

/** 题目结构（与 grade.js 中 quiz 项兼容；多余字段用索引签名兜底，避免类型报错）。 */
export interface Question {
  id: string
  /** 题型，缺省按 'single' 处理（兼容旧数据未标 type 的情况）。 */
  type?: QuestionType
  q: string
  options?: unknown[]
  /** 单选题：正确答案在 options 中的下标。 */
  answer?: number
  explanation?: string
  /** 错题溯源字段（来自 GRADE_LEARNING 合并补全）。 */
  pointId?: string
  pointTitle?: string
  grade?: number
  [key: string]: unknown
}

/** 单题判分结果。 */
export type ScoreResult = boolean

/** 题型 -> 判分器 的注册表（R6 插件化核心）。 */
type Scorer = (question: Question, answer: unknown) => ScoreResult

const REGISTRY: Record<QuestionType, Scorer> = {} as Record<QuestionType, Scorer>

/**
 * 登记某题型的判分器。后续扩展题型时调用，例如：
 *   registerScorer('fill', (q, a) => String(a).trim() === q.answerText)
 * ExerciseEngine 通过 scoreQuestion 按题分发，无需感知具体题型。
 */
export function registerScorer(type: QuestionType, scorer: Scorer): void {
  REGISTRY[type] = scorer
}

/** 单选题判分：用户所选下标 === 正确答案下标。 */
export function scoreSingle(question: Question, answer: unknown): ScoreResult {
  return typeof answer === 'number' && answer === question.answer
}

// 内置题型默认登记（single）。
registerScorer('single', scoreSingle)

/**
 * 归一化题目：补全缺省字段（type 默认 'single'），并判断数据是否「可被判分」。
 * 防御点：
 *  - options 必须是非空数组；
 *  - answer 必须是 0..options.length-1 的整数（否则判分越界或恒错）。
 * 返回 { question, valid }，valid=false 表示数据残缺，调用方应过滤 / 跳过。
 */
export function normalizeQuestion(raw: Question): { question: Question; valid: boolean } {
  const question: Question = { ...raw, type: (raw.type as QuestionType) || 'single' }
  const options = Array.isArray(raw.options) ? raw.options : []
  const answerOk =
    typeof raw.answer === 'number' &&
    Number.isInteger(raw.answer) &&
    raw.answer >= 0 &&
    raw.answer < options.length
  return { question, valid: options.length > 0 && answerOk }
}

/**
 * 按题型分发判分。未知题型一律判错（不崩溃、不计入通过），
 * 由调用方决定是否把该题从题集中剔除。
 */
export function scoreQuestion(question: Question, answer: unknown): ScoreResult {
  const scorer = REGISTRY[(question.type as QuestionType) || 'single']
  return scorer ? scorer(question, answer) : false
}

export interface ScoreSummary {
  /** 答对题数（仅统计 valid 题）。 */
  correctCount: number
  /** 参与计分的题数（仅 valid 题；残缺题不计入，避免「显示 M 题但得分 X/N」错位）。 */
  total: number
  /** 答错（含未作答）的题目 id。 */
  wrongIds: string[]
  /** 答对的题目 id。 */
  correctIds: string[]
}

/**
 * 对「题集 + 作答」批量判分，产出 ExerciseEngine 提交所需的全部统计。
 * - 仅对 valid（数据完整）的题目计分；残缺题被跳过，不计入 total，也不污染对错统计。
 * - answers 以题目 id 为键；未作答 (undefined) 视为答错。
 */
export function scoreAll(
  questions: Question[],
  answers: Record<string, number>
): ScoreSummary {
  let correctCount = 0
  let total = 0
  const wrongIds: string[] = []
  const correctIds: string[] = []
  for (const raw of questions) {
    const { question, valid } = normalizeQuestion(raw)
    if (!valid) continue // 残缺题不计入总分（调用方通常会预先过滤）
    total += 1
    if (scoreQuestion(question, answers[question.id])) {
      correctCount += 1
      correctIds.push(question.id)
    } else {
      wrongIds.push(question.id)
    }
  }
  return { correctCount, total, wrongIds, correctIds }
}
