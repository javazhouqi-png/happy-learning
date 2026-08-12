// 快乐学园 · 业务数据与内容层
// 设计原则：数据与视图分离。所有文案、课程、题库、视频、徽章集中于此，
// 组件仅负责渲染与交互；新增学科 / 课程 / 题目时，只需在此处扩展数据，
// 状态层（AppContext）与展示组件会自动适配，无需改动业务逻辑。

/* ----------------------------- 学科 ----------------------------- */
// SUBJECTS 是全局唯一的学科定义，id 为稳定标识（用于路由 / 状态索引，切勿随意改动）。
// color 为学科主色（用于卡片、进度、徽章着色）；icon 对应 ui/Icon 的内置图标名。
export const SUBJECTS = [
  {
    id: 'chinese',
    name: '语文',
    color: '#FF6B9D',
    icon: 'book',
    tagline: '识字 · 阅读 · 表达',
    desc: '从拼音到阅读，一步步爱上汉字与故事。',
  },
  {
    id: 'math',
    name: '数学',
    color: '#FF9F45',
    icon: 'calculator',
    tagline: '计算 · 逻辑 · 思维',
    desc: '口算、图形与应用题，玩着练出数学脑。',
  },
  {
    id: 'english',
    name: '英语',
    color: '#3DCA6E',
    icon: 'language',
    tagline: '单词 · 听说 · 兴趣',
    desc: '字母、单词与日常对话，轻松开口说。',
  },
];

// 学科 id 列表，供遍历 / 校验使用，避免在各处硬编码字符串。
export const SUBJECT_IDS = SUBJECTS.map((s) => s.id);

export const getSubject = (id) => SUBJECTS.find((s) => s.id === id);

/* ----------------------------- 课程 ----------------------------- */
// 每节课：id（学科内唯一）/ 标题 / 时长(分钟) / paragraphs（正文段落数组）
// 注意：LESSONS 的键名必须与 SUBJECTS 的 id 完全一致；课程完成状态以 lesson.id 作为索引。
export const LESSONS = {
  chinese: [
    {
      id: 'cn-1',
      title: '拼音真好玩',
      duration: 8,
      paragraphs: [
        '拼音是我们认识汉字的好朋友。声母有 b、p、m、f，韵母有 a、o、e、i、u、ü。',
        '把声母和韵母拼在一起，就能读出很多字：b—a→ba（八），m—a→ma（妈）。',
        '记住四声调：妈(mā)、麻(má)、马(mǎ)、骂(mà)，声调不同，意思就不一样啦！',
      ],
    },
    {
      id: 'cn-2',
      title: '识字小能手',
      duration: 10,
      paragraphs: [
        '汉字有偏旁部首。带“氵”的字多和水有关：河、海、洗。带“木”的字多和树有关：林、森、松。',
        '我们可以用“加一加”记字：日 + 月 = 明，小 + 大 = 尖。',
        '每天认 5 个新字，坚持一个月就能认识 150 个字！',
      ],
    },
    {
      id: 'cn-3',
      title: '古诗轻轻诵',
      duration: 6,
      paragraphs: [
        '“床前明月光，疑是地上霜。”这是李白的《静夜思》，写的是夜里想家的心情。',
        '读古诗要放慢速度，想象画面：明亮的月光洒在床前，像地上结了一层白霜。',
        '大声读三遍，你也能把这首诗背下来。',
      ],
    },
  ],
  math: [
    {
      id: 'ma-1',
      title: '加减法小魔法',
      duration: 8,
      paragraphs: [
        '加法是把东西合起来：3 个苹果 + 2 个苹果 = 5 个苹果。',
        '减法是把东西拿走：5 块糖 - 2 块糖 = 3 块糖。',
        '小窍门：凑十法。8 + 5 = 8 + 2 + 3 = 10 + 3 = 13，算得又快又准！',
      ],
    },
    {
      id: 'ma-2',
      title: '乘法口诀表',
      duration: 10,
      paragraphs: [
        '乘法是“几个相同数相加”的简便写法。3 × 4 就是 4 个 3 相加：3+3+3+3=12。',
        '背熟九九乘法表，做题快人一步：一一得一，一二得二……',
        '口诀小游戏：和爸爸妈妈比赛，看谁先说出 7 × 8 等于多少！',
      ],
    },
    {
      id: 'ma-3',
      title: '有趣的图形',
      duration: 7,
      paragraphs: [
        '正方形四条边一样长，四个角都是直角。长方形对面一样长。',
        '圆没有角，三角形有三条边。我们身边到处是图形：钟表是圆，书本是长方形。',
        '数一数：你的房间里有几个正方形、几个圆形？',
      ],
    },
  ],
  english: [
    {
      id: 'en-1',
      title: '字母 ABC',
      duration: 7,
      paragraphs: [
        '英语有 26 个字母，从 A 到 Z。A 像尖屋顶，B 像小耳朵。',
        '大声唱字母歌：A B C D E F G，H I J K L M N O P……',
        '试着写出自己的名字，找出里面有哪些字母！',
      ],
    },
    {
      id: 'en-2',
      title: '颜色单词',
      duration: 6,
      paragraphs: [
        'red 红色，blue 蓝色，yellow 黄色，green 绿色。',
        '看窗外：the sky is blue（天空是蓝的），the sun is yellow（太阳是黄的）。',
        '把家里的东西用英语颜色说一遍吧！',
      ],
    },
    {
      id: 'en-3',
      title: '动物好朋友',
      duration: 7,
      paragraphs: [
        'cat 猫，dog 狗，bird 鸟，fish 鱼，panda 熊猫。',
        '跟读：I like pandas.（我喜欢熊猫。）',
        '你最喜欢哪种动物？用英语说出来！',
      ],
    },
  ],
};

