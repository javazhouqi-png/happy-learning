// 统一图标组件：全部使用内联 SVG（currentColor 着色），保证清晰且可随文字颜色变化。
// 不使用 emoji / Unicode 符号，确保跨端一致。

const paths = {
  star: (
    <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.05 1.1-6.47L2.6 9.9l6.5-.95L12 2.5z" />
  ),
  book: (
    <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5V5.5zM4 18.5h16" />
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v4M8 19h4" />
    </>
  ),
  language: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5-11-6.5z" />,
  trophy: (
    <>
      <path d="M7 4h10v4a5 5 0 01-10 0V4z" />
      <path d="M7 5H4v2a3 3 0 003 3M17 5h3v2a3 3 0 01-3 3M9 14h6M10 14v3h4v-3M8 20h8" />
    </>
  ),
  // icon-spec.md §2 提供了带绶带+星的加强版 medal，但本图标存在 fill="currentColor" 调用
  // （Header/AchievementWall），填充态下内嵌星会与外圆同色糊成一团，故按 spec「或保留现状」保留简化版。
  medal: (
    <>
      <circle cx="12" cy="14" r="6" />
      <path d="M9 2l3 6 3-6M12 8v6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  moon: <path d="M20 14.5A8 8 0 119.5 4 6.5 6.5 0 0020 14.5z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 9h16M8 3v4M16 3v4" />
    </>
  ),
  flame: <path d="M12 3c1 4-3 5-3 9a3 3 0 006 0c0-2-1-3-1-3 2 1 3 3 3 5a6 6 0 11-12 0c0-5 4-7 7-11z" />,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />,
  home: <path d="M4 11l8-7 8 7M6 10v10h12V10" />,
  gamepad: (
    <>
      <rect x="3" y="8" width="18" height="9" rx="4.5" />
      <path d="M7 12.5h2M8 11.5v2M15.5 12h.01M17.5 13h.01" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0114 0" />
    </>
  ),
  shield: <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z" />,
  heart: <path d="M12 20s-7-4.5-7-9.5A4 4 0 0112 7a4 4 0 017 3.5C19 15.5 12 20 12 20z" />,
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 00-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0012 3z" />
    </>
  ),

  /* ---- 吉祥物表情：替代原五个表情 emoji，见 docs/design/icon-spec.md §1 ---- */
  'mood-calm': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 10c.6-.7 1.4-.7 2 0M14 10c.6-.7 1.4-.7 2 0" />
      <path d="M9 15c1 1.1 5 1.1 6 0" />
    </>
  ),
  'mood-happy': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9.5h.01M15 9.5h.01" />
      <path d="M8 13.5c1.5 2.5 6 2.5 7.5 0" />
    </>
  ),
  'mood-sad': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9.5h.01M15 9.5h.01" />
      <path d="M8.5 16c1-1.2 5-1.2 6 0" />
      <path d="M9.5 12.6c0 1 .3 1.6.3 2.2M14.5 12.6c0 1-.3 1.6-.3 2.2" />
      <path d="M8.5 7.5l1.5.8M15.5 7.5l-1.5.8" />
    </>
  ),
  'mood-wow': (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1.6" />
      <circle cx="15" cy="10" r="1.6" />
      <path d="M10.4 15h3.2a1.2 1.2 0 010 2.4h-3.2a1.2 1.2 0 010-2.4z" />
    </>
  ),
  'mood-think': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9.5h.01" />
      <path d="M15 10h.01" />
      <path d="M9.5 15c1-.6 2.5-.2 3 .8" />
      <path d="M12 3.5l.6 1.4L14 5.5l-1.4.6L12 7.5l-.6-1.4L10 5.5l1.4-.6z" />
    </>
  ),

  /* ---- 游戏化 / 奖励：替代原庆祝类 emoji，见 icon-spec.md §2 ---- */
  confetti: (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M18.5 5.5l-2 2M7.5 16.5l-2 2" />
      <rect x="5.5" y="5.5" width="2.5" height="2.5" rx=".5" transform="rotate(18 6.75 6.75)" />
      <circle cx="17" cy="8" r="1.4" />
      <path d="M7 16l1.4 1.4L7 18.8 5.6 17.4z" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2.8c2.8 1.4 4.2 4.7 4.2 8.2 0 1.5-.5 2.9-1 3.9l-3.2 1.6-3.2-1.6c-.5-1-1-2.4-1-3.9C7.8 7.5 9.2 4.2 12 2.8z" />
      <circle cx="12" cy="9.2" r="1.6" />
      <path d="M8.3 15.6 6.8 19c1.6.2 2.8-.4 3.5-1.4M15.7 15.6 17.2 19c-1.6.2-2.8-.4-3.5-1.4" />
      <path d="M10.7 18.8 12 21l1.3-2.2" />
    </>
  ),
  egg: (
    <>
      <path d="M12 3.2c3.4 0 5.3 4 5.3 7.8 0 4.4-2.4 9.8-5.3 9.8S6.7 15.4 6.7 11c0-3.8 1.9-7.8 5.3-7.8z" />
      <path d="M6.9 11.2h10.2" />
      <path d="M9 11.2l3-2 3 2" />
      <path d="M12 6l.5 1.3 1.3.5-1.3.5L12 9.6l-.5-1.3L10.2 8l1.3-.5z" />
    </>
  ),
  muscle: (
    <>
      <path d="M7 20a2.5 2.5 0 01-2.5-2.5V15a2.5 2.5 0 012.5-2.5h.5" />
      <path d="M7.5 12.5c0-2.2 1.6-3.8 3.8-3.8 1.7 0 2.8.9 2.8 2.3V13c1.3.5 2.1 1.6 2.1 3 0 1.7-1.2 2.8-3 2.8H10a3.2 3.2 0 01-3.2-3.2V12.5z" />
      <path d="M11 10.4V9M13.4 10.8V8.8M15.6 11.6v-1.2" />
    </>
  ),

  /* ---- 档案导出 / 导入 / 家长密码（Task #5 新增） ---- */
  download: (
    <>
      <path d="M12 3v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  upload: (
    <>
      <path d="M12 21V9" />
      <path d="M7 13l5-5 5 5" />
      <path d="M5 3h14" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11l8 8M16 16l2-2M14 18l2-2" />
    </>
  )
}

export default function Icon({ name, size = 24, strokeWidth = 1.8, fill = 'none', className, style }) {
  const node = paths[name] || paths.star
  const isFilled = fill !== 'none' || ['star', 'play', 'flame', 'sparkle', 'heart'].includes(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? 'currentColor' : fill}
      stroke={isFilled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {node}
    </svg>
  )
}
