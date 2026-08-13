/* 站点级 UI 常量（壳层 Header/Footer 静态引用，须保持极小，避免拖入主包）。 */

/* ----------------------------- 品牌与页脚（展示用） ----------------------------- */
export const brand = { name: '快乐学园', slogan: '快乐学习，每天进步一点点' };

export const footerColumns = [
  {
    title: '学习',
    links: [
      { label: '学习中心', to: '/learn' },
      { label: '复习中心', to: '/review' },
      { label: '成长中心', to: '/growth' },
      { label: '动画课堂', to: '/videos' },
    ],
  },
  {
    title: '资源',
    links: [
      { label: '使用帮助', to: '/' },
      { label: '学习指南', to: '/' },
      { label: '更新日志', to: '/' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: '关于我们', to: '/' },
      { label: '联系我们', to: '/' },
      { label: '隐私政策', to: '/' },
    ],
  },
];
