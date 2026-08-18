// 语音朗读封装：封装浏览器原生 SpeechSynthesis（Web Speech API），不引入任何依赖。
// 用于「听一听」朗读课文 / 古诗，帮助低龄儿童跟读。不支持时由调用方降级处理。

const SUPPORTED =
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

/** 当前环境是否支持语音合成。 */
export function speechSupported() {
  return SUPPORTED
}

/**
 * 朗读一段文本（普通话）。
 * @param {string} text 待朗读文本
 * @param {object} opts { lang, rate, onEnd, onError }
 * @returns {boolean} 是否成功发起朗读
 */
export function speak(text, opts = {}) {
  if (!SUPPORTED || !text) return false
  const { lang = 'zh-CN', rate = 0.9, onEnd, onError } = opts
  try {
    // 先取消可能正在进行的朗读，避免叠加串音。
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = rate
    u.pitch = 1

    // 优先挑选中文嗓音；部分浏览器嗓音列表异步加载，需监听 voiceschanged。
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      const zh = voices.find((v) => /zh|cmn|Chinese/i.test(v.lang) || /中文|普通话|国语/.test(v.name))
      if (zh) u.voice = zh
    }
    pickVoice()
    if (window.speechSynthesis.onvoiceschanged === null || window.speechSynthesis.onvoiceschanged === undefined) {
      window.speechSynthesis.onvoiceschanged = pickVoice
    }

    u.onend = () => {
      if (onEnd) onEnd()
    }
    u.onerror = () => {
      if (onError) onError()
    }
    window.speechSynthesis.speak(u)
    return true
  } catch (e) {
    if (onError) onError(e)
    return false
  }
}

/** 停止当前朗读。组件卸载或再次点击时调用，防止串音。 */
export function cancelSpeech() {
  if (SUPPORTED) window.speechSynthesis.cancel()
}
