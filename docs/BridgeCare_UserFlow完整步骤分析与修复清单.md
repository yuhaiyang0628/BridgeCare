# BridgeCare — 3 个核心 User Flow 完整步骤分析 & 原型缺口修复清单

---

## Flow 1: New Patient Onboarding（新患者入组 + 任务链创建）

### 完整步骤（Start → End）

| # | 动作 | 所在视图 | 系统响应 |
|---|------|---------|---------|
| 1 | 顾问点击 Sidebar 顶部「+ New Patient」按钮 **或** Dashboard 页面头部「+ New Patient」按钮 | Dashboard → New Patient Wizard | 跳转到 Wizard Step 1 |
| 2 | 填写患者基础信息：First Name / Last Name / DOB / Nationality / Phone / Email / Preferred Languages (chips 可多选) / Insurance Type / Insurance Provider / Notes & Special Requirements | Wizard Step 1: Patient Info | — |
| 3 | 点击「Next: Referral Source →」 | Wizard Step 1 → Step 2 | 步骤指示器更新，Step 1 标记为 ✓ |
| 4 | 填写转诊上下文：Referring Hospital / Referring Doctor / Primary Department / Target Hospital / Reason for Referral / Urgency Level / Medical Summary / Attach Records | Wizard Step 2: Referral | — |
| 5 | 点击「Next: Select Template →」 | Wizard Step 2 → Step 3 | 步骤指示器更新，Step 2 标记为 ✓ |
| 6 | 从 6 个模板卡片中选择一个（默认选中 Cross-Hospital OB Referral），也可选「Build from Scratch」 | Wizard Step 3: Template Selection | 选中卡片高亮（紫色边框 + ✓） |
| 7 | 点击「Next: Customize Chain →」 | Wizard Step 3 → Step 4 | 步骤指示器更新 |
| 8 | 查看 10 步任务链预览，可操作 3 个 Optional 步骤的 toggle 开关（Step 4: Send Pre-Visit Instructions / Step 5: Arrange Interpreter / Step 9: Schedule MDT Consultation），也可点击「+ Add Custom Task」 | Wizard Step 4: Customize | — |
| 9 | 点击「Next: Review & Launch →」 | Wizard Step 4 → Step 5 | 步骤指示器更新 |
| 10 | 审核汇总信息：Patient（姓名/年龄/国籍/语言/保险/联系方式）+ Referral（转出→转入医院/科室/医生/紧急程度/医疗摘要）+ Task Chain（模板名/活跃步骤数/预估时长/首个任务到期时间） | Wizard Step 5: Review | 底部提示框说明系统将执行的操作 |
| 11 | 点击「🚀 Launch Task Chain」 | Wizard Step 5 → Success | 系统执行：(1) 创建患者 app 账号 (2) 推送前 3 个任务到 Dashboard (3) 发送德语欢迎消息给患者 (4) 启动任务 #2 的 SLA 计时器 |
| 12 | Success 页面显示：✓ 动画 + 3 项关键数据（9 Active Tasks / 2h First SLA / DE App Language） | Success State | — |
| 13 | 点击「View Patient Details →」 **→ 应跳转到 Emma Schmidt 的患者详情页** | Success → Patient Detail (Emma) | 显示 Emma Schmidt 的信息 + 任务链 Step 1（Create Patient Profile）为 active，其余为 waiting |
| 14 | **（替代路径）** 点击「Back to Dashboard」 **→ Dashboard 应显示 Emma Schmidt 的新卡片在 To Do 列** | Success → Dashboard | Kanban To Do 列出现 Emma Schmidt 卡片 |

**End point**: 顾问在 Patient Detail 看到新患者的任务链已启动，或在 Dashboard 看到新卡片。

### 缺口排查

| Gap # | 描述 | 当前行为 | 应有行为 |
|-------|------|---------|---------|
| **1.1** | Success「View Patient Details」跳转到错误患者 | 跳转到 Sarah Johnson（硬编码） | 应跳转到 Emma Schmidt 的详情页，显示任务链刚启动（Step 1 active） |
| **1.2** | Success「Back to Dashboard」无新患者卡片 | Dashboard 不变 | To Do 列应出现 Emma Schmidt 卡片 |
| **1.3** | 缺少患者 app 收到欢迎通知的展示 | 无连接到患者 app | Success 页应可选查看患者 app 的欢迎消息（证明双端联动） |

---

## Flow 2: Dashboard & Anomaly Handling（日常看板管理 + 异常处理）

### 完整步骤（Start → End）

