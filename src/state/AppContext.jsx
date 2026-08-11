import { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { initialAppState } from '../data/content.js'

const AppContext = createContext(null)

// 集中式状态管理：用 useReducer 统一处理交互动作，
// 组件通过 hooks 读取状态、派发动作，避免 prop 透传。
function reducer(state, action) {
  switch (action.type) {
    case 'SELECT_ANSWER':
      // 已作答后不允许再次选择
      if (state.exercise.answered) return state
      return { ...state, exercise: { ...state.exercise, selected: action.label } }

    case 'CHECK_ANSWER': {
      if (state.exercise.answered || !state.exercise.selected) return state
      const correct = state.exercise.correctLabel === state.exercise.selected
      return {
        ...state,
        exercise: { ...state.exercise, answered: true, correct },
        points: correct ? state.points + state.exercise.reward : state.points
      }
    }

    case 'RESET_EXERCISE':
      return {
        ...state,
        exercise: { ...state.exercise, selected: null, answered: false, correct: false }
      }

    case 'TOGGLE_GUARD':
      return {
        ...state,
        timeGuards: { ...state.timeGuards, [action.key]: !state.timeGuards[action.key] }
      }

    case 'SET_TAB':
      return { ...state, activeTab: action.tab }

    case 'TOGGLE_MOBILE_NAV':
      return { ...state, mobileNavOpen: action.open }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialAppState)

  const selectAnswer = useCallback((label) => dispatch({ type: 'SELECT_ANSWER', label }), [])
  const checkAnswer = useCallback(() => dispatch({ type: 'CHECK_ANSWER' }), [])
  const resetExercise = useCallback(() => dispatch({ type: 'RESET_EXERCISE' }), [])
  const toggleGuard = useCallback((key) => dispatch({ type: 'TOGGLE_GUARD', key }), [])
  const setTab = useCallback((tab) => dispatch({ type: 'SET_TAB', tab }), [])
  const toggleMobileNav = useCallback((open) => dispatch({ type: 'TOGGLE_MOBILE_NAV', open }), [])

  const value = useMemo(
    () => ({
      ...state,
      selectAnswer,
      checkAnswer,
      resetExercise,
      toggleGuard,
      setTab,
      toggleMobileNav
    }),
    [state, selectAnswer, checkAnswer, resetExercise, toggleGuard, setTab, toggleMobileNav]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// 业务 Hook：任何组件都能安全获取全局状态与动作
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp 必须在 <AppProvider> 内部使用')
  return ctx
}
