const assert = require('assert').strict;
const M = require('./model.js');
const I18n = require('./i18n.js');

const defaultDemo = M.buildDemoState();
assert.equal(defaultDemo.phase, 'booking_due');
assert.equal(M.alertCount(defaultDemo), 1);
assert.equal(defaultDemo.patient.firstName, 'Sarah');
assert.equal(defaultDemo.booking, null);
assert.equal(defaultDemo.log.length, 2);
assert.deepEqual(defaultDemo.log.map(event => event.type), ['booking_overdue', 'referral_accepted']);
assert.match(I18n.activity(defaultDemo.log[1], 'en'), /Sarah Johnson.*Beijing United Family Hospital.*Beijing Anzhen Hospital/);
assert.match(I18n.activity(defaultDemo.log[1], 'zh'), /Sarah Johnson.*Beijing United Family Hospital.*Beijing Anzhen Hospital/);
assert.equal(I18n.translate('Start from referral', 'zh'), '从转诊开始');
assert.equal(I18n.translate('{name}’s case', 'zh', { name: 'Mina Chen' }), '查看 Mina Chen 的病例');
assert.equal(I18n.translate('Care coordinator', 'zh'), '转诊协调员');
assert.equal(I18n.translate('Target hospital', 'zh'), '接诊医院');
assert.equal(I18n.translate('Guided booking', 'zh'), '电话预约引导');
assert.equal(I18n.translate('Review alert', 'zh'), '处理预约异常');
assert.equal(I18n.errorText('connected_call_required', 'zh'), '请先选择并记录“已接通”，再确认预约。');
assert.equal(I18n.preferredLocale('English'), 'en');
assert.equal(I18n.preferredLocale('中文'), 'zh');
assert.equal(I18n.preferredLocale('zh-CN'), 'zh');
const reportDemo = M.buildDemoState('report_delayed');
assert.equal(reportDemo.phase, 'report_delayed');
assert.equal(reportDemo.booking.date, 'October 8, 2026');
assert.equal(reportDemo.report.status, 'delayed');
assert.equal(M.alertCount(reportDemo), 1);
assert.equal(reportDemo.log.length, 5);
assert.match(M.patientMessage(reportDemo), /following up on the report/);
assert.equal(reportDemo.log[0].type, 'report_delayed');
assert.match(I18n.activity(reportDemo.log[0], 'zh'), /检查报告尚未收到.*Yuzhu Dai/);
assert.equal(M.buildDemoState('referral').phase, 'empty');
assert.throws(() => M.buildDemoState('invented'), /Unknown demo scenario/);

