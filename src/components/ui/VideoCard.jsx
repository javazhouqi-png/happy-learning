import Icon from './Icon.jsx'
import { getSubject } from '../../data/content.js'
import styles from './VideoCard.module.css'

// 视频卡片：缩略图（学科色渐变）+ 播放按钮 + 时长徽章 + 标题 + 已看标记 + ★收藏
export default function VideoCard({ video, watched = false, onPlay, favorited = false, onToggleFavorite }) {
  const subject = getSubject(video.subject)
  const color = subject?.color || 'var(--c-primary)'
  return (
    <article className={styles.card} style={{ '--accent': color }}>
      <div
        className={styles.thumb}
        style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 45%, #fff))` }}
      >
        <div className={styles.loop} aria-hidden="true" />
        <button className={styles.play} onClick={() => onPlay?.(video)} aria-label={`播放 ${video.title}`}>
          <Icon name="play" size={26} fill="currentColor" />
        </button>
        <button
          type="button"
          className={`${styles.fav} ${favorited ? styles.favOn : ''}`}
          onClick={() => onToggleFavorite?.()}
          aria-pressed={favorited}
          aria-label={favorited ? '取消收藏' : '收藏这个视频'}
          title={favorited ? '取消收藏' : '收藏这个视频'}
        >
          <Icon name="star" size={16} style={{ color: favorited ? '#fff' : 'rgba(255,255,255,0.9)', opacity: favorited ? 1 : 0.7 }} />
        </button>
        <span className={styles.duration}>{video.duration}</span>
        {watched && (
          <span className={styles.watched}>
            <Icon name="check" size={13} fill="currentColor" /> 已观看
          </span>
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.meta} style={{ color }}>{subject?.name}</span>
        <h3 className={styles.title}>{video.title}</h3>
      </div>
    </article>
  )
}
