import { useState } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import { GRADES, getGradeLearning, SUBJECTS } from '../../data/content.js'
import styles from './GradeLearning.module.css'

// 取学科展示元信息：优先复用 SUBJECTS 的 name/color/icon；科学等补充学科在 GRADE_LEARNING 内自带。
const subjectMeta = (id) => SUBJECTS.find((s) => s.id === id)

// 单个配套练习（选择题）：本地交互，点选后揭示正误与解析，不写全局状态（定位为“指导练习”）。
function ExerciseItem({ ex, index }) {
  const [picked, setPicked] = useState(null)
  const answered = picked !== null
  const correct = picked === ex.answer
  return (
    <div className={styles.exItem}>
      <p className={styles.exQ}>
        <span className={styles.exNo}>练 {index + 1}</span>
        {ex.q}
      </p>
      <div className={styles.exOptions}>
        {ex.options.map((opt, i) => {
          let cls = styles.exOpt
          if (answered) {
            if (i === ex.answer) cls += ` ${styles.exOptRight}`
            else if (i === picked) cls += ` ${styles.exOptWrong}`
          } else if (i === picked) {
            cls += ` ${styles.exOptPicked}`
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => setPicked(i)}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={`${styles.exFeedback} ${correct ? styles.exOk : styles.exBad}`}>
          <Icon name={correct ? 'check' : 'close'} size={14} />
          {correct ? '答对啦！' : '再想想～'} {ex.explanation}
        </p>
      )}
    </div>
  )
}

// 年级分层学习路径：以“年级”为进度轴、“学科”为内容轴，把每个知识点展开为
// 「解析 / 配套练习 / 常见误区 / 实际应用 / 螺旋衔接」四件套，形成完整学习闭环。
// 全部只读展示 + 轻量练习交互，不写任何业务状态；字段缺失以 || 兜底，绝不崩。
export default function GradeLearning() {
  const { derived } = useApp()
  const [grade, setGrade] = useState(1)
  const [subId, setSubId] = useState('chinese')
  const [open, setOpen] = useState({})

  const data = getGradeLearning(grade)
  const subjectEntries = data ? Object.entries(data.subjects) : []
  const activeSub = data?.subjects[subId] ? subId : subjectEntries[0]?.[0]
  const sub = activeSub ? data.subjects[activeSub] : null

  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }))

  const onGrade = (g) => {
    setGrade(g)
    setSubId('chinese')
    setOpen({})
  }

  return (
    <section className="section" id="grade-learning">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="学习路径 · GRADE PATH"
          eyebrowIcon="book"
          color="var(--c-primary)"
          title="年级分层学习"
          subtitle="按年级组织学习路径，每个知识点都配有解析、配套练习、常见误区与实际应用，帮学生真正学懂、学活。"
        />

        {/* 年级切换 Tab：选中后重置学科与展开状态 */}
        <div className={styles.grades} role="tablist" aria-label="选择年级">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={g === grade}
              className={`${styles.gradeTab} ${g === grade ? styles.gradeTabActive : ''}`}
              onClick={() => onGrade(g)}
            >
              {g} 年级
            </button>
          ))}
        </div>

        {data ? (
          <>
            {/* 学科子标签：语/数/英/科；核心学科显示掌握度 */}
            <div className={styles.subTabs}>
              {subjectEntries.map(([sid, s]) => {
                const meta = subjectMeta(sid)
                const color = meta?.color || s.color || 'var(--c-gamify)'
                const name = meta?.name || s.name || sid
                return (
                  <button
                    key={sid}
                    type="button"
                    className={`${styles.subTab} ${sid === activeSub ? styles.subTabActive : ''}`}
                    style={{ '--accent': color }}
                    onClick={() => {
                      setSubId(sid)
                      setOpen({})
                    }}
                  >
                    {name}
                    {meta && typeof derived.mastery[sid] === 'number' && (
                      <span className={styles.subMastery}>{derived.mastery[sid]}%</span>
                    )}
                  </button>
                )
              })}
            </div>

            {sub && (
              <div className={styles.subjectWrap} style={{ '--accent': subjectMeta(activeSub)?.color || sub.color || 'var(--c-primary)' }}>
                {/* 教材/课标口径说明（如英语预备级）：弱化提示条 */}
                {sub.note && <p className={styles.note}>{sub.note}</p>}

                {/* 学习路径概览：知识点数量 + 标题速览 */}
                <div className={styles.overview}>
                  <span className={styles.ovCount}>本年级「{sub.name || activeSub}」共 {sub.points.length} 个重点知识点</span>
                  <div className={styles.chips}>
                    {sub.points.map((p) => (
                      <span key={p.id} className={styles.chip}>{p.title}</span>
                    ))}
                  </div>
                </div>

                {/* 知识点四段式卡片 */}
                <ul className={styles.list}>
                  {sub.points.map((p, i) => {
                    const key = `${grade}-${activeSub}-${i}`
                    const isOpen = !!open[key]
                    return (
                      <li key={key} className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
                        <button
                          type="button"
                          className={styles.itemHead}
                          aria-expanded={isOpen}
                          onClick={() => toggle(key)}
                        >
                          <Icon name="book" size={18} className={styles.itemIcon} />
                          <span className={styles.itemTitle}>{p.title || '知识点'}</span>
                          <Icon name="chevronRight" size={18} className={styles.chevron} />
                        </button>

                        {isOpen && (
                          <div className={styles.detail}>
                            {/* 1. 知识点解析 */}
                            <div className={styles.block}>
                              <div className={styles.blockHead}>
                                <Icon name="bulb" size={16} className={styles.bulb} />
                                <strong>知识点解析</strong>
                              </div>
                              <p>{p.analysis || '—'}</p>
                            </div>

                            {/* 2. 配套练习 */}
                            <div className={styles.block}>
                              <div className={styles.blockHead}>
                                <Icon name="star" size={16} className={styles.pen} />
                                <strong>配套练习</strong>
                              </div>
                              {(p.exercises || []).map((ex, ei) => (
                                <ExerciseItem key={ei} ex={ex} index={ei} />
                              ))}
                            </div>

                            {/* 3. 常见误区 */}
                            <div className={styles.block}>
                              <div className={styles.blockHead}>
                                <Icon name="shield" size={16} className={styles.warn} />
                                <strong>常见误区</strong>
                              </div>
                              <ul className={styles.misList}>
                                {(p.misconceptions || []).map((m, mi) => (
                                  <li key={mi} className={styles.misItem}>
                                    <span className={styles.misWrong}>✗ {m.wrong}</span>
                                    <span className={styles.misFix}>✓ {m.fix}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* 4. 实际应用 */}
                            <div className={styles.block}>
                              <div className={styles.blockHead}>
                                <Icon name="sparkle" size={16} className={styles.spark} />
                                <strong>实际应用</strong>
                              </div>
                              <ul className={styles.appList}>
                                {(p.applications || []).map((a, ai) => (
                                  <li key={ai}>{a}</li>
                                ))}
                              </ul>
                            </div>

                            {/* 螺旋衔接 */}
                            {p.spiral && (
                              <div className={styles.spiral}>
                                <Icon name="arrowRight" size={15} />
                                <span><strong>螺旋衔接：</strong>{p.spiral}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className={styles.empty}>该年级内容整理中，敬请期待～</p>
        )}
      </div>
    </section>
  )
}
