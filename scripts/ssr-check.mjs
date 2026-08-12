// 临时诊断脚本：用 Vite SSR 渲染 App 源码（React 走 Node 原生），捕获首屏渲染异常。
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const store = {}
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v) },
  removeItem: (k) => { delete store[k] },
}

const vite = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  ssr: { external: ['react', 'react-dom', 'react-router-dom'] },
})

try {
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx')
  const { AppProvider } = await vite.ssrLoadModule('/src/state/AppContext.jsx')
  const { FunProvider } = await vite.ssrLoadModule('/src/components/fun/FunContext.jsx')

  const routes = ['/', '/learn', '/learn/math', '/review', '/growth', '/grade', '/play', '/parent', '/videos']
  for (const route of routes) {
    const html = renderToString(
      React.createElement(
        MemoryRouter,
        { initialEntries: [route] },
        React.createElement(
          AppProvider,
          null,
          React.createElement(FunProvider, null, React.createElement(App, null))
        )
      )
    )
    console.log(`SSR_OK ${route} length=`, html.length)
  }
} catch (e) {
  console.error('SSR_ERROR:', e && e.stack ? e.stack : e)
} finally {
  await vite.close()
}
