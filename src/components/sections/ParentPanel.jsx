import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { parentPanel } from '../../data/content.js'
import styles from './ParentPanel.module.css'

function Toggle({ on, onClick }) {
  return (
    <button
      className={`${styles.toggle} ${on ? styles.on : ''}`}
      role="switch"
      aria-checked={on}
      onClick={onClick}
    >
      <span className={styles.knob} />
    </button>
  )
}

export default function ParentPanel() {
  const { timeGuards, toggleGuard } = useApp()
  const { child, today, guards } = parentPanel

  return (
    <section className={`section ${styles.section}`} id="parents">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="家长查看面板 · FOR PARENTS"
          eyebrowIcon="shield"
          color="var(--c-math)"
          title="孩子的成长，家长一眼看清"
          subtitle="学习动态、专注时长、用眼保护，科学陪伴不焦虑。"
        />

        <div className={styles.layout}>
          {/* 孩子档案 */}
          <div className={styles.profile}>
            <div className={styles.avatar} style={{ background: `var(${child.colorVar})` }}>
              <Icon name="user" size={30} fill="currentColor" />
            </div>
            <div>
              <div className={styles.childName}>{child.name}</div>
              <div className={styles.childGrade}>{child.grade}</div>
            </div>
            <div className={styles.statRow}>
              <div className={styles.stat}><strong>32</strong><span>已完成课</span></div>
              <div className={styles.stat}><strong>21</strong><span>连续天数</span></div>
              <div className={styles.stat}><strong>4</strong><span>获得徽章</span></div>
            </div>
          </div>

          {/* 今日动态 */}
          <div className={styles.today}>
            <h3 className={styles.blockTitle}>今日动态</h3>
            <ul className={styles.timeline}>
              {today.map((t, i) => (
                <li key={i} className={styles.event}>
                  <span className={styles.eventIcon}><Icon name={t.icon} size={16} fill="currentColor" /></span>
                  <span className={styles.eventText}>{t.text}</span>
                  <span className={styles.eventTime}>{t.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 时长管理 */}
          <div className={styles.guards}>
            <h3 className={styles.blockTitle}>时长与护眼管理</h3>
            {guards.map((g) => (
              <div key={g.key} className={styles.guardRow}>
                <span className={styles.guardIcon}><Icon name={g.icon} size={18} strokeWidth={2} /></span>
                <div className={styles.guardInfo}>
                  <div className={styles.guardLabel}>{g.label}</div>
                  <div className={styles.guardDesc}>{g.desc}</div>
                </div>
                <Toggle on={timeGuards[g.key]} onClick={() => toggleGuard(g.key)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
