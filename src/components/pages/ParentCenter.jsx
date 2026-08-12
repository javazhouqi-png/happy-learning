import PageHeader from '../ui/PageHeader.jsx'
import ParentPanel from '../sections/ParentPanel.jsx'
import ParentWeeklyReport from '../modules/ParentWeeklyReport.jsx'
import styles from './Page.module.css'

// 家长空间：家长面板 + 周报，聚焦“家长视角的陪伴与查看”。
export default function ParentCenter() {
  return (
    <div className={`container ${styles.page}`}>
      <PageHeader
        title="家长空间"
        subtitle="了解孩子的学习时长、积分与连续打卡，陪 TA 一起成长。"
        icon="medal"
        accent="var(--c-chinese)"
      />
      <div className={styles.body}>
        <ParentPanel />
        <ParentWeeklyReport />
      </div>
    </div>
  )
}
