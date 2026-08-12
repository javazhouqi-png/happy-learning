import { useState } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import { GRADES, getGradeKnowledge, SUBJECTS } from '../../data/content.js'
import styles from './GradeKnowledge.module.css'

// 取学科展示元信息：优先复用 SUBJECTS 的 name/color/icon（与全局学科一致）；
// 科学等补充学科在 GRADE_KNOWLEDGE 内自带 name/color/icon，做到数据自给、互不耦合。
const subjectMeta = (id) => SUBJECTS.find((s) => s.id === id)

// 年级知识清单：把 docs/curriculum-roadmap.md 的知识点以「可浏览清单」形式呈现。
// 设计要点：
// - 年级用 Tab 切换；每个学科一个分区，标题处显示该科「掌握度」（仅对 chinese/math/english 这类已接入 App 的学科）。
// - 每个知识点是一张手风琴卡片：默认只露标题与核心内容，展开后显示「为什么必须掌握」「真实场景用得到」，
//   既保持首页信息密度可控，又完整承载路线图文档的三栏内容。
// - 全部为只读展示，不写任何状态；getGradeKnowledge 缺数据时有空态兜底，字段缺失以 || '' 兜底，绝不崩。
export default function GradeKnowledge() {
  const { derived } = useApp()
  const [grade, setGrade] = useState(1)
  const [open, setOpen] = useState({}) // key -> 是否展开

  const data = getGradeKnowledge(grade)
  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }))

  return (
    <section className="section" id="knowledge">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="学习地图 · ROADMAP"
          eyebrowIcon="bulb"
          color="var(--c-primary)"
          title="年级知识清单"
          subtitle="按年级与学科梳理小学 1–6 年级必须掌握的核心知识点——每一条都说明为什么学、在哪些真实情境用得到。"
        />

        {/* 年级切换 Tab：选中后重置展开状态，避免跨年级残留 */}
        <div className={styles.grades} role="tablist" aria-label="选择年级">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={g === grade}
              className={`${styles.gradeTab} ${g === grade ? styles.gradeTabActive : ''}`}
              onClick={() => {
                setGrade(g)
                setOpen({})
              }}
            >
              {g} 年级
            </button>
          ))}
        </div>

        {data ? (
          <div className={styles.subjects}>
            {Object.entries(data.subjects).map(([sid, sub]) => {
              const meta = subjectMeta(sid)
              const name = meta?.name || sub.name || sid
              const color = meta?.color || sub.color || 'var(--c-gamify)'
              const icon = meta?.icon || sub.icon || 'bulb'
              const mastery = derived.mastery[sid]
              const hasMastery = !!meta && typeof mastery === 'number'
              return (
                <div key={sid} className={styles.subject} style={{ '--accent': color }}>
                  <div className={styles.subjectHead}>
                    <span className={styles.subjectIcon}>
                      <Icon name={icon} size={20} />
                    </span>
                    <h3 className={styles.subjectName}>{name}</h3>
                    {hasMastery && (
                      <span className={styles.mastery}>掌握度 {mastery}%</span>
                    )}
                    <span className={styles.count}>{sub.items.length} 项</span>
                  </div>

                  <ul className={styles.list}>
                    {sub.items.map((item, i) => {
                      const key = `${grade}-${sid}-${i}`
                      const isOpen = !!open[key]
                      return (
                        <li
                          key={key}
                          className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
                        >
                          <button
                            type="button"
                            className={styles.itemHead}
                            aria-expanded={isOpen}
                            onClick={() => toggle(key)}
                          >
                            <span className={styles.itemTitle}>{item.title || '知识点'}</span>
                            <span className={styles.itemCore}>{item.core || ''}</span>
                            <Icon name="chevronRight" size={18} className={styles.chevron} />
                          </button>

                          {isOpen && (
                            <div className={styles.detail}>
                              <div className={styles.detailRow}>
                                <Icon name="bulb" size={16} className={styles.bulb} />
                                <div>
                                  <strong>为什么必须掌握</strong>
                                  <p>{item.why || '—'}</p>
                                </div>
                              </div>
                              <div className={styles.detailRow}>
                                <Icon name="sparkle" size={16} className={styles.spark} />
                                <div>
                                  <strong>真实场景用得到</strong>
                                  <p>{item.scene || '—'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        ) : (
          <p className={styles.empty}>该年级内容整理中，敬请期待～</p>
        )}
      </div>
    </section>
  )
}
