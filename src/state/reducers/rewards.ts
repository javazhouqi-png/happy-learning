// 趣味激励域 reducer：游戏加分、奖励兑换。
import type { AppState, AppAction } from '../types';
import { pushHistory, safeInt } from '../helpers';

export function rewardsReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // 趣味游戏加分：受控且幂等（amount<=0 视为无效，直接原样返回）。
    // 仅累加积分与历史，不计入学习时长、也不刷新连续打卡天数（游戏时间不计入“学习天数”）。
    case 'ADD_POINTS': {
      const gained = safeInt(action.amount);
      if (gained <= 0) return state;
      return {
        ...state,
        points: state.points + gained,
        history: pushHistory(state.history, 'game', `${action.reason || '游戏'} +${gained}`, { points: gained }),
      };
    }

    // 兑换奖励：受控且幂等。cost 由组件从 REWARDS 传入（状态层不依赖数据层）。
    // 已拥有 / 积分不足 时静默忽略（直接返回原状态），由 UI 负责禁用按钮，避免误扣。
    case 'REDEEM_REWARD': {
      const { id, cost } = action;
      const price = safeInt(cost);
      if (!id || state.redeemedRewards.includes(id)) return state;
      if (state.points < price) return state;
      return {
        ...state,
        points: state.points - price,
        redeemedRewards: [...state.redeemedRewards, id],
        history: pushHistory(state.history, 'reward', `兑换 ${id}`),
      };
    }

    default:
      return state;
  }
}
