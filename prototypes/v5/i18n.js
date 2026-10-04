(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BridgeCareI18n = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const zh = {
    'Main navigation': '主导航', 'Interface language': '界面语言', 'WORKSPACE': '工作台',
    'Dashboard': '工作台', 'Patient preview': '患者预览', 'Reset demo': '重置演示',
    'Return to Sarah’s booking-overdue case': '返回 Sarah 的预约超时病例', 'Coordinator workspace': '协调员工作台',
    'INTERACTIVE MOCK': '交互式原型', 'Care coordination': '医疗协调', 'DEMO MODE': '演示模式',
    'One referral. Every handoff.': '一份转诊，贯穿每次交接。',
    'Opens with Sarah’s overdue booking. Calls and patient updates are simulated.': '默认展示 Sarah 的预约超时病例。电话和患者端更新均为模拟内容。',
    'No active case': '暂无进行中的病例', 'Referral accepted': '已接收转诊', 'Booking overdue': '预约已超时',
    'Call retry needed': '待再次联系', 'Appointment confirmed': '预约已确认', 'Report due': '待收检查报告',
    'Report delayed': '检查报告延迟', 'Clinician review pending': '等待医生审阅', 'Arrange follow-up': '安排随访',
    'Clinical handoff arranged': '随访交接已完成', 'Case in progress': '病例处理中',
    'This step is not available at the current stage.': '当前阶段无法执行此操作。',
    'Accept a referral to create Sarah’s case first.': '请先完成转诊录入，再查看病例。',
    'The patient preview will appear after the referral is accepted.': '完成转诊录入后即可查看患者预览。',
    'Open {name} case': '查看 {name} 的病例', 'Coordinator action needed': '待协调员处理', 'Owner · Yuzhu Dai': '负责人 · Yuzhu Dai',
    'Open case': '打开病例', '{value}% complete': '已完成 {value}%',
    'Referral received': '收到转诊', 'Coordinator action': '协调员待办', 'Awaiting care team': '等待医疗团队处理', 'Handoff': '随访交接',
    'New cases and records': '新转诊与病历材料', 'Calls, decisions and exceptions': '电话联系、处理决定与异常',
    'Visit and report tracking': '就诊与报告跟进', 'Clinician review and next visit': '医生审阅与后续就诊',
    'Nothing needs urgent attention': '目前没有紧急事项', 'Overdue booking and report follow-up will appear here.': '预约超时或报告逾期时，会显示在这里。',
    '{name} · appointment not confirmed': '{name} · 预约尚未确认',
    'Last call: {reason}. Retry by {due}.': '上次电话结果：{reason}。请于 {due} 前重试。',
    'The booking deadline has passed. Review the referral before contacting the hospital.': '预约已超过截止时间。联系医院前，请先查看转诊信息。',
    '{name} · report delayed': '{name} · 检查报告延迟', 'Yuzhu Dai will follow up by {due}.': 'Yuzhu Dai 会在 {due} 前跟进。',
    'Review alert': '处理预约异常', 'Open report task': '查看报告跟进', 'ACTIVE CASES': '进行中病例',
    'Ready for referral intake': '准备接收新转诊', 'EXCEPTIONS': '待处理异常', 'Needs coordinator judgment': '需要协调员判断',
    'CASE STAGE': '病例阶段', 'Open workspace': '等待接收转诊', 'One shared case record': '病例记录贯穿整个流程',
    'PROTOTYPE SHORTCUTS': '演示快捷入口', 'Demo scenarios': '演示场景',
    'Switches rebuild the case from valid task-chain steps.': '切换场景时会按对应流程生成病例和任务记录。',
    'Start from referral': '从转诊开始', 'Clear this case and open the five-step wizard': '清空当前病例并打开五步向导',
    'Open Sarah’s hospital booking exception': '查看 Sarah 的预约异常', 'Report delayed': '检查报告延迟',
    'Open a post-visit report follow-up': '打开就诊后的报告跟进', 'Current': '当前场景',
    'YOUR ACTIVE CASE': '当前病例', 'Sarah’s case': 'Sarah 的病例', '{name}’s case': '查看 {name} 的病例', 'Patient preview': '患者预览',
    'START A CARE JOURNEY': '开始处理转诊', 'No active referral': '暂无转诊',
    'Enter Sarah’s information and launch the task chain to begin.': '填写患者信息并启动任务链，即可开始。',
    'Start from referral →': '从转诊开始 →', 'CARE JOURNEY': '转诊流程',
    '{name}’s coordination board': '{name} 的转诊协作看板',
    'One referral moves through the work. The coordinator owns every handoff.': '这份转诊会依次经过各项处理，每次交接都由协调员跟进。',
    'Open {name}’s case →': '打开 {name} 的病例 →', 'No case in this stage': '此阶段暂无病例',
    'ATTENTION QUEUE': '待处理事项', 'Needs coordinator attention': '需要协调员处理',
    '{count} open exception': '{count} 项待处理异常', 'No open exceptions': '当前没有待处理异常',
    'Today / care operations': '今日工作', 'Care dashboard': '医疗协调工作台',
    'A clear view of the work that keeps Sarah’s care moving.': '查看当前待办，跟进每位患者的就诊安排。',
    'Referral setup progress': '转诊设置进度', 'Patient': '患者', 'Referral': '转诊', 'Template': '模板', 'Adjust': '调整', 'Launch': '启动',
    'Patient information': '患者信息', 'Referral context': '转诊背景', 'Select a task chain': '选择任务链',
    'Adjust optional steps': '调整可选步骤', 'Review and launch': '检查并启动',
    'Start with the patient and the language they use for care.': '先填写患者信息和首选沟通语言。',
    'Capture where the referral starts and which team will receive it.': '填写转诊来源和接诊团队。',
    'Choose a focused care plan for this cross-hospital referral.': '为这次跨院转诊选择合适的任务链。',
    'Keep only the support this patient needs. You can revise the optional interpreter task.': '只保留患者需要的支持项。口译协调任务可按需调整。',
    'Check the case details before creating the shared task chain.': '请先检查病例信息，再创建任务链。',
    'First name': '名字', 'Last name': '姓氏', 'Preferred language': '首选语言',
    'Referring hospital': '转出医院', 'Receiving hospital': '接诊医院', 'Receiving department': '接诊科室',
    'Reason for referral': '转诊原因', 'Cross-Hospital OB Referral': '跨院产科转诊',
    'Prepare records, coordinate booking, guide the visit, track the report and arrange follow-up.': '整理病历、协调预约、协助就诊、跟进检查报告，并安排随访。',
    'Selected': '已选择', 'Select': '选择', 'OB Referral · Interpreter-ready': '产科转诊 · 可安排口译',
    'Use the same care plan with interpreter coordination included as a suggested support task.': '在同一任务链中加入口译协调，作为可选支持。',
    'Two preset configurations are shown for this case. Full template authoring is outside this prototype.': '此原型提供两个预设方案，暂不支持自定义模板。',
    'The task chain is a starting point.': '任务链用于起步，具体安排由协调员判断。',
    'Yuzhu decides whether translation support is needed and stays responsible for each handoff.': 'Yuzhu 会判断是否需要口译支持，并跟进每次交接。',
    'Accept referral and review records': '接收转诊并复核病历', 'Prepare referral documents': '准备转诊材料',
    'Confirm hospital appointment': '确认医院预约', 'Arrange interpreter': '安排口译',
    'Send appointment details': '发送预约信息', 'Guide visit and check-in': '协助就诊与登记',
    'Collect and check report': '收取并核对报告', 'Arrange clinician follow-up': '安排医生随访',
    'Coordinator': '协调员', 'System': '系统', 'Patient + Coordinator': '患者 + 协调员',
    'Optional support': '可选支持', 'Included in this chain': '包含在此任务链中', 'Optional': '可选', 'Included': '已包含',
    'Included': '已包含', 'Done': '已完成', 'Skipped': '已跳过', 'Active': '进行中', 'Waiting': '等待中', 'Attention': '需关注',
    'PATIENT': '患者', 'REFERRAL': '转诊', 'REASON FOR REFERRAL': '转诊原因', 'TASK CHAIN': '任务链',
    'Interpreter coordination included': '已添加口译协调任务', 'Interpreter coordination skipped': '未添加口译协调任务',
    'Launching creates a local case and task chain. This prototype does not send a patient invitation.': '启动后会在本地创建病例和任务链。本原型不会向患者发送邀请。',
    'Exit setup': '退出设置', 'Save and exit': '退出设置', 'NEW REFERRAL': '新建转诊', 'Cancel': '取消',
    '← Back': '← 返回', 'Continue →': '继续 →', 'Launch task chain →': '启动任务链 →',
    'Referral setup / step {step} of 5': '新建转诊 · 第 {step}/5 步',
    'STEP 0{step}': '第 0{step} 步', 'Referral': '转诊', 'Documents': '病历材料', 'Booking': '预约', 'Visit': '就诊', 'Report': '报告', 'Follow-up': '随访',
    'Active referral / {name}': '当前转诊 · {name}', 'Task chain · {template}': '任务链 · {template}', 'CARE PLAN': '照护计划',
    '{value}% complete': '已完成 {value}%', 'Case context': '转诊信息', 'REFERRAL SOURCE': '转诊来源',
    'RECEIVING HOSPITAL': '接诊医院', 'DEPARTMENT': '科室', 'PREFERRED LANGUAGE': '首选语言', 'NEXT · PREPARE THE REFERRAL': '下一步 · 准备转诊材料',
    'Review records before the hospital call': '联系医院前核对病历',
    'Keep the referral package ready. This demo advances to the booking deadline so the exception workflow can be reviewed.': '先准备好转诊材料，再将演示推进到预约截止时间，查看后续处理流程。',
    'Interpreter task included': '已安排口译协调', 'Assign the interpreter before the care plan moves to booking.': '进入预约阶段前，请先安排口译员。',
    'Assign interpreter in mock →': '模拟安排口译员 →', 'Advance demo to booking deadline →': '推进演示至预约超时状态 →',
    'NEXT · HOSPITAL CONTACT': '下一步 · 联系医院', 'Appointment still needs confirmation': '预约尚未确认',
    'Last call: {reason}. Retry by {due}.': '上次电话结果：{reason}。请于 {due} 前重试。',
    'The booking deadline has passed. Review the case context and decide how to contact the hospital.': '预约已超过截止时间。请先查看转诊信息，再决定如何联系医院。',
    'Review alert →': '处理预约异常 →', 'Start guided booking': '开始电话预约', 'NEXT · PATIENT VISIT': '下一步 · 患者就诊',
    'View patient preview': '查看患者预览', 'Advance demo to after visit →': '推进演示至就诊后 →',
    'NEXT · REPORT CONTINUITY': '下一步 · 检查报告跟进', 'Report follow-up is due': '需要跟进检查报告',
    'Track the hospital report': '跟进检查报告', 'Keep the patient informed while the care team completes its report handoff.': '医疗团队处理报告期间，请及时向患者同步进展。',
    'Open report workflow →': '查看报告跟进 →', 'NEXT · CLINICAL REVIEW': '下一步 · 医生审阅',
    'Wait for clinician review': '等待医生审阅', 'The report was routed to {reviewer}. Confirm review before arranging another visit.': '报告已转交给 {reviewer}。安排后续就诊前请先确认医生已审阅。',
    'Confirm clinician review →': '确认医生已审阅 →', 'NEXT · FOLLOW-UP': '下一步 · 随访',
    'Arrange clinical follow-up': '安排临床随访', '{reviewer} completed review. Confirm the clinician and appointment details.': '{reviewer} 已完成审阅。请确认医生与预约信息。',
    'Schedule follow-up →': '安排随访 →', 'CARE PLAN HANDED OFF': '照护计划已交接',
    'Follow-up is arranged': '随访已安排', '{clinician} · {date} at {time}. The patient sees the next step and appointment details.': '{clinician} · {date} {time}。患者端会显示下一步和预约详情。',
    'Follow-up is arranged with {clinician} for {date} at {time}. The patient sees the next step and appointment details.': '已为患者安排随访：{clinician} 医生，{date} {time}。患者端已更新预约信息。',
    'Start a referral': '开始新转诊',
    '+ New referral': '+ 新建转诊', 'CONFIRMED HOSPITAL APPOINTMENT': '已确认医院预约', 'COMPLETED HOSPITAL VISIT': '已完成医院就诊',
    'Bring your passport and referral documents.': '请携带护照和转诊材料。', 'Patient preview shows these same details.': '患者预览显示相同的预约信息。',
    'Review alert →': '处理预约异常 →', 'Open report workflow →': '查看报告跟进 →', 'Active referral': '当前转诊',
    'Task chain': '任务链', 'Case context': '转诊信息', 'Activity': '操作记录', 'CASE CONTEXT': '转诊信息',
    'Exception review / booking': '预约异常处理', 'Appointment overdue': '预约已超时',
    'Review the referral context and choose how to move the hospital contact forward.': '查看转诊信息，决定下一步如何联系医院。',
    '← Back to case': '← 返回病例', 'What happened': '异常详情', 'No appointment was confirmed by the booking deadline. This is the first hospital contact attempt.': '预约截止时间前，医院还没有确认预约。这是第一次联系医院。',
    'Last attempt: {reason}. Retry by {due}; Yuzhu Dai owns the next call.': '上次联系结果：{reason}。Yuzhu Dai 负责在 {due} 前再次联系。',
    'OWNER': '负责人', 'Yuzhu Dai · Care Coordinator': 'Yuzhu Dai · 转诊协调员',
    'Coordinator decision': '处理决定', 'Why a person stays in the loop': '为什么需要人工确认',
    'This hospital has no reliable booking interface in the scenario. BridgeCare keeps the context and outcome structured; Yuzhu makes and records the call.': '这家医院没有可靠的预约接口。BridgeCare 会整理转诊信息，由 Yuzhu 负责致电并记录结果。',
    'Retry guided booking →': '再次联系医院 →', 'Start guided booking →': '开始电话预约 →', 'Open task chain': '查看任务链',
    'Manual coordination / {name}': '电话协调 / {name}', 'Guided hospital booking': '电话预约引导',
    'The system supplies context. The coordinator makes and records the call.': '系统整理好相关信息，由协调员致电并记录结果。',
    'Call brief': '致电信息', 'CALLING': '致电医院', 'Booking desk': '预约部门', 'SUGGESTED SCRIPT': '电话话术参考', 'PREPARE': '通话前准备',
    'Hello, I’m calling from': '您好，我从', 'about': '致电咨询', 'We’re arranging a': '我们正在安排', 'with': '，科室为',
    'Could you confirm availability, location and required documents?': '请问能否确认可预约时间、地点和所需材料？',
    'Referral letter · Translated summary · Passport': '转诊信、病历摘要译文和护照',
    'Suggested wording only. Yuzhu confirms facts with the hospital.': '以下是话术参考，具体信息由 Yuzhu 与医院确认。',
    'Record the outcome': '记录通话结果', 'Ready to contact the hospital?': '准备好开始模拟通话了吗？',
    'This is a simulated call. No call will be placed.': '这是模拟电话，不会实际拨出。', 'Start simulated call': '开始模拟通话',
    'Call workspace open': '模拟通话已开始', 'Choose the outcome reported by the hospital desk.': '请选择医院预约部门反馈的结果。',
    'Connected': '已接通', 'The desk confirmed an available slot': '预约部门确认有可用时段', 'No answer': '未接通',
    'Record the attempt and assign a retry': '登记本次未接通，并安排再次联系', 'Appointment date': '预约日期', 'Appointment time': '预约时间',
    'Building / floor / check-in': '楼栋、楼层或报到地点', 'Instructions from hospital': '医院提供的说明',
    'Confirm only the slot and logistics the hospital provided.': '只确认医院提供的预约时间和就诊安排。',
    'Confirm appointment and update patient →': '确认预约并更新患者端 →',
    'No appointment has been booked.': '预约尚未确认。', 'Recording this attempt creates a retry task for Yuzhu Dai.': '记录后会为 Yuzhu Dai 创建再次联系的待办。',
    'Why the call did not connect': '未接通原因', 'Retry by': '下次联系时间',
    'The patient preview will continue to say the appointment is not confirmed.': '患者预览中仍会显示预约尚未确认。',
    'Record attempt and assign retry →': '记录未接通并安排再次联系 →', 'After visit / continuity': '就诊后跟进',
    'Report follow-up': '检查报告跟进', 'Track the report': '跟进检查报告', 'The visit is over; the coordinator keeps the hospital handoff visible.': '就诊已结束，协调员会继续跟进医院报告交接。',
    'Case status': '病例进度', 'PATIENT-FACING STATUS': '患者端状态', 'Case status': '病例进度',
    'Coordinator action': '协调员待办', 'IF THE DEADLINE PASSES': '超过截止时间时', 'Record a report delay': '记录报告延迟',
    'Set a follow-up time so the missing report stays visible on the workbench.': '设置跟进时间，工作台会提醒你继续跟进尚未收到的报告。',
    'Follow up by': '跟进时间', 'Record report delay →': '记录报告延迟 →',
    'WHEN THE REPORT ARRIVES': '收到报告后', 'Route it for clinician review': '转交医生审阅',
    'Log receipt and send the report to the named clinician. Findings remain with the clinical team.': '登记收到检查报告，并转交指定医生审阅。报告内容由医疗团队负责解读。',
    'Route to clinician': '转交医生', 'Mark received and route for review →': '确认收到并转交医生审阅 →',
    'Clinical checkpoint / human review': '医生审阅确认', 'Confirm clinician review': '确认医生已审阅',
    'The coordinator records review completion before another visit can be arranged.': '协调员确认医生已完成审阅后，才能安排随访。',
    'Report handoff': '报告交接', 'REPORT RECEIVED': '报告已收到',
    'Clinical findings are not represented or interpreted in this prototype.': '本原型不展示或解读临床检查结果。',
    'Human checkpoint': '人工确认',
    'In a real service, this status would come from a verified clinician action or a documented confirmation.': '实际使用时，应根据医生的确认或相关记录更新此状态。',
    'Coordinator check': '协调员确认', 'Has the clinician completed review?': '医生已经审阅报告了吗？',
    'Use this simulated checkpoint only after the clinician has reviewed the report. It unlocks follow-up scheduling.': '请在医生审阅报告后再点击确认。确认后才能安排随访。',
    'Record clinician review completed →': '确认医生已完成审阅 →', 'Clinical handoff / final step': '随访交接 / 最后一步',
    'Arrange follow-up': '安排随访', 'Complete the loop with a clear next appointment for Sarah.': '安排患者的下一次就诊，完成转诊交接。',
    'Before scheduling': '安排随访前', 'CLINICIAN REVIEW COMPLETED': '医生已完成审阅',
    'The report has been reviewed. Findings are not shown in this prototype.': '医生已审阅报告。本原型不展示具体检查结果。',
    'Human handoff': '人工交接', 'Confirm a suitable appointment with the clinician and communicate the logistics to Sarah.': '与医生确认合适的随访时间，再把安排告知患者。',
    'Confirm a suitable appointment with the clinician and communicate the logistics to {name}.': '与医生确认合适的随访时间，再把安排告知 {name}。',
    'Follow-up details': '随访信息', 'Clinician': '医生', 'Date': '日期', 'Time': '时间',
    'Arrange follow-up and update patient →': '安排随访并更新患者 →', 'Patient view / read-only preview': '患者端预览（只读）',
    'What {name} sees': '{name} 会看到的内容', 'One accurate next step, shared from the coordinator’s case plan.': '患者端会显示与协调员工作台一致的下一步安排。',
    'SHARED CASE STATUS': '病例进度', 'Local preview only. No real patient notification is sent.': '这里只展示预览，不会真的向患者发送通知。',
    'HOSPITAL APPOINTMENT': '医院预约', 'Not confirmed yet': '尚未确认', 'HOSPITAL INSTRUCTIONS': '医院说明',
    'NEXT STEP': '下一步', 'BRIDGECARE · CARE UPDATE': 'BRIDGECARE · 医疗进度更新',
    'Your care journey, one step at a time.': '一步一步了解您的就诊安排。', 'TODAY’S UPDATE': '今日更新', 'WHAT’S NEXT': '接下来',
    'Updated from your coordinator’s case plan': '与协调员工作台同步更新', 'CLINICIAN FOLLOW-UP': '医生随访',
    'Contact Yuzhu Dai': '联系 Yuzhu Dai', 'Care coordinator · Questions about logistics or timing': '医疗协调员 · 可咨询预约地点或时间',
    'Preview language': '预览语言', 'Preview language / English': '预览语言 / English', 'English': 'English', '中文': '中文',
    'Your care coordinator is arranging your hospital appointment. We will share the details once confirmed.': '医疗协调员正在帮您联系医院预约。确认后，我们会把具体安排告诉您。',
    'Your appointment is confirmed for {date} at {time}.': '您的预约已确认：{date} {time}。',
    'Your visit is complete. Your care team is following up on the report. No action is needed from you now.': '您已完成本次就诊。医疗团队正在跟进检查报告，您暂时不需要操作。',
    'Your report has arrived. A clinician will review it before your care coordinator shares the next step.': '检查报告已收到。医生审阅后，医疗协调员会告诉您下一步安排。',
    'Your clinician has reviewed the report. Your care coordinator is arranging the next appointment.': '医生已审阅检查报告。医疗协调员正在为您安排下一次就诊。',
    'Your clinician follow-up is scheduled for {date} at {time}.': '已为您安排医生随访：{date} {time}。',
    'Contact Yuzhu Dai if you need to change the appointment.': '如需调整预约，请联系 Yuzhu Dai。',
    'Your coordinator will share the next step after the care team reviews the report.': '医疗团队审阅报告后，医疗协调员会告诉您下一步安排。',
    'Your coordinator is arranging a follow-up appointment with your clinician.': '医疗协调员正在为您安排随访。',
    'Attend your clinician follow-up with {clinician} on {date} at {time}.': '请于 {date} {time} 按时就诊，随访医生为 {clinician}。',
    'Your care team will share the appointment details once the hospital confirms a slot.': '医院确认预约时间后，我们会把具体安排告诉您。',
    'No active referral preview.': '暂无可预览的转诊信息。',
    'BridgeCare · Care coordination': 'BridgeCare · 医疗协调',
    'Complete {field} before continuing.': '请先填写{field}，再继续。',
    'First name': '名字', 'Last name': '姓氏', 'Preferred language': '首选语言',
    'Referral reason': '转诊原因', 'Target hospital': '接诊医院', 'Department': '接诊科室', 'Task-chain template': '任务链模板',
    'Call outcome': '通话结果', 'Retry time': '重试时间', 'Follow-up time': '跟进时间', 'Reviewing clinician': '审阅医生',
    'Appointment date': '预约日期', 'Appointment time': '预约时间', 'Hospital location': '医院地点',
    'Clinician': '医生', 'Follow-up date': '随访日期',
    'This action is unavailable at the current stage.': '当前阶段无法执行此操作。',
    'First name is required.': '请填写名字。', 'Last name is required.': '请填写姓氏。',
    'Preferred language is required.': '请填写首选语言。', 'Referring hospital is required.': '请填写转出医院。',
    'Target hospital is required.': '请填写接诊医院。', 'Department is required.': '请填写接诊科室。',
    'Referral reason is required.': '请填写转诊原因。', 'Task-chain template is required.': '请选择任务链模板。',
    'Call outcome is required.': '请选择通话结果。', 'Retry time is required.': '请填写下次联系时间。',
    'Record a connected hospital call before confirming an appointment.': '请先选择并记录“已接通”，再确认预约。',
    'Appointment date is required.': '请填写预约日期。', 'Appointment time is required.': '请填写预约时间。',
    'Hospital location is required.': '请填写医院地点。', 'Follow-up time is required.': '请填写跟进时间。',
    'Reviewing clinician is required.': '请填写负责审阅的医生。', 'Clinician is required.': '请填写医生姓名。',
    'Follow-up date is required.': '请填写随访日期。', 'Assign an interpreter before advancing this case.': '推进病例前，请先安排口译员。',
    'Interpreter task was skipped for this referral.': '此转诊未安排口译员。',
    'Demo reset to Sarah’s booking-overdue case.': '演示病例已重置为 Sarah 的预约超时状态。',
    'Loaded the booking-overdue scenario.': '已切换到预约超时场景。',
    'Loaded the report-delayed scenario.': '已切换到报告延迟场景。',
    'Interpreter assigned in the case plan.': '已在任务链中安排口译员。',
    'Care Coordinator': '转诊协调员', 'Care coordinator': '转诊协调员', 'Exit setup': '退出设置',
    'Care coordination board': '转诊协作看板', 'Care journey progress': '转诊流程进度',
    'New referral': '新建转诊', 'Case': '病例', 'Guided booking': '电话预约引导', 'Clinical handoff': '随访交接',
    'FOLLOW-UP DEADLINE': '跟进期限', 'RECORD THE OUTCOME': '记录处理结果',
    'Manual coordination / {name}': '电话协调 / {name}',
    'A clear view of the work that keeps each patient’s care moving.': '查看当前待办，跟进每位患者的就诊安排。',
    'Referral setup / step {step} of 5': '新建转诊 · 第 {step}/5 步', 'STEP 0{step}': '第 0{step} 步',
    'Enter patient information and launch the task chain to begin.': '填写患者信息并启动任务链以开始。',
    'Keep the referral package ready. This demo advances to the booking deadline so the exception workflow can be reviewed.': '先准备好转诊材料，再将演示推进到预约截止时间，查看后续处理流程。',
    'The booking deadline has passed. Review the case context and decide how to contact the hospital.': '预约已超过截止时间。请先查看转诊信息，再决定如何联系医院。',
    'Appointment confirmed for {date} at {time} · {location}. The patient preview shows these same details.': '预约已确认：{date} {time} · {location}。患者预览显示相同信息。',
    'Report follow-up is due': '需要跟进检查报告', 'Track the hospital report': '跟进检查报告',
    'Keep the patient informed while the care team completes its report handoff.': '医疗团队处理报告期间，请及时向患者同步进展。',
    'Create a care plan to see the next coordinator action.': '创建照护计划，即可查看协调员接下来的工作。',
    'CALLING': '致电医院', 'Booking desk': '预约部门', 'SUGGESTED SCRIPT': '电话话术参考',
    'PREPARE': '通话前准备', 'Referral letter · Translated summary · Passport': '转诊信、病历摘要译文和护照',
    'Suggested wording only. Yuzhu confirms facts with the hospital.': '以下是话术参考，具体信息由 Yuzhu 与医院确认。',
    'Call workspace open': '模拟通话已开始', 'Choose the outcome reported by the hospital desk.': '请选择医院预约部门反馈的结果。',
    'The desk confirmed an available slot': '预约部门确认有可用时段', 'Record the attempt and assign a retry': '登记本次未接通，并安排再次联系',
    'Confirm only the slot and logistics the hospital provided.': '只确认医院提供的预约时间和就诊安排。',
    'The patient preview will continue to say the appointment is not confirmed.': '患者预览中仍会显示预约尚未确认。',
    'The visit is over; the coordinator keeps the hospital handoff visible.': '就诊已结束，协调员会继续跟进医院报告交接。',
    'PATIENT-FACING STATUS': '患者端状态', 'IF THE DEADLINE PASSES': '超过截止时间时',
    'Set a follow-up time so the missing report stays visible on the workbench.': '设置跟进时间，工作台会提醒你继续跟进尚未收到的报告。',
    'WHEN THE REPORT ARRIVES': '收到报告后', 'Route it for clinician review': '转交医生审阅',
    'Log receipt and send the report to the named clinician. Findings remain with the clinical team.': '登记收到检查报告，并转交指定医生审阅。报告内容由医疗团队负责解读。',
    'Clinical findings are not represented or interpreted in this prototype.': '本原型不展示或解读临床检查结果。',
    'Human checkpoint': '人工确认',
    'In a real service, this status would come from a verified clinician action or a documented confirmation.': '实际使用时，应根据医生的确认或相关记录更新此状态。',
    'Use this simulated checkpoint only after the clinician has reviewed the report. It unlocks follow-up scheduling.': '请在医生审阅报告后再点击确认。确认后才能安排随访。',
    'The report has been reviewed. Findings are not shown in this prototype.': '医生已审阅报告。本原型不展示具体检查结果。',
    'Confirm a suitable appointment with the clinician and communicate the logistics to Sarah.': '与医生确认合适的随访时间，再把安排告知患者。',
    'One accurate next step, shared from the coordinator’s case plan.': '患者端会显示与协调员工作台一致的下一步安排。',
    'Complete the loop with a clear next appointment for {name}.': '为 {name} 安排下一次随访，完成转诊交接。',
    'Routed to': '已转交给', 'Contact Yuzhu Dai': '联系 Yuzhu Dai',
    'Care coordinator · Questions about logistics or timing': '医疗协调员 · 可咨询预约地点或时间',
    'Preview language': '预览语言', 'Local preview only. No real patient notification is sent.': '这里只展示预览，不会真的向患者发送通知。',
    'SHARED CASE STATUS': '病例进度', 'NEXT STEP': '下一步', 'BRIDGECARE · CARE UPDATE': 'BRIDGECARE · 医疗进度更新',
    'Your care journey, one step at a time.': '一步一步了解您的就诊安排。', 'TODAY’S UPDATE': '今日更新',
    'WHAT’S NEXT': '接下来', 'Updated from your coordinator’s case plan': '与协调员工作台同步更新',
    'No active referral preview.': '暂无可预览的转诊信息。',
    'This action could not be completed.': '无法完成此操作。',
    'Accept a referral to create a case first.': '请先接收转诊以创建病例。'
  };

  const activityTemplates = {
    referral_accepted: {
      en: 'Referral accepted for {patientName}: {fromHospital} → {toHospital}, {department}. Task chain launched from {template}{interpreter}.',
      zh: '已收到患者 {patientName} 的转诊：{fromHospital} → {toHospital}（{department}）。已启动「{template}」任务链{interpreter}。'
    },
    booking_overdue: { en: 'Demo time advanced. Appointment task is overdue; coordinator action needed.', zh: '演示已推进到预约截止时间。预约尚未确认，需要协调员跟进。' },
    interpreter_assigned: { en: 'Interpreter assigned for the visit.', zh: '已为本次就诊安排口译员。' },
    call_retry: {
      en: 'Call not completed. Retry assigned to {owner} for {due}.',
      zh: '电话未接通。{owner} 会在 {due} 前再次联系医院。'
    },
    booking_confirmed: {
      en: 'Connected with {hospital}. Appointment confirmed for {date} at {time} · {location}. Instructions: {instructions}. Patient update prepared.',
      zh: '已联系 {hospital}。预约已确认：{date} {time}，地点：{location}。医院说明：{instructions}。患者预览已同步预约信息。'
    },
    visit_completed: { en: 'Demo time advanced. Visit completed; report is due from the receiving hospital.', zh: '演示已推进至就诊后。等待接诊医院提供检查报告。' },
    report_delayed: { en: 'Report delayed. {owner} will follow up by {due}.', zh: '检查报告尚未收到。{owner} 会在 {due} 前跟进。' },
    report_received: { en: 'Report received and routed to {reviewer} for clinical review.', zh: '已收到检查报告，并转交给 {reviewer} 医生，目前等待审阅。' },
    report_reviewed: { en: '{reviewer} completed clinical review. Coordinator can arrange follow-up.', zh: '{reviewer} 医生已审阅检查报告。协调员可以安排随访。' },
    followup_scheduled: { en: 'Follow-up arranged with {clinician} for {date} at {time}. Patient update prepared.', zh: '已为患者预约随访：{clinician} 医生，{date} {time}。患者预览已同步预约信息。' }
  };

  const errors = {
    step_unavailable: ['This action is unavailable at the current stage.', '当前病例阶段无法执行此操作。'],
    first_name_required: ['First name is required.', '请填写名字。'],
    last_name_required: ['Last name is required.', '请填写姓氏。'],
    language_required: ['Preferred language is required.', '请填写首选语言。'],
    referring_hospital_required: ['Referring hospital is required.', '请填写转出医院。'],
    target_hospital_required: ['Target hospital is required.', '请填写接诊医院。'],
    department_required: ['Department is required.', '请填写接诊科室。'],
    referral_reason_required: ['Referral reason is required.', '请填写转诊原因。'],
    template_required: ['Task-chain template is required.', '请选择任务链模板。'],
    call_outcome_required: ['Call outcome is required.', '请选择通话结果。'],
    retry_time_required: ['Retry time is required.', '请填写下次联系时间。'],
    connected_call_required: ['Record a connected hospital call before confirming an appointment.', '请先选择并记录“已接通”，再确认预约。'],
    appointment_date_required: ['Appointment date is required.', '请填写预约日期。'],
    appointment_time_required: ['Appointment time is required.', '请填写预约时间。'],
    hospital_location_required: ['Hospital location is required.', '请填写医院地点。'],
    follow_up_time_required: ['Follow-up time is required.', '请填写跟进时间。'],
    reviewer_required: ['Reviewing clinician is required.', '请填写审阅医生。'],
    clinician_required: ['Clinician is required.', '请填写医生姓名。'],
    follow_up_date_required: ['Follow-up date is required.', '请填写随访日期。'],
    assign_interpreter_first: ['Assign an interpreter before advancing this case.', '推进病例前，请先安排口译员。'],
    interpreter_skipped: ['Interpreter task was skipped for this referral.', '此转诊未纳入口译任务。'],
    unknown_action: ['This action could not be completed.', '无法完成此操作。']
  };

  function interpolate(text, values) {
    return String(text).replace(/\{([a-zA-Z0-9_]+)\}/g, function (match, key) {
      return values && Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match;
    });
  }

  function translate(text, locale, values) {
    const source = String(text == null ? '' : text);
    const translated = locale === 'zh' ? (zh[source] || source) : source;
    return interpolate(translated, values);
  }

  function preferredLocale(preferredLanguage) {
    const preferred = String(preferredLanguage || '').toLowerCase();
    return /chinese|mandarin|中文|普通话|简体|\bzh([_-]|$)/i.test(preferred) ? 'zh' : 'en';
  }

  function activity(event, locale) {
    const template = activityTemplates[event.type];
    if (!template) return event.type;
    const values = Object.assign({}, event.params || {});
    if (values.template) values.template = translate(values.template, locale);
    if (event.type === 'referral_accepted') {
      values.interpreter = values.includeInterpreter
        ? (locale === 'zh' ? '，其中包含口译协调' : '; interpreter task included')
        : (locale === 'zh' ? '，未包含口译协调' : '; interpreter task skipped');
    }
    const sentence = locale === 'zh' ? template.zh : template.en;
    return interpolate(sentence, values);
  }

  function patientMessage(state, locale) {
    switch (state.phase) {
      case 'empty': return translate('No active referral preview.', locale);
      case 'intake': case 'booking_due': case 'retry':
        return translate('Your care coordinator is arranging your hospital appointment. We will share the details once confirmed.', locale);
      case 'booked': return translate('Your appointment is confirmed for {date} at {time}.', locale, state.booking);
      case 'report_pending': case 'report_delayed':
        return translate('Your visit is complete. Your care team is following up on the report. No action is needed from you now.', locale);
      case 'report_received':
        return translate('Your report has arrived. A clinician will review it before your care coordinator shares the next step.', locale);
      case 'report_reviewed':
        return translate('Your clinician has reviewed the report. Your care coordinator is arranging the next appointment.', locale);
      case 'handed_off': return translate('Your clinician follow-up is scheduled for {date} at {time}.', locale, state.followup);
      default: return '';
    }
  }

  function hasTranslation(text) {
    return Object.prototype.hasOwnProperty.call(zh, String(text));
  }

  function errorText(code, locale) {
    const pair = errors[code];
    return pair ? pair[locale === 'zh' ? 1 : 0] : translate('This action could not be completed.', locale);
  }

  function errorForField(key, locale) {
    const fields = {
      firstName: ['first name', '名字'], lastName: ['last name', '姓氏'], language: ['preferred language', '首选语言'],
      referringHospital: ['referring hospital', '转出医院'], targetHospital: ['receiving hospital', '接诊医院'],
      department: ['receiving department', '接诊科室'], referralReason: ['referral reason', '转诊原因']
    };
    const pair = fields[key];
    return pair ? pair[locale === 'zh' ? 1 : 0] : String(key);
  }

  return { translate, activity, patientMessage, preferredLocale, hasTranslation, errorText, errorForField };
});
