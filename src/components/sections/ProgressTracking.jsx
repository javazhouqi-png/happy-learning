import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { SUBJECTS } from '../../data/content.js'
import styles from './ProgressTracking.module.css'

export default function ProgressTracking() {
  const { derived } = useApp()
  const studyMin = Math.round(derived.studySeconds / 60)
  const accuracy = derived.totalQuizzes
    ? Math.round((derived.totalCorrect / derived.totalQuizzes) * 100)
    : 0

  const stats = [
    { icon: 'clock', label: '学习时长', value: `${studyMin} 分钟` },
    { icon: 'check', label: '练习总数', value: `${derived.totalQuizzes} 题` },
    { icon: 'trophy', label: '答题正确率', value: `${accuracy}%` },
    { icon: 'flame', label: '连续天数', value: `${derived.streakDays} 天` },
  ]

  return (
    <section className={`section ${styles.section}`} id="progress">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="学习进度跟踪 · PROGRESS"
          eyebrowIcon="trophy"
          color="var(--c-primary)"
          title="看得见的点滴进步"
          subtitle="清晰的统计与掌握度，让孩子有成就感，也让家长放心。"
        />

        <div className={styles.layout}>
          {/* 学习概览 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>学习概览</h3>
            <p className={styles.cardSub}>所有数据来自真实学习活动</p>
            <div className={styles.stats}>
              {stats.map((s) => (
                <div key={s.label} className={styles.stat}>
                  <span className={styles.statIcon}><Icon name={s.icon} size={18} fill="currentColor" /></span>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 学科掌握度 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>学科掌握度</h3>
            <p className={styles.cardSub}>综合课程完成度与答题正确率</p>
            <div className={styles.mastery}>
              {SUBJECTS.map((s) => (
                <div key={s.id} className={styles.masteryRow}>
                  <span className={styles.masteryIcon} style={{ background: s.color, color: '#fff' }}>
                    <Icon name={s.icon} size={16} fill="currentColor" />
                  </span>
                  <span className={styles.masteryName}>{s.name}</span>
                  <ProgressBar value={derived.mastery[s.id] || 0} color={s.color} height={9} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
