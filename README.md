# Charm ST

为 SillyTavern 生成正则美化脚本和格式提示词的可视化工具。

## 功能

**核心编辑**
- 对话气泡 — 竖线 / 卡片 / 引用块三种预设，自定义主题色、头像、圆角、阴影等
- 状态面板 — 分组管理、网格 / 标签 / 紧凑 / 高亮四种布局、文本 / 进度条 / 徽章三种字段类型
- 文字特效 — 星号 / 中文括号 / 方括号 / 删除线 / 自定义正则匹配，独立样式配置
- 翻页卡片 — 3D 翻转效果，四套排版预设（Claude / 小说 / 轻量 / 赛博），纯 CSS :checked 实现
- 格式提示词 — 根据配置自动生成 AI 格式引导词，支持中英双语和多种语气

**预设与测试**
- 6 套全局风格预设 — 温暖日常、暗黑哥特、赛博朋克、清新校园、极简纯净、手账风
- 正则测试页 — 输入模拟 AI 输出，实时预览正则替换效果，显示每条脚本匹配状态
- 全量预览 — 一键查看所有模块组合效果，支持翻页正反面切换

**导出与配置**
- 导出中心 — 全部导出 ZIP（JSON + TXT）、单独导出 JSON、复制到剪贴板
- 配置持久化 — 自动保存到 localStorage，支持导出 / 导入 / 重置配置 JSON
- 引导系统 — 全屏欢迎页 + 三步向导（选风格 → 填角色 → 导出说明）
- 使用说明 — 工作原理、导入步骤、FAQ

## 部署

### Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alaka01/charm-st)

### 本地运行

```bash
git clone https://github.com/alaka01/charm-st.git
cd charm-st
npm install
npm run dev
```

### Docker

```bash
docker build -t charm-st .
docker run -d -p 8080:80 charm-st
```

访问 http://localhost:8080

## 使用方式

1. 打开工具，跟随向导选择风格并填写角色名
2. 在各标签页中微调配置（或直接使用预设默认值）
3. 在「正则测试」页面验证效果
4. 在「导出中心」导出 ZIP
5. 在 SillyTavern 中导入 JSON 正则脚本 + 粘贴格式提示词到角色卡

## 技术栈

React + TypeScript + Vite、Tailwind CSS + shadcn/ui、Zustand（状态管理 + 持久化）、Framer Motion（动画）

## 重要说明

SillyTavern 的正则渲染环境不执行 JavaScript。本工具生成的所有交互效果（翻页、状态切换等）均使用纯 CSS 实现（checkbox/radio + :checked 选择器）。

---

v0.4.0 | [更新日志](./CHANGELOG.md)
