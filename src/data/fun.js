// 趣味文案与彩蛋语料。集中管理，统一童趣调性，并便于后续扩充。
// 随机抽取用 pickRandom，让每次反馈都有新鲜感，孩子不容易腻。

// 从数组里随机取一条；空数组返回空串，保证调用方永远拿得到可渲染文本。
export function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return ''
  return list[Math.floor(Math.random() * list.length)]
}

// 答对时的鼓励语（随机取一条）
export const PRAISE = [
  '答对啦！你就是小天才 🌟',
  '太棒了，这道题被你秒杀！',
  '稳！正确率拉满～',
  '聪明如你，继续冲！',
  '哇，这题也难不倒你！',
]

// 答错时的温柔安慰（不打击信心，引导看解析）
export const ENCOURAGE = [
  '差一点点，再看看解析就好啦～',
  '没关系，答错的题星宝会帮你记着！',
  '小失误而已，下一题一定行！',
  '别急，慢慢想，你可以的！',
]

// 全部答对（闯关成功）的庆祝语
export const CLEAR_ALL = [
  '全部答对！你就是本题库的王 👑',
  '通关啦！奖励你一朵小红花 🌸',
  '满分通关，棒棒哒！',
]

// 升级时的贺词
export const LEVEL_UP = [
  '升级啦！新的称号在等你～',
  '等级提升，你越来越厉害了！',
  '又升级了，继续加油哦！',
]

// 徽章解锁的提示
export const BADGE_UNLOCK = [
  '解锁新徽章！去勋章墙看看吧～',
  '哇，又一枚徽章到手！',
]

// 彩蛋语料（点 logo / 吉祥物触发）
export const EGG_MESSAGES = [
  '🥚 你发现了隐藏彩蛋！快乐学园永远欢迎好奇宝宝～',
  '🎉 彩蛋 get！其实你比想象中更棒！',
  '✨ 秘密被你戳穿啦，送你一个虚拟拥抱！',
]

// 吉祥物不同心情下的台词（点击它时会冒出来）
export const MASCOT_LINES = {
  idle: '嗨～一起学习吧！',
  cheer: '答对啦，太开心啦！',
  sad: '没关系，再试一次就好～',
  dance: '耶！发现彩蛋，跳舞庆祝！',
  think: '让我想想这道题……',
}
