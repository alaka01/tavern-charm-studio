# 更新记录

## v0.4.0 — 第 2 轮功能优化（2026-03-08）

### 改动内容
- **配置持久化**：使用 Zustand `persist` 中间件 + localStorage（key: `tavern-charm-config`），刷新页面自动恢复所有配置，排除 `activeTab`
- **设置抽屉**：Header 右侧新增齿轮图标，打开底部抽屉提供：
  - 导出配置（JSON 文件备份）
  - 导入配置（从 JSON 恢复）
  - 重置为默认配置（需二次确认）
- **配置简化 — 对话气泡**：卡片样式详细设置和文字样式折叠为「高级选项」，默认收起，标注「可选 · 不调整也能正常使用」
- **配置简化 — 状态面板**：新增 3 套快速模板按钮（🎮 RPG 冒险、🏫 校园日常、🧙 奇幻世界），一键填充字段列表；样式设置折叠为可选面板
- **配置简化 — 翻页卡片**：标签配置区增加说明文字；自定义调整面板标注「高级 · 预设已够用」；卡片样式控件合并进自定义调整面板
- **TabId 类型修复**：`'guide'` 已包含在 TabId 联合类型中

### 遇到的问题
- `useAppStore` 未加 `persist` 中间件导致刷新丢失所有配置，是第 1 轮最关键的遗漏
- `partialize` 需要排除函数和 `activeTab`，只持久化纯数据字段
- 对话气泡和状态面板的高级选项默认展开导致新用户认知负担重

### 涉及文件
- `src/stores/useAppStore.ts` — 添加 persist、resetToDefaults、exportConfig、importConfig
- `src/components/layout/Header.tsx` — 集成 SettingsDrawer
- `src/components/layout/SettingsDrawer.tsx` — 新建设置抽屉组件
- `src/components/tabs/DialogBubbleTab.tsx` — 高级选项折叠
- `src/components/tabs/StatusPanelTab.tsx` — 快速模板 + 样式折叠
- `src/components/tabs/FlipCardTab.tsx` — 标签说明文字 + 面板整合

---


## v0.3.0 — 翻页卡片背景方案重构（2026-03-08）

### 改动内容
- **删除渐变色配置**：移除正面/背面各 2 个渐变色选择器和渐变方向选择器（共 6 个控件），简化配置流程
- **背景色整合进排版预设**：每个排版预设自带匹配的正面/背面背景色，无需单独选择
  - Claude 风：`#1a1a2e` / `#1e1e32`
  - 小说风：`#1c1917` / `#1f1c19`（暖棕黑 + 米白色文字）
  - 轻量简洁风：`transparent` / `rgba(255,255,255,0.03)`
  - 赛博霓虹风：`#0a0e1a` / `#0c1024`
- **手动微调面板简化**：背景控件简化为正面/背面单色 picker + 卡片边框 toggle
- **翻面提示文字语义化**：正面 `👆 点击查看状态面板`，背面 `👆 点击返回正文`，字号缩小至 11px、透明度降至 0.35

### 遇到的问题
- 渐变背景在长文阅读场景下分散注意力，不适合 3000+ 字叙述内容
- 背景和排版分开配置导致用户需要手动搭配，容易出现配色不协调的情况
- 原有 6 个渐变相关控件（2 色 × 2 面 + 2 方向）过于复杂，大部分用户不会调整

### 涉及文件
- `src/types/index.ts` — `TypographyConfig` 增加 `frontBg`/`backBg`，`FlipCardConfig` 移除渐变字段
- `src/stores/useAppStore.ts` — 预设数据更新
- `src/utils/regexBuilder.ts` — 生成逻辑改用纯色背景
- `src/components/tabs/FlipCardTab.tsx` — UI 重构

---

## v0.2.0 — 正文排版预设系统（2026-03-08）

