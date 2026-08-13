import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import {
  BADGES,
  LESSONS,
  LEVEL_STEP,
  levelFromPoints,
  levelTitle,
} from '../data/subjects.js';
import { reducer } from './reducer';
import { loadState, saveState } from './storage';
import { emptySubject } from './helpers';

// 对外暴露积分规则（部分组件/测试可能需要）。
export { POINTS } from './constants';

/* ----------------------------- Provider ----------------------------- */

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 惰性初始化：用 loadState 作为 initializer，仅在挂载时读取一次存储。
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // 任意状态变化即写回本地存储；隐私模式 / 配额超限等写入失败静默忽略，不影响使用。
  useEffect(() => {
    saveState(state);
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

    // 按年级独立掌握度：仅依据该年级自身的答题正确率（课程非按年级划分，故不混入完成率），
    // 用于「年级分层学习」按年级展示各科的答题进度与掌握情况，互不串台。
    // 遍历 state.quizByGrade 的现有年级键，避免从大体积 content.js 引入 GRADES 常量污染主包。
    const progressByGrade = {};
    Object.keys(state.quizByGrade || {}).forEach((kg) => {
      const g = Number(kg);
      progressByGrade[g] = {};
      ['chinese', 'math', 'english'].forEach((sub) => {
        const q = (state.quizByGrade[g] && state.quizByGrade[g][sub]) || emptySubject();
        const rate = q.total ? q.correct / q.total : 0;
        progressByGrade[g][sub] = {
          correct: q.correct,
          total: q.total,
          mastery: Math.round(rate * 100),
        };
      });
    });

    // 今日学习时长 / 家长每日上限（分钟）。
    // 未成年人模式下，每日上限强制不超过家长设定的“未成年人上限”（默认 40 分钟），
    // 复用既有每日时长统计与进度条，无需新增状态字段。
    const todayStudyMin = Math.round(state.todayStudySec / 60);
    const minorCap = state.parent.minorMode
      ? Math.min(state.parent.dailyLimitMin, state.parent.minorDailyCapMin || 40)
      : state.parent.dailyLimitMin;
    const dailyLimitMin = minorCap;
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
      progressByGrade,
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
        dispatch({
          type: 'ANSWER_QUIZ',
          subjectId,
          correct,
          total,
          wrongIds: opts.wrongIds,
          correctIds: opts.correctIds,
          wrongEntries: opts.wrongEntries,
        }),
      watchVideo: (videoId, durationSec, subjectId) =>
        dispatch({ type: 'WATCH_VIDEO', videoId, durationSec, subjectId }),
      recordStudy: (seconds) => dispatch({ type: 'RECORD_STUDY', seconds }),
      updateParent: (patch) => dispatch({ type: 'UPDATE_PARENT', patch }),
      clearWrong: (subjectId) => dispatch({ type: 'CLEAR_WRONG', subjectId }),
      setGrade: (grade) => dispatch({ type: 'SET_GRADE', grade }),
      setMinorMode: (on) => dispatch({ type: 'SET_MINOR_MODE', on }),
      setParentPin: (pin) => dispatch({ type: 'SET_PARENT_PIN', pin }),
      hydrate: (next) => dispatch({ type: 'HYDRATE', next }),
      addPoints: (amount, reason) => dispatch({ type: 'ADD_POINTS', amount, reason }),
      redeemReward: (id, cost) => dispatch({ type: 'REDEEM_REWARD', id, cost }),
      recordReview: (subjectId, allCorrect) => dispatch({ type: 'RECORD_REVIEW', subjectId, allCorrect }),
      markTextRead: (key) => dispatch({ type: 'MARK_TEXT_READ', key }),
      markTextRecite: (key) => dispatch({ type: 'MARK_TEXT_RECITE', key }),
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
