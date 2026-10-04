# BridgeCare 项目交接文档（Handoff）

> **文档目的**：把 BridgeCare 作品集项目从立项到当前状态的全部信息完整交接给下一个 agent。
> **交接时间**：2026-10-01
> **项目根目录**：`/Users/haiyang/WorkBuddy/2026-07-04-12-47-00/`
> **一句话**：一个为「外籍患者跨院就医」设计的、以**医疗顾问工作台为 B 端主角**的双端协调系统作品集项目。最终产出目标是一份 **作品集横向排版（当前 6 页，详见 §5）**。

---

## 0. 一分钟速览（TL;DR）

| 维度 | 结论 |
|------|------|
| **项目名** | BridgeCare — Redesigning Cross-Hospital Care Navigation for International Patients in China |
| **申请方向** | 美国 HCI / UX / Product Design 硕士作品集 |
| **叙事主角** | B 端**医疗顾问（Care Coordinator）**为主；患者故事仅作开场钩子 |
| **产品形态** | 三层架构：顾问工作台(Desktop) → 任务链引擎(Engine) → 患者 APP(Mobile) |
| **核心创新** | **Task Chain 任务链系统**（把转诊流程固化为可复用模板） |
| **核心设计立意** | **「人在环内的连续性编排层」**（Human-in-the-loop Orchestration for Continuity）——刻意**不做全自动** |
| **最终产出** | 横向排版 PDF（当前 HTML 排版稿 6 页，页面尺寸 1400×990px） |
| **已完成** | 叙事框架、产品架构、5 个 User Flow、hi-fi 交互原型、17 张线框图、2 页 Research 扩写、6 页排版稿、Hard Turns 逆风盘页 |
| **主要待办** | Research 扩写合并进统一排版、真实线框图回填排版、Impact 页内容填充、最终 PDF 导出 |

---

## 1. 项目定位与背景

### 1.1 场景
中国医疗体系中，国际私立医院有服务意愿但受限于设备/专科，**必须转诊至公立医院**。对没有中文能力的外籍患者而言，跨院就医是「语言 + 系统结构」的双重迷宫。典型锚点故事：一对经历多次流产的外籍夫妻，在私立医院被建议去公立医院做**胎儿心脏超声**，全程依赖顾问翻译、协调、导航。

### 1.2 角色与身份
- 叙事第一人称主角记为 **戴雨竹**（作品集署名的设计者，见 `项目1_叙事框架优化_戴雨竹.md`）。
- 当时的操作者以「**产品经理 / 作品集导师**」视角推动项目（用户原话："我要讲给我学生听"）。

### 1.3 语言约定
- **作品集正文用英文**（申请美国院校）。
- **所有工作文档（.md）用中文**。
- 医院名保留英文/拼音：United Family Hospital、Anzhen Hospital 等。

---

## 2. 核心叙事策略（务必先读，全项目的灵魂）

### 2.1 根本问题：一个主角，别两个
最初草稿存在「患者故事」与「顾问 OA 工具」两条线打架的问题。**最终决策：选 C（双端协调系统），但用 A（患者故事）开场。**

### 2.2 故事弧线
```
钩子 Hook  → 真实紧张的外籍患者跨院故事，让观众共情
转向 Turn  → 救场的不是超人，是医疗顾问；顾问才是那个"隐形系统"
问题 Problem → 顾问没有工具，靠记忆/人脉/微信群救火
洞察 Insight → 医疗系统按"医院结构"设计，而非按"患者任务路径"设计
方案 Solution → BridgeCare：任务链引擎 + 顾问工作台 + 患者轻量 App
验证 Validation → 5 位顾问可用性测试 + 关键指标
反思 Reflection → High-stakes 场景中，自动化减摩擦，不替代人类判断
```

### 2.3 关键金句（可作为叙事锚点）
> **"The coordinator is the system — but the system doesn't exist."**
> （协调者本身就是系统——但这个系统并不存在。）

### 2.4 篇幅分配（B 端主导）
| 章节 | 端 | 占比 |
|------|-----|------|
| 封面 / 背景 / 故事钩子 / 问题转向 | — / 患者 / 顾问 | 各约 8% |
| 研究与洞察 | 双端 | 17% |
| 产品概念与架构 | 双端 | 13% |
| **顾问平台深度展开** | **B 端** | **25%（主战场）** |
| 患者 APP | C 端 | 8% |
| 迭代 / 影响与反思 | 双端 | 各 8% |

