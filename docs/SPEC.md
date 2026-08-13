# Spec · 快乐学园改造 v1.0

> 生成日期：2026-08-12
> 基于：PRD v1（docs/prd-product-research.md）＋ 架构方案 v1（docs/architecture/ARCH-REFACTOR-PLAN.md）＋ 设计调研 v1
> 状态：已确认（用户确认"接电优先"）
> 配套：docs/IMPROVEMENT-PLAN.md（三文档整合）· docs/curriculum-roadmap.md（唯一内容源）

---

## 1. 产品定义
- **一句话描述**：对齐课标的每日 15 分钟自学工具——孩子自己愿意练，家长一页看懂薄弱点；不注册、不上传、无广告。
- **目标用户**：6-12 岁小学生（分 1-2/3-4/5-6 三段）+ 28-45 岁双职工家长。
- **核心问题**：现有最好内容（GRADE_LEARNING 138 题/138 易错点）被隔离在闭环外，不入错题本/掌握度/积分/家长周报。

## 2. MVP 范围（锁定）
| 优先级 | 功能 | 验收摘要 |
|--------|------|----------|
| P0 | 质量门禁 | ESLint9+Prettier+husky+CI+门禁脚本；tsc --noEmit 作 interim 安全网 |
| P0 | P0 违规修复 | 移除 emoji 功能图标（改项目 Icon.jsx）+ 收敛硬编码色到 token |
| P0 | 全量 TS 化 | 三段棘轮迁移；AppAction 判别联合；noUncheckedIndexedAccess |
| P0 | 存储迁移 | storage.migrate(v1→v2) 与 AppContext 拆分同批，防存量清零 |
| P0 | AppContext 拆分 | 按"动作域"拆 reducer + slices；拆 State/Actions Context |
| P0 | content 拆分+懒加载 | 数据按域/年级拆文件；8 路由 React.lazy；主 chunk<180KB |
| P0 | 接通 138 题入闭环 | GRADE_LEARNING 练习接入 ExerciseEngine+状态，题库 36→174 |
| P0 | ErrorBoundary+骨架屏 | 全局+每路由隔离；ChunkLoadError 引导刷新 |
| P1 | 移动端统一弹窗 | 自研 Dialog/ActionSheet；破坏性操作家长门控 |
| P1 | 真实视频闭环 | 自研播放器；真实 timeupdate/ended 判定计分 |
| P1 | 导出/导入学习档案 | storage.exportProfile/importProfile；家长中心入口 |
| P1 | 未成年人模式合规 | 30 分钟休息提醒/每日 1h/22:00-6:00 不服务/退出家长验证 |
| P2 | 内容扩充 | 题型 1→6；四溯源字段；misconceptions；单元诊断卷 |

## 3. 明确不做（Out-of-Scope）
| 不做 | 原因 |
|------|------|
| 真实后端/账号/云同步 | 用户确认纯前端；纯前端无法防篡改/多端同步 |
| 云端排行榜/社交 | 需后端+防作弊 |
| 假装 AI 打分 | 无模型，假 AI 损害信任 |
| 占位视频+假播放 | P0 内容诚信红线 |

## 4. 技术架构（锁定）
| 层 | 技术 | 版本 | 锁定原因 |
|----|------|------|----------|
| 前端 | React | ^18.3.1（已装） | 现状保留 |
| 构建 | Vite | ^5.4.10（已装） | 现状保留 |
| 语言 | TypeScript | 最新 5.x | 全量 TS 化 |
| 类型 | @types/react / @types/react-dom | 与 React 18 匹配 | 类型底座 |
| 门禁 | ESLint 9 Flat + typescript-eslint + react-hooks + jsx-a11y + Prettier | 最新 | 质量门禁 |
| 钩子 | husky + lint-staged | 最新 | pre-commit 轻量校验 |
| 图标 | 项目自有 src/components/ui/Icon.jsx | — | 0 KB，TS 化后编译期校验图标名 |
| 部署 | 纯静态托管（GitHub Pages / 任意静态空间） | — | 无后端 |

## 5. API 端点清单
无（纯前端，无后端）。所有持久化走 localStorage（happy-learning-state-v1 → v2 迁移）。

## 6. 数据库表清单
无（localStorage 键值：`happy-learning-state-v2`，结构由 state/types 定义）。

