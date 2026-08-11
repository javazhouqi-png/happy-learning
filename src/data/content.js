// ============================================================
// 内容数据层 (Content / Mock Data)
// 将页面文案与业务数据集中管理，组件只负责渲染，便于维护与替换。
// ============================================================

export const brand = {
  name: '快乐学园',
  tagline: '让每个孩子爱上学习',
  socialProof: '已有 120 万+ 小朋友在快乐学园快乐成长'
}

export const navItems = [
  { id: 'subjects', label: '学科' },
  { id: 'courses', label: '课程' },
  { id: 'challenge', label: '挑战' },
  { id: 'parents', label: '家长' }
]

// 三大基础学科
export const subjects = [
  {
    id: 'chinese',
    name: '语文',
    colorVar: '--c-chinese',
    icon: 'book',
    desc: '拼音识字、阅读理解、古诗诵读，打好母语根基。',
    progress: 65,
    lessons: 32
  },
  {
    id: 'math',
    name: '数学',
    colorVar: '--c-math',
    icon: 'calculator',
    desc: '口算心算、图形思维、逻辑启蒙，越练越聪明。',
    progress: 80,
    lessons: 40
  },
  {
    id: 'english',
    name: '英语',
    colorVar: '--c-english',
    icon: 'language',
    desc: '自然拼读、趣味对话、情景动画，敢说敢用。',
    progress: 52,
    lessons: 28
  }
]

// 互动练习题（口算）
export const exercise = {
  subject: 'math',
  prompt: '算一算：7 + 8 = ?',
  hint: '小提示：先记住 7，再往后数 8 个数～',
  options: [
    { label: 'A', text: '13' },
    { label: 'B', text: '15' },
    { label: 'C', text: '14' },
    { label: 'D', text: '16' }
  ],
  correctLabel: 'B',
  reward: 10
}

// 动画教学视频
export const videos = [
  {
    id: 'v1',
    title: '拼音王国大冒险',
    meta: '语文 · 启蒙',
    duration: '08:24',
    colorVar: '--c-chinese'
  },
  {
    id: 'v2',
    title: '图形变变变',
    meta: '数学 · 思维',
    duration: '06:12',
    colorVar: '--c-math'
  },
  {
    id: 'v3',
    title: 'ABC 自然拼读',
    meta: '英语 · 拼读',
    duration: '09:38',
    colorVar: '--c-english'
  }
]

// 成就徽章墙
export const badges = [
  { id: 'b1', name: '拼音小达人', icon: 'medal', colorVar: '--c-chinese', earned: true },
  { id: 'b2', name: '口算王', icon: 'calculator', colorVar: '--c-math', earned: true },
  { id: 'b3', name: '阅读之星', icon: 'book', colorVar: '--c-primary', earned: true },
  { id: 'b4', name: '全勤标兵', icon: 'star', colorVar: '--c-english', earned: true },
  { id: 'b5', name: '英语开口王', icon: 'language', colorVar: '--c-gamify', earned: false },
  { id: 'b6', name: '百日坚持', icon: 'flame', colorVar: '--c-math', earned: false }
]

// 游戏化成长面板
export const gamification = {
  name: '小明同学',
  level: 8,
  points: 1280,
  nextLevelPoints: 220,
  streak: 21
}

// 学习进度 - 本周学习时长（分钟）
export const weeklyProgress = {
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  values: [20, 35, 30, 45, 40, 60, 50]
}

// 家长面板
export const parentPanel = {
  child: { name: '小明', grade: '三年级', colorVar: '--c-primary' },
  today: [
    { time: '09:20', text: '完成语文阅读练习', icon: 'book' },
    { time: '10:15', text: '观看动画课《图形变变变》', icon: 'play' },
    { time: '15:40', text: '获得「口算王」徽章', icon: 'medal' }
  ],
  guards: [
    { key: 'weekday', label: '工作日使用时长上限', desc: '周一至周五每天最多 60 分钟', icon: 'clock' },
    { key: 'weekend', label: '周末弹性模式', desc: '周末可适当延长学习时间', icon: 'calendar' },
    { key: 'night', label: '夜间护眼模式', desc: '20:30 后自动切换暗色护眼界面', icon: 'moon' }
  ]
}

// 页脚
export const footerColumns = [
  { title: '产品', links: ['学科课程', '动画课堂', '互动练习', '家长面板'] },
  { title: '资源', links: ['帮助中心', '学习指南', '活动公告', '教师入口'] },
  { title: '关于', links: ['关于我们', '联系我们', '用户协议', '隐私政策'] }
]

// ============================================================
// 全局应用初始状态 (用于 Context)
// ============================================================
export const initialAppState = {
  points: gamification.points,
  activeTab: 'home',
  mobileNavOpen: false,
  timeGuards: {
    weekday: true,
    weekend: false,
    night: true
  },
  exercise: {
    ...exercise,
    selected: null,
    answered: false,
    correct: false
  }
}
