# BridgeCare v6 · 第一阶段视觉规范

## 方向

面向转诊协调员的浅色企业工作台。信息密度清楚，蓝色只标记主要操作和当前节点；异常、待办、成功状态同时使用文字和图标表达。BridgeCare 的识别点是贯穿跨院转诊、预约、就诊、报告和随访的“交接线”，用细线和节点呈现当前进度，不做装饰性光效。

参考 Arco Design 的主色、中性色、语义色、字体与紧凑组件变量，保留 BridgeCare 自己的名称、病例和流程。采用原生 HTML/CSS/JS，不引入 Arco React。[Arco Design 主题变量](https://arco.design/themes/design/11843) · [Arco Design 组件变量示例](https://arco.design/themes/design/2522)

## Tokens

| 用途 | Token | 值 |
|---|---|---|
| 页面底色 | `--bc-bg` | `#F5F7FA` |
| 卡片 / 导航 | `--bc-surface` | `#FFFFFF` |
| 次级表面 | `--bc-surface-muted` | `#F7F8FA` |
| 主文字 | `--bc-text` | `#1D2129` |
| 次级文字 | `--bc-text-secondary` | `#4E5969` |
| 辅助文字 | `--bc-text-muted` | `#86909C` |
| 主色 / 选中 | `--bc-primary` | `#165DFF` |
| 主色悬停 | `--bc-primary-hover` | `#0E42D2` |
| 选中浅底 | `--bc-primary-soft` | `#E8F3FF` |
| 边框 | `--bc-border` | `#E5E6EB` |
| 强边框 | `--bc-border-strong` | `#C9CDD4` |
| 焦点环 | `--bc-focus` | `rgba(22, 93, 255, .24)` |
| 成功 | `--bc-success` / `--bc-success-soft` | `#00B42A` / `#E8FFEA` |
| 警告 | `--bc-warning` / `--bc-warning-soft` | `#FF7D00` / `#FFF7E8` |
| 危险 | `--bc-danger` / `--bc-danger-soft` | `#F53F3F` / `#FFECE8` |

- 字体：`Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`。正文 14px / 1.55；页面标题 26px / 1.25；分区标题 16px；字段标签 13px；辅助信息不低于 12px。
- 间距：4px 基准，常用 `4 / 8 / 12 / 16 / 20 / 24 / 32px`。
- 圆角：输入与标签 4px，按钮 6px，卡片与导航项 8px，浮层 10px。
- 边框：默认 1px 实线；交互边框用主色。阴影仅用于浮层，卡片靠边框与留白分层。移除渐变、玻璃模糊、径向光晕和发光按钮。
- 状态：蓝色表示可操作或当前选中；红色表示需处理或错误；橙色表示等待或临近期限；绿色表示已完成。状态始终配文字或图标。

## 三张关键页面结构草图

### Dashboard

```text
┌ 浅色侧栏：BridgeCare / 工作台 / Sarah 病例 / 患者预览 ┐ ┌ 顶栏：位置 · 语言 · 重置 ┐
│                                                        │ │ 今日工作 / 简短说明       │
│                                                        │ │ Sarah 病例摘要 + 主操作   │
│                                                        │ │ Demo scenarios（三入口）  │
│                                                        │ │ 待处理异常（单一提醒区）  │
│                                                        │ │ 四阶段转诊看板            │
└────────────────────────────────────────────────────────┘
```

### 病例页

```text
Sarah Johnson · 预约超时 · 处理预约异常
转诊 ──●预约──○就诊──○报告──○随访     ← BridgeCare 交接线
┌ 左：任务链 / 每项负责人和状态 ┐  ┌ 右：转诊信息 / 下一步 / 操作记录 ┐
└──────────────────────────────┘  └─────────────────────────────────┘
```

### 电话预约页

```text
电话预约引导 · Sarah Johnson       转诊 ──●预约──○就诊──○报告──○随访
┌ 左：医院与转诊信息 / 电话话术参考 ┐  ┌ 右：模拟通话 / 已接通或未接通 ┐
│                                    │  │ 成功填写预约 / 未接通安排重试 │
└────────────────────────────────────┘  └──────────────────────────────┘
```

本阶段只铺设以上三页及共享工作台外壳。其余流程页待视觉方向确认后再完整改造。
