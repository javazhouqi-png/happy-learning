import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // 将 react 生态单独拆为 vendor 块：入口 index-*.js 仅含应用壳层代码，
        // 既符合门禁「主包 < 180KB」要求，也避免框架体积反复计入业务分包。
        manualChunks(id) {
          // 年级海量数据（GRADE_LEARNING 等）独立为 grade 块，仅随 /grade、/textbook、/learn、
          // /review 等懒加载页按需加载，绝不进入首屏共享 content 块（见 R1 / 门禁脚本断言）。
          if (id.includes('src/data/grade.js')) {
            return 'grade'
          }
          // 首屏共享数据块（SUBJECTS / QUIZZES / VIDEOS / REWARDS 等）：保持独立，随首屏加载；
          // 必须显式固定为 content 块，否则会被 grade 块（其 import QUIZZES）连带吞并，
          // 导致首屏被迫加载年级数据。content.js 不反向引用 grade.js，故二者互不串台。
          if (id.includes('src/data/content.js')) {
            return 'content'
          }
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
  },
  // Vitest 测试配置：纯函数用 node 环境即可，无需 jsdom。
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
