import Icon from './Icon.jsx'
import Button from './Button.jsx'
import ProgressBar from './ProgressBar.jsx'
import { getLessons } from '../../data/content.js'
import styles from './SubjectCard.module.css'

// 学科卡片：图标 + 名称 + 描述 + 实时学习进度 + 进入按钮
export default function SubjectCard({ subject, progress = 0, onEnter }) {
  const { id, name, color, icon, desc } = subject
  const lessons = getLessons(id).length
  return (
    <article className={styles.card} style={{ '--accent': color }}>
      <div className={styles.iconBox}>
        <Icon name={icon} size={30} fill="currentColor" />
      </div>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.desc}>{desc}</p>

      <ProgressBar value={progress} color={color} label="掌握度" />

      <div className={styles.footer}>
        <span className={styles.lessons}>
          <Icon name="book" size={15} strokeWidth={2} /> {lessons} 节课
        </span>
        <Button variant="outline" size="sm" onClick={() => onEnter?.(subject)}>
          进入学习
        </Button>
      </div>
    </article>
  )
}
