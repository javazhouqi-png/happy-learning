// 档案域 reducer：导入快照（HYDRATE）、重置（RESET）。
import type { AppState, AppAction } from '../types';
import { defaultState, migrate } from '../storage';

export function profileReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // 导入档案：用经过校验的快照替换当前状态；缺字段由 migrate 回填，绝不整体丢弃。
    case 'HYDRATE':
      return migrate(action.next || {});

    // 重置全部进度：回到默认。用户主动触发，用于换账号或重新开始。
    case 'RESET':
      return defaultState();

    default:
      return state;
  }
}
