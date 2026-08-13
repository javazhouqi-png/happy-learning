import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { GRADES, getGradeLearning, SUBJECTS } from '../../data/content.js'
import { getTextbook, countTexts, SUBJECT_IDS } from '../../data/textbook.js'
import { TextExercises } from '../modules/LessonTexts.jsx'
import styles from './TextbookPage.module.css'

const subjectMeta = (id) => SUBJECTS.find((s) => s.id === id)

// 单篇课文卡：课文名 + 教材出处 + 课后习题 + 朗读/背诵打卡。
function TextCard({ text, accent, read, recite, onRead, onRecite }) {
  return (
    <article className={styles.textCard} style={{ '--accent': accent }}>
      <div className={styles.textHead}>
        <h4 className={styles.textTitle}>{text.title}</h4>
        {text.ref && <span className={styles.textRef}>{text.ref}</span>}
      </div>
      <TextExercises text={text} accent={accent} />
      <div className={styles.checkRow}>
        <button
          type="button"
          className={`${styles.checkBtn} ${read ? styles.checkOn : ''}`}
          onClick={() => onRead(text.key)}
          aria-pressed={read}
        >
          <Icon name={read ? 'check' : 'book'} size={15} fill={read ? 'currentColor' : 'none'} />
          朗读{read ? '已打卡' : '打卡'}
        </button>
        <button
          type="button"
          className={`${styles.checkBtn} ${styles.recite} ${recite ? styles.checkOn : ''}`}
          onClick={() => onRecite(text.key)}
          aria-pressed={recite}
        >
          <Icon name={recite ? 'check' : 'star'} size={15} fill={recite ? 'currentColor' : 'none'} />
          背诵{recite ? '已打卡' : '打卡'}
        </button>
      </div>
    </article>
  )
}

