import PageHeader from '../ui/PageHeader.jsx'
import AnimatedVideos from '../sections/AnimatedVideos.jsx'
import GameCenter from '../modules/GameCenter.jsx'
import CollectionAlbum from '../modules/CollectionAlbum.jsx'
import styles from './Page.module.css'

// 趣味乐园：动画课堂 + 记忆翻牌游戏 + 贴纸收藏册，聚焦“玩中学”与收集乐趣。
export default function PlayCenter() {
  return (
    <div className={`container ${styles.page}`}>
      <PageHeader
        title="趣味乐园"
        subtitle="看动画、玩翻牌小游戏，把学到的成就贴进收藏册。"
        icon="star"
        accent="var(--c-accent-yellow)"
      />
      <div className={styles.body}>
        <AnimatedVideos />
        <GameCenter />
        <CollectionAlbum />
      </div>
    </div>
  )
}
