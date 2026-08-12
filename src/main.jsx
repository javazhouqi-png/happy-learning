import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppProvider } from './state/AppContext.jsx'
import { FunProvider } from './components/fun/FunContext.jsx'
import './index.css'

// FunProvider 必须位于 AppProvider 之内（它要读取全局状态中的“音效开关”），
// 同时在 App 之外（让吉祥物 / 庆祝层 / 升级监听常驻于所有路由之上）。
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AppProvider>
        <FunProvider>
          <App />
        </FunProvider>
      </AppProvider>
    </HashRouter>
  </React.StrictMode>
)
