import { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import { playSound } from '../../utils/sound.js'
import CelebrationLayer from './CelebrationLayer.jsx'
import Mascot from './Mascot.jsx'
import FunWatchers from './FunWatchers.jsx'

// 趣味层上下文：把“庆祝 / 音效 / 吉祥物心情 / 彩蛋”收敛到一个 Provider，
// 让任意业务组件都能用 useFun() 触发趣味反馈，而不必把这类 UI 噪声写进核心逻辑。
const FunContext = createContext(null)

const DEFAULT_MOOD = 'idle'

export function FunProvider({ children }) {
  const { state } = useApp()
  const [events, setEvents] = useState([]) // 庆祝事件队列（toast + 可选彩带）
  const [mood, setMoodState] = useState(DEFAULT_MOOD) // 吉祥物当前心情
  const [secretUnlocked, setSecretUnlocked] = useState(false) // 彩蛋徽章（一次性，不持久化）
  const idRef = useRef(0)
  const moodTimer = useRef(null)

  // 触发一次庆祝：右上角冒出 toast，confetti 为 true 时额外撒花。
  // 事件会在 duration 后自动移除，避免堆积。
  const celebrate = useCallback((opts = {}) => {
    const id = ++idRef.current
    const evt = {
      id,
      title: opts.title || '好棒！',
      // 图标统一走 Icon 图标库的键名（禁止 emoji 作功能图标，P0）
      icon: opts.icon || 'confetti',
      confetti: !!opts.confetti,
      tone: opts.tone || 'good', // good / warn
      duration: opts.confetti ? 2800 : 2200,
    }
    setEvents((prev) => [...prev, evt])
    setTimeout(() => {
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }, evt.duration)
  }, [])

  // 播放音效，但受家长“音效反馈”开关约束（开关关则不响）。
  const sound = useCallback(
    (type) => {
      if (state.parent?.sound) playSound(type)
    },
    [state.parent?.sound]
  )

  // 切换吉祥物心情；duration 毫秒后回到 idle（传 0 则保持）。
  const setMood = useCallback((next, duration = 1600) => {
    setMoodState(next)
    if (moodTimer.current) clearTimeout(moodTimer.current)
    if (duration > 0) {
      moodTimer.current = setTimeout(() => setMoodState(DEFAULT_MOOD), duration)
    }
  }, [])

  const unlockSecret = useCallback(() => setSecretUnlocked(true), [])

  const api = useMemo(
    () => ({ celebrate, sound, setMood, mood, secretUnlocked, unlockSecret }),
    [celebrate, sound, setMood, mood, secretUnlocked, unlockSecret]
  )

  // 把常驻的趣味 UI（吉祥物、庆祝层、副作用监听）挂在这里，
  // 这样它们天然出现在所有路由之上，业务页面无需逐个引入。
  return (
    <FunContext.Provider value={api}>
      {children}
      <FunWatchers />
      <Mascot mood={mood} />
      <CelebrationLayer events={events} />
    </FunContext.Provider>
  )
}

/**
 * 消费趣味层。必须在 <FunProvider> 内调用（FunProvider 已包在 AppProvider 内），
 * 否则抛错给出明确提示，避免拿到 null 后 `.celebrate` 报错。
 */
export function useFun() {
  const ctx = useContext(FunContext)
  if (!ctx) throw new Error('useFun 必须在 <FunProvider> 内使用')
  return ctx
}
