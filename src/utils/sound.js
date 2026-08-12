// 轻量音效：使用浏览器原生 Web Audio API，不引入任何第三方库。
// 仅在用户交互（点击）触发的回调里调用，符合浏览器自动播放策略。
// 家长设置中的“音效反馈”开关由调用方（FunProvider）统一判断，这里只负责发声。

let ctx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  // 部分浏览器初始为 suspended，需 resume 后才能发声
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// 单个音符：频率 / 起始(秒) / 时长(秒) / 波形 / 音量
function tone(freq, start, dur, type = 'sine', gainVal = 0.18) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = c.currentTime + start
  // 轻快的“叮”声：快速起音 + 指数衰减，避免刺耳
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(gainVal, t0 + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

// 不同事件对应不同“旋律”，用琶音/和弦营造游戏感
const RECIPES = {
  correct: () => { tone(660, 0, 0.12, 'sine'); tone(880, 0.08, 0.16, 'sine') }, // 上行两音：答对
  wrong: () => { tone(311, 0, 0.18, 'triangle'); tone(233, 0.12, 0.22, 'triangle') }, // 下行：答错
  ding: () => { tone(988, 0, 0.18, 'sine') }, // 视频完成
  fanfare: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.2, 'triangle')) }, // 闯关/解锁
  levelup: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.08, 0.22, 'sine')) }, // 升级
  egg: () => { [784, 988, 1319, 988, 1319].forEach((f, i) => tone(f, i * 0.07, 0.16, 'square', 0.12)) }, // 彩蛋
}

export function playSound(type) {
  const fn = RECIPES[type]
  if (fn) {
    try { fn() } catch { /* 音频不可用时静默忽略 */ }
  }
}
