# 快乐学园 · 设计规范 DESIGN.md（9 节）

> 设计语言：课标权威·亲切趣味 = Linear 克制层级 × 可汗儿童温情引导 × 洪恩 IP 趣味。
> 双角色：6-12 岁学生（分 1-2 / 3-4 / 5-6 三段）+ 28-45 岁家长。浅色暖底、单一友好强调蓝 `#4d96ff`，**避紫粉渐变**。
> 机器可读 token 见 `design-tokens.json`；10 个新增图标见 `docs/design/icon-spec.md`；插画豁免白名单见 `docs/design/illustration-whitelist.json`。

## 1. 设计语言基调
- **关键词**：明亮、圆润、童趣、可信、克制。
- **氛围**：像一位耐心又专业的同学——鼓励但不幼稚，权威但不说教。主色蓝 `#4d96ff`（信任/专注），暖米底 `#fff8f0` 降低屏幕冷感。
- **对标**：Linear（信息层级克制）× Khan Kids（温情引导）× 洪恩（IP 趣味）。家长空间反向收敛为中性克制（见 §6）。
- **字体**：标题 `Fredoka`/显示圆体，正文 `Quicksand` + `Noto Sans SC`（中文优先），数字/进度用等宽 `--font-mono` 保证对齐。

## 2. 分龄视觉规范
| 段位 | 视觉重心 | 字号/字重 | 引导 | 禁忌 |
|------|----------|-----------|------|------|
| **1-2 年级** | 大字、强图、拼音/朗读 | 正文 ≥18px，字重 590；题干配拼音 | 「星宝」吉祥物全程陪伴，按钮用图标+短词 | 长句、纯文字、小字 |
| **3-4 年级** | 学业分化，鼓励自主 | 正文 16px，字重 510 | 进度环+成就徽章驱动 | 过度幼稚化（贴纸感过满） |
| **5-6 年级** | 目标驱动，厌恶幼稚 | 正文 15-16px，克制圆角 | 数据化反馈（掌握度/排名趋势），弱化 IP | 卡通化过载、低龄配色 |

全局：圆角随段位收敛（1-2 用 `--r-lg` 28px，5-6 用 `--r-md` 18px）；强调色每屏 ≤2 处。

> **扩展**：年级作为「两档皮肤开关」的详细映射、首批「3-4 克制密度」皮肤与全曲线激励语调，见 `docs/design/grade-incentive.md`（不重写本节）。逐页落地提示词见 `docs/design/page-prompts.md`。

## 3. 真实视频播放器 UX 规范
- **自研播放器**：播放/暂停 + 进度拖拽 + 时间 + 倍速 0.75/1/1.25/1.5 + CC 字幕。
- **完成判定**：真实监听 `timeupdate`/`ended`，累计真实观看 ≥95% 且有效时长达标（频繁 `seeked` 不计入）才触发庆祝层 + 计分联动；写入 localStorage 防刷分。
- **播放中禁用**"看介绍/跳过"等假按钮；缓冲显示骨架占位，避免 CLS。
- **合规**：22:00-6:00 不服务；连续 30 分钟弹休息提醒（见 §6 家长门控外的护眼提醒）。

## 4. 加载态 / 骨架屏规范
- **组件级骨架屏**：保留目标高度（防布局抖动），`shimmer` 微光动画（reduced-motion 时静态）。
- **首屏/路由切换**：非阻塞 overlay； React.lazy 模块包 `Suspense` + `ErrorBoundary`。
- **主 chunk 体积**：CI 断言 <180KB；分包失败由 ErrorBoundary 识别 `ChunkLoadError` 引导刷新。

## 5. ErrorBoundary 视觉规范
- **按模块隔离**：main 外层一个兜全局 + 每路由一个隔离；单模块崩溃不白屏全局。
- **视觉**：友好「星宝」插画（白名单内）+ **具体**错误文案（如"这一页加载失败了，点下方重试"）**不暴露技术栈/堆栈** + 重试按钮。
- **ChunkLoadError** 文案引导"刷新页面即可恢复"，非笼统"出错了"。

