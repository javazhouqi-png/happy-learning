import { useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import styles from './PageHeader.module.css'

// 子页面通用页头：返回首页 + 标题/副标题，可选主题色与图标。
// 通过 --accent 注入主题色，使各页头与对应模块主色保持一致（如成长页用绿色、家长页用粉色）。
export default function PageHeader({ title, subtitle, icon, accent }) {
  const navigate = useNavigate()
  return (
    <header className={styles.head} style={accent ? { '--accent': accent } : undefined}>
      <button type="button" className={styles.back} onClick={() => navigate('/')}>
        <Icon name="chevronRight" size={18} className={styles.backIcon} />
        首页
      </button>
      <div className={styles.titleRow}>
        {icon && (
          <span className={styles.icon}>
            <Icon name={icon} size={26} fill="currentColor" />
          </span>
        )}
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.sub}>{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}
