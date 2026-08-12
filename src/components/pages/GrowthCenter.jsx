import PageHeader from '../ui/PageHeader.jsx'
import SubjectMastery from '../modules/SubjectMastery.jsx'
import GradeKnowledge from '../modules/GradeKnowledge.jsx'
import AchievementWall from '../sections/AchievementWall.jsx'
import ProgressTracking from '../sections/ProgressTracking.jsx'
import styles from './Page.module.css'

// 成长中心：掌握度 + 年级知识清单 + 勋章墙 + 进度，聚焦“看见自己的进步”。
export default function GrowthCenter() {
  return (
    <div className={`container ${styles.page}`}>
      <PageHeader
        title="成长中心"
        subtitle="看看每科学得怎么样、拿到了哪些徽章，进步看得见。"
        icon="trophy"
        accent="var(--c-english)"
      />
      <div className={styles.body}>
        <SubjectMastery />
        <GradeKnowledge />
        <AchievementWall />
        <ProgressTracking />
      </div>
    </div>
  )
}