---

## 3. 产品形态与架构（B 端主导）

> 完整内容见 `BridgeCare_产品架构与叙事框架_B端主导版.md`。以下是核心要点。

### 3.1 三层架构
```
┌──────────────────────────────────────────────┐
│                BridgeCare 引擎层                │
│   任务链引擎 · 状态同步层 · 知识库 · 通知引擎     │
└──────────┬───────────────────────┬────────────┘
     ┌─────▼─────┐          ┌──────▼──────┐
     │ 顾问工作台  │          │   患者APP    │
     │ (Desktop)  │          │  (Mobile)   │
     │ 主角·复杂   │          │  配角·简洁   │
     └───────────┘          └─────────────┘
```
- **不是两个独立产品，而是一个系统的两个视图**，共享同一份任务数据。
- 顾问工作台 = **发动机**（搭任务链、处理异常、沉淀知识）；患者 APP = **仪表盘**（只看到"下一步做什么"）。

### 3.2 顾问工作台信息架构（顶层导航）
工作台 / 患者管理 / 任务模板库 / 知识库 / 数据中心 / 设置。

**工作台（灵魂界面）三栏布局**：左=今日待办+筛选；中=Kanban 看板；右=异常预警+快捷操作。
Kanban 卡片 = 一个患者的任务链快照（国籍 flag + 姓名 + 当前任务链 + 进度条 + deadline + 待备材料）。

### 3.3 任务链系统（Task Chain，核心创新）
- **概念**：一次转诊不是"一个任务"，而是一串有依赖关系的任务（如胎儿心脏超声转诊含 10 步）。
- **数据结构**：每个节点含 任务名 / 执行者(系统·顾问·患者) / 依赖 / 预计时长 / 截止规则 / 执行方式(自动·半自动·手动) / 所需文档 / 患者端通知 / 通知语言 / 异常处理。
- **可视化**：患者详情页以横向流程图呈现（✅完成 / 🔵进行中 / ⬜未开始 / ⚠️异常），可点击、可拖拽、可增删节点。
- **模板库**：把隐性知识变显性资产。预置模板 + 顾问创建 + 团队共享（可 fork / 版本管理）。新人第一天即可看到完整流程。

### 3.4 跨院协调层：三层集成模型（体现"尊重工程现实"）
> 中国公立医院大多**无开放 API**。不能假装"一键对接所有医院"。

| 层级 | 方式 | 覆盖率 |
|------|------|--------|
| Layer 3 | **API 直连**（自动同步） | 约 20% |
| Layer 2 | **引导式手动**（无 API 但有在线系统 → 引导顾问操作+记录） | 约 50% |
| Layer 1 | **结构化手动**（纯线下/电话 → 结构化录入+提醒） | 约 30% |

Layer 2 的设计示例：系统预填患者信息 + 一键拨号 + 最佳拨打时间 + 通话后结构化记录 → 一键推进 + 自动通知患者。**价值：把"看不见的电话预约"变成有结构、有记录、可追溯、可演进为自动化的步骤。**

### 3.5 异常管理模块
跨院就医常态就是"出意外"。系统让异常**被早发现、被有结构地处理**。异常类型：预约超时 / 患者未签到 / 报告延迟 / 检查结果异常 / 预约取消 / 患者长时间无响应。异常面板提供"可能原因"快捷选项 + 一键操作（联系患者/联系医院/重新预约/标记已处理），**必须填写处理记录才能关闭**（复盘素材 + 知识库来源）。

### 3.6 知识库模块
内容结构：医院档案（科室分布/预约方式/报告领取/国际部信息）、检查治疗指南、多语言话术库（EN/JP/KR）、保险与支付、文化注意事项。**模板引用知识库条目** → 顾问更新知识库，所有引用该条目的模板自动更新。

### 3.7 患者 APP（C 端，配角但精炼）
3 个页面：**Today**（今天要做的一件事） / **Timeline**（全旅程时间轴） / **Help**（多语言 FAQ + 一键联系顾问 + 我的文档）。
设计决策：首页只给"下一步"不给列表；**不做自助预约**（预约需专业判断）；联系顾问入口每页固定（安全感）。

