import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import ExerciseEngine from '../ExerciseEngine.jsx'
import LessonTexts from '../modules/LessonTexts.jsx'
import VideoCard from '../ui/VideoCard.jsx'
import VideoModal from '../VideoModal.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { getSubject, getLessons, VIDEOS } from '../../data/content.js'
import styles from './SubjectPage.module.css'

const TABS = [
  { id: 'lessons', label: '课程', icon: 'book' },
  { id: 'practice', label: '练习', icon: 'calculator' },
  { id: 'videos', label: '视频', icon: 'play' },
]

export default function SubjectPage() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const subject = getSubject(subjectId)
  const { state, derived, actions } = useApp()
  const [tab, setTab] = useState('lessons')
  const [activeVideo, setActiveVideo] = useState(null)

  if (!subject) {
    return (
      <div className={styles.notFound}>
        <p>没有找到这个学科哦～</p>
        <Link to="/"><Button variant="primary">返回首页</Button></Link>
      </div>
    )
  }

  const lessons = getLessons(subjectId)
  const videos = VIDEOS.filter((v) => v.subject === subjectId)
  const doneCount = lessons.filter((l) => state.completedLessons[l.id]).length

  return (
    <div className={styles.page} style={{ '--accent': subject.color }}>
      <div className="container">
        {/* 学科头 */}
        <button className={styles.back} onClick={() => navigate('/')}>
          <Icon name="chevronRight" size={18} className={styles.backIcon} /> 返回首页
        </button>

        <header className={styles.hero}>
          <span className={styles.heroIcon}><Icon name={subject.icon} size={34} fill="currentColor" /></span>
          <div className={styles.heroText}>
            <h1 className={styles.heroName}>{subject.name}</h1>
            <p className={styles.heroTag}>{subject.tagline} · {subject.desc}</p>
          </div>
        </header>

        <div className={styles.progressBar}>
          <span>课程进度 {doneCount}/{lessons.length}</span>
          <ProgressBar value={lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0} color={subject.color} height={10} />
          <span className={styles.mastery}>掌握度 {derived.mastery[subjectId] || 0}%</span>
        </div>

        {/* Tab 切换 */}
        <nav className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.icon} size={18} fill={tab === t.id ? 'currentColor' : 'none'} />
              {t.label}
            </button>
          ))}
        </nav>

        {/* 课程内容 */}
        {tab === 'lessons' && (
          <div className={styles.lessons}>
            {lessons.map((lesson) => {
              const done = !!state.completedLessons[lesson.id]
              return (
                <article key={lesson.id} className={`${styles.lesson} ${done ? styles.lessonDone : ''}`}>
                  <div className={styles.lessonHead}>
                    <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                    <span className={styles.lessonTime}><Icon name="clock" size={14} /> {lesson.duration} 分钟</span>
                  </div>
                  <div className={styles.lessonBody}>
                    {lesson.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <LessonTexts lesson={lesson} color={subject.color} />
                  {done ? (
                    <div className={styles.doneRow}><Icon name="check" size={18} fill="currentColor" /> 已学完 +15 积分</div>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => actions.completeLesson(lesson.id, subjectId, lesson.duration)}>
                      学完本课 +15 积分
                    </Button>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {/* 练习 */}
        {tab === 'practice' && (
          <div className={styles.practice}>
            <ExerciseEngine subjectId={subjectId} />
          </div>
        )}

        {/* 视频 */}
        {tab === 'videos' && (
          <div className={styles.videos}>
            {videos.length === 0 && <p className={styles.empty}>该学科暂无视频课，去看看其他学科吧～</p>}
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} watched={!!state.videosWatched[v.id]} onPlay={setActiveVideo} />
            ))}
          </div>
        )}
      </div>

      {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
    </div>
  )
}
