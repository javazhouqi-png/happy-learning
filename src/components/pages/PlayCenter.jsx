import PageHeader from '../ui/PageHeader.jsx'
import AnimatedVideos from '../sections/AnimatedVideos.jsx'
import GameCenter from '../modules/GameCenter.jsx'
import styles from './Page.module.css'

// 趣味乐园：动画课堂 + 记忆翻牌游戏，聚焦“玩中学”。
export default function PlayCenter() {
  return (
    <div className={`container ${styles.page}`}>
      <PageHeader
        title="趣味乐园"
        subtitle="看动画、玩翻牌小游戏，在轻松的氛围里巩固知识。"
        icon="star"
        accent="var(--c-accent-yellow)"
      />
      <div className={styles.body}>
        <AnimatedVideos />
        <GameCenter />
      </div>
    </div>
  )
}
