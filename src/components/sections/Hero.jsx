import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import Pill from '../ui/Pill.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { brand } from '../../data/content.js'
import styles from './Hero.module.css'

function Mascot() {
  return (
    <svg viewBox="0 0 200 200" className={styles.mascot} aria-label="快乐学园吉祥物" role="img">
      <defs>
        <radialGradient id="starG" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="100%" stopColor="#FFB020" />
        </radialGradient>
      </defs>
      <path
        d="M100 18l20 44 47 7-34 33 8 47-41-22-41 22 8-47L33 69l47-7 20-44z"
        fill="url(#starG)"
        stroke="#F59E0B"
        strokeWidth="3"
      />
      {/* 眼睛 */}
      <circle cx="80" cy="98" r="8" fill="#2D3142" />
      <circle cx="120" cy="98" r="8" fill="#2D3142" />
      <circle cx="83" cy="95" r="2.5" fill="#fff" />
      <circle cx="123" cy="95" r="2.5" fill="#fff" />
      {/* 腮红 */}
      <ellipse cx="68" cy="116" rx="9" ry="6" fill="#FF8FB1" opacity="0.85" />
      <ellipse cx="132" cy="116" rx="9" ry="6" fill="#FF8FB1" opacity="0.85" />
      {/* 微笑 */}
      <path d="M82 120q18 18 36 0" stroke="#2D3142" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function Hero() {
  const { setTab } = useApp()

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={styles.hero} id="top">
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <Pill icon="sparkle" color="var(--c-primary)">趣味学习新方式</Pill>
          <h1 className={styles.title}>
            快乐学习，
            <br />
            每天进步一点点
          </h1>
          <p className={styles.subtitle}>
            三科同步学、动画课堂、互动练习，让小朋友在游戏化旅程中爱上学习。
            积分、徽章、排行榜，越学越有动力。
          </p>
          <div className={styles.ctaRow}>
            <Button size="lg" onClick={() => scrollTo('subjects')}>
              免费开始学习
            </Button>
            <Button size="lg" variant="outline" icon={<Icon name="play" size={18} fill="currentColor" />}>
              观看介绍
            </Button>
          </div>
          <p className={styles.social}>{brand.socialProof}</p>
        </div>

        <div className={styles.visual}>
          <div className={styles.card}>
            <Mascot />
            <span className={styles.stickerStar}><Icon name="star" size={18} fill="currentColor" /></span>
            <span className={styles.stickerBadge}>+10 积分</span>
          </div>
        </div>
      </div>
    </section>
  )
}
