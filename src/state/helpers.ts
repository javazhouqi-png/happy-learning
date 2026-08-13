// 状态层共享纯函数：本地日期工具 + 输入校验 + 连签/时长/历史辅助。
import type { AppState, HistoryEntry } from './types';

export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1); // 可正确处理夏令时偏移
  return localDateStr(d);
}

// 在本地日期串上叠加 n 天，返回新的本地日期串（用于间隔重复“下次复习”）。
export function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return localDateStr(dt);
}

// 行动参数兜底：把可能为 undefined/NaN/负的输入收敛为安全非负整数。
export function safeInt(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** 更新连续学习天数：今天已记→不变；昨天→+1；更早→重置为1。 */
export function bumpStreak(state: AppState): number {
  const today = localDateStr();
  if (state.lastActiveDate === today) return state.streakDays;
  if (state.lastActiveDate === yesterdayStr()) return state.streakDays + 1;
  return 1;
}

/** 把秒数累加到“今日学习时长”；跨天先清零。 */
export function addTodayStudy(state: AppState, seconds: number): { todayDate: string; todayStudySec: number } {
  const today = localDateStr();
  const rolled = state.todayDate === today ? state.todayStudySec : 0;
  return { todayDate: today, todayStudySec: rolled + seconds };
}

// 写入一条动态；最多保留 50 条，超出丢弃最旧。
export function pushHistory(
  history: HistoryEntry[],
  type: string,
  detail: string,
  extra: { points?: number; seconds?: number } = {}
): HistoryEntry[] {
  const entry: HistoryEntry = {
    ts: Date.now(),
    type,
    detail,
    points: Number.isFinite(Number(extra.points)) ? Number(extra.points) : 0,
    seconds: Number.isFinite(Number(extra.seconds)) ? Number(extra.seconds) : 0,
  };
  return [entry, ...history].slice(0, 50);
}

export function emptySubject() {
  return { correct: 0, total: 0 };
}
