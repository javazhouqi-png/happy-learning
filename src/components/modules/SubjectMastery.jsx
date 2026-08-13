import { useApp } from '../../state/AppContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { SUBJECTS } from '../../data/content.js'
import { LESSONS } from '../../data/subjects.js'
import styles from './SubjectMastery.module.css'

// 掌握度进度环：纯展示组件，输入百分比，按比例绘制 SVG 圆环；pct 异常时兜底到 0~100。
function Ring({ pct, color }) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0))
  const r = 46
  const c = 2 * Math.PI * r
  const offset = c * (1 - p / 100)
  return (
    <svg className={styles.ring} viewBox="0 0 120 120" width="120" height="120" role="img" aria-label={`掌握度 ${p}%`}>
      <circle cx="60" cy="60" r={r} className={styles.ringBg} />
      <circle
        cx="60"
        cy="60"
        r={r}
        className={styles.ringFg}
        style={{ stroke: color, strokeDasharray: c, strokeDashoffset: offset }}
      />
      <text x="60" y="58" className={styles.ringPct}>{p}%</text>
      <text x="60" y="76" className={styles.ringLabel}>掌握度</text>
    </svg>
  )
}

// 学科掌握度详情：只读 derived.mastery 与各科完成 / 正确率，帮孩子看清强弱。
// 边界：未开始学科正确率显示「—」（避免 0/0 除零）；样本过少时给温和提示。
export default function SubjectMastery() {
  const { state, derived } = useApp()

  return (
    <section className="section section--alt" id="mastery">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="学习洞察 · INSIGHT"
          eyebrowIcon="sparkle"
          color="var(--c-english)"
          title="学科掌握度详情"
          subtitle="课程完成率与答题正确率共同决定掌握度，帮你看清每科强弱。"
        />

        <div className={styles.grid}>
          {SUBJECTS.map((sub) => {
            const lessons = LESSONS[sub.id] || []
            const done = lessons.filter((l) => state.completedLessons[l.id]).length
            const q = state.quizBySubject[sub.id] || { correct: 0, total: 0 }
            const lessonRate = lessons.length ? Math.round((done / lessons.length) * 100) : 0
            const quizRate = q.total ? Math.round((q.correct / q.total) * 100) : null
            const small = q.total > 0 && q.total < 3
            return (
              <div key={sub.id} className={styles.card} style={{ '--accent': sub.color }}>
                <Ring pct={derived.mastery[sub.id] || 0} color={sub.color} />
                <h3 className={styles.name}>{sub.name}</h3>

                <div className={styles.bar}>
                  <span className={styles.barLabel}>课程 {done}/{lessons.length}</span>
                  <ProgressBar value={lessonRate} color={sub.color} height={8} />
                </div>
                <div className={styles.bar}>
                  <span className={styles.barLabel}>正确率 {quizRate === null ? '—' : `${quizRate}%`}</span>
                  <ProgressBar value={quizRate || 0} color={sub.color} height={8} />
                </div>

                {small && <p className={styles.hint}>题目还比较少，正确率仅供参考～</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
