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
    if (!phases.includes(state.phase)) fail('step_unavailable');
  }

  function fail(code) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }

  function required(value, code) {
    if (!String(value || '').trim()) fail(code);
    return String(value).trim();
  }

  function addLog(state, type, params) {
    state.log.unshift({ type: type, params: params || {} });
  }

  function transition(current, action) {
    const state = JSON.parse(JSON.stringify(current));
    const data = action.data || {};
    switch (action.type) {
      case 'CREATE':
        requirePhase(state, ['empty']);
        state.patient = {
          firstName: required(data.firstName, 'first_name_required'),
          lastName: required(data.lastName, 'last_name_required'),
          language: required(data.language, 'language_required'),
          referringHospital: required(data.referringHospital, 'referring_hospital_required'),
          targetHospital: required(data.targetHospital, 'target_hospital_required'),
          department: required(data.department, 'department_required'),
          referralReason: required(data.referralReason, 'referral_reason_required')
        };
        state.template = required(data.template, 'template_required');
        state.includeInterpreter = Boolean(data.includeInterpreter);
        state.phase = 'intake';
        addLog(state, 'referral_accepted', {
          patientName: state.patient.firstName + ' ' + state.patient.lastName,
          fromHospital: state.patient.referringHospital,
          toHospital: state.patient.targetHospital,
          department: state.patient.department,
          template: state.template,
          includeInterpreter: state.includeInterpreter
        });
        return state;
      case 'ADVANCE_TO_BOOKING':
        requirePhase(state, ['intake']);
        if (state.includeInterpreter && !state.interpreterAssigned) fail('assign_interpreter_first');
        state.phase = 'booking_due';
        addLog(state, 'booking_overdue');
        return state;
      case 'ASSIGN_INTERPRETER':
        requirePhase(state, ['intake']);
        if (!state.includeInterpreter) fail('interpreter_skipped');
        state.interpreterAssigned = true;
        addLog(state, 'interpreter_assigned');
        return state;
      case 'CALL_NO_ANSWER':
        requirePhase(state, ['booking_due', 'retry']);
        state.retry = { reason: required(data.reason, 'call_outcome_required'), due: required(data.due, 'retry_time_required'), owner: 'Yuzhu Dai' };
        state.callAttempts += 1;
        state.phase = 'retry';
        addLog(state, 'call_retry', { owner: state.retry.owner, due: state.retry.due });
        return state;
      case 'CONFIRM_BOOKING':
        requirePhase(state, ['booking_due', 'retry']);
        if (data.callOutcome !== 'connected') fail('connected_call_required');
        state.booking = {
          date: required(data.date, 'appointment_date_required'),
          time: required(data.time, 'appointment_time_required'),
          location: required(data.location, 'hospital_location_required'),
          notes: String(data.notes || '').trim() || 'Bring your passport and referral documents.'
        };
        state.callAttempts += 1;
        state.retry = null;
        state.phase = 'booked';
        addLog(state, 'booking_confirmed', {
          hospital: state.patient.targetHospital,
          date: state.booking.date,
          time: state.booking.time,
          location: state.booking.location,
          instructions: state.booking.notes
        });
        return state;
      case 'ADVANCE_TO_VISIT':
        requirePhase(state, ['booked']);
        state.phase = 'report_pending';
        addLog(state, 'visit_completed');
        return state;
      case 'REPORT_DELAYED':
        requirePhase(state, ['report_pending']);
        state.report = { status: 'delayed', due: required(data.due, 'follow_up_time_required'), owner: 'Yuzhu Dai' };
        state.phase = 'report_delayed';
        addLog(state, 'report_delayed', { owner: state.report.owner, due: state.report.due });
        return state;
      case 'REPORT_RECEIVED':
        requirePhase(state, ['report_pending', 'report_delayed']);
        state.report = Object.assign({}, state.report || {}, { status: 'received', reviewer: required(data.reviewer, 'reviewer_required') });
        state.phase = 'report_received';
        addLog(state, 'report_received', { reviewer: state.report.reviewer });
        return state;
      case 'CONFIRM_REVIEW':
        requirePhase(state, ['report_received']);
        state.report.status = 'reviewed';
        state.phase = 'report_reviewed';
        addLog(state, 'report_reviewed', { reviewer: state.report.reviewer });
        return state;
      case 'SCHEDULE_FOLLOWUP':
        requirePhase(state, ['report_reviewed']);
        state.followup = {
          clinician: required(data.clinician, 'clinician_required'),
          date: required(data.date, 'follow_up_date_required'),
          time: required(data.time, 'appointment_time_required')
        };
        state.phase = 'handed_off';
        addLog(state, 'followup_scheduled', {
          clinician: state.followup.clinician,
          date: state.followup.date,
          time: state.followup.time
        });
        return state;
      default:
        fail('unknown_action');
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
