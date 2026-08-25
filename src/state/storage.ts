// 持久化：读取 / 写入 / 版本迁移（v1→v2）。
import type { AppState, ParentState, SubjectId, SubjectStat, WrongMap, ReviewSlot, HistoryEntry, FavoriteItem, DailyTasks } from './types';
import { emptySubject } from './helpers';

const STORAGE_KEY_V1 = 'happy-learning-state-v1';
const STORAGE_KEY = 'happy-learning-state-v2';

export const SUBJECTS: SubjectId[] = ['chinese', 'math', 'english', 'science'];

function defaultParent(): ParentState {
  return { dailyLimitMin: 30, eyeRest: true, sound: true, minorMode: false, parentPin: '', minorDailyCapMin: 40 };
}

function defaultReview(): Record<SubjectId, ReviewSlot> {
  return {
    chinese: { box: 0, next: null },
    math: { box: 0, next: null },
    english: { box: 0, next: null },
    science: { box: 0, next: null },
  };
}

/**
 * 默认状态工厂。所有「集合型」字段都给出确定结构，loadState/migrate 在此基础上做浅合并，
 * 既能兼容旧数据，也能在字段缺失时回到安全默认，避免下游读取 undefined 而崩溃。
 */
export function defaultState(): AppState {
  return {
    version: 2,
    grade: 1,
    points: 0,
    completedLessons: {},
    quizBySubject: { chinese: emptySubject(), math: emptySubject(), english: emptySubject(), science: emptySubject() },
    quizByGrade: (() => {
      const out: Record<number, Record<SubjectId, SubjectStat>> = {};
      [1, 2, 3, 4, 5, 6].forEach((g) => {
        out[g] = { chinese: emptySubject(), math: emptySubject(), english: emptySubject(), science: emptySubject() };
      });
      return out;
    })(),
    wrongBySubject: { chinese: {}, math: {}, english: {}, science: {} },
    videosWatched: {},
    studySeconds: 0,
    streakDays: 0,
    lastActiveDate: null,
    todayDate: null,
    todayStudySec: 0,
    parent: defaultParent(),
    history: [],
    redeemedRewards: [],
    reviewSchedule: defaultReview(),
    textRead: {},
    textRecite: {},
    theme: null,
    favorites: [],
    dailyTasks: { date: '', items: [] },
  };
}

/** 校验并兜底每日任务单：缺字段 / 结构异常时回退空任务（由 App 在加载后按需重新生成）。 */
function mergeDailyTasks(base: DailyTasks, raw: unknown): DailyTasks {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const r = raw as Record<string, unknown>;
  const items = Array.isArray(r.items)
    ? (r.items as Array<Record<string, unknown>>)
        .filter((it) => it && typeof it === 'object' && typeof it.id === 'string')
        .map((it) => ({
          id: String(it.id),
          title: typeof it.title === 'string' ? it.title : '',
          done: it.done === true,
          route: typeof it.route === 'string' ? it.route : undefined,
        }))
    : base.items;
  return {
    date: typeof r.date === 'string' ? r.date : base.date,
    items,
  };
}

// 数值兜底，防止旧数据把字符串写进来导致累加变拼接。
function num(v: unknown): number {
  return Number.isFinite(Number(v)) ? Number(v) : 0;
}

function mergeSubjects(base: Record<SubjectId, SubjectStat>, raw: unknown): Record<SubjectId, SubjectStat> {
  const out: Record<SubjectId, SubjectStat> = { ...base };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const r = raw as Record<string, unknown>;
  SUBJECTS.forEach((s) => {
    const v = r[s];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const o = v as Record<string, unknown>;
      out[s] = { correct: num(o.correct), total: num(o.total) };
    }
  });
  return out;
}

function mergeWrong(base: Record<SubjectId, WrongMap>, raw: unknown): Record<SubjectId, WrongMap> {
  const out: Record<SubjectId, WrongMap> = { ...base };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const r = raw as Record<string, unknown>;
  SUBJECTS.forEach((s) => {
    const v = r[s];
    if (v && typeof v === 'object' && !Array.isArray(v)) out[s] = v as WrongMap;
  });
  return out;
}

