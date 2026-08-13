import { useApp } from '../../state/AppContext.jsx'
import { useFun } from '../fun/FunContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import { REWARDS } from '../../data/content.js'
import styles from './CollectionAlbum.module.css'

// 隐藏彩蛋徽章：与勋章墙保持一致，戳穿星宝小秘密后出现。
const SECRET_BADGE = {
  id: 'badge-secret',
  name: '神秘探索者',
  icon: 'sparkle',
  desc: '戳穿了星宝的小秘密',
}

// 魔法花园：用一株随收集数量长大的小盆栽做可视化（借鉴 candy-learn-abacus 的“神奇花园”思路），
// 收集越多，枝叶越茂盛，给低龄用户直观的“我在进步”的正反馈。纯展示，无状态写入。
function MagicGarden({ count, total }) {
  // 0~1 的成长比例，驱动叶子大小与花朵显隐。
  const ratio = total ? Math.min(1, count / total) : 0
  const leafScale = 0.5 + ratio * 0.8
  const bloomed = count >= 3
  return (
    <svg className={styles.garden} viewBox="0 0 120 120" role="img" aria-label={`已收集 ${count} / ${total}`}>
      <ellipse cx="60" cy="108" rx="34" ry="7" fill="var(--c-line)" opacity="0.5" />
      {/* 花盆 */}
      <path d="M44 86h32l-4 18a6 6 0 01-6 5H54a6 6 0 01-6-5z" fill="var(--c-accent-yellow)" />
      {/* 茎 */}
      <rect x="58" y="56" width="4" height="34" rx="2" fill="var(--garden-leaf-1)" />
      {/* 叶（随成长放大） */}
      <g style={{ transformOrigin: '60px 80px', transform: `scale(${leafScale})` }}>
        <path d="M60 78C44 74 36 60 40 50c14 2 24 14 20 28z" fill="var(--garden-leaf-2)" />
        <path d="M60 78c16-4 24-18 20-28C66 52 56 64 60 78z" fill="var(--garden-leaf-3)" />
      </g>
      {/* 花（收集足够多才绽放） */}
      {bloomed && (
        <g className={styles.bloom}>
          <circle cx="60" cy="48" r="9" fill="var(--c-gamify)" />
          <circle cx="60" cy="48" r="4" fill="#fff" />
        </g>
      )}
    </svg>
  )
}

// 贴纸收藏册：把所有徽章与已兑换奖励以“贴纸”形式好玩地陈列（借鉴 candy-learn-abacus 贴纸收集册）。
// 只读现有 badge / reward 状态，零状态写入；与“勋章墙”互补——墙是正式成就列表，册是趣味收集。
export default function CollectionAlbum() {
  const { state, derived } = useApp()
  const { secretUnlocked } = useFun()

  const badgeItems = secretUnlocked ? [...derived.badges, SECRET_BADGE] : derived.badges
  const ownedRewards = (state.redeemedRewards || [])
    .map((id) => REWARDS.find((r) => r.id === id))
    .filter(Boolean)

  return (
    <section className="section section--alt" id="album">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="贴纸收藏册 · STICKER ALBUM"
          eyebrowIcon="heart"
          color="var(--c-accent-yellow)"
          title="我的贴纸收藏册"
          subtitle="每解锁一枚徽章、兑换一份奖励，都会变成这里的可爱贴纸，慢慢贴满整本册子！"
        />

        <div className={styles.gardenWrap}>
          <MagicGarden count={derived.unlockedCount} total={badgeItems.length} />
          <p className={styles.gardenText}>
            已收集 <strong>{derived.unlockedCount}</strong> / {badgeItems.length} 枚徽章贴纸
          </p>
        </div>

        <h3 className={styles.groupTitle}>徽章贴纸</h3>
        <ul className={styles.grid}>
          {badgeItems.map((b) => {
            const unlocked = b.id === SECRET_BADGE.id ? true : b.unlocked
            return (
              <li
                key={b.id}
                className={`${styles.sticker} ${unlocked ? styles.on : styles.off}`}
                title={b.desc}
              >
                <span className={styles.stickerIcon}>
                  <Icon name={unlocked ? b.icon : 'lock'} size={26} fill="currentColor" />
                </span>
                <span className={styles.stickerName}>{b.name}</span>
              </li>
            )
          })}
        </ul>

        <h3 className={styles.groupTitle}>专属奖励贴纸</h3>
        {ownedRewards.length === 0 ? (
          <p className={styles.empty}>还没有兑换奖励～去奖励商店用积分换一份吧！</p>
        ) : (
          <ul className={styles.grid}>
            {ownedRewards.map((r) => (
              <li key={r.id} className={`${styles.sticker} ${styles.on}`} title={r.desc}>
                <span className={styles.stickerIcon}>
                  <Icon name={r.icon} size={26} fill="currentColor" />
                </span>
                <span className={styles.stickerName}>{r.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
