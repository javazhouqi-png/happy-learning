import { useState } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Button from '../ui/Button.jsx'
import ExerciseEngine from '../ExerciseEngine.jsx'
import { SUBJECTS } from '../../data/content.js'
import styles from './WrongQuestionCenter.module.css'

// 本地日期串（与 AppContext 内的口径一致，仅用于“今天待复习”判定，避免重复依赖）。
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 错题本复习中心：按学科聚合错题数量，内嵌 ExerciseEngine 的「仅错题」模式进行复习，
// 并支持单科清空。判分 / 移出错题的逻辑完全复用 ExerciseEngine，这里只做编排，不复制业务。
// 借鉴 flashcard 类项目的间隔重复（Leitner）思路：每次复习完成会推进该科的复习排程，
// 全对则拉长间隔、答错则明天再练，并在卡片上提示“今天待复习”。
export default function WrongQuestionCenter() {
  const { state, derived, actions } = useApp()
  const [openSubject, setOpenSubject] = useState(null)
  const today = todayStr()

  return (
    <section className="section" id="wrong">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="错题本 · WRONG BOOK"
          eyebrowIcon="bulb"
          color="var(--c-chinese)"
          title="错题复习中心"
          subtitle="把答错的题集中起来，针对性复习，全部答对就从错题本毕业！"
        />

        <div className={styles.grid}>
          {SUBJECTS.map((sub) => {
            const count = derived.wrongCountBySubject[sub.id] || 0
            const isOpen = openSubject === sub.id
            const sched = state.reviewSchedule?.[sub.id] || { box: 0, next: null }
            const dueToday = count > 0 && sched.next && sched.next <= today
            return (
              <div key={sub.id} className={styles.card} style={{ '--accent': sub.color }}>
                <div className={styles.cardHead}>
                  <span className={styles.icon}><Icon name={sub.icon} size={22} fill="currentColor" /></span>
                  <div>
                    <h3 className={styles.name}>{sub.name}</h3>
                    <p className={styles.count}>{count > 0 ? `${count} 道待复习` : '暂无错题 🎉'}</p>
                  </div>
                </div>

                {dueToday && (
                  <span className={styles.due}>🔥 今天待复习</span>
                )}
                {count > 0 && sched.next && !dueToday && (
                  <p className={styles.nextReview}>下次复习：{sched.next}</p>
                )}

                <div className={styles.cardActions}>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={count === 0}
                    onClick={() => setOpenSubject(isOpen ? null : sub.id)}
                  >
                    {isOpen ? '收起' : '开始复习'}
                  </Button>
                  {count > 0 && (
                    <button
                      className={styles.clearLink}
                      onClick={() => {
                        if (window.confirm(`确定清空「${sub.name}」的错题本吗？`)) actions.clearWrong(sub.id)
                      }}
                    >
                      清空
                    </button>
                  )}
                </div>

                {isOpen && count > 0 && (
                  <div className={styles.reviewBox}>
                    <ExerciseEngine
                      subjectId={sub.id}
                      initialReview
                      onComplete={({ allCorrect }) => actions.recordReview(sub.id, allCorrect)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
