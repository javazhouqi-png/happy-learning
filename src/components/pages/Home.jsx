import Hero from '../sections/Hero.jsx'
import SubjectModules from '../sections/SubjectModules.jsx'
import InteractiveExercises from '../sections/InteractiveExercises.jsx'
import AnimatedVideos from '../sections/AnimatedVideos.jsx'
import GameCenter from '../modules/GameCenter.jsx'
import Gamification from '../sections/Gamification.jsx'
import AchievementWall from '../sections/AchievementWall.jsx'
import DailyCheckIn from '../modules/DailyCheckIn.jsx'
import WrongQuestionCenter from '../modules/WrongQuestionCenter.jsx'
import SubjectMastery from '../modules/SubjectMastery.jsx'
import GradeKnowledge from '../modules/GradeKnowledge.jsx'
import ProgressTracking from '../sections/ProgressTracking.jsx'
import ParentPanel from '../sections/ParentPanel.jsx'
import ParentWeeklyReport from '../modules/ParentWeeklyReport.jsx'
import ResponsiveShowcase from '../sections/ResponsiveShowcase.jsx'
import FinalCTA from '../sections/FinalCTA.jsx'

// 首页：按信息层级自上而下编排各业务区块。
// 新增的「打卡 / 错题 / 掌握度 / 周报 / 游戏」模块通过 id 锚点与顶部导航联动。
export default function Home() {
  return (
    <>
      <Hero />
      <SubjectModules />
      <InteractiveExercises />
      <AnimatedVideos />
      <GameCenter />
      <Gamification />
      <AchievementWall />
      <DailyCheckIn />
      <WrongQuestionCenter />
      <SubjectMastery />
      <GradeKnowledge />
      <ProgressTracking />
      <ParentPanel />
      <ParentWeeklyReport />
      <ResponsiveShowcase />
      <FinalCTA />
    </>
  )
}
