import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppProvider } from './state/AppContext.jsx'
import { FunProvider } from './components/fun/FunContext.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import './index.css'

// ErrorBoundary 放在最外层：任何路由 / 模块渲染崩溃都只显示友好兜底，不白屏全局。
// FunProvider 必须位于 AppProvider 之内（它要读取全局状态中的“音效开关”），
// 同时在 App 之外（让吉祥物 / 庆祝层 / 升级监听常驻于所有路由之上）。
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
      <AppProvider>
        <FunProvider>
          <App />
        </FunProvider>
      </AppProvider>
    </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