export const getLessons = (subjectId) => LESSONS[subjectId] || [];
export const getAllLessonIds = () =>
  Object.values(LESSONS).flat().map((l) => l.id);

// 统计全部课程数量（含所有学科），用于“总进度”等派生计算。
export const totalLessons = () => getAllLessonIds().length;

/* ----------------------------- 题库 ----------------------------- */
// 每题：id（学科内唯一）/ 题干 q / 选项 options / 正确项下标 answer / 解析 explanation
// answer 为 options 数组下标（0 起）；错题本以 question.id 记录已错题目。
export const QUIZZES = {
  chinese: [
    {
      id: 'cnq-1',
      q: '“妈”字读第几声？',
      options: ['第一声', '第二声', '第三声', '第四声'],
      answer: 0,
      explanation: '“妈”读作 mā，是第一声。',
    },
    {
      id: 'cnq-2',
      q: '下面哪个字带“氵”（三点水）？',
      options: ['林', '河', '森', '松'],
      answer: 1,
      explanation: '“河”带三点水，和水有关；林、森、松都带“木”。',
    },
    {
      id: 'cnq-3',
      q: '日 + 月 = ？',
      options: ['明', '尖', '林', '炎'],
      answer: 0,
      explanation: '日加月组成“明”，明亮的意思。',
    },
    {
      id: 'cnq-4',
      q: '《静夜思》的作者是谁？',
      options: ['杜甫', '李白', '白居易', '王维'],
      answer: 1,
      explanation: '《静夜思》是唐代诗人李白写的。',
    },
  ],
  math: [
    {
      id: 'maq-1',
      q: '8 + 5 = ？',
      options: ['12', '13', '14', '15'],
      answer: 1,
      explanation: '凑十法：8+2=10，10+3=13。',
    },
    {
      id: 'maq-2',
      q: '3 × 4 = ？',
      options: ['7', '12', '9', '15'],
      answer: 1,
      explanation: '3×4 就是 4 个 3 相加：3+3+3+3=12。',
    },
    {
      id: 'maq-3',
      q: '下面哪个图形没有角？',
      options: ['正方形', '三角形', '圆', '长方形'],
      answer: 2,
      explanation: '圆是曲线围成的，没有角。',
    },
    {
      id: 'maq-4',
      q: '15 - 6 = ？',
      options: ['8', '9', '10', '7'],
      answer: 1,
      explanation: '15 减 6：10-6=4，4+5=9。',
    },
  ],
  english: [
    {
      id: 'enq-1',
      q: '“红色”用英语怎么说？',
      options: ['red', 'blue', 'green', 'yellow'],
      answer: 0,
      explanation: 'red 是红色。',
    },
    {
      id: 'enq-2',
      q: '“猫”用英语怎么说？',
      options: ['dog', 'cat', 'bird', 'fish'],
      answer: 1,
      explanation: 'cat 是猫。',
    },
    {
      id: 'enq-3',
      q: '字母表里排在 A 后面的是？',
      options: ['C', 'B', 'D', 'Z'],
      answer: 1,
      explanation: '英文字母顺序是 A、B、C……所以 A 后面是 B。',
    },
    {
      id: 'enq-4',
      q: '“我喜欢熊猫”怎么说？',
      options: ['I like cats.', 'I like pandas.', 'I like dogs.', 'I like birds.'],
      answer: 1,
      explanation: 'panda 是熊猫，所以“我喜欢熊猫”是 I like pandas.',
    },
  ],
};