### 3.8 【作品集加分页】5 个关键设计决策（含代价与补偿）
1. **为什么 Kanban 而不是工单列表？** → 顾问心智是"12 个患者各在不同阶段"，列=状态。代价：不擅长时间关系 → 补偿：卡片标 deadline + 紧急色。
2. **为什么用模板而不是自由创建？** → 80% 转诊可预测，模板把个人经验变组织资产。代价：模板可能不覆盖所有场景 → 补偿：可完全自定义 + 空白创建可选。
3. **为什么患者 APP 不让患者自助预约？** → 预约涉专业判断，出错代价大。理念"顾问配置、患者执行"。代价：无法自主 → 补偿："申请变更"功能。
4. **为什么保留人工介入而不是全自动？** → high-stakes，错误自动化后果严重。自动化聚焦"减少重复劳动"而非"替代判断"。代价：效率有上限 → 补偿：随信任积累逐步放开。
5. **为什么不假装所有医院都能 API 对接？** → 承认现实，在约束中找优雅解。代价：手动步骤拉低自动化率 → 补偿：引导式手动本身即价值。

---

## 4. 核心 User Flow（3 主线 + 2 辅助）

> 完整步骤见 `BridgeCare_核心UserFlow梳理.md`（5 Flow 详述）与 `BridgeCare_UserFlow完整步骤分析与修复清单.md`（3 主线逐步 + 缺口修复）。
> **作品集重点展示 3 个主线 Flow**（对应原型中已打通的交互）：

### Flow 1：新患者入组 + 任务链创建（14 步）
入口：工作台「+ New Patient」→ 5 步 Wizard（Patient Info → Referral → Template → Customize → Review & Launch）→ Success。
产出：Emma Schmidt 患者详情（任务链 Step 1 active）+ Dashboard To Do 列新卡片。

### Flow 2：日常看板管理 + 异常处理（11 步）
入口：工作台默认 Kanban。含 Follow Up 面板、Assign 翻译员面板、Task Action 面板；异常处理后计数更新、卡片推进。

### Flow 3：跨院协调 — 引导式预约（11 步）
入口：患者详情 Step 4 或 Dashboard 异常。含 Start Call 通话模拟（Calling → Connected + 计时器）→ Confirm & Notify → Booking Success 面板 → 更新后的患者详情 + 患者 APP。

### 辅助 Flow
- **Flow 4**：知识沉淀 —— 创建任务链模板。
- **Flow 5**：患者引导旅程（C 端）。

---

## 5. 作品集叙事结构

> 完整蓝图见 `BridgeCare_作品集叙事结构完整蓝图.md`。以下是当前状态。

### 5.1 初始 5 页结构（蓝图定义）
1. **Page 1: Cover + Problem** — 患者故事钩子 + 4 个问题卡片
2. **Page 2: Research + Insights** — 研究方法 + 利益相关者地图 + 患者情绪旅程 + 3 洞察 + HMW + 3 设计原则
3. **Page 3: Solution Architecture** — 三层架构 + 任务链概念 + 信息架构 + 3 设计决策
4. **Page 4: Key Design & Flows** — 3 核心 flow + Before/After + 患者 APP
5. **Page 5: Impact & Reflection** — 5 位顾问测试 + 4 指标 + 3 反思 + 未来方向

### 5.2 当前实际排版稿：**6 页**（`bridgecare-portfolio-layout/index.html`）
1. Cover + Problem
2. Research + Insights
3. Solution Architecture
4. **★ Hard Turns（逆风盘）— 新增**
5. Key Design & Flows
6. Impact & Reflection

### 5.3 ⚠️ 重要未决问题（交接重点）
- **Research 存在"双版本"**：`bridgecare-portfolio-layout` 里是 **1 页旧版 Research**；而 `bridgecare-research-expanded/index.html` 是**扩写后的 2 页 Research**（Discovery + Synthesis & Ideation）。**两者尚未合并**。
- **最终需要决定**：是否把扩写 Research 合并进统一排版 → 那样总页数会变 **7 页**（Cover / Research×2 / Solution / Hard Turns / Key Design / Impact），或保持 Research 独立成节。
- 目标产出仍是 **横向 PDF**；目前所有排版都是 HTML 草稿，最终需在 Figma/InDesign 整合。

---

## 6. 讨论与迭代全过程（时间线，共 10+ 轮）

