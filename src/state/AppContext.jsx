import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import {
  BADGES,
  LESSONS,
  LEVEL_STEP,
  levelFromPoints,
  levelTitle,
} from '../data/content.js';

// 持久化键名（含版本号 v1）。若日后数据结构变更，升级此版本号即可自然放弃旧数据，
// 配合 loadState 的类型兜底，避免旧存储把应用拖垮。
const STORAGE_KEY = 'happy-learning-state-v1';

// 业务积分规则：集中定义，便于后续调整或做活动加成（如节假日双倍积分）。
export const POINTS = {
  lesson: 15, // 学完一节课
  quizCorrect: 10, // 每答对一题
  video: 5, // 观看一节视频
};

const emptySubject = () => ({ correct: 0, total: 0 });

/**
 * 默认状态工厂。所有「集合型」字段（completedLessons / videosWatched / quizBySubject /
 * wrongBySubject / parent / history）都给出确定结构，loadState 在此基础上做浅合并，
 * 既能兼容旧数据，也能在字段缺失时回到安全默认，避免下游读取 undefined 而崩溃。
 */
function defaultState() {
  return {
    points: 0,
    completedLessons: {}, // { [lessonId]: true }
    quizBySubject: { chinese: emptySubject(), math: emptySubject(), english: emptySubject() },
    wrongBySubject: { chinese: {}, math: {}, english: {} }, // { [subjectId]: { [questionId]: true } } 错题本
    videosWatched: {}, // { [videoId]: true }
    studySeconds: 0, // 累计学习秒数（全期）
    streakDays: 0, // 连续学习天数
    lastActiveDate: null, // 最近一次活跃日期（本地日期串）
    todayDate: null, // 当日学习时长对应的日期；跨天自动清零
    todayStudySec: 0, // 今日已学秒数（受家长每日上限约束）
    parent: { dailyLimitMin: 30, eyeRest: true, sound: true },
    history: [], // [{ ts, type, detail }] 最新在前，最多保留 50 条
    // —— 以下为「趣味激励闭环」相关状态（借鉴 math-for-piglets 存钱罐 / candy-learn-abacus 花园）——
    redeemedRewards: [], // 已兑换的奖励 id 列表（装饰性，不影响学习进度）
    // 错题复习的间隔重复排程：每科一个 Leitner 阶梯 {box, next}。
    // box: 0=待巩固(明天), 1=间隔3天, 2=间隔7天, 3=已稳定(7天)；next: 下次复习的本地日期串。
    reviewSchedule: {
      chinese: { box: 0, next: null },
      math: { box: 0, next: null },
      english: { box: 0, next: null },
    },
  };
}

/* ----------------------------- 日期工具 ----------------------------- */

// 本地日期串（YYYY-MM-DD）。使用本地时区而非 UTC，避免“凌晨学习被算作前一天”的边界问题。
function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1); // 用 setDate 计算，可正确处理夏令时偏移
  return localDateStr(d);
}

// 在本地日期串上叠加 n 天，返回新的本地日期串（用于间隔重复的“下次复习”计算）。
function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return localDateStr(dt);
}

/* ----------------------------- 持久化读取 ----------------------------- */

// 读取本地存储并做类型兜底。任何解析/字段异常都回退默认，绝不抛出——
// 因为最坏情况只是“进度清零”，也好过整个应用白屏。
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) || {};
    const base = defaultState();
    // 数值类字段强制转数字并兜底 0，防止旧数据把字符串写进来导致累加变成字符串拼接。
    const num = (v) => (Number.isFinite(+v) ? +v : 0);
    return {
      ...base,
      ...parsed,
      points: num(parsed.points),
      studySeconds: num(parsed.studySeconds),
      streakDays: num(parsed.streakDays),
      todayStudySec: num(parsed.todayStudySec),
      quizBySubject: { ...base.quizBySubject, ...(parsed.quizBySubject || {}) },
      wrongBySubject: { ...base.wrongBySubject, ...(parsed.wrongBySubject || {}) },
      parent: { ...base.parent, ...(parsed.parent || {}) },
      completedLessons: parsed.completedLessons || {},
      videosWatched: parsed.videosWatched || {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
      redeemedRewards: Array.isArray(parsed.redeemedRewards) ? parsed.redeemedRewards : [],
      reviewSchedule: { ...base.reviewSchedule, ...(parsed.reviewSchedule || {}) },
    };
  } catch {
    return defaultState();
  }
}

