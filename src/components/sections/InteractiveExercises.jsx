import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import { useApp } from '../../state/AppContext.jsx'
import styles from './InteractiveExercises.module.css'

const features = [
  { icon: 'check', text: '即时反馈，做错也不怕' },
  { icon: 'sparkle', text: '答对即获积分奖励' },
  { icon: 'trophy', text: '每周闯关排行榜' }
]

export default function InteractiveExercises() {
  const { exercise, selectAnswer, checkAnswer, resetExercise } = useApp()
  const { prompt, hint, options, correctLabel, reward, selected, answered, correct } = exercise

  return (
    <section className={`section ${styles.section}`}>
      <div className="container section__inner">
        <SectionHeading
          eyebrow="互动式练习 · INTERACTIVE"
          eyebrowIcon="calculator"
          color="var(--c-math)"
          title="边玩边练，做中学"
          subtitle="每一道题都有即时反馈，答对就能收获积分，学习像闯关一样上瘾。"
        />

        <div className={styles.layout}>
          <ul className={styles.features}>
            {features.map((f) => (
              <li key={f.text} className={styles.feature}>
                <span className={styles.featureIcon}><Icon name={f.icon} size={18} fill="currentColor" /></span>
                {f.text}
              </li>
            ))}
          </ul>

          <div className={styles.quiz}>
            <div className={styles.quizHead}>
              <span className={styles.subjectTag}>数学 · 口算</span>
              <span className={styles.reward}><Icon name="sparkle" size={14} fill="currentColor" />+{reward} 积分</span>
            </div>

            <p className={styles.prompt}>{prompt}</p>
            {hint && <p className={styles.hint}>{hint}</p>}

            <div className={styles.options}>
              {options.map((opt) => {
                const isSelected = selected === opt.label
                const isCorrect = correctLabel === opt.label
                const stateClass = answered
                  ? isCorrect
                    ? styles.right
                    : isSelected
                      ? styles.wrong
                      : ''
                  : isSelected
                    ? styles.active
                    : ''
                return (
                  <button
                    key={opt.label}
                    className={`${styles.option} ${stateClass}`}
                    onClick={() => selectAnswer(opt.label)}
                    disabled={answered}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.optLabel}>{opt.label}</span>
                    <span className={styles.optText}>{opt.text}</span>
                    {answered && isCorrect && <Icon name="check" size={20} strokeWidth={2.4} className={styles.optIcon} />}
                    {answered && isSelected && !isCorrect && <Icon name="close" size={20} strokeWidth={2.4} className={styles.optIcon} />}
                  </button>
                )
              })}
            </div>

            <div className={styles.quizFooter}>
              {!answered ? (
                <Button onClick={checkAnswer} disabled={!selected}>
                  提交答案
                </Button>
              ) : (
                <div className={`${styles.feedback} ${correct ? styles.ok : styles.no}`}>
                  <Icon name={correct ? 'check' : 'close'} size={18} strokeWidth={2.4} />
                  {correct ? `回答正确！获得 +${reward} 积分` : '再想想看～正确答案是 ' + correctLabel}
                  <Button variant="ghost" size="sm" onClick={resetExercise}>再做一次</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
