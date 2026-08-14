import { useState, useEffect } from 'react'
import Icon from '../ui/Icon.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { exportProfile, importProfile } from '../../state/profileIO.js'
import { formatStudyTime } from '../../data/content.js'
import styles from './ParentPanel.module.css'

// 学习动态图标映射。注意：AppContext 的 ADD_POINTS 写入 type:'game'，
// 此前缺 'game' 键会让游戏动态图标错落成 star；现补 'gamepad'（Icon.jsx 已有该图标）。
const TYPE_ICON = { lesson: 'book', quiz: 'check', video: 'play', game: 'gamepad' }

function Toggle({ on, onClick }) {
  return (
    <button
      className={`${styles.toggle} ${on ? styles.on : ''}`}
      role="switch"
      aria-checked={on}
      onClick={onClick}
    >
      <span className={styles.knob} />
    </button>
  )
}

function fmtTime(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function ParentPanel() {
  const { state, derived, actions } = useApp()
  const { parent } = state
  const doneLessons = Object.keys(state.completedLessons).length

  // —— 家长守护相关本地态 ——
  const [pinOpen, setPinOpen] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinErr, setPinErr] = useState('')
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyInput, setVerifyInput] = useState('')
  const [verifyErr, setVerifyErr] = useState('')
  const [archiveOpen, setArchiveOpen] = useState(false)

  const guards = [
    { key: 'eyeRest', icon: 'moon', label: '护眼提醒', desc: '每 20 分钟提醒休息一下' },
    { key: 'sound', icon: 'sparkle', label: '音效反馈', desc: '答题与获得徽章时的提示音' },
  ]

  // 键盘可达的关闭方式：任意弹出层打开时监听 Esc 关闭（文档级监听，避免在对话框元素上挂 JSX 事件处理器）。
  useEffect(() => {
    if (!pinOpen && !verifyOpen && !archiveOpen) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (pinOpen) setPinOpen(false);
      else if (verifyOpen) setVerifyOpen(false);
      else if (archiveOpen) setArchiveOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pinOpen, verifyOpen, archiveOpen]);

  const history = state.history.slice(0, 6)

  // 今日屏幕时间：来自派生数据（state.todayStudySec 已按自然日归零）。
  const todayMin = derived.todayStudyMin
  const limit = derived.dailyLimitMin
  const remaining = derived.dailyRemainingMin
  const overLimit = derived.dailyOverLimit
  const usagePct = limit > 0 ? Math.min(100, Math.round((todayMin / limit) * 100)) : 0

  // 未成年人模式开关：开启无需验证；关闭需家长密码验证（无密码则引导先设置）。
  const onToggleMinor = () => {
    if (parent.minorMode) {
      if (!parent.parentPin) {
        setPinErr('')
        setPinInput('')
        setPinOpen(true)
        return
      }
      setVerifyInput('')
      setVerifyErr('')
      setVerifyOpen(true)
    } else {
      actions.setMinorMode(true)
    }
  }

  const onVerifyClose = () => {
    if (verifyInput === parent.parentPin) {
      actions.setMinorMode(false)
      setVerifyOpen(false)
      setVerifyInput('')
    } else {
      setVerifyErr('家长密码不正确')
    }
  }

  const onSavePin = () => {
    if (!/^\d{4,6}$/.test(pinInput)) {
      setPinErr('请输入 4–6 位数字密码')
      return
    }
    actions.setParentPin(pinInput)
    setPinOpen(false)
    setPinInput('')
    setPinErr('')
  }

  // 档案导出 / 导入
  const onExport = () => {
    exportProfile(state)
    setArchiveOpen(false)
  }
  const onImportFile = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    try {
      const next = await importProfile(file)
      actions.hydrate(next)
      setArchiveOpen(false)
      window.alert('学习档案已导入，进度已恢复。')
    } catch (err) {
      window.alert((err && err.message) || '导入失败，请检查档案文件。')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <section className={`section ${styles.section}`} id="parents">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="家长查看面板 · FOR PARENTS"
          eyebrowIcon="shield"
          color="var(--c-math)"
          title="孩子的成长，家长一眼看清"
          subtitle="学习动态、专注时长、用眼保护，科学陪伴不焦虑。"
        />

        <div className={styles.layout}>
          {/* 孩子档案 */}
          <div className={styles.profile}>
            <div className={styles.avatar} style={{ background: 'var(--c-math)' }}>
              <Icon name="user" size={30} fill="currentColor" />
            </div>
            <div>
              <div className={styles.childName}>小明同学</div>
              <div className={styles.childGrade}>小学 · 快乐学园</div>
            </div>
            <div className={styles.statRow}>
              <div className={styles.stat}><strong>{doneLessons}</strong><span>已完成课</span></div>
              <div className={styles.stat}><strong>{derived.streakDays}</strong><span>连续天数</span></div>
              <div className={styles.stat}><strong>{derived.unlockedCount}</strong><span>获得徽章</span></div>
            </div>
            <button className={styles.reset} onClick={() => { if (window.confirm('确定要清空所有学习进度吗？此操作不可恢复。')) actions.reset() }}>
              重置学习进度
            </button>
          </div>

          {/* 今日屏幕时间：把家长设置的“每日学习上限”真正用起来 */}
          <div className={styles.usage}>
            <div className={styles.usageHead}>
              <span className={styles.usageTitle}>今日学习时长</span>
              <span className={`${styles.usageVal} ${overLimit ? styles.over : ''}`}>
                {formatStudyTime(state.todayStudySec)} / {limit} 分钟
              </span>
            </div>
            <ProgressBar value={usagePct} color={overLimit ? 'var(--c-danger)' : 'var(--c-english)'} height={10} />
            <p className={styles.usageHint}>
              {overLimit ? (
                <>
                  <Icon name="moon" size={14} /> 已超过今日上限，建议休息一下，保护视力与专注力。
                </>
              ) : (
                <>本日还可学习约 <strong>{remaining}</strong> 分钟。</>
              )}
            </p>
            {parent.minorMode && (
              <p className={styles.minorNote}>
                <Icon name="shield" size={13} /> 未成年人模式已开启，每日上限已自动限制为 {parent.minorDailyCapMin} 分钟。
              </p>
            )}
          </div>

          {/* 今日动态 */}
          <div className={styles.today}>
            <h3 className={styles.blockTitle}>学习动态</h3>
            {history.length === 0 ? (
              <p className={styles.empty}>还没有学习记录，快去完成第一节课吧！</p>
            ) : (
              <ul className={styles.timeline}>
                {history.map((h, i) => (
                  <li key={i} className={styles.event}>
                    <span className={styles.eventIcon}><Icon name={TYPE_ICON[h.type] || 'star'} size={16} fill="currentColor" /></span>
                    <span className={styles.eventText}>{h.detail}</span>
                    <span className={styles.eventTime}>{fmtTime(h.ts)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 时长与护眼管理 */}
          <div className={styles.guards}>
            <h3 className={styles.blockTitle}>时长与护眼管理</h3>

            <div className={styles.limitRow}>
              <div className={styles.guardInfo}>
                <div className={styles.guardLabel}>每日学习上限</div>
                <div className={styles.guardDesc}>达到后提醒休息，保护视力与专注</div>
              </div>
              <div className={styles.limitControl}>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={parent.dailyLimitMin}
                  disabled={parent.minorMode}
                  onChange={(e) => actions.updateParent({ dailyLimitMin: Number(e.target.value) })}
                  aria-label="每日学习上限（分钟）"
                />
                <span className={styles.limitValue}>{parent.dailyLimitMin} 分钟</span>
              </div>
            </div>

            {/* 未成年人模式 */}
            <div className={styles.guardRow}>
              <span className={styles.guardIcon}><Icon name="shield" size={18} strokeWidth={2} /></span>
              <div className={styles.guardInfo}>
                <div className={styles.guardLabel}>未成年人模式</div>
                <div className={styles.guardDesc}>开启后 22:00–6:00 自动锁定，每日上限不超过 {parent.minorDailyCapMin} 分钟</div>
              </div>
              <Toggle on={parent.minorMode} onClick={onToggleMinor} />
            </div>

            {/* 家长密码 */}
            <div className={styles.guardRow}>
              <span className={styles.guardIcon}><Icon name="key" size={18} strokeWidth={2} /></span>
              <div className={styles.guardInfo}>
                <div className={styles.guardLabel}>家长密码</div>
                <div className={styles.guardDesc}>
                  {parent.parentPin ? '已设置（关闭未成年人模式时需验证）' : '未设置：关闭未成年人模式无需验证'}
                </div>
              </div>
              <button className={styles.pinBtn} onClick={() => { setPinErr(''); setPinInput(''); setPinOpen(true) }}>
                {parent.parentPin ? '修改' : '设置'}
              </button>
            </div>

            {guards.map((g) => (
              <div key={g.key} className={styles.guardRow}>
                <span className={styles.guardIcon}><Icon name={g.icon} size={18} strokeWidth={2} /></span>
                <div className={styles.guardInfo}>
                  <div className={styles.guardLabel}>{g.label}</div>
                  <div className={styles.guardDesc}>{g.desc}</div>
                </div>
                <Toggle on={parent[g.key]} onClick={() => actions.updateParent({ [g.key]: !parent[g.key] })} />
              </div>
            ))}
          </div>
        </div>

        {/* 学习档案：跨设备备份与恢复（移动端统一弹窗） */}
        <div className={styles.archive}>
          <div className={styles.archiveHead}>
            <span className={styles.guardIcon}><Icon name="user" size={18} strokeWidth={2} /></span>
            <div className={styles.guardInfo}>
              <div className={styles.guardLabel}>学习档案</div>
              <div className={styles.guardDesc}>导出进度备份，或导入到其他设备继续学习</div>
            </div>
          </div>
          <button className={styles.archiveBtn} onClick={() => setArchiveOpen(true)}>
            <Icon name="download" size={18} /> 管理学习档案
          </button>
        </div>
      </div>

      {/* 家长密码设置 / 修改弹窗 */}
      {pinOpen && (
        <div className={styles.sheetOverlay} role="dialog" aria-modal="true">
          <div className={styles.sheet}>
            <div className={styles.sheetHandle} />
            <h3 className={styles.sheetTitle}>设置家长密码</h3>
            <p className={styles.sheetDesc}>用于关闭未成年人模式时验证身份，请牢记这串 4–6 位数字。</p>
            <input
              className={styles.sheetInput}
              type="password"
              inputMode="numeric"
              placeholder="请输入 4–6 位数字"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSavePin()}
            />
            {pinErr && <p className={styles.sheetErr}>{pinErr}</p>}
            <div className={styles.sheetActions}>
              <button className={styles.sheetBtnGhost} onClick={() => setPinOpen(false)}>取消</button>
              <button className={styles.sheetBtn} onClick={onSavePin}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 关闭未成年人模式验证弹窗 */}
      {verifyOpen && (
        <div className={styles.sheetOverlay} role="dialog" aria-modal="true">
          <div className={styles.sheet}>
            <div className={styles.sheetHandle} />
            <h3 className={styles.sheetTitle}>家长验证</h3>
            <p className={styles.sheetDesc}>关闭未成年人模式需输入家长密码。</p>
            <input
              className={styles.sheetInput}
              type="password"
              inputMode="numeric"
              placeholder="请输入家长密码"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onVerifyClose()}
            />
            {verifyErr && <p className={styles.sheetErr}>{verifyErr}</p>}
            <div className={styles.sheetActions}>
              <button className={styles.sheetBtnGhost} onClick={() => setVerifyOpen(false)}>取消</button>
              <button className={styles.sheetBtn} onClick={onVerifyClose}>验证并关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 学习档案统一弹窗（导出 / 导入） */}
      {archiveOpen && (
        <div className={styles.sheetOverlay} role="dialog" aria-modal="true">
          <div className={styles.sheet}>
            <div className={styles.sheetHandle} />
            <h3 className={styles.sheetTitle}>管理学习档案</h3>
            <p className={styles.sheetDesc}>导出当前全部进度到文件，或在其他设备导入继续学习。</p>
            <button className={styles.sheetBtn} onClick={onExport}>
              <Icon name="download" size={18} /> 导出当前档案
            </button>
            <button className={styles.sheetBtn} onClick={() => document.getElementById('archive-file-input').click()}>
              <Icon name="upload" size={18} /> 导入档案
            </button>
            <input
              id="archive-file-input"
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={onImportFile}
            />
            <button className={styles.sheetBtnGhost} onClick={() => setArchiveOpen(false)}>关闭</button>
          </div>
        </div>
      )}
    </section>
  )
}
