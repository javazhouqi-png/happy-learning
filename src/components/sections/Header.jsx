import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { useFun } from '../fun/FunContext.jsx'
import { pickRandom, EGG_MESSAGES } from '../../data/fun.js'
import { brand } from '../../data/content.js'
import styles from './Header.module.css'

// 主导航：6 个独立菜单，按业务类别拆分（学习 / 复习 / 成长 / 乐园 / 家长）。
// 全部为路由跳转，不再依赖首页锚点；当前路由高亮，移动端折叠为抽屉。
const NAV = [
  { id: 'home', label: '首页', route: '/' },
  { id: 'learn', label: '学习', route: '/learn' },
  { id: 'review', label: '复习', route: '/review' },
  { id: 'growth', label: '成长', route: '/growth' },
  { id: 'grade', label: '年级', route: '/grade' },
  { id: 'play', label: '乐园', route: '/play' },
  { id: 'parent', label: '家长', route: '/parent' },
]

// 判断导航项是否处于激活态：首页需精确匹配，其余按前缀匹配（如 /learn/chinese 仍高亮“学习”）。
const isActive = (item, pathname) =>
  item.route === '/' ? pathname === '/' : pathname.startsWith(item.route)

export default function Header() {
  const { derived } = useApp()
  const { celebrate, setMood } = useFun()
  const navigate = useNavigate()
  const location = useLocation()
  const [bump, setBump] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const prevPoints = useRef(derived.points)
  const logoClicks = useRef(0)
  const logoTimer = useRef(null)

  // logo 彩蛋：2 秒内连点 5 次触发撒花庆祝（不影响正常跳转首页）。
  const onLogoEgg = () => {
    logoClicks.current += 1
    if (logoTimer.current) clearTimeout(logoTimer.current)
    logoTimer.current = setTimeout(() => {
      logoClicks.current = 0
    }, 2000)
    if (logoClicks.current >= 5) {
      logoClicks.current = 0
      celebrate({ title: pickRandom(EGG_MESSAGES), emoji: '🎉', confetti: true })
      setMood('dance', 2000)
    }
  }

  useEffect(() => {
    if (derived.points !== prevPoints.current) {
      setBump(true)
      prevPoints.current = derived.points
      const t = setTimeout(() => setBump(false), 600)
      return () => clearTimeout(t)
    }
  }, [derived.points])

  const handleNav = (item) => {
    setMobileOpen(false)
    navigate(item.route)
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link
          to="/"
          className={styles.logo}
          onClick={(e) => {
            setMobileOpen(false)
            onLogoEgg()
          }}
        >
          <span className={styles.logoMark}>
            <Icon name="star" size={22} fill="currentColor" />
          </span>
          <span className={styles.logoText}>{brand.name}</span>
        </Link>

        <nav className={styles.nav} aria-label="主导航">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`${styles.navLink} ${isActive(item, location.pathname) ? styles.navLinkActive : ''}`}
              onClick={() => handleNav(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.actions}>
          <span className={`${styles.points} ${bump ? styles.bump : ''}`} title="我的积分">
            <Icon name="sparkle" size={16} fill="currentColor" />
            <span className={styles.pointsNum}>{derived.points}</span>
          </span>
          <span className={styles.badgePill} title="已获得徽章">
            <Icon name="medal" size={16} fill="currentColor" /> {derived.unlockedCount}
          </span>
          <Link to="/learn">
            <Button size="sm" className={styles.cta}>
              开始学习
            </Button>
          </Link>
          <button
            className={styles.menuBtn}
            aria-label="菜单"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </div>

      <div className={`${styles.drawer} ${mobileOpen ? styles.open : ''}`}>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`${styles.drawerLink} ${isActive(item, location.pathname) ? styles.drawerLinkActive : ''}`}
            onClick={() => handleNav(item)}
          >
            {item.label}
          </button>
        ))}
        <Link to="/learn" onClick={() => setMobileOpen(false)}>
          <Button fullWidth>开始学习</Button>
        </Link>
      </div>
    </header>
  )
}
