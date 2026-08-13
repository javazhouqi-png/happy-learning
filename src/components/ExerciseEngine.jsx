import { useState } from 'react'
import { getQuiz, getSubject } from '../data/content.js'
import { useApp } from '../state/AppContext.jsx'
import { useFun } from './fun/FunContext.jsx'
import { pickRandom, PRAISE, ENCOURAGE, CLEAR_ALL } from '../data/fun.js'
import Icon from './ui/Icon.jsx'
import Button from './ui/Button.jsx'
import styles from './ExerciseEngine.module.css'

// 答题引擎：逐题作答 -> 提交判分 -> 反馈 -> 计入积分与进度。
// 支持「错题本复习」：仅挑出此前答错的题目重练，答对即从错题本移除。
// initialReview：受控属性（默认 false）。错题本复习中心会传 true，直接以“仅错题”模式打开，
// 无需用户再点一次“复习错题”；不传时保持原有行为，向后兼容。
export default function ExerciseEngine({ subjectId, initialReview = false, onComplete }) {
  const { state, derived, actions } = useApp()
  const { celebrate, sound, setMood } = useFun()
  const subject = getSubject(subjectId)
  const questions = getQuiz(subjectId, state.grade)

  // answers 以题目 id 为键（而非序号），筛选/重排序时不会错位。
  const [answers, setAnswers] = useState({}) // { [questionId]: optionIndex }
  const [submitted, setSubmitted] = useState(false)
  const [reviewMode, setReviewMode] = useState(!!initialReview)

  // 错题本中的题目集合（用于复习模式筛选）。
  const wrongSet = derived.wrongBySubject[subjectId] || {}
  const wrongCount = derived.wrongCountBySubject[subjectId] || 0

  // 当前展示的题目集：复习模式 = 仅错题；普通模式 = 全部。
  const activeQuestions = reviewMode
    ? questions.filter((q) => wrongSet[q.id])
    : questions

  const select = (qid, oi) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qid]: oi }))
  }

  // 在 activeQuestions 范围内统计得分与本回合对错 id。
  const correctCount = activeQuestions.reduce(
    (acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0),
    0
  )
  const allAnswered = Object.keys(answers).length >= activeQuestions.length && activeQuestions.length > 0

  const submit = () => {
    if (submitted || !allAnswered) return
    const wrongIds = activeQuestions
      .filter((q) => answers[q.id] !== q.answer)
      .map((q) => q.id)
    const correctIds = activeQuestions
      .filter((q) => answers[q.id] === q.answer)
      .map((q) => q.id)
    // 错题本溯源：为每道答错的题记录 4 个来源字段（年级 / 学科 / 知识点 id / 知识点标题），
    // 便于家长周报与错题溯源；知识点信息取自题目自身的 grade/pointId/pointTitle（GRADE_LEARNING 提供）。
    const wrongEntries = activeQuestions
      .filter((q) => answers[q.id] !== q.answer)
      .map((q) => ({
        id: q.id,
        grade: q.grade ?? state.grade,
        subject: subjectId,
        pointId: q.pointId ?? q.point ?? null,
        pointTitle: q.pointTitle ?? null,
      }))
    actions.answerQuiz(subjectId, correctCount, activeQuestions.length, { wrongIds, correctIds, wrongEntries })
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
          {subject?.name} · {reviewMode ? '错题复习' : '互动练习'}
        </h3>
        <div className={styles.headTools}>
          {wrongCount > 0 && (
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

      {reviewMode && (
        <p className={styles.reviewHint}>
          仅练习之前答错的题；全部答对后这些题会移出错题本。
          <button className={styles.clearBtn} onClick={() => actions.clearWrong(subjectId)}>
            清空错题本
          </button>
        </p>
      )}

      <ol className={styles.list}>
        {activeQuestions.map((q, qi) => (
          <li key={q.id} className={styles.q}>
            <p className={styles.qText}>
              <span className={styles.qNum}>{qi + 1}.</span>
              {q.q}
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
        ))}
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
