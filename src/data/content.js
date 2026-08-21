import { LESSONS } from './subjects.js';
// 快乐学园 · 业务数据与内容层
// 设计原则：数据与视图分离。所有文案、课程、题库、视频、徽章集中于此，
// 组件仅负责渲染与交互；新增学科 / 课程 / 题目时，只需在此处扩展数据，
// 状态层（AppContext）与展示组件会自动适配，无需改动业务逻辑。

/* --------------------- 内容准确性约定（重要，编辑教育内容前必读） ---------------------
 * 本文件中的学科知识点、概念表述、例题与术语，必须严格与国内现行教育体系保持一致，
 * 权威依据为：教育部《义务教育课程方案（2022 年版）》+ 各学科《义务教育课程标准（2022 年版）》
 * + 经教育部审定的统编（人教版）教材。
 * - 新增 / 修改教育性内容前，应先对照上述课标与教材核实，避免沿用未经核实或偏离大纲的表述。
 * - 英语起始年级：国家课程统一起始年级为三年级；一、二年级仅“有条件地区/学校”可开设听说启蒙（预备级）。
 * - 量化指标以统编教材与课标为准（如一年级约 690 认 / 300 写，二年级累计约 1600 认 / 800 写）。
 * - 凡“例题 / 术语”与官方教材存在版本差异，以官方教材为准，必要时标注版本（如“统编版”）。
 * ----------------------------------------------------------------------------------- */

/* ----------------------------- 学科 ----------------------------- */
// SUBJECTS 是全局唯一的学科定义，id 为稳定标识（用于路由 / 状态索引，切勿随意改动）。
// color 为学科主色（用于卡片、进度、徽章着色）；icon 对应 ui/Icon 的内置图标名。
export const SUBJECTS = [
  {
    id: 'chinese',
    name: '语文',
    color: 'var(--c-chinese)',
    icon: 'book',
    tagline: '识字 · 阅读 · 表达',
    desc: '从拼音到阅读，一步步爱上汉字与故事。',
  },
  {
    id: 'math',
    name: '数学',
    color: 'var(--c-math)',
    icon: 'calculator',
    tagline: '计算 · 逻辑 · 思维',
    desc: '口算、图形与应用题，玩着练出数学脑。',
  },
  {
    id: 'english',
    name: '英语',
    color: 'var(--c-english)',
    icon: 'language',
    tagline: '单词 · 听说 · 兴趣',
    desc: '字母、单词与日常对话，轻松开口说。',
  },
  {
    id: 'science',
    name: '科学',
    color: 'var(--c-science)',
    icon: 'bulb',
    tagline: '观察 · 探究 · 实验',
    desc: '从身边现象出发，动手做小实验，种下科学思维的种子。',
  },
];

// 学科 id 列表，供遍历 / 校验使用，避免在各处硬编码字符串。
export const SUBJECT_IDS = SUBJECTS.map((s) => s.id);

export const getSubject = (id) => SUBJECTS.find((s) => s.id === id);

/* ----------------------------- 课程 ----------------------------- */
// 每节课：id（学科内唯一）/ 标题 / 时长(分钟) / paragraphs（正文段落数组）/ texts（统编课文篇目与课后习题）
// 注意：

export const getLessons = (subjectId) => LESSONS[subjectId] || [];
export const getAllLessonIds = () =>
  Object.values(LESSONS).flat().map((l) => l.id);

// 统计全部课程数量（含所有学科），用于“总进度”等派生计算。
export const totalLessons = () => getAllLessonIds().length;

