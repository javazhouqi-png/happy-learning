// 学习进度域 reducer：课程 / 答题 / 视频 / 计时。
import type { AppState, AppAction, WrongInput, WrongMap } from '../types';
import { addTodayStudy, bumpStreak, pushHistory, safeInt, emptySubject, localDateStr } from '../helpers';
import { POINTS } from '../constants';

export function progressReducer(state: AppState, action: AppAction): AppState {
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
        history: pushHistory(state.history, 'lesson', `${subjectId} 课程完成 +${gained}`, {
          points: gained,
          seconds: safeInt(durationMin) * 60,
        }),
      };
    }

    // 提交答题：correct/total 已含本回合得分；维护错题本（答错的加入、答对的移出）。
    case 'ANSWER_QUIZ': {
      const { subjectId, correct, total, wrongIds = [], correctIds = [], wrongEntries = [] } = action;
      const prev = state.quizBySubject[subjectId] || emptySubject();
      const gained = safeInt(correct) * POINTS.quizCorrect;
      const prevWrong = state.wrongBySubject[subjectId] || {};
      const nextWrong: WrongMap = { ...prevWrong };
      // 优先用带溯源字段的 wrongEntries（新链路）；旧链路仅传 wrongIds 时退化为记 true。
      if (wrongEntries.length) {
        wrongEntries.forEach((e: WrongInput) => {
          if (e && e.id) nextWrong[e.id] = { grade: e.grade, subject: e.subject, pointId: e.pointId, pointTitle: e.pointTitle };
        });
      } else {
        wrongIds.forEach((id: string) => {
          if (id) nextWrong[id] = true;
        });
      }
      correctIds.forEach((id: string) => {
        delete nextWrong[id];
      }); // 改对即移出错题本
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
        history: pushHistory(state.history, 'video', `${subjectId} 视频观看 +${gained}`, {
          points: gained,
          seconds: sec,
        }),
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

    default:
      return state;
  }
}
