import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { useFun } from '../fun/FunContext.jsx'
import { pickRandom, EGG_MESSAGES } from '../../data/fun.js'
import { brand } from '../../data/content.js'
import styles from './Header.module.css'

// 导航项：锚点滚动到首页区块，或跳转到独立路由
const NAV = [
  { id: 'subjects', label: '学科' },
  { id: 'practice', label: '练习' },
  { id: 'videos', label: '动画', route: '/videos' },
  { id: 'parent', label: '家长' },
]

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

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleNav = (item) => {
    setMobileOpen(false)
    if (item.route) {
      navigate(item.route)
      return
    }
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => scrollTo(item.id), 80)
    } else {
      scrollTo(item.id)
    }
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
            <button key={item.id} className={styles.navLink} onClick={() => handleNav(item)}>
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
          <Link to="/learn/chinese">
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
          <button key={item.id} className={styles.drawerLink} onClick={() => handleNav(item)}>
            {item.label}
          </button>
        ))}
        <Link to="/learn/chinese" onClick={() => setMobileOpen(false)}>
          <Button fullWidth>开始学习</Button>
        </Link>
      </div>
    </header>
  )
}