| # | 动作 | 所在视图 | 系统响应 |
|---|------|---------|---------|
| 1 | 顾问打开 BridgeCare，默认进入 Dashboard | Dashboard | 顶部 4 个数据大卡（Active Patients 24 / Pending Tasks 47 / Anomalies 3 / Completed Today 12）|
| 2 | 浏览 Kanban 看板（4 列：To Do 8 / In Progress 6 / Waiting 4 / Done 12） | Dashboard | 每张患者卡显示：姓名 + 优先级色点 + 详情 + 标签（语言/科室/紧急）+ 开启时间/截止日期 |
| 3 | 查看 Dashboard 底部异常预警面板 — 3 条 active alerts | Dashboard | 每条异常：图标(红/琥珀) + 标题 + 详情 + 操作按钮(Resolve/Follow Up/Assign) |
| 4 | **分支 A**：点击 Sarah Johnson 异常的「Resolve」按钮 | Dashboard → Booking View | 跳转到 Guided Booking 视图（进入 Flow 3） |
| 5 | **分支 B**：点击 Ahmed Al-Rashid 异常的「Follow Up」按钮 | Dashboard → Follow Up 面板 | 应弹出 Follow Up 操作面板：显示上次联系记录 + 快捷操作（重新拨打电话 / 发送催促短信 / 标记为等待中） |
| 6 | **分支 C**：点击「新德国患者缺少翻译员」异常的「Assign」按钮 | Dashboard → Assign 面板 | 应弹出 Assign 操作面板：显示可用翻译员列表 + 一键分配 |
| 7 | 点击 Kanban 中的患者卡片（如 Sarah Johnson in To Do） | Dashboard → Patient Detail | 跳转到患者详情页 |
| 8 | 在 Patient Detail 查看任务链（8 步竖向流程图） | Patient Detail | 每个节点显示：编号圆点(颜色表示状态) + 标题 + 描述(含 owner) + 状态 badge |
| 9 | 点击当前 active 的任务节点（如 Step 4: Contact Target Hospital） | Patient Detail → Task Action 面板 | 应弹出任务操作面板：显示任务详情 + 可执行操作（开始 / 完成 / 标记阻塞 / 添加备注） |
| 10 | 点击「← Back to Dashboard」返回看板 | Patient Detail → Dashboard | — |
| 11 | **（Flow 3 完成后）** 返回 Dashboard | Dashboard | 异常面板中 Sarah Johnson 的异常应消失，Anomalies 计数从 3 → 2，Sarah 的卡片从 Waiting 移到 In Progress |

**End point**: 所有异常已处理，看板状态更新。

### 缺口排查

| Gap # | 描述 | 当前行为 | 应有行为 |
|-------|------|---------|---------|
| **2.1** | 「Follow Up」按钮无响应 | 纯静态按钮 | 应弹出 Follow Up 操作面板 |
| **2.2** | 「Assign」按钮无响应 | 纯静态按钮 | 应弹出 Assign 操作面板 |
| **2.3** | 任务链节点不可交互 | 纯展示，点击无反应 | active 节点应可点击，弹出任务操作面板 |
| **2.4** | 异常处理后看板不更新 | 异常永远存在 | Flow 3 完成后返回 Dashboard，异常应消失或标记为已解决 |
| **2.5** | 患者详情页无「推进任务」入口 | 无法从详情页进入 Booking | active 且 owner=Coordinator 的任务节点应可直接跳转到对应操作（如 Step 4 → Booking） |

---

## Flow 3: Guided Cross-Hospital Booking（跨院引导式预约）

### 完整步骤（Start → End）

| # | 动作 | 所在视图 | 系统响应 |
|---|------|---------|---------|
| 1 | 从 Dashboard 异常面板点击「Resolve」 **或** 从 Kanban Waiting 列点击 Sarah Johnson 卡片 | Dashboard → Booking View | 进入引导式预约视图 |
| 2 | 查看左侧面板顶部：标题「Guided Booking」+ 副标题「Call Anzhen Hospital · Fetal Cardiac Echo」 | Booking View | — |
| 3 | 阅读电话话术脚本（含高亮占位符：医院名 / 患者孕周 / 患者姓名 / 检查类型 / 转诊文件 / 时间范围 / 科室 / 保险信息） | Booking View | — |
| 4 | 点击「📞 Start Call」按钮 | Booking View | **应进入通话状态**：按钮变为「📞 Calling... (0:05)」倒计时，3 秒后变为「✓ Connected」 |
| 5 | 通话中 — 根据脚本与医院方沟通，填写右侧表单 | Booking View | 表单字段：Call Status / Appointment Date / Appointment Time / Department Confirmed / Notes from Call |
| 6 | 查看右侧状态面板 — 6 步进度条：✓ Records Collected → ✓ Hospital Identified → ✓ Documents Translated → ⟳ Booking in Progress → ○ Notify Patient → ○ Patient Reminder | Booking View | 当前 Step 4 亮蓝 |
| 7 | 填完表单，点击「Confirm & Notify Patient」 | Booking View → Success State | **应显示预约确认成功面板** |
| 8 | 成功面板显示：✓ 预约已确认 + ✓ 患者已通过 app 通知 + ✓ 任务链已更新（Step 4 → Done, Step 5 → Active）+ ✓ 异常已自动关闭 | Booking Success State | — |
| 9 | 点击「View Patient Details」查看更新后的任务链 | Booking → Patient Detail | **Step 4 应标记为 Done, Step 5 (Notify Patient) 应标记为 Done (System auto-sent), Step 6 (Day-Before Reminder) 应标记为 Active/Scheduled** |
| 10 | **（替代路径）** 点击「View Patient App」查看患者收到的通知 | Booking → Patient App | **患者 app 的 Today 卡片应显示已确认的预约信息** |
| 11 | **（替代路径）** 点击「Back to Dashboard」 | Booking → Dashboard | **Dashboard 异常面板中 Sarah Johnson 的异常应消失，Anomalies 计数从 3 → 2** |

