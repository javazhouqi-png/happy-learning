import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        // 将 react 生态单独拆为 vendor 块：入口 index-*.js 仅含应用壳层代码，
        // 既符合门禁「主包 < 180KB」要求，也避免框架体积反复计入业务分包。
        manualChunks(id) {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/scheduler') ||
            id.includes('node_modules/history')
          ) {
            return 'react-vendor'
          }
        }
      }
    }
  }
})
