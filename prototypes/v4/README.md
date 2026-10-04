# BridgeCare 聚焦版原型 · v4

这是从 v3 复制后继续完善的独立版本。原始高保真原型、v2、v3 均保持不变。

- 原型入口：index.html（样式和脚本需与同目录文件一起保留）
- 界面文案：英文；本说明：中文
- 默认初始场景：Sarah Johnson · Booking overdue
- 数据仅存在当前页面会话；刷新会重新载入默认 Sarah 病例
- 电话、通知、医院连接和医生审阅均为模拟操作

## 默认演示入口

首次打开工作台时，Sarah 的病例、异常复核、任务链、活动记录和患者预览均已有同一份有效病例状态。默认阶段为 Booking overdue，可依次尝试：

1. **Sarah’s case**：从工作台主卡片或导航进入病例。
2. **Review alert**：从病例页标题动作进入异常复核。
3. **Start guided booking**：在异常复核中进入电话协调。
4. **Patient preview**：从侧栏或手机底部导航查看患者端当前状态。

活动记录应显示病例创建和预约超时；此阶段不得显示已确认预约。

## Demo scenarios

Dashboard 上的 **Demo scenarios** 区提供三个入口：

| 入口 | 行为 |
|---|---|
| **Start from referral** | 清空当前演示病例并打开五步向导。取消后会回到空白工作台。 |
| **Booking overdue** | 通过创建转诊、推进到预约期限两次状态转换，生成 Sarah 的预约超时病例。 |
| **Report delayed** | 通过创建、预约确认、完成就诊、记录报告延迟等状态转换，生成报告延迟病例。 |

预约超时与报告延迟预设会清空并重建演示状态，避免残留旧活动、预约或患者预览字段。预设数据只作为有效转换的输入，阶段、异常、预约、报告和 Activity 均由状态模型产生。

**Reset demo** 总是回到 Sarah 的 **Booking overdue** 默认病例。要从空白开始，请用 **Start from referral**。

## 中文演示路径

### 从转诊开始

1. 在 Dashboard 点 **Start from referral**；此前演示病例会清空，并进入五步向导。
2. 输入 Sarah 的信息、转诊上下文，选择模板并调整可选 interpreter 步骤。
3. 在审核页启动任务链。病例应带着向导输入进入病例页。
4. 若保留 interpreter，在推进预约期限前先分配 interpreter。

### 超时、未接通后重试并确认

1. 从病例页进入 **Review alert**，核对医院、科室和转诊原因。
2. 点 **Start guided booking**，开始模拟通话。
3. 选择 **No answer**，填写未接通原因和重试时间并记录。
4. 回病例查看 booking 仍为待处理、Activity 记录重试负责人和期限；患者预览仍显示未确认预约。
5. 再次进入预约，选择 **Connected**，录入日期、时间、医院、位置和医院说明并确认。
6. 核对病例、Activity 和患者预览使用同一预约记录；预约任务完成、booking 异常解除。

### 报告延迟与临床交接

可在 Dashboard 的 **Demo scenarios → Report delayed** 快速打开报告延迟场景，再点 Dashboard 的 **Open report task**，或进 Sarah 的病例后点 **Open report workflow**；也可在预约确认后推进演示到就诊后。

1. 报告工作流显示当前报告延迟和跟进期限；在 Dashboard 与任务链也能看到同一异常。
2. 标记收到报告并指定医生。此时异常解除，但 task chain 和 patient preview 都应表达“等待医生审阅”。
3. 确认医生已审阅后，才可安排随访。
4. 录入医生、日期和时间，完成交接；病例 Activity 与患者预览显示同一随访安排。

## 验收记录

**浏览器点击验收：未完成。** 我尝试读取用户当前打开的 v3 本地标签页时，Codex 浏览器策略仍拒绝本地文件 URL。依照要求，没有改用服务器、其他浏览器或间接渲染方式。因此，下面不会把静态检查或状态单测描述成界面通过。

| 项目 | 当前结果 | 依据 |
|---|---|---|
| 首次打开 Sarah’s case | 未经本轮实际点击 | v4 初始化调用状态构建器；尚未浏览器确认页面是否可见且按钮可点 |
| Review alert | 未经本轮实际点击 | 初始阶段为 booking overdue，异常入口由阶段渲染；实际按钮点击未验 |
| Guided booking | 未经本轮实际点击 | 异常复核页保留阶段守卫；点击路径未验 |
| Patient preview | 未经本轮实际点击 | booking overdue 属允许预览阶段；桌面和手机导航点击未验 |
| Start from referral → 完成五步向导 | 未经本轮实际点击 | 入口重置状态并打开向导；表单录入与 launch 界面未验 |
| Report delayed → 报告工作流 | 未经本轮实际点击 | 预设由有效转换构建，Dashboard 提供报告工作流入口；界面点击未验 |
| 返回路径、Reset 后默认病例 | 未经本轮实际点击 | 静态代码检查确认返回动作和重置状态；实际点击未验 |
| 手机宽度 / 首屏入口布局 | 未验证 | CSS 含 400px、700px、900px、1250px 断点；无浏览器截图 |

已完成的非界面检查：

- JavaScript 语法检查通过。
- test-model.js 通过：检查默认与报告延迟预设的转换序列、未接通不能确认预约、医生审阅门槛和患者提示等状态规则。
- HTML 静态解析通过，页面 ID 无重复，本地 CSS/JS 引用均存在；CSS 括号平衡且包含 1250px、900px、700px、400px 断点。
- 这些检查不能替代真实浏览器点击或视觉验收。

## 实现说明与边界

- 原始文件、v2、v3 均未改写；交付内容在 v4 目录。
- 默认值、Booking overdue 和 Report delayed 场景都由模型逐次调用 CREATE、ADVANCE、CONFIRM_BOOKING、REPORT_DELAYED 等既有转换生成；没有直接拼接阶段或互相矛盾的字段。
- 正常阶段限制继续保留：预约只可在接通后确认，报告须先收到并完成医生审阅，之后才能安排随访。
- Google Fonts 不可用时会回退到系统字体；字体显示效果未在浏览器验证。
