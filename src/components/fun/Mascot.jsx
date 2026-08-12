import { useRef, useState } from 'react'
import { useFun } from './FunContext.jsx'
import { MASCOT_LINES } from '../../data/fun.js'
import styles from './Mascot.module.css'

// 学习伙伴「星宝」：悬浮在右下角的吉祥物。表情随学习事件切换（cheer/sad/dance），
// 点击它 7 次可触发隐藏彩蛋——解锁一枚“神秘探索者”徽章（见 AchievementWall）。
const FACE = {
  idle: '🙂',
  cheer: '😄',
  sad: '🥺',
  dance: '🤩',
  think: '🤔',
}

// 触发彩蛋所需的连续点击次数
const EGG_CLICKS = 7

export default function Mascot({ mood = 'idle' }) {
  const { setMood, celebrate, sound, unlockSecret, secretUnlocked } = useFun()
  const [bubble, setBubble] = useState(false)
  const [wiggle, setWiggle] = useState(false)
  const clicks = useRef(0)
  const clickTimer = useRef(null)

  const onClick = () => {
    // 点击时的小晃动，增加“可戳”的手感
    setWiggle(true)
    setTimeout(() => setWiggle(false), 500)

    // 2.5 秒内累计点击，超时清零，避免误触
    clicks.current += 1
    if (clickTimer.current) clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => {
      clicks.current = 0
    }, 2500)

    if (clicks.current >= EGG_CLICKS) {
      clicks.current = 0
      setMood('dance', 2600)
      celebrate({ title: '🥚 你发现了隐藏彩蛋！', emoji: '🎉', confetti: true })
      sound('egg')
      if (!secretUnlocked) unlockSecret()
      return
    }

    // 普通点击：冒一句符合当前心情的台词，活泼一点
    setBubble(true)
    setTimeout(() => setBubble(false), 1800)
  }

  const line = MASCOT_LINES[mood] || MASCOT_LINES.idle

  return (
    <button
      type="button"
      className={`${styles.mascot} ${wiggle ? styles.wiggle : ''}`}
      onClick={onClick}
      aria-label="学习伙伴 星宝"
      title="点我试试看～"
    >
      {bubble && <span className={styles.bubble}>{line}</span>}
      <span className={styles.face} aria-hidden="true">
        {FACE[mood] || FACE.idle}
      </span>
      <span className={styles.name}>星宝</span>
    </button>
  )
}