## 7. 页面清单（锁定）
| 页面 | 路由 | 核心组件 | 设计 Token 主题 |
|------|------|----------|-----------------|
| 首页 | / | Home + Hero + SubjectModules | 浅色暖底、单一强调蓝 |
| 学习中心 | /learn | LearnCenter + SubjectPage | 同上 |
| 学科页 | /subject/:id | SubjectPage + LessonTexts + ExerciseEngine | 同上 |
| 年级学习 | /grade | GradeLearning + GradeKnowledge | 同上（数据按需加载） |
| 游戏中心 | /games | GameCenter + CollectionAlbum | 趣味但克制 |
| 家长空间 | /parent | ParentPanel + ParentWeeklyReport | 中性克制 |
| 成就 | /achievements | AchievementWall + Gamification + RewardStore | 奖励可视化 |
| 错题/掌握 | /wrong /mastery | WrongQuestionCenter + SubjectMastery + ProgressTracking | 诊断式呈现 |

## 8. 设计 Token（锁定）
- **主色**：--c-primary #4d96ff（避开紫粉渐变）；语义 --success/--warn/--danger；动效 --motion。
- **字体**：系统字体栈 + 中文优先（Noto Sans SC / PingFang / Microsoft YaHei）。
- **图标库**：项目自有 `src/components/ui/Icon.jsx`；尺寸 16/20/24px；补齐 5 表情+confetti/rocket/medal/egg/muscle。
- **主题**：浅色为主；reduced-motion 降级保留。
- **对标**：Linear 克制 × 可汗儿童温情 × 洪恩趣味。

## 9. 验收标准（EARS）
| 编号 | 功能 | 标准 |
|------|------|------|
| AC-01 | 接通闭环 | When 用户在 /grade 完成一道 GRADE_LEARNING 练习，系统**必须**将其记入错题本/掌握度/积分/家长周报 |
| AC-02 | 存储迁移 | When 存量 v1 用户首次打开，系统**必须**migrate 到 v2 且不丢失进度 |
| AC-03 | 懒加载 | While 访问非首页路由，系统**必须**按需加载对应 chunk，主 chunk<180KB |
| AC-04 | ErrorBoundary | If 某路由模块抛错，系统**必须**仅该模块显示友好兜底，不白屏全局 |
| AC-05 | 门禁 | While 提交含 emoji 功能图标或非法硬编码色，CI **必须**拦截 |
| AC-06 | 未成年人模式 | While 连续使用满 30 分钟，系统**必须**弹出休息提醒；22:00-6:00 **必须**不提供服务 |

## 10. 边界与约束
- 不支持 IE；响应式断点 375/768/1024。
- iOS Safari ITP 风险：以导出/导入档案 + 迁移缓解，非根治。
- 纯前端无法做防篡改/多端同步/账号找回。
- parent.dailyLimitMin 仅作"用眼提醒"，不得宣传"家长控制"。

## 11. 内嵌已知坑
| 坑 | 指纹 | 根因 | 修法 |
|----|------|------|------|
| addDays 同名不同型 | utils/date.js + AppContext | 一返回 Date 一返回 string | 新增 addDaysStr 区分 |
| TYPE_ICON 缺 game 键 | ParentPanel.jsx | 三处副本不同步 | 集中到 constants/historyIcons.ts |
| 静态 re-export 拉回主 chunk | data/index.ts | Rollup 静态合并 | 禁 export * 年级数据 + CI 体积断言 |
| 旧 chunk 404 | 懒加载部署 | 哈希变更 | ErrorBoundary 识别 ChunkLoadError 引导刷新 |

## 12. 端到端验证
```bash
npm install
npm run lint          # ESLint 9 + Prettier 校验通过
npx tsc --noEmit      # 类型检查通过（TS 化后）
npm run build         # 主 chunk < 180KB，无 emoji/硬编码色告警
npm run dev           # 手动：/grade 完成练习→错题本/周报可见；连续 30min→休息提醒
```

## 13. 变更记录
| 日期 | 变更 | 原因 | 影响 |
|------|------|------|------|
| 2026-08-12 | 初始化 Spec v1.0 | 用户确认"接电优先"方案 | 全项目改造基准 |
