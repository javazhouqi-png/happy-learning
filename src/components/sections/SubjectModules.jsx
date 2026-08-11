import SectionHeading from '../ui/SectionHeading.jsx'
import SubjectCard from '../ui/SubjectCard.jsx'
import { subjects } from '../../data/content.js'
import styles from './SubjectModules.module.css'

export default function SubjectModules() {
  return (
    <section className={`section ${styles.section}`} id="subjects">
      <div className="container section__inner">
        <SectionHeading
          eyebrow="核心学科 · CORE SUBJECTS"
          eyebrowIcon="book"
          color="var(--c-chinese)"
          title="三大基础学科，趣味启蒙每一天"
          subtitle="内容贴合小学课标，由浅入深、循序渐进，让孩子在快乐中打好基础。"
        />
        <div className={styles.grid}>
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </div>
    </section>
  )
}
