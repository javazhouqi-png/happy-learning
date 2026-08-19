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

// 填空类习题：选项展示为可点击的小卡片，孩子先选再“检查”，即时反馈对错与解析。
// 由被动“显示答案”升级为「先练后判」，与答题引擎一致的即时反馈体验。
function FillExercise({ ex, accent }) {
  const [picked, setPicked] = useState(null)
  const [checked, setChecked] = useState(false)
  const answered = picked !== null
  const isRight = answered && picked === ex.answer

  const reset = () => {
    setPicked(null)
    setChecked(false)
  }

  return (
    <li className={styles.exRow}>
      <span className={styles.exTag} style={{ background: accent }}>{TYPE_META.fill.label}</span>
      <div className={styles.exBody}>
        <p className={styles.exPrompt}>{ex.prompt}</p>
        <div className={styles.options}>
          {ex.options.map((opt, i) => {
            let cls = styles.optChip
            if (checked && i === ex.answer) cls += ` ${styles.optCorrect}`
            else if (checked && i === picked) cls += ` ${styles.optWrong}`
            else if (i === picked) cls += ` ${styles.optPicked}`
            return (
              <button
                key={i}
                type="button"
                className={cls}
                disabled={checked}
                aria-pressed={i === picked}
                onClick={() => !checked && setPicked(i)}
              >
                {opt}
              </button>
            )
          })}
        </div>
        {checked && (
          <p className={`${styles.exExplain} ${isRight ? styles.exOk : styles.exNo}`}>
            <Icon name={isRight ? 'check' : 'close'} size={14} />
            {isRight ? '答对啦！' : `正确答案：${ex.options[ex.answer]}。`}{ex.explanation}
          </p>
        )}
        <div className={styles.exBtns}>
          {!checked ? (
            <button
              type="button"
              className={styles.revealBtn}
              disabled={!answered}
              onClick={() => setChecked(true)}
            >
              检查
            </button>
          ) : (
            <button type="button" className={styles.revealBtn} onClick={reset}>
              再试一次
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

// 洗牌：把右侧项目随机打乱，保证每次连线起点不同（纯展示，不影响判分逻辑）。
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 连一连：左列固定、右列打乱，孩子点左再点右完成配对，点“检查连线”即时判定每对对错。
// 由“自己连、家长核对”的静态展示升级为可自测、即时反馈的互动连线。
function ConnectExercise({ ex, accent }) {
  const lefts = ex.pairs.map((p) => p.left)
  const rights = useState(() => shuffle(ex.pairs.map((p) => p.right)))[0]
  const [selLeft, setSelLeft] = useState(null)
  const [matches, setMatches] = useState({}) // { [leftIndex]: rightIndex }
  const [checked, setChecked] = useState(false)

  // 每道 left 对应的正确 right 在打乱数组中的位置。
  const correctRightIdx = (li) => rights.indexOf(ex.pairs[li].right)

  const onPickLeft = (li) => {
    if (checked) return
    setSelLeft((cur) => (cur === li ? null : li))
  }
  const onPickRight = (ri) => {
    if (checked || selLeft === null) return
    setMatches((m) => ({ ...m, [selLeft]: ri }))
    setSelLeft(null)
  }
  const reset = () => {
    setSelLeft(null)
    setMatches({})
    setChecked(false)
  }

  const pairOk = (li) => checked && matches[li] !== undefined && matches[li] === correctRightIdx(li)

  return (
    <li className={styles.exRow}>
      <span className={styles.exTag} style={{ background: accent }}>{TYPE_META.connect.label}</span>
      <div className={styles.exBody}>
        <p className={styles.exPrompt}>{ex.prompt}</p>
        <div className={styles.connectCols}>
          <ul className={styles.connectCol}>
            {lefts.map((lv, li) => (
              <li key={li}>
                <button
                  type="button"
                  className={`${styles.cItem} ${selLeft === li ? styles.cItemSel : ''} ${pairOk(li) ? styles.cItemOk : ''} ${checked && matches[li] !== undefined && !pairOk(li) ? styles.cItemNo : ''}`}
                  onClick={() => onPickLeft(li)}
                  disabled={checked}
                >
                  {lv}
                </button>
              </li>
            ))}
          </ul>
          <span className={styles.cArrow}>→</span>
          <ul className={styles.connectCol}>
            {rights.map((rv, ri) => {
              const matchedLeft = Object.keys(matches).find((k) => matches[k] === ri)
              const isOk = checked && matchedLeft !== undefined && pairOk(Number(matchedLeft))
              const isNo = checked && matchedLeft !== undefined && !pairOk(Number(matchedLeft))
              return (
                <li key={ri}>
                  <button
                    type="button"
                    className={`${styles.cItem} ${matchedLeft !== undefined ? styles.cItemMatched : ''} ${isOk ? styles.cItemOk : ''} ${isNo ? styles.cItemNo : ''}`}
                    onClick={() => onPickRight(ri)}
                    disabled={checked || matchedLeft !== undefined}
                  >
                    {rv}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <div className={styles.exBtns}>
          {!checked ? (
            <button
              type="button"
              className={styles.revealBtn}
              disabled={Object.keys(matches).length < lefts.length}
              onClick={() => setChecked(true)}
            >
              检查连线
            </button>
          ) : (
            <button type="button" className={styles.revealBtn} onClick={reset}>
              重新连线
            </button>
          )}
        </div>
        {checked && (
          <p className={`${styles.exExplain} ${Object.keys(matches).length === lefts.length && lefts.every((_, li) => pairOk(li)) ? styles.exOk : styles.exNo}`}>
            <Icon name={lefts.every((_, li) => pairOk(li)) ? 'check' : 'bulb'} size={14} />
            {lefts.every((_, li) => pairOk(li)) ? '全部连对，真棒！' : '对照一下：把意思相关的左右两项连起来就好啦～'}
          </p>
        )}
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
