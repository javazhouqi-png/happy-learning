import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import ExerciseEngine from '../ExerciseEngine.jsx'
import styles from './InteractiveExercises.module.css'

const features = [
  { icon: 'check', text: '即时反馈，做错也不怕' },
  { icon: 'sparkle', text: '答对即获积分奖励' },
  { icon: 'trophy', text: '每周闯关排行榜' },
]

export default function InteractiveExercises() {
  return (
    <section className={`section ${styles.section}`} id="practice">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="互动式练习 · INTERACTIVE"
          eyebrowIcon="calculator"
          color="var(--c-math)"
          title="边玩边练，做中学"
          subtitle="每一道题都有即时反馈，答对就能收获积分，学习像闯关一样上瘾。"
        />

        <div className={styles.layout}>
          <ul className={styles.features}>
            {features.map((f) => (
              <li key={f.text} className={styles.feature}>
                <span className={styles.featureIcon}><Icon name={f.icon} size={18} fill="currentColor" /></span>
                {f.text}
              </li>
            ))}
            <li className={styles.cta}>
              <Link to="/learn/math">
                <Button variant="outline">前往完整练习 →</Button>
              </Link>
            </li>
          </ul>

          <div className={styles.demo}>
            <ExerciseEngine subjectId="math" />
          </div>
        </div>
      </div>
    </section>
  )
}