**End point**: 预约确认，患者已通知，任务链推进，异常关闭。

### 缺口排查

| Gap # | 描述 | 当前行为 | 应有行为 |
|-------|------|---------|---------|
| **3.1** | 「Start Call」无通话模拟 | 按钮纯静态 | 应有通话状态切换（Calling → Connected） |
| **3.2** | 「Confirm & Notify Patient」无任何响应 | 按钮纯静态 | 应显示成功确认面板，含 4 项确认 + 导航按钮 |
| **3.3** | 无返回导航 | 无「← Back」按钮 | 应有返回 Dashboard 或 Patient Detail 的入口 |
| **3.4** | 预约成功后任务链不更新 | Patient Detail 永远是 Step 4 active | 应更新为 Step 4 Done, Step 5 Done, Step 6 Active |
| **3.5** | 预约成功后患者 app 不更新 | Patient App 永远显示同一内容 | 应显示新的已确认预约卡片 |
| **3.6** | 预约成功后异常不消失 | Dashboard 异常面板不变 | 异常应标记为 Resolved 或消失 |
| **3.7** | 无 Patient Detail → Booking 的入口 | 任务节点不可点击 | Patient Detail 的 Step 4 (active, owner=Coordinator) 应可直接跳转 Booking |

---

## 修复实施清单

### Flow 1 修复

| Fix # | 修复内容 | 实施方式 |
|-------|---------|---------|
| F1.1 | 新增 Emma Schmidt 患者详情视图 | 新增 `view-new-patient-detail`，显示 Emma 信息 + 任务链 Step 1 active |
| F1.2 | Success 页「View Patient Details」跳转到 Emma | 修改 onclick 为 `switchView('new-patient-detail')` |
| F1.3 | Dashboard To Do 列新增 Emma Schmidt 卡片 | 在 To Do 列添加 Emma 卡片（始终可见，代表刚创建） |
| F1.4 | Success 页新增「View Patient App」按钮 | 添加按钮跳转到患者 app，显示欢迎通知状态 |

### Flow 2 修复

| Fix # | 修复内容 | 实施方式 |
|-------|---------|---------|
| F2.1 | Follow Up 按钮弹出操作面板 | 添加 modal overlay，显示上次联系记录 + 快捷操作按钮 |
| F2.2 | Assign 按钮弹出分配面板 | 添加 modal overlay，显示可用翻译员列表 + 分配按钮 |
| F2.3 | 任务链节点可点击 | active 节点添加 onclick，弹出任务操作面板 |
| F2.4 | Patient Detail Step 4 添加「Start Booking」入口 | 在 Step 4 节点添加按钮，跳转 Booking |
| F2.5 | 异常面板支持「已解决」状态 | 添加 JS 函数 `resolveAnomaly()`，隐藏对应异常条目 + 更新计数 |

### Flow 3 修复

| Fix # | 修复内容 | 实施方式 |
|-------|---------|---------|
| F3.1 | Start Call 通话状态模拟 | 添加 JS 函数，按钮文本切换：Start Call → Calling... → Connected |
| F3.2 | Confirm & Notify Patient 成功面板 | 在 Booking View 内新增 success overlay，含 4 项确认 + 3 个导航按钮 |
| F3.3 | Booking View 添加返回按钮 | 顶部添加「← Back to Dashboard」和「← Back to Patient」 |
| F3.4 | 预约成功后 Patient Detail 更新 | 添加 `view-patient-detail-updated` 视图，Step 4/5 Done, Step 6 Active |
| F3.5 | 预约成功后 Patient App 更新 | 添加 `view-patient-app-updated` 视图，显示已确认预约卡片 |
| F3.6 | 预约成功后 Dashboard 异常更新 | Success 面板「Back to Dashboard」调用 `resolveAnomaly()` 后跳转 |
