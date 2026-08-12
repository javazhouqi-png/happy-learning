import { useState } from 'react'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { SUBJECTS, brand } from '../../data/content.js'
import styles from './ResponsiveShowcase.module.css'

const tabs = [
  { id: 'home', label: '首页', icon: 'home' },
  { id: 'learn', label: '学习', icon: 'book' },
  { id: 'game', label: '游戏', icon: 'gamepad' },
  { id: 'me', label: '我的', icon: 'user' },
]

const points = [
  { icon: 'sparkle', text: '同一套组件，桌面 / 移动端自动适配' },
  { icon: 'check', text: '移动端独立导航抽屉与底部 Tab' },
  { icon: 'shield', text: '触控友好，按钮与点击区域足够大' },
]

export default function ResponsiveShowcase() {
  const { derived } = useApp()
  const [activeTab, setActiveTab] = useState('learn')

  return (
    <section className={`section ${styles.section}`}>
      <div className="container section__inner">
        <SectionHeading
          eyebrow="响应式设计 · RESPONSIVE"
          eyebrowIcon="sparkle"
          color="var(--c-gamify)"
          title="桌面手机都好用"
          subtitle="基于弹性栅格与断点，页面在任意尺寸下都清晰、流畅、易操作。"
        />

        <div className={styles.layout}>
          <ul className={styles.points}>
            {points.map((p) => (
              <li key={p.text} className={styles.point}>
                <span className={styles.pointIcon}><Icon name={p.icon} size={18} fill="currentColor" /></span>
                {p.text}
              </li>
            ))}
          </ul>

          {/* 手机样机 */}
          <div className={styles.phone}>
            <div className={styles.screen}>
              <div className={styles.statusBar}>
                <span>9:41</span>
                <span className={styles.battery}><Icon name="sparkle" size={12} fill="currentColor" /></span>
              </div>

              <div className={styles.appHeader}>
                <span className={styles.appLogo}><Icon name="star" size={18} fill="currentColor" /></span>
                <span className={styles.appName}>{brand.name}</span>
                <span className={styles.appPoints}><Icon name="sparkle" size={13} fill="currentColor" /> {derived.points}</span>
              </div>

              <div className={styles.taskCard}>
                <span className={styles.taskLabel}>今日任务</span>
                <p className={styles.taskText}>还有 3 项待完成，加油！</p>
                <Button size="sm" variant="primary">开始学习</Button>
              </div>

              <div className={styles.subjects}>
                <span className={styles.subjectsTitle}>我的学科</span>
                {SUBJECTS.map((s) => (
                  <div key={s.id} className={styles.subjectRow}>
                    <span className={styles.subjectIcon} style={{ background: s.color }}>
                      <Icon name={s.icon} size={16} fill="currentColor" />
                    </span>
                    <span className={styles.subjectName}>{s.name}</span>
                    <Icon name="chevronRight" size={18} className={styles.chevron} />
                  </div>
                ))}
              </div>

              <nav className={styles.tabBar}>
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    <Icon name={t.icon} size={20} fill={activeTab === t.id ? 'currentColor' : 'none'} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