// 按年级答题进度的默认结构与迁移合并：与 mergeSubjects 同思路，逐年级逐学科兜底。
const GRADE_KEYS = [1, 2, 3, 4, 5, 6];
function emptyGradeQuiz(): Record<number, Record<SubjectId, SubjectStat>> {
  const out: Record<number, Record<SubjectId, SubjectStat>> = {};
  GRADE_KEYS.forEach((g) => {
    out[g] = { chinese: emptySubject(), math: emptySubject(), english: emptySubject(), science: emptySubject() };
  });
  return out;
}
function mergeGradeQuiz(
  base: Record<number, Record<SubjectId, SubjectStat>>,
  raw: unknown
): Record<number, Record<SubjectId, SubjectStat>> {
  const out = emptyGradeQuiz();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const r = raw as Record<string, unknown>;
  Object.keys(r).forEach((kg) => {
    const g = Number(kg);
    if (!Number.isFinite(g) || !GRADE_KEYS.includes(g)) return;
    const rg = r[kg];
    if (rg && typeof rg === 'object' && !Array.isArray(rg)) {
      out[g] = mergeSubjects(base[g] || out[g], rg);
    }
  });
  return out;
}

/**
 * 版本迁移：旧 v1 档案（无 version 字段或 version<2）升级到 v2。
 * 以 defaultState 为基底浅合并旧数据，并对嵌套对象做深一层合并与字段兜底；
 * 缺失的新字段自动回退默认，绝不整体丢弃旧进度。
 */
export function migrate(raw: Partial<AppState> | null | undefined): AppState {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  return {
    ...base,
    version: 2,
    points: num(r.points),
    studySeconds: num(r.studySeconds),
    streakDays: num(r.streakDays),
    todayStudySec: num(r.todayStudySec),
    grade: num(r.grade) || base.grade,
    quizBySubject: mergeSubjects(base.quizBySubject, r.quizBySubject),
    quizByGrade: mergeGradeQuiz(base.quizByGrade, r.quizByGrade),
    wrongBySubject: mergeWrong(base.wrongBySubject, r.wrongBySubject),
    reviewSchedule: {
      ...base.reviewSchedule,
      ...(r.reviewSchedule as Partial<Record<SubjectId, ReviewSlot>> | undefined),
    },
    parent: { ...base.parent, ...(r.parent as Partial<ParentState> | undefined) },
    completedLessons: (r.completedLessons as Record<string, boolean> | undefined) ?? base.completedLessons,
    videosWatched: (r.videosWatched as Record<string, boolean> | undefined) ?? base.videosWatched,
    textRead: (r.textRead as Record<string, boolean> | undefined) ?? base.textRead,
    textRecite: (r.textRecite as Record<string, boolean> | undefined) ?? base.textRecite,
    theme: (r.theme as string | null | undefined) ?? base.theme,
    favorites: Array.isArray(r.favorites) ? (r.favorites as FavoriteItem[]) : base.favorites,
    dailyTasks: mergeDailyTasks(base.dailyTasks, r.dailyTasks),
    lastActiveDate: (r.lastActiveDate as string | null | undefined) ?? base.lastActiveDate,
    todayDate: (r.todayDate as string | null | undefined) ?? base.todayDate,
    history: Array.isArray(r.history) ? (r.history as HistoryEntry[]) : [],
    redeemedRewards: Array.isArray(r.redeemedRewards) ? (r.redeemedRewards as string[]) : [],
  };
}

/** 读取本地存储并做版本迁移 + 类型兜底。解析异常回退默认，绝不抛出。 */
export function loadState(): AppState {
  try {
    let rawStr = localStorage.getItem(STORAGE_KEY);
    if (!rawStr) rawStr = localStorage.getItem(STORAGE_KEY_V1); // 兼容旧档
    if (!rawStr) return defaultState();
    const parsed = JSON.parse(rawStr);
    const migrated = migrate(parsed);
    // 若来自旧键，升级后立即落盘到新键，避免下次再读旧档。
    if (!localStorage.getItem(STORAGE_KEY)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      } catch {
        /* 忽略写入失败 */
      }
    }
    return migrated;
  } catch {
    return defaultState();
  }
}

/** 写回本地存储；隐私模式 / 配额超限等失败静默忽略。 */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 忽略写入失败 */
  }
}
