// 复习域 reducer：间隔重复（Leitner）阶梯推进、清空错题本。
import type { AppState, AppAction } from '../types';
import { addDays, localDateStr } from '../helpers';

export function reviewReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // 记录一次复习结果，推进间隔重复（Leitner）阶梯。借鉴 flashcard 类项目的 SRS 思路：
    // 全对 -> box+1（间隔拉长到 3/7 天），答错 -> 重置为 box0（明天再练）。
    case 'RECORD_REVIEW': {
      const { subjectId, allCorrect } = action;
      const base = state.reviewSchedule[subjectId] || { box: 0, next: null };
      const box = allCorrect ? Math.min(base.box + 1, 3) : 0;
      const intervalDays = [1, 3, 7, 7][box]; // box0->1天, box1->3天, box2/3->7天
      const next = addDays(localDateStr(), intervalDays);
      return {
        ...state,
        reviewSchedule: { ...state.reviewSchedule, [subjectId]: { box, next } },
      };
    }

    // 清空某学科错题本（复习达标后可手动清零）。
    case 'CLEAR_WRONG': {
      const { subjectId } = action;
      return {
        ...state,
        wrongBySubject: { ...state.wrongBySubject, [subjectId]: {} },
      };
    }

    default:
      return state;
  }
}
