# 图标补充规范 · 10 个新 SVG 图标（对齐 `src/components/ui/Icon.jsx`）

> 设计方资产，**不修改应用代码**。前端工程师将下列键名并入 `Icon.jsx` 的 `paths` 对象即可。
> 风格约束（与既有 26 图标一致）：`viewBox="0 0 24 24"`、`stroke="currentColor"`、`fill="none"`、`strokeWidth={1.8}`、`strokeLinecap="round"`、`strokeLinejoin="round"`、`aria-hidden="true"`。点状眼睛沿用既有 `M{x} {y}h.01` 技法（圆头短线渲染为点）。
> 这 10 个图标**全部替代原 emoji**（🙂😄🥺🤩🤔 / 🎉 / 🚀 / 🏅 / 🥚 / 💪），落实 P0「禁止 emoji 作功能图标」。

## 1. 五个吉祥物表情（UI 字形，线性描边）
对应 `Mascot.jsx` 的 `FACE` 映射：`idle🙂→mood-calm`、`cheer😄→mood-happy`、`sad🥺→mood-sad`、`dance🤩→mood-wow`、`think🤔→mood-think`。

```jsx
mood-calm: (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 10c.6-.7 1.4-.7 2 0M14 10c.6-.7 1.4-.7 2 0" />
    <path d="M9 15c1 1.1 5 1.1 6 0" />
  </>
),
// 平静：安详闭眼弧 + 浅笑

mood-happy: (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9.5h.01M15 9.5h.01" />
    <path d="M8 13.5c1.5 2.5 6 2.5 7.5 0" />
  </>
),
// 开心：点眼 + 大咧嘴笑

mood-sad: (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9.5h.01M15 9.5h.01" />
    <path d="M8.5 16c1-1.2 5-1.2 6 0" />
    <path d="M9.5 12.6c0 1 .3 1.6.3 2.2M14.5 12.6c0 1-.3 1.6-.3 2.2" />
    <path d="M8.5 7.5l1.5.8M15.5 7.5l-1.5.8" />
  </>
),
// 委屈：点眼 + 嘴角下撇 + 泪痕 + 内八字眉

mood-wow: (
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="9" cy="10" r="1.6" />
    <circle cx="15" cy="10" r="1.6" />
    <path d="M10.4 15h3.2a1.2 1.2 0 010 2.4h-3.2a1.2 1.2 0 010-2.4z" />
  </>
),
// 惊叹：瞪大圆眼 + 张嘴

mood-think: (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9.5h.01" />
    <path d="M15 10h.01" />
    <path d="M9.5 15c1-.6 2.5-.2 3 .8" />
    <path d="M12 3.5l.6 1.4L14 5.5l-1.4.6L12 7.5l-.6-1.4L10 5.5l1.4-.6z" />
  </>
),
// 思考：斜眼 + 不对称嘴 + 头顶小火花
```

## 2. 游戏化 / 奖励图标
替代 `FunWatchers.jsx`（🎉→confetti、🚀→rocket、🏅→medal）与彩蛋（🥚→egg），并新增 `muscle`（加油/努力，替代连续打卡 🔥 语义）。

```jsx
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

medal: (
  <>
    <circle cx="12" cy="14.5" r="5.5" />
    <path d="M9 3l3 5.5L15 3" />
    <path d="M12 11.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6L8.2 14.3l2.6-.4z" />
  </>
),
// 注：Icon.jsx 已存在简化版 medal（第 30-35 行），可整体替换为上版（带绶带+星），或保留现状。

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
```

## 3. `isFilled` 处理
上述 10 个图标均为线性描边（不进入 `Icon.jsx` 现有 `isFilled` 的 `['star','play','flame','sparkle','heart']` 名单），无需改动组件逻辑。若未来希望表情更"软萌"可改填充，但当前统一描边最契合既有图标集。

## 4. CSS 变量补充建议（并入 `src/index.css`）
```css
:root {
  /* A2-semantic（新增语义色） */
  --c-success: #2e9e5b;
  --c-warn:    #e08e0b;
  --c-danger:  #ff5a6e;
  --c-accent-amber: #ffb020;   /* 原 --c-accent-yellow 别名 */

  /* C-extension（吉祥物 / 魔法花园 / 奖励 / 家长） */
  --mascot-body:      #ffd166;
  --mascot-cheek:     #ff8fb1;
  --mascot-eye:       #2d3142;
  --mascot-highlight: #fff3c4;
  --garden-1: #7bdff2; --garden-2: #b8f2c8; --garden-3: #ffd6a5;
  --reward-gold:   #ffb020;
  --reward-ribbon: #ff6b9d;
  --parent-calm:   #5b6b7b;
  --hero-accent-1: #ffb020;   /* Hero 暖色主（等价 --c-accent-amber / reward-gold） */
  --hero-accent-2: #ffe08a;   /* Hero 浅暖色（新增，无等价） */
}
```