| 轮次 | 日期 | 做了什么 | 产出 |
|------|------|---------|------|
| 1 | 07-04 | 叙事框架优化：解决"双主线打架"，定"患者开场+B端主导" | `项目1_叙事框架优化_戴雨竹.md` |
| 2 | 07-04 | 产品架构深度构思：三层架构 + 任务链 + 5 决策 | `BridgeCare_产品架构与叙事框架_B端主导版.md` |
| 3 | 07-04 | 核心 User Flow 梳理（5 个 Flow） | `BridgeCare_核心UserFlow梳理.md` |
| 4 | 07-04 | 生成第一版 hi-fi 原型（钢蓝色调） | `bridgecare-prototype/index.html` |
| 5 | 07-04 | 风格翻新（用户反馈"太老登"）→ indigo-violet 渐变 | 同上（重设计） |
| 6 | 07-04 | 新增新患者 5 步创建向导 | 同上（→3955 行） |
| 7 | 07-05 | 作品集叙事结构完整蓝图（5 页） | `BridgeCare_作品集叙事结构完整蓝图.md` |
| 8 | 07-05 | 5 页横向作品集排版稿 | `bridgecare-portfolio-layout/index.html` |
| 9 | 07-08 | 大幅扩写 Research（1 页→2 页） | `bridgecare-research-expanded/index.html` |
| 10 | 07-08 | 3 Flow 逐步分析 + 15 个交互缺口修复 | `BridgeCare_UserFlow完整步骤分析与修复清单.md` + 原型修复（→5081 行） |
| 11 | 07-08 | 17 张 low-fi 线框图 PNG 导出 | `bridgecare-wireframes/` |
| 12 | 07-09 | 反思：识别"缺概念"与"缺逆风盘"两个被忽视问题 | `BridgeCare_被忽视的问题与改善方向.md` |
| 13 | 07-09 | 实施 Hard Turns 页（5 页→6 页）+ 概念锚点 | `bridgecare-portfolio-layout/index.html` 更新 |

---

## 7. 已交付产物清单（含精确路径）

### 7.1 文档类（.md，项目根目录）
| 文件 | 内容 |
|------|------|
| `项目1_叙事框架优化_戴雨竹.md` | 最早的 0-9 页叙事建议、配图清单、文案优化示例 |
| `BridgeCare_产品架构与叙事框架_B端主导版.md` | 三层架构、任务链系统、三层集成模型、异常/知识库、5 决策、Before/After |
| `BridgeCare_核心UserFlow梳理.md` | 5 个核心 Flow 的入口/步骤/价值/关键界面；设计语言提炼 |
| `BridgeCare_UserFlow完整步骤分析与修复清单.md` | 3 主线 Flow 逐步拆解 + 15 个交互缺口 + 修复清单 |
| `BridgeCare_作品集叙事结构完整蓝图.md` | 5 页叙事结构、每页文案+配图建议、中英对照、情绪节奏 |
| `BridgeCare_被忽视的问题与改善方向.md` | 反思文档：平台缺概念 + 叙事缺逆风盘，改善方向（见 §9） |

### 7.2 HTML 原型 / 排版类
| 文件 | 内容 | 规模 |
|------|------|------|
| `bridgecare-prototype/index.html` | **完整 hi-fi 交互原型**：Dashboard(Kanban)、Patient Detail、Guided Booking、Template Editor、Patient App、5 步向导、3 个 Modal、Booking Success、Toast、ESC 关闭 | ~5081 行 |
| `bridgecare-portfolio-layout/index.html` | **作品集排版稿（6 页横向，1400×990）**，右侧圆点导航 | — |
| `bridgecare-research-expanded/index.html` | **扩写 Research（2 页）**：访谈引用、观察日志、情绪旅程图、Affinity、Insight、Ideation、HMW | ~1472 行 |

### 7.3 线框图 PNG（`bridgecare-wireframes/`，共 17 张）
黑白灰 low-fi，desktop 1280×800 / mobile 375×720：
```
01-dashboard.png                10-follow-up-modal.png
02-wizard-step1-patient-info.png 11-assign-interpreter-modal.png
03-wizard-step2-referral.png    12-task-action-modal.png
04-wizard-step3-template.png    13-guided-booking.png
05-wizard-step4-customize.png   14-call-connected.png
06-wizard-step5-review.png      15-booking-success.png
07-success-launch.png           16-patient-detail-updated.png
08-patient-detail-emma.png      17-patient-app-mobile.png
09-patient-detail-sarah.png
```
配套：`wireframes.html`（线框图源，灰阶无渐变）、`screenshot.js`（Puppeteer 截图脚本，调用系统 Chrome：`/Applications/Google Chrome.app`）。

