import { useState, useEffect, useRef } from 'react'
import { getSubject } from '../data/content.js'
import { useApp } from '../state/AppContext.jsx'
import { useFun } from './fun/FunContext.jsx'
import Icon from './ui/Icon.jsx'
import styles from './VideoModal.module.css'

function parseDuration(str) {
  const [m, s] = str.split(':').map(Number)
  return m * 60 + s
}

// 视频播放弹窗：模拟播放进度，播完自动计入“已观看”与学习时长
export default function VideoModal({ video, onClose }) {
  const subject = getSubject(video.subject)
  const { actions } = useApp()
  const { celebrate, sound } = useFun()
  const durationSec = parseDuration(video.duration)

  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0~100
  const [done, setDone] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (!playing) return
    // 演示用：8 秒内播放完毕（真实时长用于学习时长统计）
    const stepMs = 200
    const inc = 100 / (8000 / stepMs)
    timer.current = setInterval(() => {
      setProgress((p) => {
        const next = p + inc
        if (next >= 100) {
          clearInterval(timer.current)
          setPlaying(false)
          setDone(true)
          actions.watchVideo(video.id, durationSec, video.subject)
          // 看完视频给一点正反馈：撒花 + 音效，强化“完成即奖励”的游戏感
          celebrate({ title: '观看完成 +5 积分', icon: 'check' })
          sound('ding')
          return 100
        }
        return next
      })
    }, stepMs)
    return () => clearInterval(timer.current)
  }, [playing, actions, video.id, video.subject, durationSec, celebrate, sound])

  // 键盘可达的关闭方式：监听 Esc（文档级监听，避免在对话框元素上挂 JSX 事件处理器而触发 a11y 规则）。
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal} style={{ '--accent': subject?.color }}>
        <button className={styles.close} onClick={onClose} aria-label="关闭">
          <Icon name="close" size={20} />
        </button>

        <div className={styles.player}>
          {video.url ? (
            <video className={styles.video} src={video.url} autoPlay muted loop playsInline />
          ) : (
            <div className={styles.bg} />
          )}
          {!playing && !done && (
            <button className={styles.playBtn} onClick={() => setPlaying(true)} aria-label="播放">
              <Icon name="play" size={34} />
            </button>
          )}
          {done && (
            <div className={styles.done}>
              <Icon name="check" size={40} />
              <span>观看完成 +5 积分</span>
            </div>
          )}
          <div className={styles.bar}>
            <div className={styles.fill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.time}>{video.duration}</span>
        </div>

        <div className={styles.meta}>
          <span className={styles.tag} style={{ background: subject?.color }}>
            {subject?.name}
          </span>
          <h3 className={styles.title}>{video.title}</h3>
          <p className={styles.desc}>{video.desc}</p>
        </div>
      </div>
    </div>
  )
}
