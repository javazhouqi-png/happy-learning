import styles from './ProgressBar.module.css'

// 进度条：value 为 0-100；color 可直接传 CSS 变量（如 var(--c-chinese)）或任意颜色。
export default function ProgressBar({ value = 0, color = 'var(--c-primary)', height = 10, label, trackColor }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={styles.wrap}>
      {label && (
        <div className={styles.top}>
          <span>{label}</span>
          <span className={styles.pct}>{clamped}%</span>
        </div>
      )}
      <div
        className={styles.track}
        style={{ height, background: trackColor || 'var(--c-surface-2)' }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={styles.fill}
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
    </div>
  )
}