/* ----------------------------- 题库 ----------------------------- */
// 每题：id（学科内唯一）/ 题干 q / 选项 options / 正确项下标 answer / 解析 explanation
// answer 为 options 数组下标（0 起）；错题本以 question.id 记录已错题目。
// 题型约定：每题均为“单项选择题”（与 ExerciseEngine 的渲染契约一致：q / options / answer / explanation）。
// 题干与表述方式参照统编教材课后题风格（如“下列……正确的一项是”“选一选，填一填”“……的读音是”）。
// grade / point 为可选溯源字段（引擎忽略），用于标注该题对应的年级与知识点，便于核对“覆盖已规划的知识点”。
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
    // —— 以下为扩充题，覆盖 GRADE_KNOWLEDGE 中已规划的知识点 ——
    {
      id: 'cnq-5',
      grade: 1,
      point: '汉语拼音·认读',
      q: '“火”的读音是（ ）。',
      options: ['huǒ', 'hǔo', 'hòu', 'fǔo'],
      answer: 0,
      explanation: '“火”读 huǒ，三声；hǔo、hòu、fǔo 均非正确拼读。',
    },
    {
      id: 'cnq-6',
      grade: 1,
      point: '汉语拼音·整体认读',
      q: '整体认读音节一共有（ ）个。',
      options: ['16', '23', '24', '26'],
      answer: 0,
      explanation: '汉语拼音共有 16 个整体认读音节（zhi chi shi ri zi ci si yi wu yu ye yue yuan yin yun ying）。',
    },
    {
      id: 'cnq-7',
      grade: 1,
      point: '识字·偏旁部首',
      q: '下列字中，带“木”字旁的是（ ）。',
      options: ['河', '松', '洗', '江'],
      answer: 1,
      explanation: '“松”带木字旁，和树木有关；河、洗、江都带“氵”。',
    },
    {
      id: 'cnq-8',
      grade: 1,
      point: '古诗·背诵',
      q: '“床前明月光”的下一句是（ ）。',
      options: ['疑是地上霜', '低头思故乡', '举头望明月', '夜来风雨声'],
      answer: 0,
      explanation: '出自李白《静夜思》：“床前明月光，疑是地上霜。”',
    },
    {
      id: 'cnq-9',
      grade: 2,
      point: '识字·部首查字法',
      q: '用部首查字法查“李”字，应先查部首（ ）。',
      options: ['木', '子', '人', '一'],
      answer: 0,
      explanation: '“李”上下结构，部首为“木”（“子”亦可作部首，统编部首查字法以“木”为首选部首）。',
    },
    {
      id: 'cnq-10',
      grade: 1,
      point: '词语·搭配',
      q: '下列词语搭配不正确的一项是（ ）。',
      options: ['弯弯的小路', '闪闪的星星', '雪白的云朵', '高高的小狗'],
      answer: 3,
      explanation: '“高高的小狗”搭配不当，应为“高高的个子 / 小小的狗”；其余搭配均正确。',
    },
    {
      id: 'cnq-11',
      grade: 1,
      point: '古诗·积累',
      q: '“桃花潭水深千尺，不及汪伦送我情”出自（ ）。',
      options: ['《静夜思》', '《赠汪伦》', '《春晓》', '《登鹳雀楼》'],
      answer: 1,
      explanation: '这两句出自李白的《赠汪伦》，写朋友间深厚的友情。',
    },
    {
      id: 'cnq-12',
      grade: 2,
      point: '写话·标点符号',
      q: '下列句子中标点使用正确的一项是（ ）。',
      options: ['今天天气真好？', '妈妈说、我们去公园。', '你吃饭了吗？', '天空朵朵白云'],
      answer: 2,
      explanation: '问句末尾用问号，“你吃饭了吗？”正确；其余或标点误用，或缺少标点。',
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
    // —— 以下为扩充题，覆盖 GRADE_KNOWLEDGE 中已规划的知识点 ——
    {
      id: 'maq-5',
      grade: 2,
      point: '乘法口诀',
      q: '我们学习的“九九乘法口诀”一共有（ ）句。',
      options: ['45', '36', '81', '99'],
      answer: 0,
      explanation: '“小九九”为 1×1 到 9×9，共 45 句。',
    },
    {
      id: 'maq-6',
      grade: 1,
      point: '认识图形·角',
      q: '一个正方形有（ ）个直角。',
      options: ['2', '3', '4', '0'],
      answer: 2,
      explanation: '正方形的四个角都是直角，共 4 个。',
    },
    {
      id: 'maq-7',
      grade: 3,
      point: '时、分、秒',
      q: '钟面上的分针走一圈，是（ ）。',
      options: ['1 时', '1 分', '12 时', '1 秒'],
      answer: 0,
      explanation: '分针走一圈是 60 分钟，也就是 1 时。',
    },
    {
      id: 'maq-8',
      grade: 3,
      point: '万以内数的认识',
      q: '下面各数中，一个零也不读的是（ ）。',
      options: ['3005', '3050', '3500', '5030'],
      answer: 2,
      explanation: '3500 读作“三千五百”，末尾的零不读；其余都有零要读。',
    },
    {
      id: 'maq-9',
      grade: 2,
      point: '长度单位',
      q: '1 米 = （ ）厘米。',
      options: ['10', '100', '1000', '60'],
      answer: 1,
      explanation: '米和厘米之间的进率是 100，1 米 = 100 厘米。',
    },
    {
      id: 'maq-10',
      grade: 2,
      point: '表内除法·平均分',
      q: '把 12 个苹果平均分给 3 个小朋友，每人分（ ）个。',
      options: ['3', '4', '6', '9'],
      answer: 1,
      explanation: '12 ÷ 3 = 4，每人分到 4 个。',
    },
    {
      id: 'maq-11',
      grade: 4,
      point: '图形·对称轴',
      q: '下面图形中，有 3 条对称轴的是（ ）。',
      options: ['长方形', '正方形', '等边三角形', '圆'],
      answer: 2,
      explanation: '等边三角形有 3 条对称轴；长方形 2 条、正方形 4 条、圆有无数条。',
    },
    {
      id: 'maq-12',
      grade: 4,
      point: '多位数乘法',
      q: '下列算式中，结果最大的是（ ）。',
      options: ['25×4', '24×5', '23×6', '22×7'],
      answer: 3,
      explanation: '25×4=100，24×5=120，23×6=138，22×7=154，最大的是 22×7。',
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
    // —— 以下为扩充题；英语国家课程统一起始为三年级，此处对照统编三上内容（字母/颜色/动物/问候）——
    {
      id: 'enq-5',
      grade: 3,
      point: '颜色词汇',
      q: '“黄色”用英语怎么说？',
      options: ['yellow', 'blue', 'red', 'green'],
      answer: 0,
      explanation: 'yellow 是黄色。',
    },
    {
      id: 'enq-6',
      grade: 3,
      point: '动物词汇',
      q: '“狗”的英语是（ ）。',
      options: ['cat', 'dog', 'pig', 'duck'],
      answer: 1,
      explanation: 'dog 是狗。',
    },
    {
      id: 'enq-7',
      grade: 3,
      point: '字母·元音',
      q: '下列字母中，是元音字母的是（ ）。',
      options: ['B', 'C', 'A', 'D'],
      answer: 2,
      explanation: '英语元音字母有 A、E、I、O、U，所以 A 是元音字母。',
    },
    {
      id: 'enq-8',
      grade: 3,
      point: '日常句型',
      q: '“这是什么？”用英语怎么说？',
      options: ['What is this?', 'What is that?', 'What are these?', 'What colour is it?'],
      answer: 0,
      explanation: '“这是什么？”是 What is this?（that 指远处，these 是复数）。',
    },
    {
      id: 'enq-9',
      grade: 3,
      point: '句型理解',
      q: '“I like red.” 的意思是（ ）。',
      options: ['我喜欢红色。', '我喜欢红色吗？', '这是红色。', '红色的我。'],
      answer: 0,
      explanation: 'I like red. = 我喜欢红色。',
    },
    {
      id: 'enq-10',
      grade: 3,
      point: '主题词汇',
      q: '下列单词中，表示动物的是（ ）。',
      options: ['book', 'panda', 'pen', 'bag'],
      answer: 1,
      explanation: 'panda 是熊猫；book 书、pen 钢笔、bag 书包。',
    },
    {
      id: 'enq-11',
      grade: 3,
      point: '问候用语',
      q: '“Good morning.” 通常用于（ ）。',
      options: ['晚上睡觉前', '早上见面问候', '向人道歉', '与人道别'],
      answer: 1,
      explanation: 'Good morning. 是“早上好”，用于早晨见面问候。',
    },
    {
      id: 'enq-12',
      grade: 1,
      point: '字母顺序',
      q: '在字母表中，排在“C”后面的是（ ）。',
      options: ['B', 'D', 'A', 'E'],
      answer: 1,
      explanation: '英文字母顺序 A、B、C、D……所以 C 后面是 D。',
    },
  ],
};


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
export const REWARDS = [
  { id: 'hat-star', name: '星星头饰', icon: 'star', cost: 60, kind: 'hat', desc: '给星宝戴上一枚闪闪小星星' },
  { id: 'hat-crown', name: '小皇冠', icon: 'medal', cost: 150, kind: 'hat', desc: '今天你就是学习小王子' },
  { id: 'skin-sunset', name: '暖阳主题', icon: 'flame', cost: 120, kind: 'theme', desc: '把界面染成温暖的夕阳色' },
  { id: 'sticker-pack', name: '欢乐贴纸包', icon: 'heart', cost: 80, kind: 'sticker', desc: '解锁一整套可爱收藏贴纸' },
  { id: 'pet-plant', name: '魔法小盆栽', icon: 'sparkle', cost: 200, kind: 'pet', desc: '随打卡天数慢慢长大的小伙伴' },
];

