import Hero from '../sections/Hero.jsx'
import SubjectModules from '../sections/SubjectModules.jsx'
import InteractiveExercises from '../sections/InteractiveExercises.jsx'
import AnimatedVideos from '../sections/AnimatedVideos.jsx'
import Gamification from '../sections/Gamification.jsx'
import ProgressTracking from '../sections/ProgressTracking.jsx'
import ParentPanel from '../sections/ParentPanel.jsx'
import ResponsiveShowcase from '../sections/ResponsiveShowcase.jsx'
import FinalCTA from '../sections/FinalCTA.jsx'

// 首页：按信息层级自上而下编排各业务区块
export default function Home() {
  return (
    <>
      <Hero />
      <SubjectModules />
      <InteractiveExercises />
      <AnimatedVideos />
      <Gamification />
      <ProgressTracking />
      <ParentPanel />
      <ResponsiveShowcase />
      <FinalCTA />
    </>
  )
}
