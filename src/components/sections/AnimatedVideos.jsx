import SectionHeading from '../ui/SectionHeading.jsx'
import VideoCard from '../ui/VideoCard.jsx'
import { videos } from '../../data/content.js'
import styles from './AnimatedVideos.module.css'

export default function AnimatedVideos() {
  return (
    <section className={`section ${styles.section}`} id="videos">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="趣味动画课堂 · VIDEOS"
          eyebrowIcon="play"
          color="var(--c-english)"
          title="动画教学，一看就懂"
          subtitle="把知识点变成好玩的动画故事，孩子看得进去，自然记得住。"
        />
        <div className={styles.grid}>
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </section>
  )
}
