import Icon from './Icon.jsx'
import styles from './Pill.module.css'

// 小标签 / Eyebrow：用于区块标题上方的小徽章
export default function Pill({ children, icon, color = 'var(--c-primary)', soft = true }) {
  return (
    <span
      className={`${styles.pill} ${soft ? styles.soft : ''}`}
      style={soft ? { background: `color-mix(in srgb, ${color} 14%, #fff)`, color } : { background: color, color: '#fff' }}
    >
      {icon && <Icon name={icon} size={15} fill="currentColor" />}
      {children}
    </span>
  )
}
