const assert = require('assert').strict;
const M = require('./model.js');

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
assert.throws(() => M.transition(s, { type: 'CONFIRM_BOOKING', data: { date: '', time: '', location: '' }}), /Appointment date/);
s = M.transition(s, { type: 'CONFIRM_BOOKING', data: { date: 'July 8', time: '09:30', location: 'Building B, 3F' }});
assert.equal(s.phase, 'booked');
assert.equal(s.retry, null);
assert.equal(M.alertCount(s), 0);
assert.match(M.patientMessage(s), /July 8.*09:30/);
s = M.transition(s, { type: 'ADVANCE_TO_VISIT' });
s = M.transition(s, { type: 'REPORT_DELAYED', data: { due: 'Tomorrow, 16:00' }});
assert.equal(M.alertCount(s), 1);
s = M.transition(s, { type: 'REPORT_RECEIVED', data: { reviewer: 'Dr. Chen' }});
assert.equal(M.alertCount(s), 0);
assert.throws(() => M.transition(s, { type: 'SCHEDULE_FOLLOWUP', data: { clinician: 'Dr. Chen', date: 'July 12', time: '11:00' }}), /unavailable/);
s = M.transition(s, { type: 'CONFIRM_REVIEW' });
s = M.transition(s, { type: 'SCHEDULE_FOLLOWUP', data: { clinician: 'Dr. Chen', date: 'July 12', time: '11:00' }});
assert.equal(s.phase, 'handed_off');
assert.match(M.patientMessage(s), /July 12.*11:00/);
assert.throws(() => M.transition(s, { type: 'CONFIRM_BOOKING', data: {} }), /unavailable/);
let optional = M.initialState();
optional = M.transition(optional, { type: 'CREATE', data: {
  firstName: 'Sarah', lastName: 'Johnson', language: 'English',
  referringHospital: 'United Family', targetHospital: 'Anzhen Hospital',
  department: 'Fetal Cardiology', referralReason: 'Fetal cardiac echo',
  template: 'Cross-Hospital OB Referral', includeInterpreter: true
}});
assert.throws(() => M.transition(optional, { type: 'ADVANCE_TO_BOOKING' }), /Assign an interpreter/);
optional = M.transition(optional, { type: 'ASSIGN_INTERPRETER' });
optional = M.transition(optional, { type: 'ADVANCE_TO_BOOKING' });
assert.equal(optional.interpreterAssigned, true);
console.log('BridgeCare model: four-scene state transition checks passed.');
