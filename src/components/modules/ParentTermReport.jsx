import { useMemo, useState } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Button from '../ui/Button.jsx'
import { SUBJECTS } from '../../data/content.js'
import { buildTermReport } from '../../data/termReport.js'
import styles from './ParentTermReport.module.css'

const SUBJECT_NAME = Object.fromEntries(SUBJECTS.map((s) => [s.id, s.name]))

// 学期报告：阶段性成长总览，复用 buildTermReport 纯函数汇总，支持一键复制分享。
export default function ParentTermReport() {
  const { state } = useApp()
  const [copied, setCopied] = useState(false)
  const report = useMemo(() => buildTermReport(state), [state])

  const empty = report.lessonsDone === 0 && report.totalQuized === 0 && report.points === 0

  const copyReport = async () => {
    const lines = [
      '【快乐学园 · 学期学习报告】',
      `累计积分：${report.points}`,
      `完成课程：${report.lessonsDone} 节`,
      `练习总正确率：${report.accuracy}%`,
      '各科掌握度：',
      ...report.perSubject.map((s) => `  · ${s.name}：${s.mastery}%（${s.correct}/${s.total}）`),
      report.hasWeak
        ? `需要巩固：${report.weak.map((w) => w.title).join('、')}`
        : '薄弱点：暂无明显薄弱点，保持节奏',
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
    <section className="section section--alt" id="term">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="学期报告 · TERM REPORT"
          eyebrowIcon="medal"
          color="var(--c-primary)"
          title="学期学习报告"
          subtitle="一份阶段性的成长总览：积分、完成课程、各科掌握度与薄弱点，随时复制分享。"
        />

        {empty ? (
          <div className={styles.empty}>
            <Icon name="book" size={40} />
            <p>还没有足够的学习数据生成报告，陪孩子完成几节课、做几道练习后这里会自动汇总～</p>
          </div>
        ) : (
          <div className={styles.panel}>
            <div className={styles.statRow}>
              <div className={styles.stat}>
                <Icon name="star" size={20} />
                <strong>{report.points}</strong>
                <span>累计积分</span>
              </div>
              <div className={styles.stat}>
                <Icon name="book" size={20} />
                <strong>{report.lessonsDone}</strong>
                <span>完成课程</span>
              </div>
              <div className={styles.stat}>
                <Icon name="check" size={20} />
                <strong>{report.accuracy}%</strong>
                <span>练习正确率</span>
              </div>
              <div className={styles.stat}>
                <Icon name="medal" size={20} />
                <strong>{report.favorites}</strong>
                <span>收藏内容</span>
              </div>
            </div>

            <div className={styles.subjects}>
              {report.perSubject.map((s) => (
                <div key={s.id} className={styles.subjectRow}>
                  <span className={styles.subjectName}>{s.name}</span>
                  <div className={styles.bar}>
                    <div className={styles.barFill} style={{ width: `${s.mastery}%` }} />
                  </div>
                  <span className={styles.subjectPct}>{s.mastery}%</span>
                </div>
              ))}
            </div>

            {report.hasWeak && (
              <div className={styles.weak}>
                <h4 className={styles.weakTitle}>需要巩固的知识点</h4>
                <div className={styles.weakTags}>
                  {report.weak.map((w, i) => (
                    <span key={i} className={styles.weakTag}>
                      {w.title}
                      <em>{SUBJECT_NAME[w.subject] || w.subject}</em>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <Button variant="primary" size="sm" onClick={copyReport}>
                {copied ? (
                  <>
                    已复制 <Icon name="check" size={14} />
                  </>
                ) : (
                  '复制学期报告'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
