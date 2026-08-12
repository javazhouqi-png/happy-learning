import PageHeader from '../ui/PageHeader.jsx'
import SubjectModules from '../sections/SubjectModules.jsx'
import InteractiveExercises from '../sections/InteractiveExercises.jsx'
import styles from './Page.module.css'

// 学习中心：学科入口 + 互动练习，聚焦“学与练”这一条主线。
export default function LearnCenter() {
  return (
    <div className={`container ${styles.page}`}>
      <PageHeader
        title="学习中心"
        subtitle="先选一门学科开始学，再动手做几道练习，知识才记得牢。"
        icon="book"
        accent="var(--c-primary)"
      />
      <div className={styles.body}>
        <SubjectModules />
        <InteractiveExercises />
      </div>
    </div>
  )
}
