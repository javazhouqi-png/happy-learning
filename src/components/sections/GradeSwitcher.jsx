import Icon from '../ui/Icon.jsx'
import { GRADES } from '../../data/grade.js'
import styles from './GradeSwitcher.module.css'

// 年级切换控件：常驻于学科页内（不放全局顶栏，避免低龄误触）。
// 仅派发 SET_GRADE，不清除任何学习数据（错题 / 掌握度按年级独立保留）。
export default function GradeSwitcher({ value, onChange }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>当前年级</span>
      <div className={styles.seg} role="group" aria-label="切换年级">
        {GRADES.map((g) => (
          <button
            key={g}
            type="button"
            className={`${styles.item} ${g === value ? styles.active : ''}`}
            aria-pressed={g === value}
            onClick={() => onChange(g)}
          >
            {g} 年级
          </button>
        ))}
      </div>
      <Icon name="chevronRight" size={14} className={styles.hint} />
    </div>
  )
}
