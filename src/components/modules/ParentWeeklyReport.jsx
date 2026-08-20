import { useMemo, useState } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Button from '../ui/Button.jsx'
import { formatStudyTime, SUBJECTS } from '../../data/content.js'
import { buildDiagnosis } from '../../data/diagnose.js'
import { lastNDates, localDateStr } from '../../utils/date.js'
import styles from './ParentWeeklyReport.module.css'

const SUBJECT_NAME = Object.fromEntries(SUBJECTS.map((s) => [s.id, s.name]))

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
  const [diagCopied, setDiagCopied] = useState(false)

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

  // 诊断报告：由错题本聚合薄弱知识点与陪学动作；派生计算，进入时实时算，不持久化。
  const diagnosis = useMemo(
    () => buildDiagnosis({ wrongBySubject: state.wrongBySubject, grade: state.grade }),
    [state.wrongBySubject, state.grade]
  )

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

  // 复制诊断报告为纯文本（降级导出，不依赖 canvas/图像库）。
  const copyDiagnosis = async () => {
    const lines = [
      '【快乐学园 · 学习诊断报告】',
      ...diagnosis.weakPoints.map(
        (w, i) =>
          `${i + 1}. ${w.title}（${SUBJECT_NAME[w.subject] || w.subject} · ${w.grade}年级 · 错 ${w.wrongCount} 次）`
      ),
      '',
      '今晚 5 分钟陪学动作：',
      ...diagnosis.actions.map((a, i) => `  ${i + 1}. ${a}`),
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
      setDiagCopied(true)
      setTimeout(() => setDiagCopied(false), 2000)
    } catch {
      setDiagCopied(false)
    }
  }

  // 打印诊断卡：弹出独立窗口渲染纯文本报告并触发打印；被拦截时降级为复制。
  const printDiagnosis = () => {
    try {
      const w = window.open('', '_blank', 'width=640,height=800')
      if (!w) throw new Error('blocked')
      const body = [
        '<h2>快乐学园 · 学习诊断报告</h2>',
        ...diagnosis.weakPoints.map(
          (p, i) =>
            `<p><b>${i + 1}. ${p.title}</b>（${SUBJECT_NAME[p.subject] || p.subject} · ${p.grade}年级 · 错 ${p.wrongCount} 次）<br/>${p.why ? '为什么重要：' + p.why + '<br/>' : ''}${p.scene ? '生活场景：' + p.scene : ''}</p>`
        ),
        '<h3>今晚 5 分钟陪学动作</h3><ol>' + diagnosis.actions.map((a) => `<li>${a}</li>`).join('') + '</ol>',
      ].join('')
      w.document.write(`<html><head><meta charset="utf-8"><title>学习诊断报告</title></head><body style="font-family:sans-serif;padding:24px;line-height:1.7">${body}</body></html>`)
      w.document.close()
      w.focus()
      w.print()
    } catch {
      copyDiagnosis()
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
                {copied ? (
                  <>
                    已复制 <Icon name="check" size={14} />
                  </>
                ) : (
                  '复制周报'
                )}
              </Button>
              <span className={styles.range}>
                统计区间：{week[0]} ~ {week[week.length - 1]}
              </span>
            </div>
          </div>
        )}

        {/* 学习诊断报告：薄弱知识点 + 陪学动作（对比免费 AI 的核心差异化资产） */}
        <SectionHeading
          eyebrow="学习诊断 · DIAGNOSIS"
          eyebrowIcon="book"
          color="var(--c-gamify)"
          title="学习诊断报告"
          subtitle="基于孩子的错题本，自动找出最薄弱的知识点，并给出今晚就能做的陪学动作。"
        />

        {!diagnosis.hasData ? (
          <div className={styles.empty}>
            <Icon name="check" size={40} />
            <p>本周暂无明显薄弱点，保持现在的节奏就好～ 多练几道题后，这里会帮你找出需要巩固的地方。</p>
          </div>
        ) : (
          <div className={styles.diag}>
            <div className={styles.diagGrid}>
              {diagnosis.weakPoints.map((w, i) => (
                <div key={`${w.subject}-${w.title}-${i}`} className={styles.weakCard}>
                  <span className={styles.weakRank}>{i + 1}</span>
                  <div className={styles.weakBody}>
                    <h4 className={styles.weakTitle}>{w.title}</h4>
                    <p className={styles.weakMeta}>
                      {SUBJECT_NAME[w.subject] || w.subject} · {w.grade} 年级 · 累计错 {w.wrongCount} 次
                    </p>
                    {w.why && <p className={styles.weakWhy}>为什么重要：{w.why}</p>}
                    {w.scene && <p className={styles.weakScene}>生活场景：{w.scene}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.adviceBlock}>
              <h4 className={styles.adviceTitle}>今晚 5 分钟陪学动作</h4>
              <ol className={styles.adviceList}>
                {diagnosis.actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ol>
            </div>

            <div className={styles.actions}>
              <Button variant="primary" size="sm" onClick={copyDiagnosis}>
                {diagCopied ? (
                  <>
                    已复制 <Icon name="check" size={14} />
                  </>
                ) : (
                  '复制诊断报告'
                )}
              </Button>
              <Button variant="soft" size="sm" onClick={printDiagnosis}>
                <Icon name="download" size={14} /> 打印 / 导出
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
