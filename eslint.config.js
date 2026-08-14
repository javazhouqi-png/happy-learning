// ESLint 9 Flat Config — 快乐学园质量门禁
// 策略（门禁先行，迁移期放行 .js）：
//  - typescript-eslint 仅对 .ts/.tsx 做类型检查，.js/.jsx 不触发类型报错（checkJs:false 配套）。
//  - .jsx 启用 react-hooks + jsx-a11y（P0 相关），但不挂 @eslint/js 严格风格规则，避免迁移前大面积报错。
//  - prettier 兼容置于最后，关闭与格式冲突的规则。
//  - emoji / 硬编码色等 P0 红线由 scripts/check-design-tokens.sh 在 CI 机器化拦截。

import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'

export default [
  {
    ignores: [
      'dist',
      'dist2',
      'dist-old',
      '_verify_build',
      '.verify-build',
      'node_modules',
      'coverage',
      'scripts',
      '*.config.js',
      '*.config.ts',
    ],
  },

  // 解析能力（JSX）与模块环境，对所有源文件生效；不启用 @eslint/js 严格风格规则（迁移期放行 .js）。
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // .jsx 启用 P0 相关插件规则（react-hooks 幂等 / jsx-a11y 无障碍），不引入额外风格报错。
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      // ⛔ P0-1：禁止 emoji 充当功能图标（机器化拦截，unicode 区间）。
      // 按 IMPROVEMENT-PLAN §4.5，emoji 禁令移交 ESLint，bash 门禁脚本只管硬编码色 + 分包体积。
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXText[value=/[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}]/u]',
          message: 'P0：禁用 emoji 图标，请用 src/components/ui/Icon 的 SVG 图标',
        },
        {
          selector: 'Literal[value=/[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}]/u]',
          message: 'P0：禁用 emoji 图标，请用 Icon 组件（name 为联合类型，编译期校验）',
        },
      ],
    },
  },

  // 课程 / 题库等数据文件中的 emoji 属教学匹配内容（如 emoji↔词语），
  // 是「数据」而非「UI 功能图标」，故对 src/data/**/*.js 豁免 P0 emoji 门禁；UI 组件仍受控。
  {
    files: ['src/data/**/*.js'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },

  // 仅 .ts/.tsx 走 typescript-eslint 类型检查（全量 TS 化阶段逐步收紧）。
  // 注意：typescript-eslint v8 的 configs.recommended 本身是配置数组，必须在顶层展开，
  // 不能像旧版对象那样在对象字面量里展开（否则会出现 "Unexpected key 0" 配置错误）。
  ...tseslint.configs.recommended,

  // prettier 兼容：必须最后，关闭一切与 prettier 冲突的格式化规则。
  prettier,
]
