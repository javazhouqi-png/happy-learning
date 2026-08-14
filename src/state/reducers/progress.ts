// 学习进度域 reducer：课程 / 答题 / 视频 / 计时。
import type { AppState, AppAction, SubjectId, SubjectStat, WrongInput, WrongMap } from '../types';
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
      // 按年级独立记录答题进度：当前年级（state.grade）决定这笔作答计入哪一年级，
      // 使「年级分层学习」中各年级的掌握度/进度相互区分，不再共用全局 quizBySubject。
      const g = state.grade;
      const prevG = (state.quizByGrade[g] && state.quizByGrade[g][subjectId]) || emptySubject();
      const gradeMap: Record<SubjectId, SubjectStat> =
        state.quizByGrade[g] ?? ({} as Record<SubjectId, SubjectStat>);
      const nextGrade: Record<SubjectId, SubjectStat> = {
        ...gradeMap,
        [subjectId]: {
          correct: prevG.correct + safeInt(correct),
          total: prevG.total + safeInt(total),
        },
      };
      return {
        ...state,
        quizBySubject: {
          ...state.quizBySubject,
          [subjectId]: {
            correct: prev.correct + safeInt(correct),
            total: prev.total + safeInt(total),
          },
        },
        quizByGrade: { ...state.quizByGrade, [g]: nextGrade },
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

    // 课文朗读打卡：首次标记给分 + 历史；再次点击可取消（不影响已得分）。
    case 'MARK_TEXT_READ': {
      const key = (action as { key?: string }).key
      if (!key) return state;
      const already = !!state.textRead[key];
      const next = { ...state.textRead };
      if (already) delete next[key];
      else next[key] = true;
      const gained = already ? 0 : POINTS.textRead;
      const today = addTodayStudy(state, 0);
      return {
        ...state,
        ...today,
        textRead: next,
        points: state.points + gained,
        streakDays: already ? state.streakDays : bumpStreak(state),
        lastActiveDate: already ? state.lastActiveDate : localDateStr(),
        history: already
          ? state.history
          : pushHistory(state.history, 'text', `课文朗读打卡 +${gained}`, { points: gained }),
      };
    }

    // 课文背诵打卡：与朗读同理，分值更高。
    case 'MARK_TEXT_RECITE': {
      const key = (action as { key?: string }).key
      if (!key) return state;
      const already = !!state.textRecite[key];
      const next = { ...state.textRecite };
      if (already) delete next[key];
      else next[key] = true;
      const gained = already ? 0 : POINTS.textRecite;
      const today = addTodayStudy(state, 0);
      return {
        ...state,
        ...today,
        textRecite: next,
        points: state.points + gained,
        streakDays: already ? state.streakDays : bumpStreak(state),
        lastActiveDate: already ? state.lastActiveDate : localDateStr(),
        history: already
          ? state.history
          : pushHistory(state.history, 'text', `课文背诵打卡 +${gained}`, { points: gained }),
      };
    }

    default:
      return state;
  }
}
