import { useMemo, useState } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Button from '../ui/Button.jsx'
import { formatStudyTime, SUBJECTS } from '../../data/content.js'
import { lastNDates, localDateStr } from '../../utils/date.js'
import styles from './ParentWeeklyReport.module.css'

const TYPE_ICON = { lesson: 'book', quiz: 'check', video: 'play', game: 'gamepad' }
const TYPE_LABEL = { lesson: '课程', quiz: '练习', video: '视频', game: '游戏' }

// 家长周报：聚合近 7 天的学习活动，生成可分享的周小结。纯聚合、只读 state。
// 积分 / 时长直接用历史记录里的 points / seconds 字段求和（AppContext 写入时记录），
// 不解析文案，避免脆弱匹配；旧数据缺字段时以 0 兜底。
export default function ParentWeeklyReport() {
  const { state, derived } = useApp()
  const week = useMemo(() => lastNDates(7), [])
  const weekSet = useMemo(() => new Set(week), [week])
  const [copied, setCopied] = useState(false)

  const report = useMemo(() => {
    const entries = (state.history || []).filter((h) => {
      if (!h || typeof h.ts !== 'number') return false
      return weekSet.has(localDateStr(new Date(h.ts)))
    })
    const byType = { lesson: 0, quiz: 0, video: 0, game: 0 }
    let points = 0
    let seconds = 0
    const activeDays = new Set()
    for (const h of entries) {
      if (byType[h.type] !== undefined) byType[h.type] += 1
      points += h.points || 0
      seconds += h.seconds || 0
      activeDays.add(localDateStr(new Date(h.ts)))
    }
    return { entries, byType, points, seconds, activeDays: activeDays.size }
  }, [state.history, weekSet])

  const copyReport = async () => {
    const lines = [
      '【快乐学园 · 本周学习小结】',
      `统计区间：${week[0]} ~ ${week[week.length - 1]}`,
      `活跃天数：${report.activeDays} 天`,
      `学习记录：${report.entries.length} 条`,
      `获得积分：${report.points}`,
      `学习时长：${formatStudyTime(report.seconds)}`,
      `当前连续打卡：${state.streakDays} 天`,
      '学科掌握度：',
      ...SUBJECTS.map((s) => `  · ${s.name}：${derived.mastery[s.id] || 0}%`),
    ]
    const text = lines.join('\n')
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="section" id="weekly">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="家长周报 · WEEKLY"
          eyebrowIcon="shield"
          color="var(--c-math)"
          title="本周学习小结"
          subtitle="一份给家长的周报：活跃天数、积分、时长一目了然，随时复制分享。"
        />

        {report.entries.length === 0 ? (
          <div className={styles.empty}>
            <Icon name="calendar" size={40} />
            <p>本周还没有学习记录，陪孩子完成一节课或玩一局游戏就会统计进来～</p>
          </div>
        ) : (
          <div className={styles.panel}>
            <div className={styles.statRow}>
              <div className={styles.stat}>
                <Icon name="flame" size={20} />
                <strong>{report.activeDays}</strong>
                <span>活跃天数</span>
              </div>
              <div className={styles.stat}>
                <Icon name="star" size={20} />
                <strong>{report.points}</strong>
                <span>获得积分</span>
              </div>
              <div className={styles.stat}>
                <Icon name="clock" size={20} />
                <strong>{formatStudyTime(report.seconds)}</strong>
                <span>学习时长</span>
              </div>
              <div className={styles.stat}>
                <Icon name="check" size={20} />
                <strong>{report.entries.length}</strong>
                <span>活动次数</span>
              </div>
            </div>

            <div className={styles.byType}>
              {Object.entries(report.byType).map(([type, n]) => (
                <div key={type} className={styles.typeItem}>
                  <Icon name={TYPE_ICON[type]} size={18} />
                  <span>{TYPE_LABEL[type]}</span>
                  <strong>{n}</strong>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <Button variant="primary" size="sm" onClick={copyReport}>
                {copied ? '已复制 ✓' : '复制周报'}
              </Button>
              <span className={styles.range}>
                统计区间：{week[0]} ~ {week[week.length - 1]}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
