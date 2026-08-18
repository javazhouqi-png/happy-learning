// 收藏域 reducer：用户自定义收藏夹（课文 / 古诗 / 错题 / 视频）的增删切换。
// 设计要点：单一数据源 favorites 数组（按收藏时间倒序）；以 kind+key 去重，
// 再次点击同一对象即取消（幂等）；设上限保护避免无限增长；不污染任何学习进度数据。
import type { AppState, AppAction, FavoriteItem } from '../types';

const MAX_FAVORITES = 200;

const sameKey = (a: FavoriteItem, b: FavoriteItem) => a.kind === b.kind && a.key === b.key;

export function favoritesReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_FAVORITE': {
      const item = action.item;
      // 非法条目（缺 kind/key）直接忽略，避免脏数据进入状态。
      if (!item || !item.kind || !item.key) return state;
      const exists = state.favorites.some((f) => sameKey(f, item));
      let next: FavoriteItem[];
      if (exists) {
        next = state.favorites.filter((f) => !sameKey(f, item));
      } else {
        if (state.favorites.length >= MAX_FAVORITES) return state; // 达上限静默忽略
        next = [{ ...item, addedAt: Date.now() }, ...state.favorites];
      }
      return { ...state, favorites: next };
    }
    default:
      return state;
  }
}
