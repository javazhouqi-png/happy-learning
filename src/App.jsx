import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/sections/Header.jsx'
import Footer from './components/sections/Footer.jsx'
import Home from './components/pages/Home.jsx'
import LearnCenter from './components/pages/LearnCenter.jsx'
import ReviewCenter from './components/pages/ReviewCenter.jsx'
import GrowthCenter from './components/pages/GrowthCenter.jsx'
import GradeLearning from './components/modules/GradeLearning.jsx'
import PlayCenter from './components/pages/PlayCenter.jsx'
import ParentCenter from './components/pages/ParentCenter.jsx'
import SubjectPage from './components/pages/SubjectPage.jsx'
import VideoLibrary from './components/pages/VideoLibrary.jsx'

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<LearnCenter />} />
          <Route path="/learn/:subjectId" element={<SubjectPage />} />
          <Route path="/review" element={<ReviewCenter />} />
          <Route path="/growth" element={<GrowthCenter />} />
          <Route path="/grade" element={<GradeLearning />} />
          <Route path="/play" element={<PlayCenter />} />
          <Route path="/parent" element={<ParentCenter />} />
          <Route path="/videos" element={<VideoLibrary />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