let s = M.initialState();
assert.equal(M.alertCount(s), 0);
s = M.transition(s, { type: 'CREATE', data: {
  firstName: 'Sarah', lastName: 'Johnson', language: 'English',
  referringHospital: 'United Family', targetHospital: 'Anzhen Hospital',
  department: 'Fetal Cardiology', referralReason: 'Fetal cardiac echo',
  template: 'Cross-Hospital OB Referral', includeInterpreter: false
}});
assert.equal(s.phase, 'intake');
assert.equal(s.patient.firstName, 'Sarah');
s = M.transition(s, { type: 'ADVANCE_TO_BOOKING' });
assert.equal(M.alertCount(s), 1);
s = M.transition(s, { type: 'CALL_NO_ANSWER', data: { reason: 'No answer', due: 'Tomorrow, 09:00' }});
assert.equal(s.phase, 'retry');
assert.equal(s.callAttempts, 1);
assert.equal(s.booking, null);
assert.equal(s.log[0].type, 'call_retry');
assert.match(I18n.activity(s.log[0], 'zh'), /电话未接通.*Yuzhu Dai.*Tomorrow, 09:00/);
assert.throws(() => M.transition(s, { type: 'CONFIRM_BOOKING', data: { date: 'July 8', time: '09:30', location: 'Building B, 3F' }}), error => error.code === 'connected_call_required');
assert.throws(() => M.transition(s, { type: 'CONFIRM_BOOKING', data: { callOutcome: 'connected', date: '', time: '', location: '' }}), error => error.code === 'appointment_date_required');
s = M.transition(s, { type: 'CONFIRM_BOOKING', data: { callOutcome: 'connected', date: 'July 8', time: '09:30', location: 'Building B, 3F' }});
assert.equal(s.phase, 'booked');
assert.equal(s.retry, null);
assert.equal(s.callAttempts, 2);
assert.equal(s.booking.notes, 'Bring your passport and referral documents.');
assert.equal(s.log[0].type, 'booking_confirmed');
assert.match(I18n.activity(s.log[0], 'en'), /Anzhen Hospital.*Building B, 3F.*Bring your passport and referral documents/);
assert.match(I18n.activity(s.log[0], 'zh'), /Anzhen Hospital.*Building B, 3F.*Bring your passport and referral documents/);
assert.equal(M.alertCount(s), 0);
assert.match(M.patientMessage(s), /July 8.*09:30/);
s = M.transition(s, { type: 'ADVANCE_TO_VISIT' });
s = M.transition(s, { type: 'REPORT_DELAYED', data: { due: 'Tomorrow, 16:00' }});
assert.equal(M.alertCount(s), 1);
s = M.transition(s, { type: 'REPORT_RECEIVED', data: { reviewer: 'Dr. Chen' }});
assert.equal(M.alertCount(s), 0);
assert.equal(s.report.status, 'received');
assert.equal(s.report.due, 'Tomorrow, 16:00');
assert.equal(s.report.owner, 'Yuzhu Dai');
assert.match(M.patientMessage(s), /clinician will review/);
assert.throws(() => M.transition(s, { type: 'SCHEDULE_FOLLOWUP', data: { clinician: 'Dr. Chen', date: 'July 12', time: '11:00' }}), error => error.code === 'step_unavailable');
assert.match(I18n.patientMessage(s, 'zh'), /报告已收到/);
assert.doesNotMatch(I18n.patientMessage(s, 'zh'), /医生已审阅/);
assert.match(I18n.activity(s.log[0], 'zh'), /已收到检查报告.*Dr\. Chen.*等待审阅/);
s = M.transition(s, { type: 'CONFIRM_REVIEW' });
assert.match(I18n.patientMessage(s, 'zh'), /医生已审阅/);
assert.doesNotMatch(I18n.patientMessage(s, 'zh'), /报告已收到/);
s = M.transition(s, { type: 'SCHEDULE_FOLLOWUP', data: { clinician: 'Dr. Chen', date: 'July 12', time: '11:00' }});
assert.equal(s.phase, 'handed_off');
assert.match(M.patientMessage(s), /July 12.*11:00/);
assert.match(I18n.patientMessage(s, 'zh'), /已为您安排医生随访/);
assert.match(I18n.activity(s.log[0], 'zh'), /已为患者预约随访：Dr\. Chen 医生/);
assert.throws(() => M.transition(s, { type: 'CONFIRM_BOOKING', data: {} }), error => error.code === 'step_unavailable');
let optional = M.initialState();
optional = M.transition(optional, { type: 'CREATE', data: {
  firstName: 'Sarah', lastName: 'Johnson', language: 'English',
  referringHospital: 'United Family', targetHospital: 'Anzhen Hospital',
  department: 'Fetal Cardiology', referralReason: 'Fetal cardiac echo',
  template: 'Cross-Hospital OB Referral', includeInterpreter: true
}});
assert.throws(() => M.transition(optional, { type: 'ADVANCE_TO_BOOKING' }), error => error.code === 'assign_interpreter_first');
optional = M.transition(optional, { type: 'ASSIGN_INTERPRETER' });
optional = M.transition(optional, { type: 'ADVANCE_TO_BOOKING' });
assert.equal(optional.interpreterAssigned, true);
let noSkip = M.transition(M.initialState(), { type: 'CREATE', data: {
  firstName: 'Sarah', lastName: 'Johnson', language: 'English', referringHospital: 'United Family',
  targetHospital: 'Anzhen Hospital', department: 'Fetal Cardiology', referralReason: 'Fetal cardiac echo',
  template: 'Cross-Hospital OB Referral'
}});
noSkip = M.transition(noSkip, { type: 'ADVANCE_TO_BOOKING' });
noSkip = M.transition(noSkip, { type: 'CONFIRM_BOOKING', data: { callOutcome: 'connected', date: 'July 8', time: '09:30', location: 'Building B, 3F' }});
noSkip = M.transition(noSkip, { type: 'ADVANCE_TO_VISIT' });
noSkip = M.transition(noSkip, { type: 'REPORT_RECEIVED', data: { reviewer: 'Dr. Chen' }});
assert.throws(() => M.transition(noSkip, { type: 'SCHEDULE_FOLLOWUP', data: { clinician: 'Dr. Chen', date: 'July 12', time: '11:00' }}), error => error.code === 'step_unavailable');
noSkip = M.transition(noSkip, { type: 'CONFIRM_REVIEW' });
noSkip = M.transition(noSkip, { type: 'SCHEDULE_FOLLOWUP', data: { clinician: 'Dr. Chen', date: 'July 12', time: '11:00' }});
assert.equal(noSkip.phase, 'handed_off');
console.log('BridgeCare model and bilingual message checks passed.');
