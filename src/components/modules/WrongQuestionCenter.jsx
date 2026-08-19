import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../state/AppContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Button from '../ui/Button.jsx'
import ExerciseEngine from '../ExerciseEngine.jsx'
import { SUBJECTS } from '../../data/content.js'
import { getSimilarQuestions } from '../../data/similar.js'
import { getQuiz } from '../../data/grade.js'
import styles from './WrongQuestionCenter.module.css'

// 本地日期串（与 AppContext 内的口径一致，仅用于“今天待复习”判定，避免重复依赖）。
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 错题举一反三：遍历该科错题本，对每道带 pointId 溯源的错题取同源他题，去重后汇总。
// 旧链路仅存 true（无 pointId）的错题无法溯源，自然被跳过；无结果返回空数组交由 UI 降级。
function buildSimilar(sub, state) {
  const set = state.wrongBySubject[sub.id] || {}
  const out = []
  const seen = new Set()
  Object.entries(set).forEach(([qid, entry]) => {
    if (!entry || !entry.pointId) return
    const list = getSimilarQuestions({
      subject: sub.id,
      grade: entry.grade ?? state.grade,
      pointId: entry.pointId,
      questionId: qid,
      limit: 2,
    })
    list.forEach((q) => {
      if (seen.has(q.id)) return
      seen.add(q.id)
      out.push(q)
    })
  })
  return out.slice(0, 6)
}

// 错题↔知识点闭环：按 pointId 把该科错题分组，每组带知识点名、题数与代表年级。
// 无 pointId 溯源的错题归入「未归类知识点」，仍可在复习模式巩固。返回按题数降序的分组数组。
function groupWrongByPoint(sub, state) {
  const set = state.wrongBySubject[sub.id] || {}
  const map = new Map()
  Object.values(set).forEach((entry) => {
    const e = entry && typeof entry === 'object' ? entry : {}
    const pid = e.pointId || ''
    const key = pid || '__none__'
    if (!map.has(key)) {
      map.set(key, {
        pointId: pid,
        title: e.pointTitle || '未归类知识点',
        grade: e.grade,
        count: 0,
      })
    }
    map.get(key).count += 1
  })
  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

// 取某知识点对应的全部题目（用于「练这组」针对性练习）；兼容 pointId / point 两种字段命名。
function questionsOfPoint(subjectId, grade, pointId) {
  const all = getQuiz(subjectId, grade) || []
  return all.filter((q) => (q.pointId ?? q.point) === pointId)
}

// 单知识点针对性练习：取该 pointId 对应的全部题目复用 ExerciseEngine 判分，
// 答对即移出错题本、答错保留溯源，形成「错题 → 知识点 → 针对性练习」闭环。
// 顶部提供「回教材」入口，便于回到统编教材对应单元巩固。
function PointPractice({ subject, pointId, groups, state, onClose, onComplete }) {
  const group = groups.find((g) => g.pointId === pointId)
  const grade = group?.grade ?? state.grade
  const questions = pointId ? questionsOfPoint(subject.id, grade, pointId) : []

  return (
    <div>
      <div className={styles.groupHead}>
        <span className={styles.groupHeadTitle}>
          <Icon name="bulb" size={15} /> 针对性练习：{group?.title || '该知识点'}
        </span>
        <div className={styles.groupHeadTools}>
          <Link to="/textbook" className={styles.backLink}>
            <Icon name="book" size={13} /> 回教材
          </Link>
          <button type="button" className={styles.groupBtn} onClick={onClose}>
            收起练习
          </button>
        </div>
      </div>
      {questions.length > 0 ? (
        <ExerciseEngine
          subjectId={subject.id}
          questions={questions}
          favoritable
          onComplete={onComplete}
        />
      ) : (
        <p className={styles.simEmpty}>
          <Icon name="bulb" size={15} /> 该知识点的练习题暂未在题库中，可先到「回教材」巩固课文。
        </p>
      )}
    </div>
  )
}

// 错题本复习中心：按学科聚合错题数量，内嵌 ExerciseEngine 的「仅错题」模式进行复习，
// 并支持单科清空。判分 / 移出错题的逻辑完全复用 ExerciseEngine，这里只做编排，不复制业务。
// 借鉴 flashcard 类项目的间隔重复（Leitner）思路：每次复习完成会推进该科的复习排程，
// 全对则拉长间隔、答错则明天再练，并在卡片上提示“今天待复习”。
export default function WrongQuestionCenter() {
  const { state, derived, actions } = useApp()
  const [openSubject, setOpenSubject] = useState(null)
  const [similarSubject, setSimilarSubject] = useState(null)
  const [groupPractice, setGroupPractice] = useState(null) // 正在针对性练习的知识点 pointId
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
                    <p className={styles.count}>
                      {count > 0 ? (
                        `${count} 道待复习`
                      ) : (
                        <>
                          <Icon name="check" size={14} /> 暂无错题
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {dueToday && (
                  <span className={styles.due}>
                    <Icon name="flame" size={14} fill="currentColor" /> 今天待复习
                  </span>
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
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => setSimilarSubject(similarSubject === sub.id ? null : sub.id)}
                    >
                      {similarSubject === sub.id ? '收起举一反三' : '举一反三'}
                    </Button>
                  )}
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
                    {groupPractice ? (
                      <PointPractice
                        subject={sub}
                        pointId={groupPractice}
                        groups={groupWrongByPoint(sub, state)}
                        state={state}
                        onClose={() => setGroupPractice(null)}
                        onComplete={({ allCorrect }) => actions.recordReview(sub.id, allCorrect)}
                      />
                    ) : (
                      <>
                        <p className={styles.groupHint}>按知识点分组，哪个薄弱就专练哪个：</p>
                        <ul className={styles.groups}>
                          {groupWrongByPoint(sub, state).map((g) => (
                            <li key={g.pointId || '__none__'} className={styles.groupRow}>
                              <span className={styles.groupName}>{g.title}</span>
                              <span className={styles.groupCount}>{g.count} 题</span>
                              {g.pointId ? (
                                <button
                                  type="button"
                                  className={styles.groupBtn}
                                  onClick={() => setGroupPractice(g.pointId)}
                                >
                                  练这组
                                </button>
                              ) : (
                                <span className={styles.groupMuted}>复习模式巩固</span>
                              )}
                            </li>
                          ))}
                        </ul>
                        <ExerciseEngine
                          subjectId={sub.id}
                          initialReview
                          favoritable
                          onComplete={({ allCorrect }) => actions.recordReview(sub.id, allCorrect)}
                        />
                      </>
                    )}
                  </div>
                )}

                {similarSubject === sub.id && (
                  <div className={styles.reviewBox}>
                    {buildSimilar(sub, state).length > 0 ? (
                      <ExerciseEngine subjectId={sub.id} questions={buildSimilar(sub, state)} />
                    ) : (
                      <p className={styles.simEmpty}>
                        <Icon name="bulb" size={15} /> 这几道题暂无同源相似题，建议先把原题练熟～
                      </p>
                    )}
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
