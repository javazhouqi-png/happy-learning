// 每日任务单域 reducer：按天生成任务、勾选完成。
// 生成逻辑在 data/dailyTasks.js 的纯函数 generateDailyTasks 中，这里只负责状态落地。
import type { AppState, AppAction } from '../types';

export function dailyTasksReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // 用新生成的每日任务单整体替换（跨天重置或首次生成）。
    case 'SET_DAILY_TASKS': {
      const tasks = action.tasks;
      if (!tasks || !Array.isArray(tasks.items)) return state;
      return { ...state, dailyTasks: tasks };
    }

    // 勾选 / 取消勾选某条任务（按稳定 id 幂等切换）。
    case 'TOGGLE_DAILY_TASK': {
      const { id } = action;
      const items = (state.dailyTasks.items || []).map((it) =>
        it.id === id ? { ...it, done: !it.done } : it
      );
      return { ...state, dailyTasks: { ...state.dailyTasks, items } };
    }

    default:
      return state;
  }
}
