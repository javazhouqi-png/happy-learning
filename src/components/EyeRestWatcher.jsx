import { useEffect, useRef } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { useFun } from './fun/FunContext.jsx'

// 护眼提醒：家长开启“护眼提醒”后，当日累计学习每满 20 分钟，弹出一次温和提醒。
// 复用趣味层的 celebrate（tone=warn）做非阻断提示；不引入新状态字段——
// 阈值计数用 ref 跟踪，跨天（todayDate 变化）自动清零。
const EYE_REST_INTERVAL = 20 * 60 // 20 分钟（秒）

export default function EyeRestWatcher() {
  const { state } = useApp()
  const { celebrate } = useFun()
  const lastNotified = useRef(0) // 已提醒到的 20 分钟阈值序号
  const prevDate = useRef(state.todayDate)
  const prevEyeRest = useRef(state.parent.eyeRest)

  // 累计学习时长跨越阈值时提醒一次。
  useEffect(() => {
    if (!state.parent.eyeRest) return
    const count = Math.floor(state.todayStudySec / EYE_REST_INTERVAL)
    if (count > lastNotified.current) {
      lastNotified.current = count
      celebrate({
        title: '学习满 20 分钟啦，看看远处休息一下吧～',
        icon: 'bulb',
        tone: 'warn',
      })
    }
  }, [state.todayStudySec, state.parent.eyeRest, celebrate])

  // 刚开启护眼提醒时，把已累计时长对应的阈值视作“已提醒”，避免立即弹出。
  useEffect(() => {
    if (state.parent.eyeRest && !prevEyeRest.current) {
      lastNotified.current = Math.floor(state.todayStudySec / EYE_REST_INTERVAL)
    }
    prevEyeRest.current = state.parent.eyeRest
  }, [state.parent.eyeRest, state.todayStudySec])

  // 跨天重置计数，避免次日仍沿用昨天的阈值。
  useEffect(() => {
    if (state.todayDate !== prevDate.current) {
      prevDate.current = state.todayDate
      lastNotified.current = 0
    }
  }, [state.todayDate])

  return null
}