### 改动内容
- **新增 4 种排版预设**，在翻页卡片配置页中一键切换：
  - 「Claude 风」— 宽松舒适，15px / 1.85 行高，适合长文
  - 「小说风」— 衬线字体 + 首行缩进，文学氛围
  - 「轻量简洁风」— 最小化改动，只优化基础可读性
  - 「赛博霓虹风」— 等宽字体 + 微弱青蓝辉光，科幻感
- **预设选择卡片**：4 张可点击卡片横向排列，含缩略预览（模拟文字行展示行间距差异）
- **自定义调整面板**：折叠式面板，支持字号/行高/字间距/缩进/段间距/容器内边距/文字阴影手动微调
- **预览区实时渲染**：使用包含叙述、心理活动、对话的综合样例文本展示排版效果

### 遇到的问题
- 正文排版优化在第一轮迭代中未生效——只修改了 CSS 变量但没有写入翻页卡片的 inline style
- 预览文本需要覆盖多种内容类型（叙述/心理/对话）才能全面展示排版差异

### 涉及文件
- `src/types/index.ts` — 新增 `TypographyConfig`、`TypographyPreset` 类型
- `src/stores/useAppStore.ts` — 预设数据定义
- `src/components/tabs/FlipCardTab.tsx` — 预设选择 UI + 微调面板
- `src/utils/regexBuilder.ts` — `buildFlipCardScript` 注入排版 inline style

---

## v0.1.0 — UI 优化第一轮迭代（2026-03-08）

### 改动内容

#### 正文排版优化
- 正文容器应用 `font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.85)`
- 翻页卡片正面内容增加 `padding: 16px 20px`
- 预览区背景色模拟酒馆深色主题（`#1a1c2e` ~ `#0e1026`）

#### 对话气泡样式重构
- **3 种气泡预设风格**：简约竖线风（默认）、卡片气泡风、引用块风
- **头像模式**：无头像（默认）、首字彩色圆形（hash 自动配色）、自定义 emoji
- **角色主题色**：8 色预设色板（温柔粉/天空蓝/翡翠绿/琥珀金/薰衣紫/珊瑚红/薄荷青/银白）+ 自定义
- **新默认样式**：左侧彩色竖线 + 半透明背景 + 不对称圆角，紧凑 4px margin

#### 状态面板分块布局
- **分组独立布局**：每组可独立设置列数（1~4列/自动）和布局模式
- **4 种布局模式**：网格平铺、左右标签式、紧凑标签式、单字段高亮式
- 分组间细线分隔，分组标题 14px/600 字重

#### 翻页卡片背面渲染优化
- 背面状态栏使用与状态面板标签页一致的美化样式

#### 导出脚本排序
- 强制执行顺序：文字特效 → 对话气泡 → 段落分隔符 → 状态面板 → 翻页卡片
- 导出中心标注执行序号

### 遇到的问题
- 对话气泡与正文之间空白过大，头像占位符（白色圆形+文字）在无真实头像时显得突兀
- 状态面板所有字段统一塞进一个 grid，无法按分组差异化布局
- 翻页卡片背面纯文本显示与正面丰富叙述内容体验割裂
- 导出脚本顺序不固定，可能导致翻页卡片包裹未美化的原始内容

### 涉及文件
- `src/types/index.ts` — 新增 `AvatarMode`、`BubblePreset`、`GroupLayout` 等类型
- `src/stores/useAppStore.ts` — store 结构更新
- `src/utils/regexBuilder.ts` — 气泡/状态面板/翻页卡片生成逻辑重写
- `src/utils/templates.ts` — 气泡预设模板
- `src/components/tabs/DialogBubbleTab.tsx` — 气泡配置 UI 重构
- `src/components/tabs/StatusPanelTab.tsx` — 分组布局配置
- `src/components/tabs/ExportCenter.tsx` — 脚本排序逻辑
- `src/components/shared/RegexPreviewPanel.tsx` — 预览区样式同步
