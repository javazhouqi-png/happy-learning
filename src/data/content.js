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
// 每节课：id（学科内唯一）/ 标题 / 时长(分钟) / paragraphs（正文段落数组）/ texts（统编课文篇目与课后习题）
// 注意：
//  - LESSONS 的键名必须与 SUBJECTS 的 id 完全一致；课程完成状态以 lesson.id 作为索引。
//  - texts 字段为本次新增的“统编课文篇目 + 课后习题”，不影响既有 paragraphs 渲染与完成态逻辑。
//  - texts[].ref 标注该篇目在统编（人教版）教材中的出处（年级/单元），便于对照核实。
//  - texts[].exercises[] 为练习，type 取值：read(朗读) / recite(背诵) / think(想一想·说一说) / fill(选字/填空，带 options+answer+explanation) / connect(连一连，带 pairs)。
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
      texts: [
        {
          title: '《轻轻跳》',
          ref: '一年级上册 · 汉语拼音',
          exercises: [
            { type: 'read', prompt: '朗读儿歌，读准 b、p、m、f 的发音。' },
            { type: 'think', prompt: '和爸爸妈妈说一说：你还在哪些词里听到过 b、p、m、f？' },
          ],
        },
        {
          title: '《说话》',
          ref: '一年级上册 · 汉语拼音',
          exercises: [
            { type: 'read', prompt: '听读儿歌，注意“小溪流说话——哗哗哗”的节奏。' },
            { type: 'fill', prompt: '选一选，填一填：小鸽子说话（ ）。', options: ['哗哗哗', '咕咕咕', '呱呱呱', '喵喵喵'], answer: 1, explanation: '鸽子叫声是“咕咕咕”；小溪是哗哗，青蛙是呱呱，小猫是喵喵。' },
          ],
        },
        {
          title: '《过桥》',
          ref: '一年级上册 · 汉语拼音',
          exercises: [
            { type: 'recite', prompt: '背诵小儿歌，注意声调准确。' },
            { type: 'think', prompt: '你能照样子编一句“（ ）过桥”吗？试一试。' },
          ],
        },
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
      texts: [
        {
          title: '《天地人》',
          ref: '一年级上册 · 识字一',
          exercises: [
            { type: 'read', prompt: '朗读课文，读准字音。' },
            { type: 'think', prompt: '说一说：你认识了“天、地、人、你、我、他”中的哪几个字？' },
            { type: 'fill', prompt: '选字填空：（ ）们一起去上学。', options: ['你', '我', '他'], answer: 2, explanation: '“他”指第三人称他人；此处泛指同学们，用“他”合适。' },
          ],
        },
        {
          title: '《金木水火土》',
          ref: '一年级上册 · 识字一',
          exercises: [
            { type: 'recite', prompt: '背诵课文：“一二三四五，金木水火土……”' },
            { type: 'fill', prompt: '数一数：课文里一共写了几个数字？（ ）', options: ['3 个', '4 个', '5 个', '6 个'], answer: 2, explanation: '一、二、三、四、五，共 5 个数字。' },
          ],
        },
        {
          title: '《对韵歌》',
          ref: '一年级上册 · 识字一',
          exercises: [
            { type: 'read', prompt: '朗读课文，感受对韵的节奏。' },
            { type: 'connect', prompt: '连一连，找朋友。', pairs: [{ left: '云', right: '雨' }, { left: '雪', right: '风' }, { left: '花', right: '树' }, { left: '鸟', right: '虫' }] },
          ],
        },
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
      texts: [
        {
          title: '《咏鹅》',
          ref: '一年级上册 · 语文园地',
          exercises: [
            { type: 'recite', prompt: '背诵古诗《咏鹅》（唐·骆宾王）。' },
            { type: 'think', prompt: '诗里写了鹅的哪些部位？用“白毛、红掌、绿水”说一说。' },
          ],
        },
        {
          title: '《江南》',
          ref: '一年级上册 · 课文',
          exercises: [
            { type: 'recite', prompt: '背诵诗歌《江南》，注意“莲叶何田田”。' },
            { type: 'fill', prompt: '选字填空：鱼戏莲叶（ ）。', options: ['东', '冬', '洞', '同'], answer: 0, explanation: '原句为“鱼戏莲叶东”；注意“东”与“冬”同音不同字。' },
          ],
        },
        {
          title: '《悯农》（其二）',
          ref: '一年级上册 · 语文园地',
          exercises: [
            { type: 'recite', prompt: '背诵“锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。”' },
            { type: 'think', prompt: '为什么诗人说“粒粒皆辛苦”？吃饭时我们可以怎么做？' },
          ],
        },
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
      texts: [
        {
          title: '《数一数》',
          ref: '一年级上册 · 准备课',
          exercises: [
            { type: 'think', prompt: '数一数图中的小朋友和气球，各有多少个？' },
            { type: 'read', prompt: '用“1、2、3……”按顺序数一数，不重复、不遗漏。' },
          ],
        },
        {
          title: '《1～5 的认识和加减法》',
          ref: '一年级上册',
          exercises: [
            { type: 'fill', prompt: '算一算：3 + 2 =（ ）。', options: ['4', '5', '6', '1'], answer: 1, explanation: '3 添上 2 是 5，所以 3+2=5。' },
            { type: 'think', prompt: '用小棒摆一摆：怎样表示“5 可以分成 2 和 3”？' },
          ],
        },
        {
          title: '《20 以内的进位加法》',
          ref: '一年级上册',
          exercises: [
            { type: 'fill', prompt: '用凑十法算：9 + 5 =（ ）。', options: ['12', '13', '14', '15'], answer: 2, explanation: '9+5：把 5 分成 1 和 4，9+1=10，10+4=14。' },
            { type: 'read', prompt: '说给家长听：你是怎么用“凑十法”算出 9+5 的？' },
          ],
        },
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
      texts: [
        {
          title: '《表内乘法（一）》',
          ref: '二年级上册',
          exercises: [
            { type: 'fill', prompt: '算一算：3 × 4 =（ ）。', options: ['7', '12', '9', '15'], answer: 1, explanation: '3×4 表示 4 个 3 相加：3+3+3+3=12。' },
            { type: 'think', prompt: '摆小棒表示“4 个 3”，并用一句乘法口诀说出来。' },
            { type: 'read', prompt: '背出 3 的乘法口诀：一三得三、二三得六……' },
          ],
        },
        {
          title: '《表内乘法（二）》',
          ref: '二年级上册',
          exercises: [
            { type: 'fill', prompt: '算一算：7 × 8 =（ ）。', options: ['54', '56', '63', '49'], answer: 1, explanation: '“七八五十六”，所以 7×8=56。' },
            { type: 'connect', prompt: '连一连：把口诀和对应的算式连起来。', pairs: [{ left: '七八五十六', right: '7×8' }, { left: '六九五十四', right: '6×9' }, { left: '九九八十一', right: '9×9' }, { left: '五八四十', right: '5×8' }] },
          ],
        },
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
      texts: [
        {
          title: '《认识图形（一）》',
          ref: '一年级上册',
          exercises: [
            { type: 'think', prompt: '分一分：牙膏盒、皮球、积木块分别是什么形状？' },
            { type: 'read', prompt: '说一说：长方体、正方体、圆柱、球各有什么特点？' },
          ],
        },
        {
          title: '《观察物体（一）》',
          ref: '二年级上册',
          exercises: [
            { type: 'think', prompt: '从前面、侧面、上面看同一个物体，看到的形状一样吗？和同伴比一比。' },
            { type: 'fill', prompt: '选一选：球放在地上会（ ）。', options: ['稳稳不动', '滚动', '立起来', '变大'], answer: 1, explanation: '球是曲面，没有平面支撑，所以会滚动。' },
          ],
        },
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
      texts: [
        {
          title: 'Letters A–Z',
          ref: '三年级上册 · 字母学习',
          exercises: [
            { type: 'read', prompt: '听唱字母歌，按顺序认读 A B C … Z。' },
            { type: 'fill', prompt: '写出所给字母的左邻右舍：A （ ） C。', options: ['B', 'D', 'E', 'F'], answer: 0, explanation: '字母顺序 A、B、C，所以中间是 B。' },
            { type: 'think', prompt: '找一找：你的名字里出现了哪些字母？' },
          ],
        },
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
      texts: [
        {
          title: 'Unit 2 Colours',
          ref: '三年级上册',
          exercises: [
            { type: 'read', prompt: '听读颜色词：red, blue, yellow, green, black, white…' },
            { type: 'fill', prompt: '选一选：red 是（ ）。', options: ['红色', '蓝色', '黄色', '绿色'], answer: 0, explanation: 'red 红色；blue 蓝色；yellow 黄色；green 绿色。' },
            { type: 'think', prompt: '用英语说说：你的书包是什么颜色？' },
          ],
        },
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
      texts: [
        {
          title: 'Unit 4 We love animals',
          ref: '三年级上册',
          exercises: [
            { type: 'read', prompt: '听读动物词：cat, dog, bird, fish, panda, elephant…' },
            { type: 'fill', prompt: '选一选：panda 是（ ）。', options: ['猫', '狗', '熊猫', '鸟'], answer: 2, explanation: 'panda 是熊猫；cat 猫，dog 狗，bird 鸟。' },
            { type: 'think', prompt: '你最喜欢哪种动物？试着用英语“I like …”说一说。' },
          ],
        },
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

/* ----------------------------- 积分奖励商店 ----------------------------- */
// 可用积分兑换的「装饰性」奖励（不影响学习进度，纯趣味与个性化）。
// 借鉴 math-for-piglets 的“虚拟存钱罐”与 candy-learn-abacus 的“糖果/神奇花园”思路：
// 让积分既能“赚”也能“花”，形成正向激励闭环；同时这些奖励本身就是可收藏的贴纸（见 CollectionAlbum）。
// cost 为该奖励所需积分；kind 仅用于展示分组与图标配色。
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
// 主导航配置（与 Header 的 NAV 保持一致）：按业务类别拆分的独立菜单项。
// 仅供需要时复用；Header 当前内置同一份 NAV，避免跨文件耦合。
export const NAV_ITEMS = [
  { id: 'home', label: '首页', route: '/' },
  { id: 'learn', label: '学习', route: '/learn' },
  { id: 'review', label: '复习', route: '/review' },
  { id: 'growth', label: '成长', route: '/growth' },
  { id: 'play', label: '乐园', route: '/play' },
  { id: 'parent', label: '家长', route: '/parent' },
];

export const PARENT_TIPS = [
  '每天陪孩子做 10 分钟互动练习，效果最好。',
  '用积分和徽章鼓励，比批评更有效。',
  '控制单次屏幕时间，保护视力与专注力。',
  '看完动画后问问孩子“学到了什么”，巩固记忆。',
];

/* ----------------------------- 趣味游戏素材 ----------------------------- */
// 记忆翻牌游戏的配对词库（字词 ↔ emoji 图标）。纯数据，便于后续扩充或按学科切换。
export const MATCH_WORDS = [
  { word: '太阳', emoji: '☀️' },
  { word: '月亮', emoji: '🌙' },
  { word: '星星', emoji: '⭐' },
  { word: '苹果', emoji: '🍎' },
  { word: '书本', emoji: '📚' },
  { word: '小猫', emoji: '🐱' },
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

/* ----------------------------- 年级知识清单 ----------------------------- */
// 小学 1–6 年级核心知识点（与 docs/curriculum-roadmap.md 同源，此处为可在 App 内展示的结构化精简版）。
// 结构：GRADE_KNOWLEDGE[年级数字] = { label, subjects: { [subjectId]: { name, color, icon?, items: [{ title, core, why, scene }] } } }
// 说明：chinese/math/english 与 SUBJECTS 的 id 一致，可复用其主色与图标；science 为补充学科，自带配色与图标。
// 每一项均含：core（核心内容）、why（为什么必须掌握）、scene（真实情境中的应用），与路线图文档三栏一致。
export const GRADE_KNOWLEDGE = {
  1: {
    label: '一年级',
    subjects: {
      chinese: {
        name: '语文',
        items: [
          { title: '汉语拼音', core: '认读 23 声母、24 韵母、16 整体认读，掌握四声与拼读。', why: '自主阅读的拐杖，识字、查字典、打字都靠它打底。', scene: '用拼音在手机打字、查字典认生字、读带拼音的课外书。' },
          { title: '识字与写字', core: '会认约 700 字、会写约 300 字，掌握基本笔画与笔顺。', why: '识字是阅读与写作的前提，规范笔顺才能避免错别字。', scene: '读路牌包装、写自己的名字和生日贺卡、作业书写清晰不误判。' },
          { title: '朗读与背诵', core: '用普通话正确流利朗读，背诵优秀诗文。', why: '训练语感与语言积累，是口头与书面表达的素材库。', scene: '参加朗诵比赛、给家人讲故事、当众发言更自信。' },
        ],
      },
      math: {
        name: '数学',
        items: [
          { title: '0–20 数与加减', core: '数数、认读写 0–20，10 以内加减与 20 以内进位加法（凑十法）。', why: '全部算术的基石，数感不牢后续乘除、分数都会吃力。', scene: '数糖果分水果、算买东西找回几元、判断还差几个满 10 个。' },
          { title: '认识立体图形', core: '辨认长方体、正方体、圆柱、球。', why: '空间观念的第一步，为周长、面积、体积打基础。', scene: '搭积木、辨认包装盒与罐头、理解“球会滚、方块能叠”。' },
          { title: '比较与分类', core: '比较大小多少长短，按某一标准对物体分类。', why: '逻辑思维的起点，也是统计“数据整理”的雏形。', scene: '整理书包按学科分类、超市里把蔬菜归蔬菜区、挑出红色物品。' },
        ],
      },
      english: {
        name: '英语',
        note: '依据《义务教育英语课程标准（2022 年版）》，国家英语课程统一起始年级为三年级；一、二年级不作统一开课要求，仅“有条件的地区/学校”可开设，且以听说启蒙（预备级）为主，不要求书写与语法。以下内容按“一年级起点（启蒙）”呈现，供提前开设的地区/学校与家长参考。',
        items: [
          { title: '26 个字母认读', core: '认读并顺序背诵 26 个字母，区分大小写。', why: '英语文字的“零件”，是拼写、查词典、键盘输入的前提。', scene: '输入密码、按书脊字母顺序找书、看英文招牌首字母。' },
          { title: '问候与课堂用语', core: 'Hello / Hi / Thank you 与 Stand up 等指令。', why: '建立“英语是用来交流”的意识，消除开口恐惧。', scene: '和外国小朋友打招呼、听懂课堂指令、看动画理解简单对白。' },
          { title: '主题词汇', core: '颜色、数字、动物、食物等约 50–80 个词。', why: '词汇是语言的砖块，主题化记忆便于在情境中调用。', scene: '说出衣服颜色、玩数数游戏、在动物园指认动物。' },
        ],
      },
      science: {
        name: '科学',
        color: '#2bb3c0',
        icon: 'bulb',
        items: [
          { title: '观察与分类', core: '用感官观察生物，认识并区分常见材料。', why: '科学探究的起点，培养实证与归类意识。', scene: '辨认可食植物、区分木/塑料/金属制品。' },
          { title: '天气与力', core: '连续记录天气，感知推、拉等力。', why: '建立自然现象与物理直觉的最初经验。', scene: '看云识天气、玩跷跷板理解平衡。' },
        ],
      },
    },
  },
  2: {
    label: '二年级',
    subjects: {
      chinese: {
        name: '语文',
        items: [
          { title: '部首查字法', core: '累计认识常用汉字约 1600 个、会写约 800 个，学会用部首查字典独立识字。', why: '脱离“拼音拐杖”，具备自主识字能力的关键转折。', scene: '课外阅读遇生字自己查、写作时确认字怎么写。' },
          { title: '写话', core: '写自己想说的话，学用逗号、句号、问号、感叹号。', why: '写话是作文的预备阶段，训练逻辑组织与标点规范。', scene: '写日记记录一天、给朋友写便条、描述一幅图。' },
          { title: '阅读理解', core: '结合上下文理解词句，复述故事大意。', why: '从“认字”走向“读懂”，是高阶阅读的底座。', scene: '读完故事讲给家长听、做阅读题提取关键句。' },
        ],
      },
      math: {
        name: '数学',
        items: [
          { title: '100 以内数与乘法口诀', core: '认识 100 以内数，熟记 45 句乘法口诀。', why: '乘法是加法的简便运算，口诀是所有乘除的速度基础。', scene: '算 3 包糖每包 2 元、摆桌椅每排 6 把、理解“几个几”。' },
          { title: '长度单位', core: '认识厘米、米，会用尺子测量。', why: '从“数”走向“量”，为面积、体积、单位换算奠基。', scene: '量书桌高度与跳绳长度、按尺寸买画框。' },
          { title: '角与观察物体', core: '辨认直角、锐角、钝角，从不同方向看物体。', why: '发展空间想象力，是立体几何与三视图的前置经验。', scene: '判断三角板是什么角、从正侧面看柜子形状不同。' },
        ],
      },
      english: {
        name: '英语',
        note: '同一年级：国家英语课程统一起始年级为三年级，二年级仍属“有条件地区/学校”开设的听说启蒙（预备级），以兴趣与语感为主。以下内容按“一年级起点（启蒙）”呈现。',
        items: [
          { title: '学校与物品', core: 'school / classroom / book 等词与 I have… 句型。', why: '把英语和真实生活绑定，提升可理解输入与开口率。', scene: '介绍书包里有什么、描述教室物品、角色扮演上课。' },
          { title: '数字 11–20 与问句', core: 'eleven–twenty，What’s this? / How many? 的问答。', why: '数字扩展支撑数量交流，疑问句结构为对话打样。', scene: '数同学人数、问“这是什么”、商店情景问价量。' },
          { title: '现在进行时萌芽', core: '听懂并说出 I’m drawing. 等正在进行的动作。', why: '建立“时态”概念雏形，为三年级系统学习铺路。', scene: '描述“我正在做什么”、看图片说“他在跑”。' },
        ],
      },
      science: {
        name: '科学',
        color: '#2bb3c0',
        icon: 'bulb',
        items: [
          { title: '天气与季节', core: '连续记录天气，认识季节变化规律。', why: '建立长期观察习惯与最基础的数据意识。', scene: '记一周晴雨、理解穿衣随季节变化。' },
          { title: '力与简单机械', core: '感知力的大小与方向，认识杠杆、滑轮等。', why: '物理启蒙，理解生活里“省力”的原理。', scene: '用杠杆撬重物、滑轮提物、体会门轴省力。' },
        ],
      },
    },
  },
  3: {
    label: '三年级',
    subjects: {
      chinese: {
        name: '语文',
        items: [
          { title: '习作正式起步', core: '围绕一个意思写清楚一段话，学写请假条等应用文雏形。', why: '三年级是“习作”拐点，表达习惯决定成绩分化。', scene: '写《我的课余生活》、给同学写生日祝福、记录实验过程。' },
          { title: '阅读与段意', core: '给自然段标序号、归纳段意、把握文章主要内容。', why: '从读字面到读结构，是中学说明文、议论文阅读的必备。', scene: '阅读题概括段意、读新闻抓重点、预习理清脉络。' },
          { title: '文言与古诗', core: '接触简短文言、背诵更多古诗词，理解注释作用。', why: '建立文言语感与文化根基，降低高年级坡度。', scene: '读成语故事出处、古迹读懂楹联、理解“破釜沉舟”。' },
        ],
      },
      math: {
        name: '数学',
        items: [
          { title: '万以内数与加减', core: '认识万以内数、数位表，笔算两三位加减。', why: '十进制思想的集中体现，笔算规范影响所有运算正确率。', scene: '读商品价格、算家庭月支出、比较城市人口。' },
          { title: '倍与多位数乘', core: '理解“倍”是比较关系，掌握多位数乘一位数。', why: '从加法思维跨向比例思维，是分数百分数的源头。', scene: '哥哥年龄是弟弟 2 倍、3 盒每盒 12 支、按比例分糖。' },
          { title: '周长与分数初步', core: '长方形正方形周长；认识几分之一、几分之几。', why: '封闭图形度量前置；分数是“非整数”世界的钥匙。', scene: '相框镶边算用料、花坛围栅栏、分披萨每人 1/4。' },
        ],
      },
      english: {
        name: '英语',
        note: '自三年级起为国家英语课程统一起始年级（一级目标），后续各年级按课标分级体系进阶。以下为三年级国家课程要求。',
        items: [
          { title: '字母书写与语音', core: '四线三格规范书写，感知字母在词中的发音。', why: '规范书写是卷面分；语音意识决定见词能读。', scene: '抄写单词不串行、按发音猜拼写、朗读更流利。' },
          { title: '主题扩展', core: '身体/动物/颜色/食物等主题与 I like… 句型。', why: '句型框架让孩子能“造自己的句子”。', scene: '介绍自己、描述宠物、点餐对话。' },
          { title: '语篇与歌谣', core: '跟读短对话、唱英文歌、借助图片理解小故事。', why: '在韵律情境中内化语言，降低死记负担。', scene: '英语角表演歌谣、跟读动画、角色扮演。' },
        ],
      },
      science: {
        name: '科学',
        color: '#2bb3c0',
        icon: 'bulb',
        items: [
          { title: '植物的一生', core: '观察种子发芽、生长到开花结果的完整过程。', why: '理解生命周期，培养持续观察的习惯。', scene: '种豆看生长、记录高度变化并画图。' },
          { title: '溶解与磁铁', core: '探究物质溶解现象，认识磁铁吸铁。', why: '建立“变量控制”与对比实验的初步意识。', scene: '泡糖看溶解、用磁铁找掉落的针。' },
        ],
      },
    },
  },
  4: {
    label: '四年级',
    subjects: {
      chinese: {
        name: '语文',
        items: [
          { title: '阅读与情感', core: '概括主要内容，体会关键词句表达情意，学做批注。', why: '从“读懂”到“读深”，是文学鉴赏与信息提炼的关键。', scene: '写读书笔记、读非连文本（图表/说明书）、阅读题拿分。' },
          { title: '有条理习作', core: '写清起因经过结果，按时间/方位顺序写，学修改。', why: '条理性是逻辑表达的底线，修改培养读者意识。', scene: '写《一件难忘的事》、游记按游览顺序、自查润色。' },
          { title: '综合性学习', core: '围绕主题查资料、合作完成小报告并展示。', why: '培养信息素养与协作，是项目式学习的雏形。', scene: '做传统节日手抄报、小组汇报、整理资料成 PPT。' },
        ],
      },
      math: {
        name: '数学',
        items: [
          { title: '大数的认识', core: '认识亿级数位，读写大数，四舍五入求近似数。', why: '建立“数量级”观念，是科学计数法的基底。', scene: '读懂“某省人口 1.2 亿”、改写成以亿为单位、估算大数。' },
          { title: '三位乘两数与除数是两数的除法', core: '笔算三位数乘两位、除数是两位数的除法（试商）。', why: '整数乘除的最高阶段，方法可迁移到小数运算。', scene: '一箱 24 瓶共 125 箱、均分练习本、估算单价。' },
          { title: '运算定律', core: '运用交换律、结合律、分配律简便计算。', why: '代数思维的萌芽，也是初中学因式分解的伏笔。', scene: '购物凑整算总价、心算 25×44、理解先算哪都行。' },
          { title: '小数意义与图形', core: '小数意义性质、三角形分类与内角和。', why: '小数是度量与货币的核心；图形为面积几何奠基。', scene: '比对商品价格、读比例尺、认交通标志形状。' },
        ],
      },
      english: {
        name: '英语',
        items: [
          { title: '一般现在时', core: 'He/She 三单、There is/are，天气衣物等主题。', why: '时态系统正式展开，三单是初中语法重难点。', scene: '描述“她每天步行上学”、说房间里有床、聊天气穿衣。' },
          { title: '情态与请求', core: 'Can you…? / What would you like? 购物对话。', why: '功能语言学用，培养真实交际能力与礼仪。', scene: '餐厅点餐、借东西说 Can I use…?、商店问尺码颜色。' },
          { title: '阅读与写作', core: '读 50–80 词小短文作答，写 3–5 句小段落。', why: '读写结合闭环，为五六年级语篇写作铺路。', scene: '读英文小故事答题、写 My Day、做英语手抄报。' },
        ],
      },
      science: {
        name: '科学',
        color: '#2bb3c0',
        icon: 'bulb',
        items: [
          { title: '声音与电路', core: '探究声音高低，连接简单电路让小灯亮。', why: '从现象到原理，在“做中学”建立因果意识。', scene: '做小灯泡亮起来、辨别周围声音的高低。' },
          { title: '岩石与土壤', core: '观察岩石特征，认识土壤的组成。', why: '建立地球物质观念，连接生活与自然。', scene: '辨认岩石种类、种花了解土壤作用。' },
        ],
      },
    },
  },
  5: {
    label: '五年级',
    subjects: {
      chinese: {
        name: '语文',
        items: [
          { title: '叙事与人物描写', core: '分辨顺倒插叙，分析外貌/动作/语言/心理描写。', why: '从看情节到看写法，是阅读高分的“分水岭”。', scene: '分析写人作文好在哪、阅读题答“作者为何这样写”。' },
          { title: '写人记事与应用文', core: '用具体事例写人，学写书信、通知、倡议书。', why: '应用文是走向社会的实用文体，写人是中学主流。', scene: '给笔友写信、写班级活动通知、写最敬佩的人。' },
          { title: '名著初探', core: '接触《西游记》《三国演义》节选，学略读浏览。', why: '打通课内外，为初中整本书阅读做准备。', scene: '看改编剧对应原著、写读书心得、参加分享会。' },
        ],
      },
      math: {
        name: '数学',
        items: [
          { title: '小数乘除', core: '小数乘除法、循环小数、求近似数。', why: '贯通货币、测量、科学数据，对照分数与百分数。', scene: '算电费单价×用量、按汇率换算外币、均摊到角分。' },
          { title: '简易方程', core: '用字母表示数，解 ax±b=c，列方程解应用。', why: '从算术到代数的根本跨越，是初中数学入场券。', scene: '已知总价单价求数量、行程问题、储蓄利息雏形。' },
          { title: '因数倍数与立体', core: '因数倍数、质数合数、长方体正方体表面积体积。', why: '数论入门支撑约分通分；体积让空间观念质变。', scene: '12/18 约成 2/3、分小组取质数、算水箱装多少水。' },
          { title: '分数与多边形', core: '分数意义性质、通分约分、多边形面积、植树问题。', why: '分数是比例百分数前置；转化思想与建模启蒙。', scene: '通分比较、按配方取 3/4 杯、街道种树算棵数。' },
        ],
      },
      english: {
        name: '英语',
        items: [
          { title: '现在进行时与频度', core: 'be + V-ing；often/usually 等频度副词。', why: '时态对比建立时间轴，频度副词丰富写作。', scene: '描述“此刻大家在做什么”、说通常周末去公园。' },
          { title: '话题深化', core: '周末/季节/生日/家务主题对话与短文。', why: '贴近生活提升语用，融入跨文化表达。', scene: '聊最爱季节及原因、写我的生日、描述家务。' },
          { title: '语篇写作', core: '写 60–100 词连贯短文，用连接词表观点。', why: '写作从句子升级到语篇，是初中硬实力。', scene: '写 My Weekend、参加作文竞赛、留学素材雏形。' },
        ],
      },
      science: {
        name: '科学',
        color: '#2bb3c0',
        icon: 'bulb',
        items: [
          { title: '光与影', core: '探究光的直线传播与影子的形成。', why: '为初中光学打底，建立“模型解释现象”的思维。', scene: '做潜望镜、影子实验、理解日食原理。' },
          { title: '地球与生物环境', core: '认识地球运动，理解食物链与生态平衡。', why: '建立生态系统的整体观，连接人与自然。', scene: '理解昼夜四季、画食物链、保护本地生态。' },
        ],
      },
    },
  },
  6: {
    label: '六年级',
    subjects: {
      chinese: {
        name: '语文',
        items: [
          { title: '文体与快速阅读', core: '区分记叙/说明/议论，浏览跳读获取信息。', why: '初中阅读量激增、文体多元，须“因文体而读”。', scene: '快速读新闻抓要点、读科普识说明方法、高效完成长阅读。' },
          { title: '应用文与立意', core: '写建议书、演讲稿、读后感，围绕中心选材。', why: '应用文是公民素养，立意选材对接中考作文。', scene: '写“给校长的建议书”、国旗下演讲、读后感应评比。' },
          { title: '古诗文与小初衔接', core: '背诵更多古诗文，理解文言常用词。', why: '小学积累越厚，初中《论语》《出师表》越轻松。', scene: '读懂碑文楹联、理解成语典故原文、预习不掉队。' },
        ],
      },
      math: {
        name: '数学',
        items: [
          { title: '分数乘除与比比例', core: '分数乘除应用、比的意义化简、解比例。', why: '分数—比—比例一脉相承，是初中函数与相似形基础。', scene: '按比例放大配方、用地图比例尺算实地距离、调配浓度。' },
          { title: '百分数', core: '百分数意义，折扣、税率、利率、合格率等应用。', why: '生活数学的通用语言，消费金融统计无处不在。', scene: '算打八折省多少、看银行存款利率、读“及格率 95%”。' },
          { title: '圆与扇形', core: '圆的认识、周长面积，读取扇形统计图。', why: '首次系统研究曲线图形，扇形图是常用呈现方式。', scene: '算花坛围栏与铺草面积、看支出占比扇形图、理解 π。' },
          { title: '圆柱圆锥与负数', core: '圆柱表面积体积、负数与数轴、整理复习。', why: '旋转体体积巅峰；负数是数系扩张、数轴是坐标系基石。', scene: '算易拉罐用铝、看天气预报零下 5℃、记账“支出为负”。' },
        ],
      },
      english: {
        name: '英语',
        items: [
          { title: '一般将来时', core: 'be going to / will 表达将来，制定计划。', why: '时态体系补全，是初一时态学习的直接衔接点。', scene: '说“暑假我打算去北京”、写旅行计划、讨论下周做什么。' },
          { title: '比较级与综合话题', core: '形容词比较级、职业/爱好/情绪/交通话题。', why: '比较级是初中形容词副词核心；综合话题提升交际完整度。', scene: '比较“我比你高”、介绍家人职业、描述出行方式。' },
          { title: '阅读写作综合', core: '读 100–150 词做推理，写结构完整短文。', why: '达到“用英语做事情”的初步水平，平稳过渡初中。', scene: '读故事做判断推理、写自我介绍/邮件、应对入学测试。' },
        ],
      },
      science: {
        name: '科学',
        color: '#2bb3c0',
        icon: 'bulb',
        items: [
          { title: '微小世界', core: '用放大镜/显微镜观察微小物体与结构。', why: '拓展观察尺度，培养精细观察与实证精神。', scene: '看昆虫结构、观察细胞、认识微生物。' },
          { title: '物质变化与宇宙', core: '区分物理与化学变化，认识星座与宇宙。', why: '建立变化分类与宇宙观念，衔接中学理科。', scene: '醋泡蛋壳看变化、区分铁生锈、认北斗七星。' },
        ],
      },
    },
  },
};

// 年级列表（1–6），供年级切换 Tab 遍历。
export const GRADES = [1, 2, 3, 4, 5, 6];

// 按年级取知识清单；年级不存在时返回 null（由调用方兜底展示空态）。
export const getGradeKnowledge = (g) => GRADE_KNOWLEDGE[g] || null;

/* ----------------------------- 品牌与页脚（展示用） ----------------------------- */
export const brand = { name: '快乐学园', slogan: '快乐学习，每天进步一点点' };

export const footerColumns = [
  {
    title: '学习',
    links: [
      { label: '学习中心', to: '/learn' },
      { label: '复习中心', to: '/review' },
      { label: '成长中心', to: '/growth' },
      { label: '动画课堂', to: '/videos' },
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
