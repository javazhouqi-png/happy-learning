import { Component } from 'react'

// 判定是否为「懒加载分包 404 / Chunk 加载失败」类错误：
// 新版本部署会让旧哈希 chunk 失效，这类错误应引导用户刷新而非笼统报错。
function isChunkError(error) {
  const msg = (error && (error.message || String(error))) || ''
  return /chunk|loading chunk|dynamic import|failed to fetch|import\(\)|dynamically imported/i.test(msg)
}

// 友好吉祥物插画（纯装饰，使用 currentColor / design token，无硬编码色、无 emoji）。
function MascotFallback() {
  return (
    <svg
      viewBox="0 0 200 200"
      width="132"
      height="132"
      aria-hidden="true"
      style={{ color: 'var(--c-primary)' }}
    >
      <path
        d="M100 28l16 34 36 5-26 25 6 36-32-17-32 17 6-36L48 67l36-5z"
        fill="var(--c-accent-yellow)"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="84" cy="96" r="6" fill="var(--c-ink)" />
      <circle cx="116" cy="96" r="6" fill="var(--c-ink)" />
      <path
        d="M86 116q14 10 28 0"
        stroke="var(--c-ink)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * 全局错误边界（class 组件，符合 React 错误边界契约）。
 * - 识别 ChunkLoadError / 加载 chunk 失败 → 引导刷新页面（而非白屏）。
 * - 其他渲染错误 → 吉祥物插画 + 友好文案 + 重试按钮，不暴露技术栈细节。
 * 每路由隔离边界在后续切片接入；此边界为最外层兜底，保证任何模块崩溃都不白屏全局。
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, isChunk: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isChunk: isChunkError(error) }
  }

  componentDidCatch(error, info) {
    // 仅开发环境记录详细错误，绝不在界面暴露技术栈。
    if (import.meta.env && import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info)
    }
  }

  handleRetry = () => {
    if (this.state.isChunk) {
      // 旧 chunk 已失效，刷新才能拿到新版本。
      window.location.reload()
    } else {
      this.setState({ hasError: false, isChunk: false })
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const { isChunk } = this.state
    return (
      <div
        role="alert"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          background: 'var(--c-bg)',
          color: 'var(--c-ink)',
        }}
      >
        <MascotFallback />
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '22px', margin: 0 }}>
          {isChunk ? '页面加载出了点小状况' : '哎呀，这里遇到了一点小问题'}
        </h2>
        <p style={{ maxWidth: '420px', color: 'var(--c-ink-soft)', margin: 0 }}>
          {isChunk
            ? '可能是新版本刚刚发布，刷新一下就能继续啦。'
            : '别担心，你的学习进度都还在。可以重试一下，或刷新页面重新加载。'}
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--r-pill)',
              background: 'var(--c-primary)',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            {isChunk ? '刷新页面' : '重试一下'}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--r-pill)',
              background: 'var(--c-surface-2)',
              color: 'var(--c-ink)',
            }}
          >
            回到首页刷新
          </button>
        </div>
      </div>
    )
  }
}