/* ----------------------------- 连续打卡 ----------------------------- */

/**
 * 更新连续学习天数。规则：
 * - 今天已记过 → 不变（同一次会话多次学习不重复 +1）；
 * - 昨天活跃 → +1；
 * - 更早或更久没学 → 重置为 1（断签后从今天重新计数）。
 * 返回新的 streakDays。
 */
function bumpStreak(state) {
  const today = localDateStr();
  if (state.lastActiveDate === today) return state.streakDays;
  if (state.lastActiveDate === yesterdayStr()) return state.streakDays + 1;
  return 1;
}

/* ----------------------------- 今日时长（受家长上限约束） ----------------------------- */

/**
 * 把秒数累加到「今日学习时长」。跨天（todayDate 与今天不一致）时先清零再计，
 * 保证家长设置的每日上限按自然日生效，而不是累计全生涯。
 */
function addTodayStudy(state, seconds) {
  const today = localDateStr();
  const rolled = state.todayDate === today ? state.todayStudySec : 0;
  return { todayDate: today, todayStudySec: rolled + seconds };
}

/* ----------------------------- 历史记录 ----------------------------- */

// 写入一条动态；最多保留 50 条，超出丢弃最旧，防止本地存储无限膨胀。
// extra 可选携带 { points, seconds }：points = 本次获得的积分，seconds = 本次累计的学习秒数，
// 供「家长周报」等聚合模块直接求和，避免再去解析 detail 文案。历史结构向后兼容——
// 旧数据没有这两个字段时，聚合处用 `|| 0` 兜底，不会崩溃。
function pushHistory(history, type, detail, extra = {}) {
  const entry = {
    ts: Date.now(),
    type,
    detail,
    points: Number.isFinite(+extra.points) ? +extra.points : 0,
    seconds: Number.isFinite(+extra.seconds) ? +extra.seconds : 0,
  };
  return [entry, ...history].slice(0, 50);
}

/* ----------------------------- 输入校验 ----------------------------- */

// 行动参数兜底：把可能为 undefined/NaN/负的输入收敛为安全非负整数。
function safeInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/* ----------------------------- Reducer ----------------------------- */

/**
 * 纯函数 reducer。所有动作只增不减（积分/进度可叠加，重置走 RESET），
 * 且每种「已完成」动作都做了幂等保护（已学过/已看过的不再重复计分）。
 * @param {object} state
 * @param {{ type: string, [k: string]: any }} action
 */
