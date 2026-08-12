import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import { footerColumns, brand } from '../../data/content.js'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandCol}>
          <div className={styles.logo}>
            <span className={styles.logoMark}><Icon name="star" size={20} fill="currentColor" /></span>
            {brand.name}
          </div>
          <p className={styles.tagline}>{brand.slogan}</p>
        </div>

        <div className={styles.cols}>
          {footerColumns.map((col) => (
            <div key={col.title} className={styles.col}>
              <h4 className={styles.colTitle}>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.to}>
                    {link.to.startsWith('/#') ? (
                      <a href={link.to} className={styles.link}>{link.label}</a>
                    ) : (
                      <Link to={link.to} className={styles.link}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>2026 {brand.name} 版权所有</span>
        <span className={styles.bottomLinks}>
          <a href="#">隐私政策</a>
          <a href="#">用户协议</a>
        </span>
      </div>
    </footer>
  )
}