// 按 id 取奖励；找不到返回 null（供模块做空值兜底）。
export const getReward = (id) => REWARDS.find((r) => r.id === id) || null;

/* ----------------------------- 其它文案 ----------------------------- */
// 主导航配置：全站唯一数据源（Header 直接引用此份，避免双份配置漂移）。
// 按业务类别拆分的独立菜单项；新增 / 删除路由只需改这里一处。
export const NAV_ITEMS = [
  { id: 'home', label: '首页', route: '/' },
  { id: 'learn', label: '学习', route: '/learn' },
  { id: 'textbook', label: '教材', route: '/textbook' },
  { id: 'review', label: '复习', route: '/review' },
  { id: 'growth', label: '成长', route: '/growth' },
  { id: 'grade', label: '年级', route: '/grade' },
  { id: 'play', label: '乐园', route: '/play' },
  { id: 'videos', label: '动画', route: '/videos' },
  { id: 'favorites', label: '收藏', route: '/favorites' },
  { id: 'parent', label: '家长', route: '/parent' },
];

export const PARENT_TIPS = [
  '每天陪孩子做 10 分钟互动练习，效果最好。',
  '用积分和徽章鼓励，比批评更有效。',
  '控制单次屏幕时间，保护视力与专注力。',
  '看完动画后问问孩子“学到了什么”，巩固记忆。',
];

/* ----------------------------- 趣味游戏素材 ----------------------------- */
// 记忆翻牌游戏的配对词库（字词 ↔ 图标）。纯数据，便于后续扩充或按学科切换。
// 图标统一引用 ui/Icon 的锁定字形（禁止 emoji 作功能图标，P0 合规）。
export const MATCH_WORDS = [
  { word: '书本', icon: 'book' },
  { word: '月亮', icon: 'moon' },
  { word: '星星', icon: 'star' },
  { word: '爱心', icon: 'heart' },
  { word: '火苗', icon: 'flame' },
  { word: '魔法', icon: 'sparkle' },
];


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
