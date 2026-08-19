import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import { useApp } from '../../state/AppContext.jsx'
import styles from './DailyTasks.module.css'

// 首页「今日学习任务」卡片：把每日任务单（今日三件事）以勾选清单呈现，
// 完成后显示进度与鼓励。任务在 App 挂载时按当天状态自动生成，跨天重置。
export default function DailyTasks() {
  const { state, actions } = useApp()
  const dt = state.dailyTasks || { date: '', items: [] }
  const items = dt.items || []
  const done = items.filter((i) => i.done).length
  const total = items.length
  const allDone = total > 0 && done === total

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.head}>
            <div>
              <h2 className={styles.title}>
                <Icon name="calendar" size={18} /> 今日学习任务
              </h2>
              <p className={styles.sub}>
                {dt.date ? `${dt.date} · 已完成 ${done}/${total}` : '正在为你安排今天的学习～'}
              </p>
            </div>
            {allDone && (
              <span className={styles.badge}>
                <Icon name="trophy" size={14} /> 今日全勤
              </span>
            )}
          </div>

          {total > 0 && (
            <ul className={styles.list}>
              {items.map((it) => (
                <li key={it.id} className={`${styles.item} ${it.done ? styles.itemDone : ''}`}>
                  <button
                    type="button"
                    className={styles.check}
                    aria-pressed={it.done}
                    aria-label={it.done ? '已完成，点击取消' : '标记为完成'}
                    onClick={() => actions.toggleDailyTask(it.id)}
                  >
                    {it.done && <Icon name="check" size={18} fill="currentColor" />}
                  </button>
                  <span className={styles.label}>{it.title}</span>
                  {it.route && (
                    <Link to={it.route} className={styles.go}>
                      去做 <Icon name="arrowRight" size={13} />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* 进度条 */}
          {total > 0 && (
            <div className={styles.progress}>
              <div className={styles.bar} style={{ width: `${Math.round((done / total) * 100)}%` }} />
            </div>
          )}

          {allDone && (
            <p className={styles.reward}>
              <Icon name="star" size={14} /> 三项都完成啦，今天的学习闭环圆满，继续保持！
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
