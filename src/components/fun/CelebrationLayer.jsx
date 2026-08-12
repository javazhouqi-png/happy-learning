import { useMemo } from 'react'
import styles from './CelebrationLayer.module.css'

// 彩带碎片：固定数量，随机位置/颜色/动画延迟/时长，营造漫天撒花。
// 仅在出现 confetti 事件时整体挂载一次，事件消失即卸载。
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const colors = ['#4d96ff', '#ff6b9d', '#ff9f45', '#3dca6e', '#7a5cff', '#ffb020']
        return {
          id: i,
          left: Math.random() * 100,
          bg: colors[i % colors.length],
          delay: Math.random() * 0.5,
          dur: 2 + Math.random() * 1.2,
          rot: Math.random() * 360,
          size: 7 + Math.random() * 6,
        }
      }),
    []
  )
  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={styles.piece}
          style={{
            left: `${p.left}%`,
            background: p.bg,
            width: `${p.size}px`,
            height: `${p.size * 0.5}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  )
}

// 庆祝层：固定全屏、不拦截点击。上半部分悬浮 toast，需要时在底层铺一层彩带。
export default function CelebrationLayer({ events }) {
  const hasConfetti = events.some((e) => e.confetti)
  return (
    <div className={styles.layer} aria-live="polite">
      {hasConfetti && <Confetti />}
      {events.map((e) => (
        <div
          key={e.id}
          className={`${styles.toast} ${e.confetti ? styles.big : ''} ${e.tone === 'warn' ? styles.warn : ''}`}
        >
          <span className={styles.emoji}>{e.emoji}</span>
          <span className={styles.title}>{e.title}</span>
        </div>
      ))}
    </div>
  )
}
