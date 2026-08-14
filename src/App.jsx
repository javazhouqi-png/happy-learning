import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import Header from './components/sections/Header.jsx'
import Footer from './components/sections/Footer.jsx'
import MinorModeGate from './components/MinorModeGate.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

// 路由级代码分割：每个页面独立异步块，避免全部打入主包（门禁要求主包 < 180KB）。
// 年级海量数据（GRADE_LEARNING 等）随页面块按需加载，不再拖入入口块。
const Home = lazy(() => import('./components/pages/Home.jsx'))
const LearnCenter = lazy(() => import('./components/pages/LearnCenter.jsx'))
const SubjectPage = lazy(() => import('./components/pages/SubjectPage.jsx'))
const TextbookPage = lazy(() => import('./components/pages/TextbookPage.jsx'))
const ReviewCenter = lazy(() => import('./components/pages/ReviewCenter.jsx'))
const GrowthCenter = lazy(() => import('./components/pages/GrowthCenter.jsx'))
const GradeLearning = lazy(() => import('./components/modules/GradeLearning.jsx'))
const PlayCenter = lazy(() => import('./components/pages/PlayCenter.jsx'))
const ParentCenter = lazy(() => import('./components/pages/ParentCenter.jsx'))
const VideoLibrary = lazy(() => import('./components/pages/VideoLibrary.jsx'))

// 路由根：所有页面共用顶部导航与页脚；主体按路由切换。
// 菜单结构：首页(总览) / 学习 / 复习 / 成长 / 乐园 / 家长，按业务类别拆分，
// 每个菜单聚合一组相关功能，页面布局更宽松、导航更清晰。
export default function App() {
  const { pathname } = useLocation()

  // 路由切换后回到顶部，避免停留在上一页滚动位置
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <>
      <Header />
      <main>
        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              style={{ padding: '48px 16px', textAlign: 'center' }}
            >
              加载中…
            </div>
          }
        >
          <Routes>
            {/* 每路由独立错误边界：单页（懒加载 chunk）崩溃只影响该路由，不拖垮全局。
                最外层兜底仍保留在 main.jsx。 */}
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              }
            />
            <Route
              path="/learn"
              element={
                <ErrorBoundary>
                  <LearnCenter />
                </ErrorBoundary>
              }
            />
            <Route
              path="/learn/:subjectId"
              element={
                <ErrorBoundary>
                  <SubjectPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/textbook"
              element={
                <ErrorBoundary>
                  <TextbookPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/review"
              element={
                <ErrorBoundary>
                  <ReviewCenter />
                </ErrorBoundary>
              }
            />
            <Route
              path="/growth"
              element={
                <ErrorBoundary>
                  <GrowthCenter />
                </ErrorBoundary>
              }
            />
            <Route
              path="/grade"
              element={
                <ErrorBoundary>
                  <GradeLearning />
                </ErrorBoundary>
              }
            />
            <Route
              path="/play"
              element={
                <ErrorBoundary>
                  <PlayCenter />
                </ErrorBoundary>
              }
            />
            <Route
              path="/parent"
              element={
                <ErrorBoundary>
                  <ParentCenter />
                </ErrorBoundary>
              }
            />
            <Route
              path="/videos"
              element={
                <ErrorBoundary>
                  <VideoLibrary />
                </ErrorBoundary>
              }
            />
            <Route
              path="*"
              element={
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      {/* 全应用级未成年人夜间保护：22:00–6:00 自动锁定，仅用上下文、不引入重数据。 */}
      <MinorModeGate />
    </>
  )
}