## 6. 移动端 Dialog / ActionSheet 规范（含家长门控）
- **自研组件**：移动端底部 ActionSheet，桌面居中 Dialog；`aria-modal` + 焦点陷阱 + ESC/遮罩关闭 + 禁滚动穿透。
- **家长门控**（破坏性操作：打卡重置、错题清空）：先简单算术题或长按 3 秒验证，再二次确认。
- **文案**：动作按钮用具体动词（"清空错题本"），不用"确定/取消"模糊对。
- **家长空间**：中性克制——去圆体/降饱和，用 `--parent-calm`，聚焦"三个薄弱点 + 三条今晚怎么陪"诊断式呈现，可打印周报。

## 7. 空状态插画规范
- **禁止**"暂无数据"纯文字。统一用 SVG 插画（白名单 `EmptyState*.jsx`）+ 引导文案 + 行动钮。
- **8 处空态**：错题本空 / 掌握度未生成 / 收藏空 / 奖励未解锁 / 周报无数据 / 搜索无结果 / 年级未选 / 导入无档案——各配不同插画与下一步动作。
- **插画风格**：线条圆润、配色取自 `--garden-*`/`--mascot-*`，与功能 UI 的 token 体系区分（装饰性豁免门禁）。

## 8. 动效 token（150-250ms）
- `--motion-fast` 150ms（按压/悬停）、`--motion-base` 200ms（进入/状态）、`--motion-slow` 250ms（跨模块）；`--ease-standard: cubic-bezier(0.2,0,0,1)`。
- 规则：hover/active ≤150ms；toast/弹层 200-250ms；**全量支持 `prefers-reduced-motion`**（现有 `index.css` 已降级，新增动效须同步加媒体查询）。
- 庆祝层（撒花）可放宽至 2-3s 但仅一次性、非阻塞。

## 9. 图标使用规范（16 / 20 / 24px）
- **唯一图标源**：`src/components/ui/Icon.jsx`（项目自有，0 依赖，TS 化后图标名写错即编译报错）。**禁止 emoji / Unicode 作功能图标**（P0）。
- **尺寸**：行内 16px、按钮内 20px、独立图标 24px；`strokeWidth` 默认 1.8，`strokeLinecap/Join` round，`currentColor` 着色，`aria-hidden`。
- **新增 10 图标**（见 `icon-spec.md`）：`mood-calm/happy/sad/wow/think`（替代 🙂😄🥺🤩🤔）、`confetti`（🎉）、`rocket`（🚀）、`medal`（🏅，原已有简化版可替换）、`egg`（🥚）、`muscle`（💪 加油）。
- **mood-* 为 UI 字形（线性描边）**，与「星宝」装饰插画（白名单、可多色）区分；表情切换映射见 `Mascot.jsx` 的 `FACE`。

---

## 附录 A · 插画 SVG 配色门禁豁免白名单
仅下列**装饰性**文件内部配色可豁免硬编码色检查（详见 `docs/design/illustration-whitelist.json`）：
`src/components/fun/Mascot.jsx`(+`.module.css`)、`CelebrationLayer.jsx`(+`.module.css`)、`MagicGarden.jsx`(+`.module.css`)、`src/components/illustrations/**`、`src/assets/illustrations/**`、`src/components/modules/EmptyState*.jsx`。
**功能 UI 一律 `var(--token)`**，硬编码色仅允许 `#fff`/`#000`。

## 附录 B · P0 自检
- [x] 无 emoji 作功能图标（10 个 SVG 替代，全项目替换 emoji） 
- [x] 无紫粉渐变（主色蓝 `#4d96ff`，禁止 `#7C3AED→#EC4899` 类渐变）
- [x] 无硬编码色（功能 UI 走 token；仅白名单插画豁免）
- [x] 无 AI 模板味文案（按钮用具体动词，Hero/空态展示真实产品内容）
