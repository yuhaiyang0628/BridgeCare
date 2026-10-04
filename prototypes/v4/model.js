(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BridgeCareModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const TEMPLATE_STEPS = [
    { id: 'intake', title: 'Accept referral and review records', owner: 'Coordinator' },
    { id: 'documents', title: 'Prepare referral documents', owner: 'Coordinator' },
    { id: 'booking', title: 'Confirm hospital appointment', owner: 'Coordinator' },
    { id: 'interpreter', title: 'Arrange interpreter', owner: 'Coordinator', optional: true },
    { id: 'notify', title: 'Send appointment details', owner: 'System' },
    { id: 'visit', title: 'Guide visit and check-in', owner: 'Patient + Coordinator' },
    { id: 'report', title: 'Collect and check report', owner: 'Coordinator' },
    { id: 'followup', title: 'Arrange clinician follow-up', owner: 'Coordinator' }
  ];
  const DEFAULT_REFERRAL = Object.freeze({
    firstName: 'Sarah', lastName: 'Johnson', language: 'English',
    referringHospital: 'Beijing United Family Hospital', targetHospital: 'Beijing Anzhen Hospital',
    department: 'Fetal Cardiology',
    referralReason: 'Fetal cardiac echo after a suspected anomaly on the anatomy scan',
    template: 'Cross-Hospital OB Referral', includeInterpreter: false
  });
  const DEMO_APPOINTMENT = Object.freeze({
    callOutcome: 'connected', date: 'October 8, 2026', time: '09:30',
    location: 'Building B, 3F · Foreign Patients Window',
    notes: 'Bring passport and translated referral letter'
  });

  function initialState() {
    return { phase: 'empty', patient: null, template: null, includeInterpreter: false, interpreterAssigned: false,
      booking: null, callAttempts: 0, retry: null, report: null, followup: null, log: [] };
  }

  function requirePhase(state, phases) {
    if (!phases.includes(state.phase)) throw new Error('This action is unavailable at the current stage.');
  }

  function required(value, label) {
    if (!String(value || '').trim()) throw new Error(label + ' is required.');
    return String(value).trim();
  }

  function addLog(state, message) {
    state.log.unshift(message);
  }

  function transition(current, action) {
    const state = JSON.parse(JSON.stringify(current));
    const data = action.data || {};
    switch (action.type) {
      case 'CREATE':
        requirePhase(state, ['empty']);
        state.patient = {
          firstName: required(data.firstName, 'First name'),
          lastName: required(data.lastName, 'Last name'),
          language: required(data.language, 'Preferred language'),
          referringHospital: required(data.referringHospital, 'Referring hospital'),
          targetHospital: required(data.targetHospital, 'Target hospital'),
          department: required(data.department, 'Department'),
          referralReason: required(data.referralReason, 'Referral reason')
        };
        state.template = required(data.template, 'Task-chain template');
        state.includeInterpreter = Boolean(data.includeInterpreter);
        state.phase = 'intake';
        addLog(state, 'Referral accepted for ' + state.patient.firstName + ' ' + state.patient.lastName + ': ' + state.patient.referringHospital + ' → ' + state.patient.targetHospital + ', ' + state.patient.department + '. Task chain launched from ' + state.template + (state.includeInterpreter ? '; interpreter task included.' : '; interpreter task skipped.'));
        return state;
      case 'ADVANCE_TO_BOOKING':
        requirePhase(state, ['intake']);
        if (state.includeInterpreter && !state.interpreterAssigned) throw new Error('Assign an interpreter before advancing this case.');
        state.phase = 'booking_due';
        addLog(state, 'Demo time advanced. Appointment task is overdue; coordinator action needed.');
        return state;
      case 'ASSIGN_INTERPRETER':
        requirePhase(state, ['intake']);
        if (!state.includeInterpreter) throw new Error('Interpreter task was skipped for this referral.');
        state.interpreterAssigned = true;
        addLog(state, 'Interpreter assigned for the visit.');
        return state;
      case 'CALL_NO_ANSWER':
        requirePhase(state, ['booking_due', 'retry']);
        state.retry = { reason: required(data.reason, 'Call outcome'), due: required(data.due, 'Retry time'), owner: 'Yuzhu Dai' };
        state.callAttempts += 1;
        state.phase = 'retry';
        addLog(state, 'Call not completed. Retry assigned to Yuzhu Dai for ' + state.retry.due + '.');
        return state;
      case 'CONFIRM_BOOKING':
        requirePhase(state, ['booking_due', 'retry']);
        if (data.callOutcome !== 'connected') throw new Error('Record a connected hospital call before confirming an appointment.');
        state.booking = {
          date: required(data.date, 'Appointment date'),
          time: required(data.time, 'Appointment time'),
          location: required(data.location, 'Hospital location'),
          notes: String(data.notes || '').trim() || 'Bring your passport and referral documents.'
        };
        state.callAttempts += 1;
        state.retry = null;
        state.phase = 'booked';
        addLog(state, 'Connected with ' + state.patient.targetHospital + '. Appointment confirmed for ' + state.booking.date + ' at ' + state.booking.time + ' · ' + state.booking.location + '. Instructions: ' + state.booking.notes + '. Patient update prepared.');
        return state;
      case 'ADVANCE_TO_VISIT':
        requirePhase(state, ['booked']);
        state.phase = 'report_pending';
        addLog(state, 'Demo time advanced. Visit completed; report is due from the receiving hospital.');
        return state;
      case 'REPORT_DELAYED':
        requirePhase(state, ['report_pending']);
        state.report = { status: 'delayed', due: required(data.due, 'Follow-up time'), owner: 'Yuzhu Dai' };
        state.phase = 'report_delayed';
        addLog(state, 'Report delayed. Yuzhu Dai will follow up by ' + state.report.due + '.');
        return state;
      case 'REPORT_RECEIVED':
        requirePhase(state, ['report_pending', 'report_delayed']);
        state.report = Object.assign({}, state.report || {}, { status: 'received', reviewer: required(data.reviewer, 'Reviewing clinician') });
        state.phase = 'report_received';
        addLog(state, 'Report received and routed to ' + state.report.reviewer + ' for clinical review.');
        return state;
      case 'CONFIRM_REVIEW':
        requirePhase(state, ['report_received']);
        state.report.status = 'reviewed';
        state.phase = 'report_reviewed';
        addLog(state, state.report.reviewer + ' completed clinical review. Coordinator can arrange follow-up.');
        return state;
      case 'SCHEDULE_FOLLOWUP':
        requirePhase(state, ['report_reviewed']);
        state.followup = { clinician: required(data.clinician, 'Clinician'), date: required(data.date, 'Follow-up date'), time: required(data.time, 'Follow-up time') };
        state.phase = 'handed_off';
        addLog(state, 'Follow-up arranged with ' + state.followup.clinician + ' for ' + state.followup.date + ' at ' + state.followup.time + '. Patient update prepared.');
        return state;
      default:
        throw new Error('Unknown action: ' + action.type);
    }
  }

  function defaultReferral() {
    return Object.assign({}, DEFAULT_REFERRAL);
  }

  function buildDemoState(scenario) {
    const selected = scenario || 'booking_overdue';
    let state = initialState();
    if (selected === 'referral') return state;
    if (!['booking_overdue', 'report_delayed'].includes(selected)) {
      throw new Error('Unknown demo scenario: ' + selected);
    }
    state = transition(state, { type: 'CREATE', data: defaultReferral() });
    state = transition(state, { type: 'ADVANCE_TO_BOOKING' });
    if (selected === 'booking_overdue') return state;
    state = transition(state, { type: 'CONFIRM_BOOKING', data: DEMO_APPOINTMENT });
    state = transition(state, { type: 'ADVANCE_TO_VISIT' });
    state = transition(state, { type: 'REPORT_DELAYED', data: { due: 'October 13, 2026 · 16:00' } });
    return state;
  }

  function alertCount(state) {
    return ['booking_due', 'retry', 'report_delayed'].includes(state.phase) ? 1 : 0;
  }

  function patientMessage(state) {
    switch (state.phase) {
      case 'empty': return 'No active referral preview.';
      case 'intake': case 'booking_due': case 'retry': return 'Your care coordinator is arranging your hospital appointment. We will share the details once confirmed.';
      case 'booked': return 'Your appointment is confirmed for ' + state.booking.date + ' at ' + state.booking.time + '.';
      case 'report_pending': case 'report_delayed': return 'Your visit is complete. Your care team is following up on the report. No action is needed from you now.';
      case 'report_received': return 'Your report has arrived. A clinician will review it before your care coordinator shares the next step.';
      case 'report_reviewed': return 'Your clinician has reviewed the report. Your care coordinator is arranging the next appointment.';
      case 'handed_off': return 'Your clinician follow-up is scheduled for ' + state.followup.date + ' at ' + state.followup.time + '.';
      default: return '';
    }
  }

  return { TEMPLATE_STEPS, initialState, defaultReferral, buildDemoState, transition, alertCount, patientMessage };
});
