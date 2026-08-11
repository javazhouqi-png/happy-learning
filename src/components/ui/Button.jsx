import styles from './Button.module.css'

// 通用按钮：支持 primary / outline / ghost 三种变体，可整块或行内。
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  icon,
  iconRight = false,
  className = '',
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.full : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {icon && !iconRight && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
      {icon && iconRight && <span className={styles.icon}>{icon}</span>}
    </button>
  )
}
