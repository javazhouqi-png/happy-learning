import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/sections/Header.jsx'
import Footer from './components/sections/Footer.jsx'
import Home from './components/pages/Home.jsx'
import SubjectPage from './components/pages/SubjectPage.jsx'
import VideoLibrary from './components/pages/VideoLibrary.jsx'

// 路由根：所有页面共用顶部导航与页脚；主体按路由切换。
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn/:subjectId" element={<SubjectPage />} />
          <Route path="/videos" element={<VideoLibrary />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
