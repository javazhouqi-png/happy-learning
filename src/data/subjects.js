/* 核心参考数据 + 等级体系（主包 AppContext 等静态引用，须保持轻量）。
   从 content.js 拆分而来，避免年级海量数据（GRADE_LEARNING 等）被主包静态引用。
   本文件仅含：BADGES / LESSONS / 等级体系常量与推导函数。 */

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
        {
          title: '《口耳目》',
          ref: '一年级上册 · 识字一',
          exercises: [
            { type: 'read', prompt: '朗读课文，读准字音。' },
            { type: 'fill', prompt: '选字填空：站如（ ），坐如钟。', options: ['松', '钟', '风', '虫'], answer: 1, explanation: '“站如松，坐如钟”是课文原句；注意“钟”与“松”的读音不同。' },
            { type: 'think', prompt: '说一说：你的口、耳、目分别能做什么？' },
          ],
        },
        {
          title: '《日月水火》',
          ref: '一年级上册 · 识字一',
          exercises: [
            { type: 'recite', prompt: '看图认字：日、月、水、火、山、石、田、禾。' },
            { type: 'fill', prompt: '选一选：“火”字像（ ）。', options: ['一团火苗', '一道水波', '一座山', '一轮太阳'], answer: 0, explanation: '“火”的字形像跳动的火苗；日是太阳，水是水波。' },
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
    {
      id: 'cn-4',
      title: '课文我会读',
      duration: 8,
      paragraphs: [
        '课文里有美丽的图画和有趣的故事。读准字音，读出节奏，你也能讲给别人听。',
        '《秋天》写了天气凉了、树叶黄了；《小小的船》把月儿比作小船；《四季》说了春、夏、秋、冬的不同。',
        '大声朗读三遍，再试着背一背你最喜欢的一篇！',
      ],
      texts: [
        {
          title: '《秋天》',
          ref: '一年级上册 · 课文',
          exercises: [
            { type: 'recite', prompt: '朗读课文：“天气凉了，树叶黄了，一片片叶子从树上落下来……”' },
            { type: 'fill', prompt: '选一选：秋天到了，树叶（ ）。', options: ['变绿了', '黄了落下来', '开花了', '长高了'], answer: 1, explanation: '秋天天气转凉，树叶变黄飘落；这是课文描写的景象。' },
            { type: 'think', prompt: '你眼中的秋天还有什么变化？和爸爸妈妈说一说。' },
          ],
        },
        {
          title: '《小小的船》',
          ref: '一年级上册 · 课文',
          exercises: [
            { type: 'recite', prompt: '背诵：“弯弯的月儿小小的船，小小的船儿两头尖……”' },
            { type: 'fill', prompt: '选字填空：弯弯的（ ）儿小小的船。', options: ['月', '日', '星', '云'], answer: 0, explanation: '原句为“弯弯的月儿小小的船”；月儿弯弯像小船。' },
          ],
        },
        {
          title: '《四季》',
          ref: '一年级上册 · 课文',
          exercises: [
            { type: 'read', prompt: '朗读课文，注意草芽、荷叶、谷穗、雪人的不同语气。' },
            { type: 'think', prompt: '你最喜欢哪个季节？用“（ ）说：‘我是（ ）天。’”的句式说一说。' },
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
          ref: '一年级上册 · 1～5的认识和加减法',
          exercises: [
            { type: 'fill', prompt: '算一算：3 + 2 =（ ）。', options: ['4', '5', '6', '1'], answer: 1, explanation: '3 添上 2 是 5，所以 3+2=5。' },
            { type: 'think', prompt: '用小棒摆一摆：怎样表示“5 可以分成 2 和 3”？' },
          ],
        },
        {
          title: '《20 以内的进位加法》',
          ref: '一年级上册 · 20以内的进位加法',
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
          ref: '一年级上册 · 表内乘法（一）',
          exercises: [
            { type: 'fill', prompt: '算一算：3 × 4 =（ ）。', options: ['7', '12', '9', '15'], answer: 1, explanation: '3×4 表示 4 个 3 相加：3+3+3+3=12。' },
            { type: 'think', prompt: '摆小棒表示“4 个 3”，并用一句乘法口诀说出来。' },
            { type: 'read', prompt: '背出 3 的乘法口诀：一三得三、二三得六……' },
          ],
        },
        {
          title: '《表内乘法（二）》',
          ref: '一年级上册 · 表内乘法（二）',
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
          ref: '一年级上册 · 认识图形（一）',
          exercises: [
            { type: 'think', prompt: '分一分：牙膏盒、皮球、积木块分别是什么形状？' },
            { type: 'read', prompt: '说一说：长方体、正方体、圆柱、球各有什么特点？' },
          ],
        },
        {
          title: '《观察物体（一）》',
          ref: '一年级上册 · 观察物体（一）',
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
          ref: '三年级上册 · Unit 2 Colours',
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
          ref: '三年级上册 · Unit 4 Animals',
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
