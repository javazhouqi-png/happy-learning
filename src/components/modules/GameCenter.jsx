import { useState, useRef } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import { useFun } from '../fun/FunContext.jsx'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Button from '../ui/Button.jsx'
import { MATCH_WORDS } from '../../data/content.js'
import styles from './GameCenter.module.css'

const REWARD = 20 // 每通关一次的积分奖励

// Fisher–Yates 洗牌：用 Math.random 打乱数组，返回新数组（不改原数组）。
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck() {
  const pairs = MATCH_WORDS.map((w, i) => ({ pairId: i, ...w }))
  return shuffle([...pairs, ...pairs]).map((c, i) => ({ ...c, idx: i }))
}

// 趣味游戏中心：零依赖的「记忆翻牌」小游戏。
// 仅负责挂载与计分回调——完成后经 AppContext.addPoints 加分，并复用 useFun 的庆祝 / 音效。
// 防刷：每局仅奖励一次（awardedRef 守卫）；动画时长尊重 prefers-reduced-motion（见 CSS）。
export default function GameCenter() {
  const { actions } = useApp()
  const { celebrate, sound } = useFun()
  const [cards, setCards] = useState(() => buildDeck())
  const [flipped, setFlipped] = useState([]) // 当前翻开的卡 idx
  const [matched, setMatched] = useState([]) // 已配对的 pairId 列表
  const [busy, setBusy] = useState(false) // 翻牌动画期间锁定输入
  const awardedRef = useRef(false)

  const finish = () => {
    if (awardedRef.current) return
    awardedRef.current = true
    actions.addPoints(REWARD, '记忆翻牌游戏')
    celebrate({ title: `闯关成功！+${REWARD} 积分`, emoji: '🎉', confetti: true })
    sound('fanfare')
  }

  const onCard = (idx) => {
    if (busy) return
    if (flipped.includes(idx)) return
    if (matched.includes(cards[idx].pairId)) return
    const next = [...flipped, idx]
    setFlipped(next)
    if (next.length === 2) {
      setBusy(true)
      const [a, b] = next
      const isMatch = cards[a].pairId === cards[b].pairId
      // 用 setTimeout 留出翻牌动画时间；reduced-motion 下动画被禁用但仍按逻辑判定。
      setTimeout(() => {
        if (isMatch) {
          const newMatched = [...matched, cards[a].pairId]
          setMatched(newMatched)
          sound('correct')
          if (newMatched.length === MATCH_WORDS.length) finish()
        } else {
          sound('wrong')
        }
        setFlipped([])
        setBusy(false)
      }, isMatch ? 350 : 700)
    }
  }

  const restart = () => {
    awardedRef.current = false
    setMatched([])
    setFlipped([])
    setBusy(false)
    setCards(buildDeck())
  }

  return (
    <section className="section section--alt" id="game">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="趣味游戏 · PLAY"
          eyebrowIcon="gamepad"
          color="var(--c-gamify)"
          title="记忆翻牌小游戏"
          subtitle="翻开两张相同的牌即可配对，全部配对成功就能获得积分奖励！"
        />

        <div className={styles.panel}>
          <div className={styles.bar}>
            <span className={styles.progress}>
              已配对 <strong>{matched.length}</strong> / {MATCH_WORDS.length}
            </span>
            <Button variant="soft" size="sm" onClick={restart}>重新开始</Button>
          </div>

          <div className={styles.board}>
            {cards.map((c) => {
              const isFlipped = flipped.includes(c.idx)
              const isMatched = matched.includes(c.pairId)
              const faceUp = isFlipped || isMatched
              return (
                <button
                  key={c.idx}
                  className={`${styles.card} ${faceUp ? styles.faceUp : ''} ${isMatched ? styles.matched : ''}`}
                  onClick={() => onCard(c.idx)}
                  disabled={busy || isMatched}
                  aria-label={faceUp ? `${c.word}` : '未翻开的牌'}
                >
                  <span className={styles.back}>?</span>
                  <span className={styles.front}>
                    <span className={styles.emoji}>{c.emoji}</span>
                    <span className={styles.word}>{c.word}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <p className={styles.tip}>小提示：先记住牌的位置，下一轮就能更快配对啦～</p>
        </div>
      </div>
    </section>
  )
}
