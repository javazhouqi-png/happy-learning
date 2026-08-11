import Pill from './Pill.jsx'
import styles from './SectionHeading.module.css'

// 区块标题：eyebrow 小标签 + 主标题 + 副标题，左对齐，统一节奏
export default function SectionHeading({ eyebrow, eyebrowIcon, title, subtitle, align = 'left', color = 'var(--c-primary)' }) {
  return (
    <header
      className={`${styles.head} ${align === 'center' ? styles.center : ''}`}
    >
      {eyebrow && <Pill icon={eyebrowIcon} color={color}>{eyebrow}</Pill>}
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  )
}
