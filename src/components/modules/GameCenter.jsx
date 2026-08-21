import { useState, useRef, useEffect, useMemo } from 'react'
import { useApp } from '../../state/AppContext.jsx'
import { useFun } from '../fun/FunContext.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { MATCH_WORDS } from '../../data/content.js'
import { getGradeLearning } from '../../data/grade.js'
import { speak, cancelSpeech, speechSupported } from '../../utils/speech.js'
import styles from './GameCenter.module.css'

const REWARD = 20 // 每通关一次的积分奖励

// Fisher–Yates 洗牌：用 Math.random 打乱数组，返回新数组（不改原数组）。
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck() {
  const pairs = MATCH_WORDS.map((w, i) => ({ pairId: i, ...w }))
  return shuffle([...pairs, ...pairs]).map((c, i) => ({ ...c, idx: i }))
}

const MODES = [
  { id: 'memory', label: '记忆翻牌', icon: 'gamepad' },
  { id: 'flash', label: '知识点闪卡', icon: 'book' },
  { id: 'arith', label: '口算闯关', icon: 'calculator' },
  { id: 'dictate', label: '听写跟读', icon: 'volume' },
]

// 趣味游戏中心：零依赖的「记忆翻牌」+ 三类互动学习（闪卡 / 口算 / 听写）。
// 各模式仅负责挂载与计分回调——完成后经 AppContext.addPoints 加分，并复用 useFun 的庆祝 / 音效。
export default function GameCenter() {
  const [mode, setMode] = useState('memory')

  return (
    <section className="section section--alt" id="game">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="趣味游戏 · PLAY"
          eyebrowIcon="gamepad"
          color="var(--c-gamify)"
          title="趣味游戏与互动学习"
          subtitle="翻牌配对、知识点闪卡、口算闯关、听写跟读——在玩中巩固，越学越上瘾！"
        />

        <div className={styles.modeTabs}>
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`${styles.modeTab} ${mode === m.id ? styles.modeTabActive : ''}`}
              onClick={() => setMode(m.id)}
            >
              <Icon name={m.icon} size={16} fill={mode === m.id ? 'currentColor' : 'none'} />
              {m.label}
            </button>
          ))}
        </div>

        <div className={styles.panel}>
          {mode === 'memory' && <MemoryGame />}
          {mode === 'flash' && <FlashCardGame />}
          {mode === 'arith' && <ArithmeticGame />}
          {mode === 'dictate' && <DictationGame />}
        </div>
      </div>
    </section>
  )
}

