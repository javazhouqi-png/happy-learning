import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { useApp } from '../../state/AppContext.jsx'
import styles from './Gamification.module.css'

export default function Gamification() {
  const { derived } = useApp()
  const { level, points, levelProgress, levelStep, streakDays, badges, unlockedCount } = derived
  const remaining = levelStep - levelProgress

  return (
    <section className={`section ${styles.section}`} id="gamification">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="游戏化激励 · GAMIFIED"
          eyebrowIcon="trophy"
          color="var(--c-gamify)"
          title="学习像闯关，越玩越上瘾"
          subtitle="积分、徽章、连续打卡——用孩子喜欢的方式，把坚持变成习惯。"
        />

        <div className={styles.layout}>
          {/* 成长面板 */}
          <div className={styles.panel}>
            <div className={styles.profile}>
              <div className={styles.avatar}><Icon name="user" size={34} fill="currentColor" /></div>
              <div>
                <div className={styles.name}>小朋友</div>
                <span className={styles.levelPill}>Lv.{level}</span>
              </div>
            </div>

            <div className={styles.pointsBox}>
              <span className={styles.pointsNum}>{points}</span>
              <span className={styles.pointsUnit}>积分</span>
            </div>

            <ProgressBar value={Math.round((levelProgress / levelStep) * 100)} color="#fff" trackColor="rgba(255,255,255,0.28)" height={12} />
            <p className={styles.nextLevel}>距 Lv.{level + 1} 还差 {remaining} 积分</p>

            <div className={styles.streak}>
              <Icon name="flame" size={20} fill="currentColor" />
              连续学习 <strong>{streakDays}</strong> 天
            </div>
          </div>

          {/* 徽章墙 */}
          <div className={styles.wall}>
            <h3 className={styles.wallTitle}>
              成就徽章墙 <span className={styles.wallCount}>{unlockedCount} / {badges.length}</span>
            </h3>
            <div className={styles.badges}>
              {badges.map((b) => (
                <div key={b.id} className={`${styles.badge} ${b.unlocked ? '' : styles.locked}`} title={b.desc}>
                  <span
                    className={styles.badgeIcon}
                    style={b.unlocked ? { background: 'var(--c-gamify)', color: '#fff' } : { background: '#eef0f3', color: '#b6bcc6' }}
                  >
                    {b.unlocked ? <Icon name={b.icon} size={26} fill="currentColor" /> : <Icon name="lock" size={24} />}
                  </span>
                  <span className={styles.badgeName}>{b.name}</span>
                  {!b.unlocked && <span className={styles.badgeLock}>未获得</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
