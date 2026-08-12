import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import Hero from '../sections/Hero.jsx'
import SubjectModules from '../sections/SubjectModules.jsx'
import Gamification from '../sections/Gamification.jsx'
import ResponsiveShowcase from '../sections/ResponsiveShowcase.jsx'
import FinalCTA from '../sections/FinalCTA.jsx'
import styles from './Home.module.css'

// 首页改为「总览仪表盘」：核心入口（学科）+ 我的成长快照 + 五大功能区快捷导航。
// 原先堆叠的 16 个模块已拆分到独立菜单页（/learn /review /growth /play /parent），
// 首页只保留高频、轻量的内容，降低认知负担。
const QUICK = [
  { to: '/learn', label: '学习中心', desc: '学科与练习', icon: 'book', color: 'var(--c-primary)' },
  { to: '/review', label: '复习中心', desc: '打卡与错题', icon: 'check', color: 'var(--c-gamify)' },
  { to: '/growth', label: '成长中心', desc: '掌握度与徽章', icon: 'trophy', color: 'var(--c-english)' },
  { to: '/grade', label: '年级学习', desc: '分层学习路径', icon: 'book', color: 'var(--c-chinese)' },
  { to: '/play', label: '趣味乐园', desc: '动画与游戏', icon: 'star', color: 'var(--c-accent-yellow)' },
  { to: '/parent', label: '家长空间', desc: '时长与周报', icon: 'medal', color: 'var(--c-chinese)' },
]

export default function Home() {
  return (
    <>
      <Hero />
      <SubjectModules />
      <Gamification />

      <section className={`section ${styles.quick}`}>
        <div className="container">
          <h2 className={styles.title}>继续探索</h2>
          <div className={styles.grid}>
            {QUICK.map((q) => (
              <Link key={q.to} to={q.to} className={styles.card}>
                <span className={styles.icon} style={{ background: q.color }}>
                  <Icon name={q.icon} size={24} fill="currentColor" />
                </span>
                <span>
                  <span className={styles.cardTitle}>{q.label}</span>
                  <span className={styles.cardDesc}>{q.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ResponsiveShowcase />
      <FinalCTA />
    </>
  )
}
