// 家长 / 设置域 reducer：家长补丁、年级、未成年人模式、家长密码。
import type { AppState, AppAction } from '../types';

export function parentReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // 家长设置：浅合并补丁，缺省字段不受影响。
    case 'UPDATE_PARENT':
      return { ...state, parent: { ...state.parent, ...action.patch } };

    // 设置当前孩子年级（1–6）：仅合法区间才更新。
    case 'SET_GRADE': {
      const g = Number(action.grade);
      if (!(g >= 1 && g <= 6)) return state;
      return { ...state, grade: g };
    }

    // 切换未成年人模式（开启无需验证；关闭需家长密码，由 UI 侧先验证再派发）。
    case 'SET_MINOR_MODE':
      return { ...state, parent: { ...state.parent, minorMode: !!action.on } };

    // 设置 / 修改家长密码：强制 4–6 位数字（与 ParentPanel 受控校验双保险）。
    // 空串视为「找回/重置」通道（清空为未设置）；非法格式忽略、不改变原值。
    case 'SET_PARENT_PIN': {
      const pin = String(action.pin ?? '');
      if (pin === '') {
        if (state.parent.parentPin === '') return state;
        return { ...state, parent: { ...state.parent, parentPin: '' } };
      }
      if (!/^\d{4,6}$/.test(pin)) return state; // 非法：保持原值，由 UI 提示
      return { ...state, parent: { ...state.parent, parentPin: pin } };
    }

    // 切换界面主题：null=自动（跟随已拥有皮肤）/ 'sunset'=强制暖阳 / 'none'=强制默认。
    case 'SET_THEME':
      return { ...state, theme: action.theme };

    default:
      return state;
  }
}
