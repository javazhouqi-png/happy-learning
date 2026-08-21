import { useState } from 'react'
import { getSubject } from '../data/content.js'
import { getQuiz } from '../data/grade.js'
import { useApp } from '../state/AppContext.jsx'
import { useFun } from './fun/FunContext.jsx'
import { pickRandom, PRAISE, ENCOURAGE, CLEAR_ALL } from '../data/fun.js'
import { scoreAll, normalizeQuestion } from './exercise/score'
import { sortByAdaptive, selectDifficulty, accuracyOf, difficultyLabel } from '../data/adaptive.js'
import Icon from './ui/Icon.jsx'
import Button from './ui/Button.jsx'
import styles from './ExerciseEngine.module.css'

// 答题引擎：逐题作答 -> 提交判分 -> 反馈 -> 计入积分与进度。
// 支持「错题本复习」：仅挑出此前答错的题目重练，答对即从错题本移除。
// initialReview：受控属性（默认 false）。错题本复习中心会传 true，直接以“仅错题”模式打开，
// 无需用户再点一次“复习错题”；不传时保持原有行为，向后兼容。
export default function ExerciseEngine({ subjectId, initialReview = false, onComplete, questions: questionOverride, favoritable = false }) {
  const { state, derived, actions } = useApp()
  const { celebrate, sound, setMood } = useFun()
  const subject = getSubject(subjectId)
  // 自定义题集（如「举一反三」）：覆盖默认题库，直接以传入集合练习，复用判分与渲染。
  const hasOverride = Array.isArray(questionOverride) && questionOverride.length > 0
  const baseQuestions = hasOverride ? questionOverride : getQuiz(subjectId, state.grade)
  // 普通模式启用自适应：错题优先排序（不破坏 override / 复习模式语义）。
  const questions = reviewMode
    ? baseQuestions.filter((q) => wrongSet[q.id])
    : !hasOverride
      ? sortByAdaptive(baseQuestions, { wrongIds: wrongSet })
      : baseQuestions

  // answers 以题目 id 为键（而非序号），筛选/重排序时不会错位。
  const [answers, setAnswers] = useState({}) // { [questionId]: optionIndex }
  const [submitted, setSubmitted] = useState(false)
  const [reviewMode, setReviewMode] = useState(!!initialReview)

  // 错题本中的题目集合（用于复习模式筛选）。
  const wrongSet = derived.wrongBySubject[subjectId] || {}
  const wrongCount = derived.wrongCountBySubject[subjectId] || 0

  // 自适应难度档：依据本学科历史正确率（无数据默认巩固）。
  const subjectStat = state.quizBySubject?.[subjectId]
  const difficulty = selectDifficulty(accuracyOf(subjectStat?.correct, subjectStat?.total))

  // 当前展示的题目集：自定义题集 = 直接使用；复习模式 = 仅错题；普通模式 = 全部。
  const activeQuestions = hasOverride
    ? questions
    : reviewMode
      ? questions.filter((q) => wrongSet[q.id])
      : questions

  // 仅保留「数据完整」的题：题库为手写大表，偶发缺选项/缺答案的残缺题不应拖垮整页，
  // 也不计入总分。渲染与判分都基于同一份 validQuestions，避免「显示 N 题但得分 X/M」错位。
  const validQuestions = activeQuestions.filter((q) => normalizeQuestion(q).valid)

  const select = (qid, oi) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qid]: oi }))
  }

  // 在 validQuestions 范围内批量判分，得到本回合对错统计。
  const { correctCount, wrongIds, correctIds } = scoreAll(validQuestions, answers)
  const allAnswered = Object.keys(answers).length >= validQuestions.length && validQuestions.length > 0

  const submit = () => {
    if (submitted || !allAnswered) return
    // 错题本溯源：为每道答错的题记录 4 个来源字段（年级 / 学科 / 知识点 id / 知识点标题），
    // 便于家长周报与错题溯源；知识点信息取自题目自身的 grade/pointId/pointTitle（GRADE_LEARNING 提供）。
    const wrongEntries = validQuestions
      .filter((q) => wrongIds.includes(q.id))
      .map((q) => ({
        id: q.id,
        grade: q.grade ?? state.grade,
        subject: subjectId,
        pointId: q.pointId ?? q.point ?? null,
        pointTitle: q.pointTitle ?? null,
      }))
    actions.answerQuiz(subjectId, correctCount, validQuestions.length, { wrongIds, correctIds, wrongEntries })
    setSubmitted(true)

    // 复习完成上报（可选）：错题复习中心据此推进间隔重复排程。普通练习不传该回调。
    if (typeof onComplete === 'function') {
      onComplete({
        correct: correctCount,
        total: activeQuestions.length,
        allCorrect: correctCount === activeQuestions.length,
      })
    }

    // 趣味反馈：根据本轮对错情况，给出撒花 / 音效 / 吉祥物表情 + 随机幽默文案。
    // 全对给大庆祝，部分对给鼓励，全错给温柔安慰——不打击信心。
    if (correctCount === activeQuestions.length) {
      celebrate({ title: pickRandom(CLEAR_ALL), icon: 'trophy', confetti: true })
      sound('fanfare')
      setMood('cheer', 2200)
    } else if (correctCount > 0) {
      celebrate({ title: pickRandom(PRAISE), icon: 'star' })
      sound('correct')
      setMood('cheer')
    } else {
      celebrate({ title: pickRandom(ENCOURAGE), icon: 'muscle', tone: 'warn' })
      sound('wrong')
      setMood('sad')
    }
  }

  // 切换模式时清空已选与提交态，避免不同题集间的答案串台。
  const toggleReview = () => {
    setAnswers({})
    setSubmitted(false)
    setReviewMode((v) => !v)
  }

  const retry = () => {
    setAnswers({})
    setSubmitted(false)
  }

  // 空态：复习模式但暂无错题（说明已经全对啦）。
  if (reviewMode && activeQuestions.length === 0) {
    return (
      <div className={styles.wrap} style={{ '--accent': subject?.color }}>
        <div className={styles.head}>
          <h3 className={styles.title}>{subject?.name} · 错题复习</h3>
          <button className={styles.linkBtn} onClick={toggleReview}>返回全部题目</button>
        </div>
        <p className={styles.allRight}>
          <Icon name="check" size={18} /> 太棒了，这一科暂时没有错题！
        </p>
      </div>
    )
  }

  return (
    <div className={styles.wrap} style={{ '--accent': subject?.color }}>
      <div className={styles.head}>
        <h3 className={styles.title}>
          {subject?.name} · {hasOverride ? '专项练习' : reviewMode ? '错题复习' : '互动练习'}
        </h3>
        <div className={styles.headTools}>
          {!hasOverride && !reviewMode && (
            <span className={styles.diffBadge} title="根据历史正确率自动调整难度">
              智能 Lv.{difficulty} · {difficultyLabel(difficulty)}
            </span>
          )}
          {!hasOverride && wrongCount > 0 && (
            <button className={styles.reviewBtn} onClick={toggleReview}>
              <Icon name="bulb" size={14} />
              {reviewMode ? '返回全部题目' : `复习错题 (${wrongCount})`}
            </button>
          )}
          {submitted && (
            <span className={styles.score}>
              得分 {correctCount}/{activeQuestions.length}
            </span>
          )}
        </div>
      </div>

      {reviewMode && !hasOverride && (
        <p className={styles.reviewHint}>
          仅练习之前答错的题；全部答对后这些题会移出错题本。
          <button className={styles.clearBtn} onClick={() => actions.clearWrong(subjectId)}>
            清空错题本
          </button>
        </p>
      )}

      <ol className={styles.list}>
        {activeQuestions.map((q, qi) => {
          const favKey = `wrong:${q.id}`
          const favOn = favoritable && derived.favoriteSet.has(favKey)
          const toggleFav = () =>
            actions.toggleFavorite({
              kind: 'wrong',
              key: q.id,
              title: q.q,
              subject: subjectId,
              grade: state.grade,
              addedAt: Date.now(),
            })
          return (
          <li key={q.id} className={styles.q}>
            <p className={styles.qText}>
              <span className={styles.qNum}>{qi + 1}.</span>
              {q.q}
              {favoritable && (
                <button
                  type="button"
                  className={`${styles.favBtn} ${favOn ? styles.favOn : ''}`}
                  onClick={toggleFav}
                  aria-pressed={favOn}
                  title={favOn ? '取消收藏' : '收藏这道题'}
                >
                  <Icon name="star" size={15} style={{ color: favOn ? 'var(--c-warn)' : 'var(--c-ink-3)', opacity: favOn ? 1 : 0.55 }} />
                </button>
              )}
            </p>
            <div className={styles.options}>
              {q.options.map((opt, oi) => {
                const isPicked = answers[q.id] === oi
                const isCorrect = q.answer === oi
                let cls = styles.option
                if (submitted && isCorrect) cls += ` ${styles.right}`
                else if (submitted && isPicked && !isCorrect) cls += ` ${styles.wrong}`
                else if (isPicked) cls += ` ${styles.picked}`
                return (
                  <button
                    key={oi}
                    type="button"
                    className={cls}
                    onClick={() => select(q.id, oi)}
                    disabled={submitted}
                    aria-pressed={isPicked}
                  >
                    <span className={styles.optLabel}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                    {submitted && isCorrect && (
                      <Icon name="check" size={18} className={styles.optIcon} />
                    )}
                    {submitted && isPicked && !isCorrect && (
                      <Icon name="close" size={18} className={styles.optIcon} />
                    )}
                  </button>
                )
              })}
            </div>
            {submitted && (
              <p className={styles.explain}>
                <Icon name="bulb" size={14} /> {q.explanation}
              </p>
            )}
          </li>
          )
        })}
      </ol>

      <div className={styles.actions}>
        {!submitted ? (
          <Button variant="primary" onClick={submit} disabled={!allAnswered}>
            {allAnswered ? '提交答案' : '请答完所有题目'}
          </Button>
        ) : (
          <Button variant="soft" onClick={retry}>
            再练一次
          </Button>
        )}
      </div>
    </div>
  )
}
