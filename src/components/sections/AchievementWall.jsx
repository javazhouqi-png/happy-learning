import { useApp } from '../../state/AppContext.jsx'
import { useFun } from '../fun/FunContext.jsx'
import Icon from '../ui/Icon.jsx'
import styles from './AchievementWall.module.css'

// 隐藏彩蛋徽章：只有戳穿星宝的小秘密（点它 7 下）后才会显现，增加探索乐趣。
const SECRET_BADGE = {
  id: 'badge-secret',
  name: '神秘探索者',
  icon: 'sparkle',
  desc: '戳穿了星宝的小秘密',
}

// 勋章墙：把当前所有徽章展示成可收集的卡片。
// 已解锁的高亮 + 错落入场动画；未解锁显示锁与“解锁条件”，暗示下一步目标。
export default function AchievementWall() {
  const { derived } = useApp()
  const { secretUnlocked } = useFun()

  // 真实徽章已带 .unlocked 标记；彩蛋徽章在解锁后追加到末尾。
  const items = secretUnlocked ? [...derived.badges, SECRET_BADGE] : derived.badges

  return (
    <section className="section section--alt" id="badges">
      <div className="container section__inner">
        <div className={styles.head}>
          <h2 className={styles.title}>我的勋章墙</h2>
          <p className={styles.sub}>
            已收集 {derived.unlockedCount} / {items.length} 枚 · 继续闯关解锁更多！
          </p>
        </div>

        <ul className={styles.grid}>
          {items.map((b, i) => {
            const unlocked = b.id === SECRET_BADGE.id ? true : b.unlocked
            return (
              <li
                key={b.id}
                className={`${styles.card} ${unlocked ? styles.on : styles.off} reveal`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  className={styles.iconWrap}
                  style={{ '--badge': unlocked ? 'var(--c-gamify)' : 'var(--c-ink-faint)' }}
                >
                  <Icon name={unlocked ? b.icon : 'lock'} size={28} fill="currentColor" />
                </span>
                <h3 className={styles.name}>{b.name}</h3>
                <p className={styles.desc}>
                  {unlocked ? (
                    b.desc
                  ) : (
                    <>
                      <Icon name="lock" size={12} /> {b.desc}
                    </>
                  )}
                </p>
                {unlocked && <span className={styles.ribbon}>已获得</span>}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
