import PageHeader from '../ui/PageHeader.jsx'
import DailyCheckIn from '../modules/DailyCheckIn.jsx'
import WrongQuestionCenter from '../modules/WrongQuestionCenter.jsx'
import styles from './Page.module.css'

// 复习中心：连续打卡 + 错题巩固，聚焦“温故与坚持”。
export default function ReviewCenter() {
  return (
    <div className={`container ${styles.page}`}>
      <PageHeader
        title="复习中心"
        subtitle="每天来打个卡，再把做错的题练一遍，基础越扎越稳。"
        icon="check"
        accent="var(--c-gamify)"
      />
      <div className={styles.body}>
        <DailyCheckIn />
        <WrongQuestionCenter />
      </div>
    </div>
  )
}
