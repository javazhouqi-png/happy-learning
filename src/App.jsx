import Header from './components/sections/Header.jsx'
import Hero from './components/sections/Hero.jsx'
import SubjectModules from './components/sections/SubjectModules.jsx'
import InteractiveExercises from './components/sections/InteractiveExercises.jsx'
import AnimatedVideos from './components/sections/AnimatedVideos.jsx'
import Gamification from './components/sections/Gamification.jsx'
import ProgressTracking from './components/sections/ProgressTracking.jsx'
import ParentPanel from './components/sections/ParentPanel.jsx'
import ResponsiveShowcase from './components/sections/ResponsiveShowcase.jsx'
import FinalCTA from './components/sections/FinalCTA.jsx'
import Footer from './components/sections/Footer.jsx'

// 页面编排：按信息层级自上而下组织各业务区块。
// 全局状态（积分 / 答题 / 开关 / Tab）由 AppProvider 通过 Context 下发，
// 各区块只负责消费状态、派发动作，互不耦合。
export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SubjectModules />
        <InteractiveExercises />
        <AnimatedVideos />
        <Gamification />
        <ProgressTracking />
        <ParentPanel />
        <ResponsiveShowcase />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
