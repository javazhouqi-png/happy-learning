import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import styles from './FinalCTA.module.css'

export default function FinalCTA() {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.banner}>
          <div className={styles.text}>
            <h2 className={styles.title}>让孩子今天就开始快乐学习</h2>
            <p className={styles.sub}>免费体验三科互动课程，和 120 万+ 小朋友一起进步。</p>
          </div>
          <Button
            size="lg"
            variant="primary"
            icon={<Icon name="arrowRight" size={18} strokeWidth={2.2} />}
            iconRight
          >
            立即为孩子开通
          </Button>
        </div>
      </div>
    </section>
  )
}