---

## 8. 设计系统 / 视觉规范（原型中使用）

在多个 HTML 中复用，交接时保持一致：

### 8.1 字体
- **Display/标题**：`Outfit`
- **正文**：`DM Sans`
- **等宽/标签**：`DM Mono`

### 8.2 颜色（indigo-violet 体系）
```css
--indigo: #6366F1;   --violet: #7C3AED;   --blue: #3B82F6;
--indigo-light: #EEF2FF;  --violet-light: #F5F3FF;  --blue-light: #EFF6FF;
--text-1:#1A1A2E; --text-2:#4A4A5E; --text-3:#8A8A9A;
--border:#E5E7EB; --border-light:#F0F0F4;
--success:#10B981; --warning:#F59E0B; --danger:#EF4444;
```
- 主视觉渐变：`#7C3AED → #6366F1 → #3B82F6`
- 背景：淡紫渐变底 + 径向光晕；Header 用 glassmorphism（blur 20px）
- Sidebar：浮动卡片态 + 深紫渐变
- 统计卡：四色渐变；Kanban 每列不同渐变色

### 8.3 形状与动效
- 圆角：卡片 12–14px，容器 24–32px，按钮/标签 pill（9999px）
- 序号圆点/标签：`b-num` 26px 圆形，渐变填充
- 按钮：spring easing +渐变主按钮带 glow shadow
- 排版页：1400×990px，页边距 48px，顶部 page-bar 32px

### 8.4 作品集专用结构（`bridgecare-portfolio-layout`）
- `.portfolio-page` 帧；`.page-bar` 顶栏；`.page-num` 页码（`01 / 06` 格式）
- `.section-label` 章节标签；`.accent-tag` 高亮标签
- `.nav-dots` 右侧圆点导航（`scrollToPage(n)` + IntersectionObserver 高亮）
- Hard Turns 页专用：`.p4ht-*` 系列（interstitial / triangle / beats / glance）

---

## 9. 【已实施】被忽视的问题与改善（重要背景）

### 9.1 两个被忽视的问题（`BridgeCare_被忽视的问题与改善方向.md`）
1. **平台设计缺"概念"**：功能完备但像"医疗版 Asana"，缺统摄性设计立意。
2. **叙事缺"逆风盘"**：一路顺风的汇报，看不到设计者打硬仗/做 tradeoff 的能力。

### 9.2 确立的核心概念
> **「人在环内的连续性编排层」（Human-in-the-loop Orchestration for Continuity）**
> 把"协调员 = 系统的人肉补丁"洞察转化为产品哲学：不替代人，而是把隐性知识外化、把断裂的连续性缝合。

**不可能三角**（设计张力）：`自动化效率 ⇄ 个性化适配 ⇄ 高风险零容错`——我们主动压"自动化"，顶"个性化"和"安全"。

**签名交互（hero interaction）**：引导式预约通话屏（人拿系统给的剧本在打电话，不是自动拨号）。

### 9.3 已实施（在 `bridgecare-portfolio-layout/index.html`）
- 新增 **Page 4「Hard Turns / Designing Through Constraints」**：
  - 第一人称 interstitial（Designer's Dilemma）
  - 「不可能三角」SVG（自动化↓ / 个性化↑ / 高风险零容错↑）
  - 3 个逆风盘节拍卡（Automation Temptation / Template Trap / Scope Cut），结构 = 撞墙 → 取舍 → 结果
  - 底部 "Tradeoff at a Glance"（Gave Up / Gained / Net）
- Page 1 加 design-thesis tagline；Page 5 高亮加 "Deliberately Not Full Automation"，Flow 3 callout 升级为 "Signature interaction"。
- 页码全部更新为 `01/06 ~ 06/06`；nav-dots 增至 6 个。

### 9.4 "逆风盘"叙事模板（可复用）
每个节拍统一结构：**尝试 → 撞墙 → 理性 tradeoff → 结果**。
> 参考方法论：用户过往用"给项目加不完美的点"来创造展示解决问题能力的舞台（例：婴儿体温贴项目遇到"续航/舒适/精度"不可能三角，v1 失败→分析→tradeoff→协同硬件做柔性电池→v2 过关）。

---

