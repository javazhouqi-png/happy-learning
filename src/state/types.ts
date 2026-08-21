// 全局状态类型定义（Task #3 引入）。
// 配合 AppContext 动作域拆分与 storage.migrate(v1→v2) 使用；供状态层各 TS 模块共享。

export type SubjectId = 'chinese' | 'math' | 'english' | 'science';

export interface SubjectStat {
  correct: number;
  total: number;
}

/** 错题条目（存储值）：带溯源字段；旧链路退化为存 true。 */
export interface WrongEntry {
  grade?: number;
  subject?: SubjectId;
  pointId?: string;
  pointTitle?: string;
}

/** 答题动作携带的错题输入：必须有 id 作为错题本键。 */
export interface WrongInput {
  id: string;
  grade?: number;
  subject?: SubjectId;
  pointId?: string;
  pointTitle?: string;
}

/** 用户收藏条目（持久化值）：儿童主动收藏的课文 / 古诗 / 错题 / 视频等。 */
export interface FavoriteItem {
  kind: 'text' | 'poem' | 'point' | 'wrong' | 'video';
  key: string;
  title: string;
  subject?: SubjectId;
  grade?: number;
  addedAt: number;
}

/** 每日学习任务单中的单条任务（今日三件事）。 */
export interface DailyTask {
  /** 稳定槽位 id（如 review-wrong / read-text / watch-video），用于持久化勾选状态。 */
  id: string;
  /** 展示标题。 */
  title: string;
  /** 是否已完成。 */
  done: boolean;
  /** 点击「去做」跳转的路由（如 /review、/textbook）。 */
  route?: string;
}

/** 每日任务单：按天生成，跨天自动重置。 */
export interface DailyTasks {
  /** 本地日期串 YYYY-MM-DD；与当天不一致时触发重新生成。 */
  date: string;
  items: DailyTask[];
}

export type WrongValue = true | WrongEntry;
export type WrongMap = Record<string, WrongValue>;

export interface ParentState {
  dailyLimitMin: number;
  eyeRest: boolean;
  sound: boolean;
  minorMode: boolean;
  parentPin: string;
  minorDailyCapMin: number;
}

export interface ReviewSlot {
  box: number;
  next: string | null;
}

export interface HistoryEntry {
  ts: number;
  type: string;
  detail: string;
  points: number;
  seconds: number;
}

export interface AppState {
  version: number;
  grade: number;
  points: number;
  completedLessons: Record<string, boolean>;
  quizBySubject: Record<SubjectId, SubjectStat>;
  /** 按年级独立追踪的答题进度：quizByGrade[年级][学科] = { correct, total }。
   *  用于「年级分层学习」等按年级区分展示答题进度 / 掌握度，避免各年级共用同一份全局进度。 */
  quizByGrade: Record<number, Record<SubjectId, SubjectStat>>;
  wrongBySubject: Record<SubjectId, WrongMap>;
  videosWatched: Record<string, boolean>;
  studySeconds: number;
  streakDays: number;
  lastActiveDate: string | null;
  todayDate: string | null;
  todayStudySec: number;
  parent: ParentState;
  history: HistoryEntry[];
  redeemedRewards: string[];
  reviewSchedule: Record<SubjectId, ReviewSlot>;
  /** 课文朗读打卡：键为 textbook.textKey，值为是否已朗读。 */
  textRead: Record<string, boolean>;
  /** 课文背诵打卡：键为 textbook.textKey，值为是否已背诵。 */
  textRecite: Record<string, boolean>;
  /** 界面主题：null=跟随拥有状态自动应用；'sunset'=强制暖阳；'none'=强制默认（已拥有也关闭）。 */
  theme: string | null;
  /** 用户收藏夹：儿童主动收藏的课文/古诗/错题/视频等，按收藏时间倒序。 */
  favorites: FavoriteItem[];
  /** 每日学习任务单（今日三件事）：按天生成，跨天重置，提升学习留存与闭环。 */
  dailyTasks: DailyTasks;
}

/** 动作联合；末尾宽松成员保证未知动作可被安全接受（降级为原状态）。 */
export type AppAction =
  | { type: 'COMPLETE_LESSON'; lessonId: string; subjectId: SubjectId; durationMin?: number }
  | { type: 'ANSWER_QUIZ'; subjectId: SubjectId; correct?: number; total?: number; wrongIds?: string[]; correctIds?: string[]; wrongEntries?: WrongInput[] }
  | { type: 'WATCH_VIDEO'; videoId: string; durationSec?: number; subjectId?: SubjectId }
  | { type: 'RECORD_STUDY'; seconds?: number }
  | { type: 'UPDATE_PARENT'; patch: Partial<ParentState> }
  | { type: 'SET_GRADE'; grade: number }
  | { type: 'SET_MINOR_MODE'; on: boolean }
  | { type: 'SET_PARENT_PIN'; pin?: string }
  | { type: 'SET_THEME'; theme: string | null }
  | { type: 'ADD_POINTS'; amount?: number; reason?: string }
  | { type: 'REDEEM_REWARD'; id?: string; cost?: number }
  | { type: 'RECORD_REVIEW'; subjectId: SubjectId; allCorrect?: boolean }
  | { type: 'CLEAR_WRONG'; subjectId: SubjectId }
  | { type: 'MARK_TEXT_READ'; key: string }
  | { type: 'MARK_TEXT_RECITE'; key: string }
  | { type: 'TOGGLE_FAVORITE'; item: FavoriteItem }
  | { type: 'SET_DAILY_TASKS'; tasks: DailyTasks }
  | { type: 'TOGGLE_DAILY_TASK'; id: string }
  | { type: 'HYDRATE'; next?: Partial<AppState> }
  | { type: 'RESET' };