export const getQuiz = (subjectId) => QUIZZES[subjectId] || [];

// 统计某学科题目数量；用于空题库边界判断（如某科暂无题目时不渲染练习区）。
export const quizCountBySubject = (subjectId) => getQuiz(subjectId).length;

/* ----------------------------- 视频课程 ----------------------------- */
// 每节视频：id / 学科 subject / 标题 title / 时长 duration（"分:秒"字符串）/ 简介 desc
// duration 仅用于展示与“学习时长”累计，解析由 VideoModal.parseDuration 处理。
export const VIDEOS = [
  { id: 'vid-1', subject: 'chinese', title: '拼音王国大冒险', duration: '3:20', desc: '跟着动画认识声母韵母，拼音不再难。' },
  { id: 'vid-2', subject: 'math', title: '10 以内的加法', duration: '4:05', desc: '用积木演示加法，一眼看懂“合起来”。' },
  { id: 'vid-3', subject: 'english', title: 'Colors Song 颜色歌', duration: '2:48', desc: '欢快儿歌学会 red / blue / yellow / green。' },
  { id: 'vid-4', subject: 'math', title: '乘法口诀歌谣', duration: '3:55', desc: '把九九表唱成歌，背得又快又牢。' },
  { id: 'vid-5', subject: 'chinese', title: '跟着古诗去旅行', duration: '5:10', desc: '在画面里读懂《静夜思》的思乡情。' },
  { id: 'vid-6', subject: 'english', title: 'Animal Friends 动物朋友', duration: '3:30', desc: '猫狗鸟鱼熊猫，一次认全。' },
];

export const getVideo = (id) => VIDEOS.find((v) => v.id === id);
// 按学科筛选视频；用于视频库筛选与学科页视频 Tab。
export const getVideosBySubject = (subjectId) => VIDEOS.filter((v) => v.subject === subjectId);

