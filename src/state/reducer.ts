// 组合 reducer：按动作域将 action 委派给对应 slice，保持对外动作集合不变。
import type { AppState, AppAction } from './types';
import { progressReducer } from './reducers/progress';
import { parentReducer } from './reducers/parent';
import { rewardsReducer } from './reducers/rewards';
import { reviewReducer } from './reducers/review';
import { profileReducer } from './reducers/profile';

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'COMPLETE_LESSON':
    case 'ANSWER_QUIZ':
    case 'WATCH_VIDEO':
    case 'RECORD_STUDY':
      return progressReducer(state, action);

    case 'UPDATE_PARENT':
    case 'SET_GRADE':
    case 'SET_MINOR_MODE':
    case 'SET_PARENT_PIN':
      return parentReducer(state, action);

    case 'ADD_POINTS':
    case 'REDEEM_REWARD':
      return rewardsReducer(state, action);

    case 'RECORD_REVIEW':
    case 'CLEAR_WRONG':
      return reviewReducer(state, action);

    case 'HYDRATE':
    case 'RESET':
      return profileReducer(state, action);

    default:
      return state;
  }
}
