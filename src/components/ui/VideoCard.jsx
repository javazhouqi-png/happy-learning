import Icon from './Icon.jsx'
import styles from './VideoCard.module.css'

// 视频卡片：缩略图（渐变占位）+ 播放按钮 + 时长徽章 + 标题
export default function VideoCard({ video, onPlay }) {
  const { title, meta, duration, colorVar } = video
  const color = `var(${colorVar})`
  return (
    <article className={styles.card}>
      <div
        className={styles.thumb}
        style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 45%, #fff))` }}
      >
        <button className={styles.play} style={{ '--accent': color }} onClick={() => onPlay?.(video)} aria-label={`播放 ${title}`}>
          <Icon name="play" size={26} fill="currentColor" />
        </button>
        <span className={styles.duration}>{duration}</span>
      </div>
      <div className={styles.body}>
        <span className={styles.meta} style={{ color }}>{meta}</span>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </article>
  )
}