/* ----------------------------- 徽章 ----------------------------- */
// check(state) 返回是否解锁；state 见 AppContext 的 userInfo
export const BADGES = [
  {
    id: 'badge-first',
    name: '勇敢第一步',
    icon: 'star',
    desc: '完成第一次答题',
    check: (s) => s.totalQuizzes >= 1,
  },
  {
    id: 'badge-100',
    name: '积分小达人',
    icon: 'trophy',
    desc: '累计获得 100 积分',
    check: (s) => s.points >= 100,
  },
  {
    id: 'badge-correct10',
    name: '答题小能手',
    icon: 'check',
    desc: '累计答对 10 道题',
    check: (s) => s.totalCorrect >= 10,
  },
  {
    id: 'badge-cn',
    name: '语文小博士',
    icon: 'book',
    desc: '学完所有语文课程',
    check: (s) => (LESSONS.chinese || []).every((l) => s.completedLessons[l.id]),
  },
  {
    id: 'badge-ma',
    name: '数学小天才',
    icon: 'calculator',
    desc: '学完所有数学课程',
    check: (s) => (LESSONS.math || []).every((l) => s.completedLessons[l.id]),
  },
  {
    id: 'badge-en',
    name: '英语小能手',
    icon: 'language',
    desc: '学完所有英语课程',
    check: (s) => (LESSONS.english || []).every((l) => s.completedLessons[l.id]),
  },
  {
    id: 'badge-video3',
    name: '视频小观众',
    icon: 'play',
    desc: '观看 3 节视频课',
    check: (s) => s.videosWatchedCount >= 3,
  },
  {
    id: 'badge-all',
    name: '全能小学者',
    icon: 'medal',
    desc: '三科都学完且积分满 200',
    check: (s) =>
      ['chinese', 'math', 'english'].every((sub) =>
        (LESSONS[sub] || []).every((l) => s.completedLessons[l.id])
      ) && s.points >= 200,
  },
];

/* ----------------------------- 其它文案 ----------------------------- */
export const NAV_ITEMS = [
  { id: 'subjects', label: '学科', to: '/#subjects' },
  { id: 'practice', label: '练习', to: '/#practice' },
  { id: 'videos', label: '动画', to: '/#videos' },
  { id: 'parent', label: '家长', to: '/#parent' },
];

export const PARENT_TIPS = [
  '每天陪孩子做 10 分钟互动练习，效果最好。',
  '用积分和徽章鼓励，比批评更有效。',
  '控制单次屏幕时间，保护视力与专注力。',
  '看完动画后问问孩子“学到了什么”，巩固记忆。',
];

// 等级对照：每 LEVEL_STEP 积分升一级；levelFromPoints 由累计积分推导等级（最低 1 级）。
export const LEVEL_STEP = 50;
export const levelFromPoints = (points) => Math.max(1, Math.floor((points || 0) / LEVEL_STEP) + 1);

// 等级称号：下标 = 等级 - 1。等级超出数组长度时由 levelTitle 兜底，避免越界显示 undefined。
export const LEVEL_TITLES = [
  '萌新学员',
  '好奇宝宝',
  '进阶小学者',
  '勤奋小标兵',
  '知识小达人',
  '学科小能手',
  '智慧小博士',
  '全能小学霸',
  '星光大学者',
  '传奇小学者',
];

// 由等级返回称号；越界时回退为通用称号，保证 UI 永远有可读文本。
export const levelTitle = (level) => LEVEL_TITLES[level - 1] || `Lv.${level} 小学者`;

/**
 * 把秒数格式化为「X 小时 Y 分 / Y 分 Z 秒 / Z 秒」的中文时长。
 * 输入异常（负数、NaN、undefined）一律按 0 处理，保证显示不会崩。
 * @param {number} seconds
 * @returns {string}
 */
export function formatStudyTime(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h} 小时 ${m} 分`;
  if (m > 0) return `${m} 分 ${sec} 秒`;
  return `${sec} 秒`;
}

/* ----------------------------- 品牌与页脚（展示用） ----------------------------- */
export const brand = { name: '快乐学园', slogan: '快乐学习，每天进步一点点' };

export const footerColumns = [
  {
    title: '产品',
    links: [
      { label: '学科课程', to: '/#subjects' },
      { label: '互动练习', to: '/#practice' },
      { label: '动画课堂', to: '/videos' },
      { label: '家长中心', to: '/#parent' },
    ],
  },
  {
    title: '资源',
    links: [
      { label: '使用帮助', to: '/' },
      { label: '学习指南', to: '/' },
      { label: '更新日志', to: '/' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: '关于我们', to: '/' },
      { label: '联系我们', to: '/' },
      { label: '隐私政策', to: '/' },
    ],
  },
];
