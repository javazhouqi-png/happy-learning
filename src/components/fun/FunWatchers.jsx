import { useEffect, useRef } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import { useFun } from './FunContext.jsx'
import { pickRandom, LEVEL_UP, BADGE_UNLOCK } from '../../data/fun.js'

// 副作用监听：盯着派生数据，在“升级 / 解锁新徽章 / 连续打卡”发生时自动撒花 + 音效。
// 纯展示用途、不修改任何状态，因此绝不会干扰核心业务逻辑。
export default function FunWatchers() {
  const { derived } = useApp()
  const { celebrate, sound } = useFun()

  const prevLevel = useRef(derived.level)
  const prevBadges = useRef(derived.unlockedCount)
  const prevStreak = useRef(derived.streakDays)

  // 等级提升
  useEffect(() => {
    if (derived.level > prevLevel.current) {
      celebrate({ title: pickRandom(LEVEL_UP), emoji: '🚀', confetti: true })
      sound('levelup')
    }
    prevLevel.current = derived.level
  }, [derived.level, celebrate, sound])

  // 解锁新徽章
  useEffect(() => {
    if (derived.unlockedCount > prevBadges.current) {
      celebrate({ title: pickRandom(BADGE_UNLOCK), emoji: '🏅', confetti: true })
      sound('fanfare')
    }
    prevBadges.current = derived.unlockedCount
  }, [derived.unlockedCount, celebrate, sound])

  // 连续学习打卡（至少 2 天才庆祝，避免首日误触）
  useEffect(() => {
    if (derived.streakDays > prevStreak.current && derived.streakDays >= 2) {
      celebrate({ title: `连续学习 ${derived.streakDays} 天，坚持就是胜利！🔥`, emoji: '🔥' })
      sound('fanfare')
    }
    prevStreak.current = derived.streakDays
  }, [derived.streakDays, celebrate, sound])

  return null
}
