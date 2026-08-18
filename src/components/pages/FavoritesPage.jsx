import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { getSubject } from '../../data/content.js'
import styles from './FavoritesPage.module.css'

// 各收藏类型的中文名与跳转入口：收藏是“快捷入口”，点击★即可收藏、再次点击取消，
// 跳转仅定位到对应板块（精准定位单篇课文/单题超出本批范围）。
const KIND_META = {
  text: { label: '课文', to: '/textbook', color: 'var(--c-chinese)' },
  poem: { label: '古诗', to: '/grade', color: 'var(--c-english)' },
  wrong: { label: '错题', to: '/review', color: 'var(--c-math)' },
  video: { label: '动画', to: '/videos', color: 'var(--c-gamify)' },
}
const KIND_ORDER = ['text', 'poem', 'wrong', 'video']

export default function FavoritesPage() {
  const { state, actions } = useApp()
  const favorites = state.favorites || []

  return (
    <div className="container">
      <header className={styles.head}>
        <span className={styles.headIcon}><Icon name="star" size={30} fill="currentColor" /></span>
        <div>
          <h1 className={styles.headTitle}>我的收藏</h1>
          <p className={styles.headSub}>把喜欢的课文、动画、错题收进来，随时回来复习～</p>
        </div>
      </header>

      {favorites.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="star" size={42} className={styles.emptyIcon} />
          <p>还没有收藏哦～</p>
          <p className={styles.emptyHint}>在课文、动画或错题旁点击 <Icon name="star" size={14} style={{ color: 'var(--c-warn)' }} /> 就能收进来。</p>
          <Link to="/learn"><Button variant="outline">去学习 →</Button></Link>
        </div>
      ) : (
        KIND_ORDER.map((kind) => {
          const items = favorites.filter((f) => f.kind === kind)
          if (items.length === 0) return null
          const meta = KIND_META[kind]
          return (
            <section key={kind} className={styles.group}>
              <div className={styles.groupHead} style={{ '--accent': meta.color }}>
                <Icon name="star" size={16} fill="currentColor" />
                <h2 className={styles.groupTitle}>{meta.label}</h2>
                <span className={styles.groupCount}>{items.length}</span>
              </div>
              <ul className={styles.list}>
                {items.map((f) => (
                  <li key={`${f.kind}:${f.key}`} className={styles.item} style={{ '--accent': meta.color }}>
                    <span className={styles.itemStar}><Icon name="star" size={16} fill="currentColor" /></span>
                    <div className={styles.itemBody}>
                      <div className={styles.itemTitle}>{f.title}</div>
                      <div className={styles.itemMeta}>
                        {f.subject && <span>{getSubject(f.subject)?.name || f.subject}</span>}
                        {typeof f.grade === 'number' && <span>{f.grade} 年级</span>}
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <Link to={meta.to} className={styles.goLink}>前往</Link>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => actions.toggleFavorite(f)}
                        aria-label={`取消收藏 ${f.title}`}
                      >
                        取消
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}
    </div>
  )
}
