import { useState } from 'react'
import { Link } from 'react-router-dom'
import SectionHeading from '../ui/SectionHeading.jsx'
import VideoCard from '../ui/VideoCard.jsx'
import VideoModal from '../VideoModal.jsx'
import { useApp } from '../../state/AppContext.jsx'
import { VIDEOS } from '../../data/content.js'
import styles from './AnimatedVideos.module.css'

export default function AnimatedVideos() {
  const { state } = useApp()
  const [active, setActive] = useState(null)

  return (
    <section className={`section ${styles.section}`} id="videos">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="趣味动画课堂 · VIDEOS"
          eyebrowIcon="play"
          color="var(--c-english)"
          title="动画教学，一看就懂"
          subtitle="把知识点变成好玩的动画故事，孩子看得进去，自然记得住。"
          action={<Link to="/videos" className={styles.allLink}>查看全部 →</Link>}
        />
        <div className={styles.grid}>
          {VIDEOS.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              watched={!!state.videosWatched[video.id]}
              onPlay={setActive}
            />
          ))}
        </div>
      </div>

      {active && <VideoModal video={active} onClose={() => setActive(null)} />}
    </section>
  )
}
