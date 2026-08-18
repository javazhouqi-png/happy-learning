import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import VideoCard from '../ui/VideoCard.jsx'
import VideoModal from '../VideoModal.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { VIDEOS, SUBJECTS, getSubject } from '../../data/content.js'
import styles from './VideoLibrary.module.css'

// 筛选条：全部 + 各学科的视频数量统计，便于快速定位。
const FILTERS = [
  { id: 'all', label: '全部' },
  ...SUBJECTS.map((s) => ({ id: s.id, label: s.name })),
]

export default function VideoLibrary() {
  const { state, derived, actions } = useApp()
  const navigate = useNavigate()
  const [active, setActive] = useState(null)
  const [filter, setFilter] = useState('all')

  const watchedCount = VIDEOS.filter((v) => state.videosWatched[v.id]).length
  const list = filter === 'all' ? VIDEOS : VIDEOS.filter((v) => v.subject === filter)
  const countFor = (id) => (id === 'all' ? VIDEOS.length : VIDEOS.filter((v) => v.subject === id).length)

  return (
    <div className={styles.page}>
      <div className="container">
        <button className={styles.back} onClick={() => navigate('/')}>
          <Icon name="chevronRight" size={18} className={styles.backIcon} /> 返回首页
        </button>

        <header className={styles.head}>
          <h1 className={styles.title}>动画课堂</h1>
          <p className={styles.sub}>把知识点变成好玩的动画故事 · 已观看 {watchedCount}/{VIDEOS.length}</p>
        </header>

        {/* 学科筛选 */}
        <div className={styles.filters} role="tablist" aria-label="按学科筛选视频">
          {FILTERS.map((f) => {
            const color = f.id === 'all' ? 'var(--c-primary)' : getSubject(f.id)?.color
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                className={`${styles.chip} ${filter === f.id ? styles.chipActive : ''}`}
                style={{ '--chip': color }}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className={styles.chipCount}>{countFor(f.id)}</span>
              </button>
            )
          })}
        </div>

        {list.length === 0 ? (
          <p className={styles.empty}>
            该学科暂无视频课，去看看<button className={styles.emptyLink} onClick={() => setFilter('all')}>全部视频</button>吧～
          </p>
        ) : (
          <div className={styles.grid}>
            {list.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                watched={!!state.videosWatched[v.id]}
                onPlay={setActive}
                favorited={derived.favoriteSet.has(`video:${v.id}`)}
                onToggleFavorite={() =>
                  actions.toggleFavorite({
                    kind: 'video',
                    key: v.id,
                    title: v.title,
                    subject: v.subject,
                    addedAt: Date.now(),
                  })
                }
              />
            ))}
          </div>
        )}

        <div className={styles.foot}>
          <Link to="/learn/chinese">
            <Button variant="outline">去学科里做练习 →</Button>
          </Link>
        </div>
      </div>

      {active && <VideoModal video={active} onClose={() => setActive(null)} />}
    </div>
  )
}
