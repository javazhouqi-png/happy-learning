import { useState } from 'react'
import Icon from '../ui/Icon.jsx'
import styles from './LessonTexts.module.css'

// 课后习题类型 → 标签文案与图标（图标均取自 ui/Icon 已支持清单，避免缺图标回退）。
const TYPE_META = {
  read: { label: '朗读', icon: 'book' },
  recite: { label: '背诵', icon: 'star' },
  think: { label: '思考', icon: 'bulb' },
  fill: { label: '填空', icon: 'check' },
  connect: { label: '连一连', icon: 'arrowRight' },
}

// 填空类习题：选项展示为小卡片，点击“显示答案”后高亮正确项并给出解析。
function FillExercise({ ex, accent }) {
  const [show, setShow] = useState(false)
  return (
    <li className={styles.exRow}>
      <span className={styles.exTag} style={{ background: accent }}>{TYPE_META.fill.label}</span>
      <div className={styles.exBody}>
        <p className={styles.exPrompt}>{ex.prompt}</p>
        <div className={styles.options}>
          {ex.options.map((opt, i) => (
            <span
              key={i}
              className={`${styles.optChip} ${show && i === ex.answer ? styles.optCorrect : ''}`}
            >
              {opt}
            </span>
          ))}
        </div>
        {show && (
          <p className={styles.exExplain}>
            <strong>答案：</strong>
            {ex.options[ex.answer]}。{ex.explanation}
          </p>
        )}
        <button type="button" className={styles.revealBtn} onClick={() => setShow((v) => !v)}>
          {show ? '隐藏答案' : '显示答案'}
        </button>
      </div>
    </li>
  )
}

// 连一连：以“左 —— 右”成对呈现，由学习者自行连线（与统编教材“连一连”一致，为动手/动脑活动）。
function ConnectExercise({ ex, accent }) {
  return (
    <li className={styles.exRow}>
      <span className={styles.exTag} style={{ background: accent }}>{TYPE_META.connect.label}</span>
      <div className={styles.exBody}>
        <p className={styles.exPrompt}>{ex.prompt}</p>
        <ul className={styles.pairs}>
          {ex.pairs.map((p, i) => (
            <li key={i} className={styles.pair}>
              <span className={styles.pairItem}>{p.left}</span>
              <span className={styles.pairDash}>——</span>
              <span className={styles.pairItem}>{p.right}</span>
            </li>
          ))}
        </ul>
        <p className={styles.exHint}>自己连一连，再请家长核对～</p>
      </div>
    </li>
  )
}

function ExerciseRow({ ex, accent }) {
  const meta = TYPE_META[ex.type] || TYPE_META.read
  if (ex.type === 'fill') return <FillExercise ex={ex} accent={accent} />
  if (ex.type === 'connect') return <ConnectExercise ex={ex} accent={accent} />
  return (
    <li className={styles.exRow}>
      <span className={styles.exTag} style={{ background: accent }}>
        <Icon name={meta.icon} size={12} fill="currentColor" />
        {meta.label}
      </span>
      <p className={styles.exPrompt}>{ex.prompt}</p>
    </li>
  )
}

// 可复用：渲染一篇课文的课后习题列表（朗读/背诵/思考/填空/连一连）。
// 供 LessonTexts 与教材同步页（TextbookPage）共用，避免重复实现。
export function TextExercises({ text, accent }) {
  const exs = text?.exercises || []
  if (exs.length === 0) return null
  return (
    <ul className={styles.exList}>
      {exs.map((ex, j) => (
        <ExerciseRow key={j} ex={ex} accent={accent} />
      ))}
    </ul>
  )
}

// 课程下的“统编课文篇目 + 课后习题”区块。lesson.texts 为空时整体不渲染，不影响既有课程卡片。
export default function LessonTexts({ lesson, color }) {
  const texts = lesson?.texts
  if (!texts || texts.length === 0) return null
  const accent = color || 'var(--c-chinese)'
  return (
    <div className={styles.wrap} style={{ '--accent': accent }}>
      <h4 className={styles.title}>
        <Icon name="book" size={16} fill="currentColor" />
        课文 · 课后习题
      </h4>
      <div className={styles.texts}>
        {texts.map((t, i) => (
          <div key={i} className={styles.textCard}>
            <div className={styles.textHead}>
              <span className={styles.textTitle}>{t.title}</span>
              {t.ref && <span className={styles.textRef}>{t.ref}</span>}
            </div>
            <TextExercises text={t} accent={accent} />
          </div>
        ))}
      </div>
    </div>
  )
}