// 教材同步页：以统编教材为 spine，按「年级 → 学科 → 册 → 单元 → 课文」组织，
// 每篇课文配课后习题与朗读/背诵打卡；并联动年级分层知识点，让教材与知识点真正连通。
export default function TextbookPage() {
  const { state, derived, actions } = useApp()
  const [grade, setGrade] = useState(state.grade || 1)
  const [subId, setSubId] = useState('chinese')
  const [open, setOpen] = useState({})

  const book = getTextbook(grade, subId)
  const meta = subjectMeta(subId)
  const color = meta?.color || 'var(--c-primary)'

  const units = book?.units || []
  const total = countTexts(grade, subId)

  const readCount = useMemo(() => {
    if (!book) return 0
    let n = 0
    book.units.forEach((u) => u.texts.forEach((t) => { if (state.textRead[t.key]) n += 1 }))
    return n
  }, [book, state.textRead])

  const reciteCount = useMemo(() => {
    if (!book) return 0
    let n = 0
    book.units.forEach((u) => u.texts.forEach((t) => { if (state.textRecite[t.key]) n += 1 }))
    return n
  }, [book, state.textRecite])

  // 该年级是否存在任意学科的教材（用于年级 Tab 可用性）。
  const gradeHasBook = (g) => SUBJECT_IDS.some((s) => getTextbook(g, s))
  const firstAvailableGrade = GRADES.find(gradeHasBook) ?? 1

  const toggle = (name) => setOpen((o) => ({ ...o, [name]: !o[name] }))
  const onGrade = (g) => { setGrade(g); setOpen({}) }
  const onSub = (s) => { setSubId(s); setOpen({}) }

  // 知识点速览（来自年级分层学习，连通教材）。
  const gl = getGradeLearning(grade)
  const points = (gl?.subjects?.[subId]?.points) || []

  return (
    <div className={`container ${styles.page}`} style={{ '--accent': color }}>
      <header className={styles.head}>
        <span className={styles.headIcon}><Icon name="book" size={30} fill="currentColor" /></span>
        <div>
          <h1 className={styles.headTitle}>教材同步</h1>
          <p className={styles.headSub}>跟着统编教材学：选课文、做课后题、朗读背诵打卡，知识点一键回顾。</p>
        </div>
      </header>

      {/* 年级切换 */}
      <div className={styles.grades} role="tablist" aria-label="选择年级">
        {GRADES.map((g) => {
          const ok = gradeHasBook(g)
          return (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={g === grade}
              disabled={!ok}
              className={`${styles.gradeTab} ${g === grade ? styles.gradeTabActive : ''} ${ok ? '' : styles.gradeTabOff}`}
              onClick={() => ok && onGrade(g)}
            >
              {g} 年级
            </button>
          )
        })}
      </div>

      {/* 学科子标签 */}
      <div className={styles.subTabs}>
        {SUBJECT_IDS.map((sid) => {
          const m = subjectMeta(sid)
          const c = m?.color || 'var(--c-gamify)'
          return (
            <button
              key={sid}
              type="button"
              className={`${styles.subTab} ${sid === subId ? styles.subTabActive : ''}`}
              style={{ '--accent': c }}
              onClick={() => onSub(sid)}
            >
              {m?.name || sid}
              {typeof derived.mastery[sid] === 'number' && (
                <span className={styles.subMastery}>{derived.mastery[sid]}%</span>
              )}
            </button>
          )
        })}
      </div>

      {!book ? (
        <div className={styles.empty}>
          <Icon name="book" size={40} className={styles.emptyIcon} />
          <p>该年级教材正在同步整理中～</p>
          <button type="button" className={styles.emptyBtn} onClick={() => onGrade(firstAvailableGrade)}>
            先看看 {firstAvailableGrade} 年级上册
          </button>
        </div>
      ) : (
        <>
          {/* 册头 + 打卡总进度 */}
          <div className={styles.volume}>
            <span className={styles.volumeTag}>{book.volume}</span>
            <span className={styles.volumeMeta}>共 {units.length} 个单元 · {total} 篇课文</span>
          </div>

          <div className={styles.progressGrid}>
            <div className={styles.progCell}>
              <div className={styles.progTop}>
                <span>朗读打卡</span>
                <span className={styles.progNum}>{readCount}/{total}</span>
              </div>
              <ProgressBar value={total ? Math.round((readCount / total) * 100) : 0} color={color} height={8} />
            </div>
            <div className={styles.progCell}>
              <div className={styles.progTop}>
                <span>背诵打卡</span>
                <span className={styles.progNum}>{reciteCount}/{total}</span>
              </div>
              <ProgressBar value={total ? Math.round((reciteCount / total) * 100) : 0} color="var(--c-english)" height={8} />
            </div>
          </div>

          {/* 单元折叠列表 */}
          <ul className={styles.units}>
            {units.map((u, ui) => {
              const isOpen = open[u.name] ?? ui === 0
              return (
                <li key={u.name} className={`${styles.unit} ${isOpen ? styles.unitOpen : ''}`}>
                  <button type="button" className={styles.unitHead} aria-expanded={isOpen} onClick={() => toggle(u.name)}>
                    <Icon name="book" size={18} className={styles.unitIcon} />
                    <span className={styles.unitName}>{u.name}</span>
                    <span className={styles.unitCount}>{u.texts.length} 篇</span>
                    <Icon name="chevronRight" size={18} className={styles.chevron} />
                  </button>
                  {isOpen && (
                    <div className={styles.unitBody}>
                      {u.texts.map((t) => (
                        <TextCard
                          key={t.key}
                          text={t}
                          accent={color}
                          read={!!state.textRead[t.key]}
                          recite={!!state.textRecite[t.key]}
                          onRead={actions.markTextRead}
                          onRecite={actions.markTextRecite}
                        />
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {/* 知识点速览 → 联动年级分层 */}
          {points.length > 0 && (
            <section className={styles.know}>
              <div className={styles.knowHead}>
                <Icon name="bulb" size={18} className={styles.knowIcon} />
                <h3 className={styles.knowTitle}>本年级知识点速览</h3>
                <Link to="/grade" className={styles.knowLink}>去年级分层详解</Link>
              </div>
              <div className={styles.chips}>
                {points.map((p) => (
                  <span key={p.id} className={styles.chip}>{p.title}</span>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
