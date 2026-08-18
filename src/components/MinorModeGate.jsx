import { useEffect, useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import Icon from './ui/Icon.jsx'
import styles from './MinorModeGate.module.css'

// 全应用级未成年人夜间保护：开启未成年人模式后，22:00–6:00 禁止进入学习界面。
// 家长可通过密码临时验证放行（仅当前会话），未设置密码则无法绕过——符合合规要求。
export default function MinorModeGate() {
  const { state } = useApp()
  const minorMode = state.parent.minorMode
  const pin = state.parent.parentPin
  const [hour, setHour] = useState(() => new Date().getHours())
  const [override, setOverride] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [input, setInput] = useState('')
  const [err, setErr] = useState('')

  // 每 30 秒刷新一次当前小时，让锁定在 6:00 自动解除、22:00 自动生效。
  const blocked = minorMode && (hour >= 22 || hour < 6)

  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours()), 30_000)
    return () => clearInterval(t)
  }, [])

  // 离开禁玩时段后重置临时放行，确保下一个禁玩时段重新锁定（而非一次验证永久放行）。
  useEffect(() => {
    if (!blocked) setOverride(false)
  }, [blocked])

  if (!minorMode) return null
  if (!blocked || override) return null

  const verify = () => {
    if (!pin) {
      setErr('尚未设置家长密码，请先在「家长空间」设置后再验证')
      return
    }
    if (input === pin) {
      setOverride(true)
      setVerifyOpen(false)
    } else {
      setErr('家长密码不正确')
    }
  }

  return (
    <div className={styles.overlay} role="alertdialog" aria-modal="true" aria-label="夜间休息时段">
      <div className={styles.card}>
        <span className={styles.icon}><Icon name="moon" size={34} /></span>
        <h2 className={styles.title}>夜间休息时段</h2>
        <p className={styles.text}>
          根据未成年人保护要求，<strong>22:00–6:00</strong> 为休息时间，暂不提供服务。<br />
          明日 6:00 后将自动开放。
        </p>
        {!verifyOpen ? (
          pin ? (
            <button
              className={styles.btn}
              onClick={() => {
                setErr('')
                setInput('')
                setVerifyOpen(true)
              }}
            >
              家长验证后临时使用
            </button>
          ) : (
            <p className={styles.hint}>如需临时使用，请家长先在「家长空间」设置密码。</p>
          )
        ) : (
          <div className={styles.verify}>
            <input
              className={styles.pin}
              type="password"
              inputMode="numeric"
              placeholder="请输入家长密码"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
            />
            {err && <p className={styles.err}>{err}</p>}
            <div className={styles.verifyBtns}>
              <button
                className={styles.btnGhost}
                onClick={() => {
                  setVerifyOpen(false)
                  setErr('')
                }}
              >
                取消
              </button>
              <button className={styles.btn} onClick={verify}>
                验证
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