// 记忆翻牌：零依赖小游戏（保留原实现）。
function MemoryGame() {
  const { actions } = useApp()
  const { celebrate, sound } = useFun()
  const [cards, setCards] = useState(() => buildDeck())
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [busy, setBusy] = useState(false)
  const awardedRef = useRef(false)

  const finish = () => {
    if (awardedRef.current) return
    awardedRef.current = true
    actions.addPoints(REWARD, '记忆翻牌游戏')
    celebrate({ title: `闯关成功！+${REWARD} 积分`, icon: 'confetti', confetti: true })
    sound('fanfare')
  }

  const onCard = (idx) => {
    if (busy) return
    if (flipped.includes(idx)) return
    if (matched.includes(cards[idx].pairId)) return
    const next = [...flipped, idx]
    setFlipped(next)
    if (next.length === 2) {
      setBusy(true)
      const [a, b] = next
      const isMatch = cards[a].pairId === cards[b].pairId
      setTimeout(() => {
        if (isMatch) {
          const newMatched = [...matched, cards[a].pairId]
          setMatched(newMatched)
          sound('correct')
          if (newMatched.length === MATCH_WORDS.length) finish()
        } else {
          sound('wrong')
        }
        setFlipped([])
        setBusy(false)
      }, isMatch ? 350 : 700)
    }
  }

  const restart = () => {
    awardedRef.current = false
    setMatched([])
    setFlipped([])
    setBusy(false)
    setCards(buildDeck())
  }

  return (
    <>
      <div className={styles.bar}>
        <span className={styles.progress}>
          已配对 <strong>{matched.length}</strong> / {MATCH_WORDS.length}
        </span>
        <Button variant="soft" size="sm" onClick={restart}>重新开始</Button>
      </div>
      <div className={styles.board}>
        {cards.map((c) => {
          const isFlipped = flipped.includes(c.idx)
          const isMatched = matched.includes(c.pairId)
          const faceUp = isFlipped || isMatched
          return (
            <button
              key={c.idx}
              className={`${styles.card} ${faceUp ? styles.faceUp : ''} ${isMatched ? styles.matched : ''}`}
              onClick={() => onCard(c.idx)}
              disabled={busy || isMatched}
              aria-label={faceUp ? `${c.word}` : '未翻开的牌'}
            >
              <span className={styles.back}>?</span>
              <span className={styles.front}>
                <Icon name={c.icon} size={30} className={styles.faceIcon} />
                <span className={styles.word}>{c.word}</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className={styles.tip}>小提示：先记住牌的位置，下一轮就能更快配对啦～</p>
    </>
  )
}

// 知识点闪卡：由当前年级 GRADE_LEARNING 的各类知识点生成卡组，认识 / 不认识分流，不认识可收藏。
function FlashCardGame() {
  const { state, actions } = useApp()
  const { sound } = useFun()

  const deck = useMemo(() => {
    const gl = getGradeLearning(state.grade)
    if (!gl) return []
    const list = []
    ;['chinese', 'math', 'english', 'science'].forEach((sub) => {
      const points = gl.subjects?.[sub]?.points || []
      points.forEach((p) => {
        if (p.title && p.core) list.push({ id: p.id || `${sub}-${p.title}`, front: p.title, back: p.core, subject: sub })
      })
    })
    return shuffle(list)
  }, [state.grade])

  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [known, setKnown] = useState(0)
  const [unknown, setUnknown] = useState([])
  const [done, setDone] = useState(false)

  const restart = () => {
    setIdx(0)
    setRevealed(false)
    setKnown(0)
    setUnknown([])
    setDone(false)
  }

  if (deck.length === 0) {
    return <p className={styles.tip}>当前年级暂无可用的知识点卡片，换个年级或先学几节课再来试试～</p>
  }

  if (done) {
    return (
      <div className={styles.flashEnd}>
        <h3 className={styles.flashEndTitle}>本轮完成！</h3>
        <p>认识 <strong>{known}</strong> 个 · 待巩固 <strong>{unknown.length}</strong> 个</p>
        {unknown.length > 0 && (
          <ul className={styles.unknownList}>
            {unknown.map((u) => (
              <li key={u.id}>
                <span>{u.front}</span>
                <button
                  type="button"
                  className={styles.miniBtn}
                  onClick={() => actions.toggleFavorite({ kind: 'point', key: u.id, title: u.front, subject: u.subject, grade: state.grade, addedAt: Date.now() })}
                >
                  <Icon name="star" size={13} /> 收藏
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button variant="soft" size="sm" onClick={restart}>再来一轮</Button>
      </div>
    )
  }

  const card = deck[idx]
  const next = () => {
    setRevealed(false)
    if (idx + 1 >= deck.length) setDone(true)
    else setIdx(idx + 1)
  }

  return (
    <div className={styles.flash}>
      <div className={styles.flashProgress}>第 {idx + 1} / {deck.length} 张</div>
      <div className={styles.flashCard}>
        <h3 className={styles.flashFront}>{card.front}</h3>
        {revealed ? (
          <p className={styles.flashBack}>{card.back}</p>
        ) : (
          <button type="button" className={styles.revealBtn} onClick={() => { setRevealed(true); sound('correct') }}>
            翻看答案
          </button>
        )}
      </div>
      <div className={styles.flashActions}>
        <Button variant="soft" size="sm" onClick={() => { setKnown((k) => k + 1); next() }}>
          <Icon name="check" size={14} /> 认识了
        </Button>
        <Button variant="primary" size="sm" onClick={() => { setUnknown((u) => [...u, card]); next() }}>
          不认识
        </Button>
      </div>
    </div>
  )
}

// 口算闯关：按年级生成题目，60 秒计时，实时计分 + 连击，结束结算并发积分。
function makeProblem(grade) {
  const ops = grade <= 2 ? ['+', '-'] : grade <= 4 ? ['+', '-', '×'] : ['+', '-', '×', '÷']
  const op = ops[Math.floor(Math.random() * ops.length)]
  const max = grade <= 2 ? 20 : 100
  let a, b, answer
  if (op === '+') {
    a = Math.floor(Math.random() * max) + 1
    b = Math.floor(Math.random() * max) + 1
    answer = a + b
  } else if (op === '-') {
    a = Math.floor(Math.random() * max) + 1
    b = Math.floor(Math.random() * (a + 1))
    answer = a - b
  } else if (op === '×') {
    a = Math.floor(Math.random() * 9) + 1
    b = Math.floor(Math.random() * 9) + 1
    answer = a * b
  } else {
    b = Math.floor(Math.random() * 9) + 1
    const q = Math.floor(Math.random() * 9) + 1
    a = b * q
    answer = q
  }
  return { text: `${a} ${op} ${b} = ?`, answer }
}

function ArithmeticGame() {
  const { state, actions } = useApp()
  const { celebrate, sound } = useFun()
  const [problem, setProblem] = useState(() => makeProblem(state.grade))
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [running, setRunning] = useState(true)
  const awardedRef = useRef(false)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running])

  const submit = () => {
    if (!running) return
    const val = Number(input)
    if (val === problem.answer) {
      const newCombo = combo + 1
      setCombo(newCombo)
      setScore((s) => s + 1 + Math.floor(newCombo / 3))
      sound('correct')
    } else {
      setCombo(0)
      sound('wrong')
    }
    setInput('')
    setProblem(makeProblem(state.grade))
  }

  const restart = () => {
    awardedRef.current = false
    setProblem(makeProblem(state.grade))
    setInput('')
    setScore(0)
    setCombo(0)
    setTimeLeft(60)
    setRunning(true)
  }

  const finish = () => {
    if (awardedRef.current) return
    awardedRef.current = true
    const reward = score >= 5 ? REWARD : score * 2
    if (reward > 0) actions.addPoints(reward, '口算闯关')
    celebrate({ title: `口算结束！+${reward} 积分`, icon: 'confetti', confetti: true })
  }

  // 时间到：结算一次（幂等）。
  useEffect(() => {
    if (!running && timeLeft === 0) finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, timeLeft])

  return (
    <div className={styles.arith}>
      <div className={styles.arithBar}>
        <span className={styles.arithStat}>得分 <strong>{score}</strong></span>
        <span className={styles.arithStat}>连击 <strong>{combo}</strong></span>
        <span className={styles.arithStat}>剩余 <strong>{timeLeft}</strong> 秒</span>
        <Button variant="soft" size="sm" onClick={restart}>重新开始</Button>
      </div>
      {running ? (
        <>
          <div className={styles.arithProblem}>{problem.text}</div>
          <div className={styles.arithInputRow}>
            <input
              className={styles.arithInput}
              type="number"
              inputMode="numeric"
              value={input}
              placeholder="输入答案"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
            />
            <Button variant="primary" size="sm" onClick={submit}>提交</Button>
          </div>
          <p className={styles.tip}>提示：按回车也能提交；连对 3 题有额外加分～</p>
        </>
      ) : (
        <div className={styles.flashEnd}>
          <h3 className={styles.flashEndTitle}>时间到！</h3>
          <p>本轮答对 <strong>{score}</strong> 题{score >= 5 ? '，已发放积分奖励' : '，再接再厉～'}</p>
          <Button variant="soft" size="sm" onClick={restart}>再来一局</Button>
        </div>
      )}
    </div>
  )
}

// 听写跟读：复用 TTS 朗读词，儿童跟读；诚实边界——不评分、不造假，仅陪练。
function DictationGame() {
  const { state } = useApp()
  const supported = speechSupported()
  const [items, setItems] = useState([])
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const gl = getGradeLearning(state.grade)
    const list = []
    const en = gl?.subjects?.english?.points || []
    const cn = gl?.subjects?.chinese?.points || []
    en.slice(0, 4).forEach((p) => list.push({ text: p.title, lang: 'en-US', label: '英语' }))
    cn.slice(0, 4).forEach((p) => list.push({ text: p.title, lang: 'zh-CN', label: '语文' }))
    setItems(shuffle(list))
    setIdx(0)
    setRevealed(false)
  }, [state.grade])

  useEffect(() => () => cancelSpeech(), [])

  const play = () => {
    const it = items[idx]
    if (!it) return
    speak(it.text, { lang: it.lang, rate: it.lang === 'en-US' ? 0.8 : 0.9 })
    setRevealed(false)
  }

  // 进入新词时自动朗读一次。
  useEffect(() => {
    if (items.length && supported) play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, items.length])

  if (!supported) {
    return <p className={styles.tip}>当前设备不支持语音朗读，听写跟读暂不可用～ 其他模式照常可玩。</p>
  }
  if (items.length === 0) {
    return <p className={styles.tip}>当前年级暂无可听写的内容，换个年级试试～</p>
  }

  const it = items[idx]
  const next = () => {
    setRevealed(false)
    if (idx + 1 >= items.length) setIdx(0)
    else setIdx(idx + 1)
  }

  return (
    <div className={styles.dictate}>
      <div className={styles.flashProgress}>第 {idx + 1} / {items.length} 个 · {it.label}</div>
      <div className={styles.dictateCard}>
        <button type="button" className={styles.dictatePlay} onClick={play} aria-label="播放朗读">
          <Icon name="volume" size={34} fill="currentColor" />
        </button>
        {revealed ? (
          <p className={styles.dictateText}>{it.text}</p>
        ) : (
          <p className={styles.dictateHint}>听一听，跟着读出来吧（点击喇叭可重听）</p>
        )}
      </div>
      <div className={styles.flashActions}>
        <Button variant="soft" size="sm" onClick={() => setRevealed(true)}>看答案</Button>
        <Button variant="primary" size="sm" onClick={next}>
          下一个 <Icon name="chevronRight" size={14} />
        </Button>
      </div>
      <p className={styles.tip}>诚实边界：听写跟读只陪练、不计分，避免“假成绩”。</p>
    </div>
  )
}
