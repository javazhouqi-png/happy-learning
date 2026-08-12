import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { brand, formatStudyTime } from '../../data/content.js'
import styles from './ParentPanel.module.css'

const TYPE_ICON = { lesson: 'book', quiz: 'check', video: 'play' }

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

function fmtTime(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function ParentPanel() {
  const { state, derived, actions } = useApp()
  const { parent } = state
  const doneLessons = Object.keys(state.completedLessons).length

  const guards = [
    { key: 'eyeRest', icon: 'moon', label: '护眼提醒', desc: '每 20 分钟提醒休息一下' },
    { key: 'sound', icon: 'sparkle', label: '音效反馈', desc: '答题与获得徽章时的提示音' },
  ]

  const history = state.history.slice(0, 6)

  // 今日屏幕时间：来自派生数据（state.todayStudySec 已按自然日归零）。
  const todayMin = derived.todayStudyMin
  const limit = derived.dailyLimitMin
  const remaining = derived.dailyRemainingMin
  const overLimit = derived.dailyOverLimit
  const usagePct = limit > 0 ? Math.min(100, Math.round((todayMin / limit) * 100)) : 0

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
            <div className={styles.avatar} style={{ background: 'var(--c-math)' }}>
              <Icon name="user" size={30} fill="currentColor" />
            </div>
            <div>
              <div className={styles.childName}>小明同学</div>
              <div className={styles.childGrade}>小学 · 快乐学园</div>
            </div>
            <div className={styles.statRow}>
              <div className={styles.stat}><strong>{doneLessons}</strong><span>已完成课</span></div>
              <div className={styles.stat}><strong>{derived.streakDays}</strong><span>连续天数</span></div>
              <div className={styles.stat}><strong>{derived.unlockedCount}</strong><span>获得徽章</span></div>
            </div>
            <button className={styles.reset} onClick={() => { if (confirm('确定要清空所有学习进度吗？此操作不可恢复。')) actions.reset() }}>
              重置学习进度
            </button>
          </div>

          {/* 今日屏幕时间：把家长设置的“每日学习上限”真正用起来 */}
          <div className={styles.usage}>
            <div className={styles.usageHead}>
              <span className={styles.usageTitle}>今日学习时长</span>
              <span className={`${styles.usageVal} ${overLimit ? styles.over : ''}`}>
                {formatStudyTime(state.todayStudySec)} / {limit} 分钟
              </span>
            </div>
            <ProgressBar value={usagePct} color={overLimit ? '#ff6b6b' : 'var(--c-english)'} height={10} />
            <p className={styles.usageHint}>
              {overLimit ? (
                <>
                  <Icon name="moon" size={14} /> 已超过今日上限，建议休息一下，保护视力与专注力。
                </>
              ) : (
                <>本日还可学习约 <strong>{remaining}</strong> 分钟。</>
              )}
            </p>
          </div>

          {/* 今日动态 */}
          <div className={styles.today}>
            <h3 className={styles.blockTitle}>学习动态</h3>
            {history.length === 0 ? (
              <p className={styles.empty}>还没有学习记录，快去完成第一节课吧！</p>
            ) : (
              <ul className={styles.timeline}>
                {history.map((h, i) => (
                  <li key={i} className={styles.event}>
                    <span className={styles.eventIcon}><Icon name={TYPE_ICON[h.type] || 'star'} size={16} fill="currentColor" /></span>
                    <span className={styles.eventText}>{h.detail}</span>
                    <span className={styles.eventTime}>{fmtTime(h.ts)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 时长与护眼管理 */}
          <div className={styles.guards}>
            <h3 className={styles.blockTitle}>时长与护眼管理</h3>

            <div className={styles.limitRow}>
              <div className={styles.guardInfo}>
                <div className={styles.guardLabel}>每日学习上限</div>
                <div className={styles.guardDesc}>达到后提醒休息，保护视力与专注</div>
              </div>
              <div className={styles.limitControl}>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={parent.dailyLimitMin}
                  onChange={(e) => actions.updateParent({ dailyLimitMin: Number(e.target.value) })}
                  aria-label="每日学习上限（分钟）"
                />
                <span className={styles.limitValue}>{parent.dailyLimitMin} 分钟</span>
              </div>
            </div>

            {guards.map((g) => (
              <div key={g.key} className={styles.guardRow}>
                <span className={styles.guardIcon}><Icon name={g.icon} size={18} strokeWidth={2} /></span>
                <div className={styles.guardInfo}>
                  <div className={styles.guardLabel}>{g.label}</div>
                  <div className={styles.guardDesc}>{g.desc}</div>
                </div>
                <Toggle on={parent[g.key]} onClick={() => actions.updateParent({ [g.key]: !parent[g.key] })} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