function reducer(state, action) {
  switch (action.type) {
    // 学完一节课：幂等（已学的不再加分）；累计积分、今日/累计时长、连续天数、历史。
    case 'COMPLETE_LESSON': {
      const { lessonId, subjectId, durationMin } = action;
      if (state.completedLessons[lessonId]) return state;
      const gained = POINTS.lesson;
      const today = addTodayStudy(state, safeInt(durationMin) * 60);
      return {
        ...state,
        ...today,
        completedLessons: { ...state.completedLessons, [lessonId]: true },
        points: state.points + gained,
        studySeconds: state.studySeconds + safeInt(durationMin) * 60,
        streakDays: bumpStreak(state),
        lastActiveDate: localDateStr(),
        history: pushHistory(
          state.history,
          'lesson',
          `${subjectId} 课程完成 +${gained}`,
          { points: gained, seconds: safeInt(durationMin) * 60 }
        ),
      };
    }

    // 提交答题：correct/total 已含本回合得分；同时维护错题本（答错的加入、答对的移出）。
    case 'ANSWER_QUIZ': {
      const { subjectId, correct, total, wrongIds = [], correctIds = [] } = action;
      const prev = state.quizBySubject[subjectId] || emptySubject();
      const gained = safeInt(correct) * POINTS.quizCorrect;
      const prevWrong = state.wrongBySubject[subjectId] || {};
      const nextWrong = { ...prevWrong };
      wrongIds.forEach((id) => { if (id) nextWrong[id] = true; });
      correctIds.forEach((id) => { delete nextWrong[id]; }); // 改对即移出错题本
      return {
        ...state,
        quizBySubject: {
          ...state.quizBySubject,
          [subjectId]: {
            correct: prev.correct + safeInt(correct),
            total: prev.total + safeInt(total),
          },
        },
        wrongBySubject: { ...state.wrongBySubject, [subjectId]: nextWrong },
        points: state.points + gained,
        streakDays: bumpStreak(state),
        lastActiveDate: localDateStr(),
        history: pushHistory(
          state.history,
          'quiz',
          `${subjectId} 答题 ${safeInt(correct)}/${safeInt(total)} 正确 +${gained}`,
          { points: gained }
        ),
      };
    }

    // 观看视频：幂等；累计积分、时长、连续天数、历史。
    case 'WATCH_VIDEO': {
      const { videoId, durationSec, subjectId } = action;
      if (state.videosWatched[videoId]) return state;
      const gained = POINTS.video;
      const sec = safeInt(durationSec);
      const today = addTodayStudy(state, sec);
      return {
        ...state,
        ...today,
        videosWatched: { ...state.videosWatched, [videoId]: true },
        points: state.points + gained,
        studySeconds: state.studySeconds + sec,
        streakDays: bumpStreak(state),
        lastActiveDate: localDateStr(),
        history: pushHistory(
          state.history,
          'video',
          `${subjectId} 视频观看 +${gained}`,
          { points: gained, seconds: sec }
        ),
      };
    }

    // 追加学习时长（如后台计时器上报）。走跨天清零逻辑，避免污染今日上限统计。
    case 'RECORD_STUDY': {
      const today = addTodayStudy(state, safeInt(action.seconds));
      return {
        ...state,
        ...today,
        studySeconds: state.studySeconds + safeInt(action.seconds),
      };
    }

    // 家长设置：浅合并补丁，缺省字段不受影响。
    case 'UPDATE_PARENT': {
      return { ...state, parent: { ...state.parent, ...action.patch } };
    }

    // 清空某学科错题本（复习达标后可手动清零）。
    case 'CLEAR_WRONG': {
      const { subjectId } = action;
      return {
        ...state,
        wrongBySubject: { ...state.wrongBySubject, [subjectId]: {} },
      };
    }

    // 重置全部进度：回到默认。用户主动触发，用于换账号或重新开始。
    case 'RESET':
      return defaultState();

    // 趣味游戏加分：受控且幂等（amount<=0 视为无效，直接原样返回）。
    // 仅累加积分与历史，不计入学习时长、也不刷新连续打卡天数（游戏时间不计入“学习天数”）。
    case 'ADD_POINTS': {
      const gained = safeInt(action.amount);
      if (gained <= 0) return state;
      return {
        ...state,
        points: state.points + gained,
        history: pushHistory(
          state.history,
          'game',
          `${action.reason || '游戏'} +${gained}`,
          { points: gained }
        ),
      };
    }

    // 兑换奖励：受控且幂等。cost 由组件从 REWARDS 传入（状态层不依赖数据层）。
    // 已拥有 / 积分不足 时静默忽略（直接返回原状态），由 UI 负责禁用按钮，避免误扣。
    // 兑换只扣积分、记录历史，不改变学习进度——奖励纯属趣味与个性化。
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

    // 记录一次复习结果，推进间隔重复（Leitner）阶梯。借鉴 flashcard 类项目的 SRS 思路：
    // 全对 -> box+1（间隔拉长到 3/7 天），答错 -> 重置为 box0（明天再练）。
    // 仅维护每科一个轻量排程，适合低龄用户；不引入逐题 SRS 的复杂度。
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

    default:
      return state;
  }
}

