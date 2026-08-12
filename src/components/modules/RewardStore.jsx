import { useApp } from '../../state/AppContext.jsx'
import { useFun } from '../fun/FunContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Button from '../ui/Button.jsx'
import { REWARDS } from '../../data/content.js'
import styles from './RewardStore.module.css'

// 积分奖励商店：把积分从“只赚不花”变成正向激励闭环（借鉴 math-for-piglets 存钱罐 /
// candy-learn-abacus 糖果花园）。所有奖励均为装饰性，不影响学习进度；已拥有或积分不足时
// 按钮禁用并给出明确状态，兑换成功用趣味层的庆祝与音效反馈。
export default function RewardStore() {
  const { state, actions } = useApp()
  const { celebrate, sound } = useFun()
  const owned = state.redeemedRewards || []
  const points = state.points

  const handleRedeem = (r) => {
    if (owned.includes(r.id) || points < r.cost) return
    actions.redeemReward(r.id, r.cost)
    celebrate({ title: `兑换成功：${r.name}！`, emoji: '🎁' })
    sound('ding')
  }

  return (
    <section className="section" id="rewards">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="奖励商店 · REWARD SHOP"
          eyebrowIcon="star"
          color="var(--c-gamify)"
          title="积分奖励商店"
          subtitle="用学习攒下的积分，兑换可爱的装饰奖励，把快乐学园变得更特别！"
        />

        <div className={styles.balance}>
          <Icon name="star" size={20} fill="currentColor" />
          <span>我的积分</span>
          <strong>{points}</strong>
        </div>

        <ul className={styles.grid}>
          {REWARDS.map((r) => {
            const isOwned = owned.includes(r.id)
            const canAfford = points >= r.cost
            return (
              <li
                key={r.id}
                className={`${styles.card} ${isOwned ? styles.owned : ''}`}
                style={{ '--accent': 'var(--c-gamify)' }}
              >
                <span className={styles.iconWrap}>
                  <Icon name={r.icon} size={30} fill="currentColor" />
                </span>
                <h3 className={styles.name}>{r.name}</h3>
                <p className={styles.desc}>{r.desc}</p>
                <div className={styles.cost}>
                  <Icon name="star" size={15} fill="currentColor" />
                  {r.cost}
                </div>
                {isOwned ? (
                  <span className={styles.ownedTag}>已拥有</span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => handleRedeem(r)}
                  >
                    {canAfford ? '兑换' : '积分不足'}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