## 10. 术语表 / 命名约定

| 术语 | 英文 | 说明 |
|------|------|------|
| 医疗顾问 | Care Coordinator / Patient Service Coordinator | B 端主角 |
| 任务链 | Task Chain | 核心创新，可复用的条件化任务序列 |
| 跨院 | Cross-hospital / inter-hospital | |
| 转诊 | Referral | |
| 引导式手动 | Guided Manual | Layer 2 集成方式 |
| 结构化手动 | Structured Manual | Layer 1 集成方式 |
| 逆风盘 | Hard Turns | 展示 tradeoff 与解决问题能力的叙事节拍 |
| 不可能三角 | Impossible Triangle | 自动化/个性化/安全 三选二 |
| 人在环内 | Human-in-the-loop | 核心设计立意 |

**用户偏好约定（写作/排版）**：
- 结论先行；反精致软文、拒绝机构号套话。
- 作品集文案：主动语态、短句、数字具体（"20 min → 5 min"而非"更快"）。
- 每页一个"一页一句话"。

---

## 11. 待办 / 下一步（Open Items）

1. **【高优先】合并 Research**：把 `bridgecare-research-expanded`（2 页）合并进 `bridgecare-portfolio-layout`，决定最终是 7 页还是保持研究独立。
2. **【高优先】回填真实线框图**：Page 5（Key Design）中 3 个 Flow 的图片占位框，替换为 `bridgecare-wireframes/` 中对应的 17 张 PNG（如 01-dashboard、02~07-wizard、13~15-booking、17-patient-app）。
3. **【中】填充 Page 6（Impact & Reflection）**：目前部分为占位框架，需写入可用性测试反馈、指标（20→5 min / 60% / 45% / 30%）、反思文案。
4. **【中】填充 Page 3（Solution Architecture）**：架构图、任务链概念图仍是占位框，需产出真实图表。
5. **【中】产出真实配图**：Hero 主视觉、患者情绪旅程图、利益相关者地图、顾问"人肉补丁"图等。
6. **【低】最终 PDF 导出**：所有 HTML 排版稿转成成品 PDF（Figma/InDesign，或 print-to-pdf）。
7. **【低】命名一致性检查**：确认排版页顺序与页码、章节标签跨文件一致。

---

## 12. 交接注意事项（写给下一个 agent）

1. **先读 §2 叙事策略 + §9 概念**，否则会理解错"为什么 B 端是主角""为什么刻意不做全自动"。
2. **不要擅自改动既有视觉风格**（indigo-violet 体系 + 大圆角 + pill 按钮是用户明确认可的最终风格；早期"老登"版已废弃）。
3. **修改原文件时倾向保留原文件、生成新副本**（用户习惯）；不要把魔改覆盖到旧文件。
4. **Research 双版本问题必须先确认**再动排版（§5.3）。
5. **所有交付物是 HTML 草稿 + PNG**，不是最终成品；最终形态是横向 PDF。
6. **语言**：作品集正文英文，工作文档中文。
7. **"逆风盘 / Hard Turns"是本项目最重要的记忆点**，任何叙事精简都要优先保住这一页。
8. 配色遵循中文习惯（涨红跌绿）——本项目不涉及金融，但如扩展数据可视化需注意。

---

## 附：文件树（当前）
```
/Users/haiyang/WorkBuddy/2026-07-04-12-47-00/
├── 项目1_叙事框架优化_戴雨竹.md
├── BridgeCare_产品架构与叙事框架_B端主导版.md
├── BridgeCare_核心UserFlow梳理.md
├── BridgeCare_UserFlow完整步骤分析与修复清单.md
├── BridgeCare_作品集叙事结构完整蓝图.md
├── BridgeCare_被忽视的问题与改善方向.md
├── BridgeCare_项目交接文档.md          ← 本文档
├── bridgecare-prototype/
│   └── index.html                       (hi-fi 交互原型 ~5081 行)
├── bridgecare-portfolio-layout/
│   └── index.html                       (作品集排版 6 页横向)
├── bridgecare-research-expanded/
│   └── index.html                       (扩写 Research 2 页)
└── bridgecare-wireframes/
    ├── 01-dashboard.png ... 17-patient-app-mobile.png  (17 张线框图)
    ├── wireframes.html
    └── screenshot.js
```

*文档结束。如有冲突，以项目根目录的 6 份 .md 源文档为准。*
