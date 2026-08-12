import { useMemo, useState } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import {
  localDateStr,
  daysInMonth,
  firstWeekday,
  monthLabel,
} from '../../utils/date.js'
import styles from './DailyCheckIn.module.css'

const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const TYPE_ICON = { lesson: 'book', quiz: 'check', video: 'play', game: 'gamepad' }

// 每日打卡日历：把学习历史按「本地日期」归桶，月历化展示连续天数与每日活跃。
// 纯展示、只读 state，不写任何状态；所有边界（空历史 / 未来禁用 / 跨月）都在渲染层兜底。
export default function DailyCheckIn() {
  const { state } = useApp()
  const today = new Date()
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState(null) // 选中有活动的一天（日期串）

  // 历史按天分桶；条目缺 ts 字段则跳过，避免脏数据拖垮渲染。
  const byDay = useMemo(() => {
    const map = {}
    for (const h of state.history || []) {
      if (!h || typeof h.ts !== 'number') continue
      const key = localDateStr(new Date(h.ts))
      if (!map[key]) map[key] = []
      map[key].push(h)
    }
    return map
  }, [state.history])

  const total = daysInMonth(view.y, view.m)
  const lead = firstWeekday(view.y, view.m)
  const cells = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= total; d++) cells.push(d)

  const todayStr = localDateStr(today)
  const isFutureMonth =
    view.y > today.getFullYear() ||
    (view.y === today.getFullYear() && view.m > today.getMonth())

  // 不允许跳到“未来月份”（最多看到当前月），避免无意义导航。
  const shift = (delta) => {
    let m = view.m + delta
    let y = view.y
    if (m < 0) {
      m = 11
      y--
    }
    if (m > 11) {
      m = 0
      y++
    }
    if (y > today.getFullYear() || (y === today.getFullYear() && m > today.getMonth())) return
    setView({ y, m })
    setSelected(null)
  }

  const cellClick = (d) => {
    const key = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (key > todayStr) return // 未来的日子不响应
    if (!byDay[key]) {
      setSelected(null)
      return
    }
    setSelected(key)
  }

  const selEntries = selected ? byDay[selected] || [] : []
  const selPoints = selEntries.reduce((a, h) => a + (h.points || 0), 0)

  return (
    <section className="section section--alt" id="checkin">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="每日打卡 · CHECK-IN"
          eyebrowIcon="calendar"
          color="var(--c-accent-yellow)"
          title="我的学习打卡日历"
          subtitle="看看自己连续坚持了多少天，每一天的小进步都值得纪念。"
        />

        <div className={styles.panel}>
          <div className={styles.calHead}>
            <button className={styles.navBtn} onClick={() => shift(-1)} aria-label="上个月">
              <Icon name="chevronRight" size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <span className={styles.month}>{monthLabel(view.y, view.m)}</span>
            <button
              className={styles.navBtn}
              onClick={() => shift(1)}
              disabled={isFutureMonth}
              aria-label="下个月"
            >
              <Icon name="chevronRight" size={18} />
            </button>
          </div>

          {state.history.length === 0 ? (
            <div className={styles.empty}>
              <Icon name="calendar" size={40} />
              <p>还没有打卡记录，去完成一节课或答一道题，就能点亮第一天！</p>
            </div>
          ) : (
            <>
              <div className={styles.weekRow}>
                {WEEK.map((w) => (
                  <span key={w} className={styles.weekCell}>{w}</span>
                ))}
              </div>
              <div className={styles.grid}>
                {cells.map((d, i) => {
                  if (d === null) return <span key={`b${i}`} className={styles.cellEmpty} />
                  const key = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                  const isToday = key === todayStr
                  const active = !!byDay[key]
                  const future = key > todayStr
                  const sel = key === selected
                  return (
                    <button
                      key={key}
                      className={`${styles.cell} ${active ? styles.active : ''} ${isToday ? styles.today : ''} ${sel ? styles.sel : ''}`}
                      disabled={future || !active}
                      onClick={() => cellClick(d)}
                      title={active ? `${key} 有 ${byDay[key].length} 项活动` : future ? '未来的日子' : key}
                    >
                      <span className={styles.dayNum}>{d}</span>
                      {active && <span className={styles.dot} />}
                    </button>
                  )
                })}
              </div>

              {selected && (
                <div className={styles.dayDetail}>
                  <div className={styles.dayDetailHead}>
                    <strong>{selected}</strong>
                    <button className={styles.closeDetail} onClick={() => setSelected(null)} aria-label="关闭">
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                  {selEntries.length === 0 ? (
                    <p className={styles.muted}>这一天没有记录。</p>
                  ) : (
                    <>
                      <p className={styles.daySummary}>
                        共 {selEntries.length} 项活动 · 获得 <strong>{selPoints}</strong> 积分
                      </p>
                      <ul className={styles.dayList}>
                        {selEntries.map((h, i) => (
                          <li key={i} className={styles.dayItem}>
                            <Icon name={TYPE_ICON[h.type] || 'star'} size={16} />
                            <span>{h.detail}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          <div className={styles.streakBar}>
            <Icon name="flame" size={20} />
            <span>当前连续打卡 <strong>{state.streakDays}</strong> 天</span>
            {state.streakDays >= 2 && <span className={styles.streakTip}>坚持就是胜利 💪</span>}
          </div>
        </div>
      </div>
    </section>
  )
}