/* ----------------------------- Provider ----------------------------- */

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 惰性初始化：用 loadState 作为 initializer，仅在挂载时读取一次存储。
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // 任意状态变化即写回本地存储；隐私模式 / 配额超限等写入失败静默忽略，不影响使用。
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 忽略写入失败 */
    }
  }, [state]);

  // 派生数据：由 state 计算等级、徽章、掌握度等，memo 化避免无谓重算。
  const derived = useMemo(() => {
    const totalQuizzes = Object.values(state.quizBySubject).reduce((a, s) => a + s.total, 0);
    const totalCorrect = Object.values(state.quizBySubject).reduce((a, s) => a + s.correct, 0);
    const videosWatchedCount = Object.keys(state.videosWatched).length;

    const level = levelFromPoints(state.points);
    const nextLevelPoints = level * LEVEL_STEP;
    const levelProgress = state.points % LEVEL_STEP;

    const userInfo = {
      points: state.points,
      totalQuizzes,
      totalCorrect,
      videosWatchedCount,
      completedLessons: state.completedLessons,
      videosWatched: state.videosWatched,
      studySeconds: state.studySeconds,
      streakDays: state.streakDays,
    };

    // 徽章：把每个徽章的 check 作用在 userInfo 上，得到解锁状态。BADGES 用幂等判定，
    // 即使重复计分也不会“解锁后又掉回”。
    const badges = BADGES.map((b) => ({ ...b, unlocked: b.check(userInfo) }));
    const unlockedCount = badges.filter((b) => b.unlocked).length;

    // 错题本：每科错题数量。
    const wrongCountBySubject = {};
    const wrongBySubject = {};
    ['chinese', 'math', 'english'].forEach((sub) => {
      const set = state.wrongBySubject[sub] || {};
      wrongBySubject[sub] = set;
      wrongCountBySubject[sub] = Object.keys(set).length;
    });

    // 掌握度：课程完成率(60%) + 答题正确率(40%)，四舍五入到整数百分比。
    const mastery = {};
    ['chinese', 'math', 'english'].forEach((sub) => {
      const lessons = LESSONS[sub] || [];
      const done = lessons.filter((l) => state.completedLessons[l.id]).length;
      const q = state.quizBySubject[sub] || emptySubject();
      const quizRate = q.total ? q.correct / q.total : 0;
      const lessonRate = lessons.length ? done / lessons.length : 0;
      mastery[sub] = Math.round((lessonRate * 0.6 + quizRate * 0.4) * 100);
    });

    // 今日学习时长 / 家长每日上限（分钟）。
    const todayStudyMin = Math.round(state.todayStudySec / 60);
    const dailyLimitMin = state.parent.dailyLimitMin;
    const dailyRemainingMin = Math.max(0, dailyLimitMin - todayStudyMin);
    const dailyOverLimit = todayStudyMin > dailyLimitMin;

    return {
      ...userInfo,
      level,
      levelTitle: levelTitle(level),
      nextLevelPoints,
      levelProgress,
      levelStep: LEVEL_STEP,
      badges,
      unlockedCount,
      mastery,
      wrongBySubject,
      wrongCountBySubject,
      todayStudySec: state.todayStudySec,
      todayStudyMin,
      dailyLimitMin,
      dailyRemainingMin,
      dailyOverLimit,
    };
  }, [state]);

  // 动作集合：用稳定的函数引用派发，组件无需关心 action 形状。
  const actions = useMemo(
    () => ({
      completeLesson: (lessonId, subjectId, durationMin) =>
        dispatch({ type: 'COMPLETE_LESSON', lessonId, subjectId, durationMin }),
      answerQuiz: (subjectId, correct, total, opts = {}) =>
        dispatch({ type: 'ANSWER_QUIZ', subjectId, correct, total, wrongIds: opts.wrongIds, correctIds: opts.correctIds }),
      watchVideo: (videoId, durationSec, subjectId) =>
        dispatch({ type: 'WATCH_VIDEO', videoId, durationSec, subjectId }),
      recordStudy: (seconds) => dispatch({ type: 'RECORD_STUDY', seconds }),
      updateParent: (patch) => dispatch({ type: 'UPDATE_PARENT', patch }),
      clearWrong: (subjectId) => dispatch({ type: 'CLEAR_WRONG', subjectId }),
      addPoints: (amount, reason) => dispatch({ type: 'ADD_POINTS', amount, reason }),
      redeemReward: (id, cost) => dispatch({ type: 'REDEEM_REWARD', id, cost }),
      recordReview: (subjectId, allCorrect) => dispatch({ type: 'RECORD_REVIEW', subjectId, allCorrect }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    []
  );

  const value = useMemo(() => ({ state, derived, actions }), [state, derived, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * 消费全局状态。必须在 <AppProvider> 内调用，否则抛错给出明确提示，
 * 避免“拿到 null 然后 .state 报错”这类难以定位的问题。
 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp 必须在 <AppProvider> 内使用');
  return ctx;
}
