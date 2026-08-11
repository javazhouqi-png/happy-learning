import { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { navItems, brand } from '../../data/content.js'
import styles from './Header.module.css'

// 导航锚点 → 区块 id 映射
const navTarget = {
  subjects: 'subjects',
  courses: 'videos',
  challenge: 'gamification',
  parents: 'parents'
}

export default function Header() {
  const { points, mobileNavOpen, toggleMobileNav, setTab } = useApp()
  const [bump, setBump] = useState(false)
  const prevPoints = useRef(points)

  // 积分变化时触发数字跳动动画（全局状态驱动）
  useEffect(() => {
    if (points !== prevPoints.current) {
      setBump(true)
      prevPoints.current = points
      const t = setTimeout(() => setBump(false), 600)
      return () => clearTimeout(t)
    }
  }, [points])

  const goTo = (id) => {
    const el = document.getElementById(navTarget[id] || id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    toggleMobileNav(false)
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <a className={styles.logo} href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <span className={styles.logoMark}><Icon name="star" size={22} fill="currentColor" /></span>
          <span className={styles.logoText}>{brand.name}</span>
        </a>

        <nav className={styles.nav} aria-label="主导航">
          {navItems.map((item) => (
            <button key={item.id} className={styles.navLink} onClick={() => goTo(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.actions}>
          <span className={`${styles.points} ${bump ? styles.bump : ''}`} title="我的积分">
            <Icon name="sparkle" size={16} fill="currentColor" />
            <span className={styles.pointsNum}>{points}</span>
          </span>
          <span className={styles.badgePill} title="我的徽章">
            <Icon name="medal" size={16} fill="currentColor" /> 4
          </span>
          <Button size="sm" className={styles.cta} onClick={() => goTo('subjects')}>
            开始学习
          </Button>
          <button
            className={styles.menuBtn}
            aria-label="菜单"
            aria-expanded={mobileNavOpen}
            onClick={() => toggleMobileNav(!mobileNavOpen)}
          >
            <Icon name={mobileNavOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </div>

      {/* 移动端抽屉 */}
      <div className={`${styles.drawer} ${mobileNavOpen ? styles.open : ''}`}>
        {navItems.map((item) => (
          <button key={item.id} className={styles.drawerLink} onClick={() => goTo(item.id)}>
            {item.label}
          </button>
        ))}
        <Button fullWidth onClick={() => { goTo('subjects'); setTab('home') }}>
          开始学习
        </Button>
      </div>
    </header>
  )
}
