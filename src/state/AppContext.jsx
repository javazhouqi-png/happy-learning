import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { reducer } from './reducer';
import { loadState, saveState } from './storage';
import { computeDerived } from './selectors';

// 对外暴露积分规则（部分组件/测试可能需要）。
export { POINTS } from './constants';

// 状态上下文：仅承载 { state, derived }。state 变化时才重建引用，
// 仅消费状态的组件随其更新；与动作上下文隔离，互不影响重渲染范围。
const AppStateContext = createContext(null);

// 动作上下文：稳定的 actions 引用（useMemo([])），仅消费动作的组件
// （如纯按钮、趣味回调）不因 state 变化而重渲染。
const AppActionsContext = createContext(null);

/* ----------------------------- Provider ----------------------------- */

export function AppProvider({ children }) {
  // 惰性初始化：用 loadState 作为 initializer，仅在挂载时读取一次存储。
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // 任意状态变化即写回本地存储；隐私模式 / 配额超限等写入失败静默忽略，不影响使用。
  useEffect(() => {
    saveState(state);
  }, [state]);

  // 派生数据：由 state 计算等级、徽章、掌握度等，抽为纯函数 computeDerived 便于测试与按需 memo。
  const derived = useMemo(() => computeDerived(state), [state]);

  // 动作集合：用稳定的函数引用派发，组件无需关心 action 形状。
  const actions = useMemo(
    () => ({
      completeLesson: (lessonId, subjectId, durationMin) =>
        dispatch({ type: 'COMPLETE_LESSON', lessonId, subjectId, durationMin }),
      answerQuiz: (subjectId, correct, total, opts = {}) =>
        dispatch({
          type: 'ANSWER_QUIZ',
          subjectId,
          correct,
          total,
          wrongIds: opts.wrongIds,
          correctIds: opts.correctIds,
          wrongEntries: opts.wrongEntries,
        }),
      watchVideo: (videoId, durationSec, subjectId) =>
        dispatch({ type: 'WATCH_VIDEO', videoId, durationSec, subjectId }),
      recordStudy: (seconds) => dispatch({ type: 'RECORD_STUDY', seconds }),
      updateParent: (patch) => dispatch({ type: 'UPDATE_PARENT', patch }),
      clearWrong: (subjectId) => dispatch({ type: 'CLEAR_WRONG', subjectId }),
      setGrade: (grade) => dispatch({ type: 'SET_GRADE', grade }),
      setMinorMode: (on) => dispatch({ type: 'SET_MINOR_MODE', on }),
      setParentPin: (pin) => dispatch({ type: 'SET_PARENT_PIN', pin }),
      hydrate: (next) => dispatch({ type: 'HYDRATE', next }),
      addPoints: (amount, reason) => dispatch({ type: 'ADD_POINTS', amount, reason }),
      redeemReward: (id, cost) => dispatch({ type: 'REDEEM_REWARD', id, cost }),
      recordReview: (subjectId, allCorrect) => dispatch({ type: 'RECORD_REVIEW', subjectId, allCorrect }),
      markTextRead: (key) => dispatch({ type: 'MARK_TEXT_READ', key }),
      markTextRecite: (key) => dispatch({ type: 'MARK_TEXT_RECITE', key }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    []
  );

  return (
    <AppStateContext.Provider value={{ state, derived }}>
      <AppActionsContext.Provider value={actions}>{children}</AppActionsContext.Provider>
    </AppStateContext.Provider>
  );
}

/**
 * 兼容层：一次性返回 { state, derived, actions }，保持现有 40+ 调用点不变。
 * 内部从两个独立 context 取值；渐进迁移时可改用 useAppState()/useAppActions()。
 * 必须在 <AppProvider> 内调用，否则抛错给出明确提示。
 */
export function useApp() {
  const stateCtx = useContext(AppStateContext);
  const actions = useContext(AppActionsContext);
  if (!stateCtx) throw new Error('useApp 必须在 <AppProvider> 内使用');
  return { state: stateCtx.state, derived: stateCtx.derived, actions };
}

/** 渐进迁移：仅消费状态（{ state, derived }），不因动作变化重渲染。 */
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState 必须在 <AppProvider> 内使用');
  return ctx;
}

/** 渐进迁移：仅消费动作（稳定引用），不因 state 变化重渲染。 */
export function useAppActions() {
  const actions = useContext(AppActionsContext);
  if (!actions) throw new Error('useAppActions 必须在 <AppProvider> 内使用');
  return actions;
}
