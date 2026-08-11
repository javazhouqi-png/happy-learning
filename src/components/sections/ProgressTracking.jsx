import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { weeklyProgress, subjects } from '../../data/content.js'
import styles from './ProgressTracking.module.css'

export default function ProgressTracking() {
  const max = Math.max(...weeklyProgress.values)
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
          {/* 本周学习时长柱状图 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>本周学习时长</h3>
            <p className={styles.cardSub}>单位：分钟</p>
            <div className={styles.chart}>
              {weeklyProgress.values.map((v, i) => (
                <div key={weeklyProgress.labels[i]} className={styles.col}>
                  <div className={styles.barWrap}>
                    <div
                      className={styles.bar}
                      style={{ height: `${(v / max) * 100}%` }}
                      title={`${weeklyProgress.labels[i]}：${v} 分钟`}
                    />
                  </div>
                  <span className={styles.barLabel}>{weeklyProgress.labels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 学科掌握度 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>学科掌握度</h3>
            <p className={styles.cardSub}>基于练习正确率与完成度</p>
            <div className={styles.mastery}>
              {subjects.map((s) => (
                <div key={s.id} className={styles.masteryRow}>
                  <span className={styles.masteryIcon} style={{ background: `var(${s.colorVar})`, color: '#fff' }}>
                    <Icon name={s.icon} size={16} fill="currentColor" />
                  </span>
                  <span className={styles.masteryName}>{s.name}</span>
                  <ProgressBar value={s.progress} color={`var(${s.colorVar})`} height={9} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
