(function () {
  'use strict';
  const M = window.BridgeCareModel;
  let state = M.initialState();
  let view = 'dashboard';
  let wizardStep = 1;
  let callStarted = false;
  let callOutcome = 'connected';
  let draft = freshDraft();
  const app = document.getElementById('app');

  function freshDraft() {
    return { firstName: 'Sarah', lastName: 'Johnson', language: 'English',
      referringHospital: 'Beijing United Family Hospital', targetHospital: 'Beijing Anzhen Hospital',
      department: 'Fetal Cardiology', referralReason: 'Fetal cardiac echo after a suspected anomaly on the anatomy scan',
      template: 'Cross-Hospital OB Referral', includeInterpreter: false };
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function name() { return state.patient ? state.patient.firstName + ' ' + state.patient.lastName : 'Sarah Johnson'; }
  function initials() { return state.patient ? esc((state.patient.firstName[0] || '') + (state.patient.lastName[0] || '')) : 'SJ'; }
  function phaseLabel() {
    return { empty:'No active case', intake:'Referral accepted', booking_due:'Booking overdue', retry:'Call retry needed', booked:'Appointment confirmed', report_pending:'Report due', report_delayed:'Report delayed', report_received:'Clinician review pending', report_reviewed:'Arrange follow-up', handed_off:'Clinical handoff arranged' }[state.phase];
  }
  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message; el.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(function () { el.classList.remove('show'); }, 3200);
  }
  function dispatch(type, data) {
    try { state = M.transition(state, { type:type, data:data }); return true; }
    catch (err) { toast(err.message); return false; }
  }
  function setView(next) {
    if (next === 'case' && !state.patient) { toast('Accept a referral to create Sarah’s case first.'); return; }
    if (next === 'patient' && !state.patient) { toast('The patient preview will appear after the referral is accepted.'); return; }
    view = next; render(); window.scrollTo(0, 0);
  }
  function button(label, action, style, extra) {
    return '<button class="btn ' + (style || 'ghost') + '" data-action="' + action + '" ' + (extra || '') + '>' + label + '</button>';
  }
  function pageHead(kicker, title, description, right) {
    return '<div class="page-head"><div><div class="eyebrow">' + kicker + '</div><h1>' + title + '</h1><p>' + description + '</p></div>' + (right || '') + '</div>';
  }
  function field(label, key, value, wide, type) {
    return '<div class="field ' + (wide ? 'wide' : '') + '"><label for="f-' + key + '">' + label + '</label><input id="f-' + key + '" name="' + key + '" type="' + (type || 'text') + '" value="' + esc(value) + '"></div>';
  }
  function panel(title, body, extra) {
    return '<section class="panel panel-pad ' + (extra || '') + '"><div class="section-top"><h2>' + title + '</h2></div>' + body + '</section>';
  }
  function badge(text, kind) { return '<span class="badge ' + (kind || '') + '">' + esc(text) + '</span>'; }

  function dashboard() {
    const has = Boolean(state.patient);
    let alert = '<div class="empty"><strong>No urgent actions in this case</strong>When a task passes its deadline, it will appear here with a clear next action.</div>';
    if (state.phase === 'booking_due' || state.phase === 'retry') {
      alert = '<div class="alert-box"><div style="font-size:23px">⚠</div><div class="grow"><strong>' + esc(name()) + ' · appointment not confirmed</strong><p>' + (state.phase === 'retry' ? 'Previous attempt: ' + esc(state.retry.reason) + '. Retry by ' + esc(state.retry.due) + '.' : 'Booking task is overdue. Check the referral context and contact the receiving hospital.') + '</p></div>' + button('Review alert →', 'triage', 'danger small') + '</div>';
    } else if (state.phase === 'report_delayed') {
      alert = '<div class="alert-box amber"><div style="font-size:23px">◷</div><div class="grow"><strong>' + esc(name()) + ' · report delayed</strong><p>Yuzhu Dai is responsible for follow-up by ' + esc(state.report.due) + '.</p></div>' + button('Open case →', 'case', 'secondary small') + '</div>';
    }
    const mainCase = has ? '<div class="case-row"><span class="case-icon">' + initials() + '</span><div class="grow"><h3>' + esc(name()) + '</h3><p>' + esc(state.patient.referringHospital) + ' → ' + esc(state.patient.targetHospital) + ' · ' + esc(state.patient.department) + '</p></div>' + badge(phaseLabel(), M.alertCount(state) ? 'danger' : state.phase === 'handed_off' ? 'good' : '') + button('Open →', 'case', 'ghost small') + '</div>' : '<div class="empty"><strong>Start with Sarah’s referral</strong>Accept the referral to create a task chain and show the next action on this dashboard.</div>';
    return pageHead('Today / care operations', 'Care dashboard', 'See the work that needs judgment, not just the work that is due.', !has ? button('+ New referral', 'new', 'primary') : '') +
      '<div class="stat-row"><div class="stat"><small>Active cases in this demo</small><strong>' + (has ? '1' : '0') + '</strong><em>One interactive case</em></div><div class="stat alert"><small>Actions needing attention</small><strong>' + M.alertCount(state) + '</strong><em>Updates with this case</em></div><div class="stat"><small>Current stage</small><strong style="font-size:18px;margin-top:11px">' + phaseLabel() + '</strong><em>Shared across both views</em></div></div>' +
      '<div class="grid two"><div class="grid">' + panel('Needs attention', alert) + panel('Active case', mainCase) + '</div>' +
      panel('Team context', '<div class="case-row"><span class="case-icon">AA</span><div><h3>Ahmed Al-Rashid</h3><p>Endoscopy referral · waiting on hospital response</p></div></div><div class="case-row"><span class="case-icon">KN</span><div><h3>Kenji Nakamura</h3><p>Orthopedic transfer · interpreter booked</p></div></div><p class="subtle">These two cards establish the coordinator’s workload. Their flows are outside this focused mock.</p>') + '</div>';
  }

  function wizardProgress() {
    let out = '<div class="progress" aria-label="Referral setup progress">';
    for (let i = 1; i <= 5; i++) {
      if (i > 1) out += '<span class="line ' + (i <= wizardStep ? 'done' : '') + '"></span>';
      out += '<span class="node ' + (i < wizardStep ? 'done' : i === wizardStep ? 'current' : '') + '">' + (i < wizardStep ? '✓' : i) + '</span>';
    }
    return out + '</div>';
  }
  function wizard() {
    const titles = ['Patient information', 'Referral context', 'Select task chain', 'Adjust the chain', 'Review and launch'];
    let content = '';
    if (wizardStep === 1) content = '<div class="form-grid">' + field('First name', 'firstName', draft.firstName) + field('Last name', 'lastName', draft.lastName) + field('Preferred language', 'language', draft.language, true) + '</div>';
    if (wizardStep === 2) content = '<div class="form-grid">' + field('Referring hospital', 'referringHospital', draft.referringHospital) + field('Receiving hospital', 'targetHospital', draft.targetHospital) + field('Receiving department', 'department', draft.department) + field('Reason for referral', 'referralReason', draft.referralReason, true) + '</div>';
    if (wizardStep === 3) content = '<button class="choice ' + (draft.template === 'Cross-Hospital OB Referral' ? 'selected' : '') + '" data-action="template-standard" style="width:100%;text-align:left"><span class="task-dot">1</span><span><strong>Cross-Hospital OB Referral</strong><p>Records, booking, patient guidance, report tracking and clinical follow-up. Interpreter remains optional.</p></span></button><button class="choice ' + (draft.template !== 'Cross-Hospital OB Referral' ? 'selected' : '') + '" data-action="template-interpreter" style="width:100%;text-align:left"><span class="task-dot">2</span><span><strong>OB Referral · Interpreter-ready</strong><p>The same care journey, with interpreter coordination included from the start. The coordinator can still remove it in the next step.</p></span></button><p class="subtle">These are two preset configurations for this case. Full template authoring is outside the prototype.</p>';
    if (wizardStep === 4) content = '<div class="info-banner"><strong>Task chain is a starting point.</strong> The coordinator owns the decisions around translation, hospital contact, exceptions and clinical handoff.</div>' + M.TEMPLATE_STEPS.map(function (step, index) { return '<div class="check-row">' + (step.optional ? '<input id="f-interpreter" type="checkbox" ' + (draft.includeInterpreter ? 'checked' : '') + '>' : '<span class="task-dot">' + (index + 1) + '</span>') + '<label ' + (step.optional ? 'for="f-interpreter"' : '') + '><strong>' + esc(step.title) + '</strong><small>' + esc(step.owner) + (step.optional ? ' · Optional' : '') + '</small></label></div>'; }).join('');
    if (wizardStep === 5) content = '<div class="review"><div><small>PATIENT</small><strong>' + esc(draft.firstName + ' ' + draft.lastName) + '<br>' + esc(draft.language) + '</strong></div><div><small>REFERRAL</small><strong>' + esc(draft.referringHospital) + ' → ' + esc(draft.targetHospital) + '<br>' + esc(draft.department) + '</strong></div><div><small>REASON</small><strong>' + esc(draft.referralReason) + '</strong></div><div><small>TASK CHAIN</small><strong>' + esc(draft.template) + '<br>' + (draft.includeInterpreter ? 'Interpreter task planned' : 'Interpreter task skipped') + '</strong></div></div><div class="info-banner" style="margin-top:17px;margin-bottom:0">Launching creates this case and task chain in the mock. It does not send a real patient invitation.</div>';
    return pageHead('Referral setup / step ' + wizardStep + ' of 5', titles[wizardStep - 1], 'Prepare a trackable cross-hospital journey before the first hospital call.') + '<div class="panel panel-pad" style="max-width:850px">' + wizardProgress() + content + '<div class="wizard-footer">' + (wizardStep === 1 ? button('Cancel', 'dashboard', 'ghost') : button('← Back', 'wizard-back', 'ghost')) + (wizardStep === 5 ? button('Launch task chain →', 'launch', 'primary') : button('Continue →', 'wizard-next', 'primary')) + '</div></div>';
  }

  function journey() {
    const labels = ['Referral', 'Documents', 'Booking', 'Visit', 'Report', 'Follow-up'];
    const stage = { intake:2, booking_due:3, retry:3, booked:4, report_pending:5, report_delayed:5, report_received:5, report_reviewed:6, handed_off:7 }[state.phase] || 0;
    return '<div class="journey">' + labels.map(function (label, index) { const n = index + 1; return '<div class="journey-step ' + (n < stage ? 'done' : n === stage ? M.alertCount(state) ? 'alert' : 'active' : '') + '">STAGE ' + n + '<strong>' + label + '</strong></div>'; }).join('') + '</div>';
  }
  function stepStatus(step) {
    const p = state.phase;
    if (step.id === 'interpreter' && !state.includeInterpreter) return 'Skipped';
    if (step.id === 'intake') return 'Done';
    if (step.id === 'documents') return p === 'intake' ? 'Active' : 'Done';
    if (step.id === 'booking') return p === 'intake' ? 'Waiting' : ['booking_due', 'retry'].includes(p) ? 'Attention' : 'Done';
    if (step.id === 'interpreter') return state.interpreterAssigned ? 'Done' : 'Active';
    if (step.id === 'notify') return ['intake','booking_due','retry'].includes(p) ? 'Waiting' : 'Done';
    if (step.id === 'visit') return ['intake','booking_due','retry'].includes(p) ? 'Waiting' : p === 'booked' ? 'Active' : 'Done';
    if (step.id === 'report') return ['intake','booking_due','retry','booked'].includes(p) ? 'Waiting' : p === 'report_delayed' ? 'Attention' : ['report_pending','report_received'].includes(p) ? 'Active' : 'Done';
    if (step.id === 'followup') return p === 'handed_off' ? 'Done' : p === 'report_reviewed' ? 'Active' : 'Waiting';
    return 'Waiting';
  }
  function taskChain() {
    return M.TEMPLATE_STEPS.map(function (step, index) { const status = stepStatus(step); return '<div class="task"><span class="task-dot ' + (status === 'Done' ? 'done' : status === 'Attention' ? 'alert' : status === 'Active' ? 'active' : '') + '">' + (status === 'Done' ? '✓' : index + 1) + '</span><div class="grow"><strong>' + esc(step.title) + '</strong><p>' + esc(step.owner) + (step.optional ? ' · Optional' : '') + '</p></div>' + badge(status, status === 'Attention' ? 'danger' : status === 'Done' ? 'good' : '') + '</div>'; }).join('');
  }
  function nextWork() {
    switch (state.phase) {
      case 'intake': return '<div class="work-card"><h3>Next: prepare records</h3><p>Review the referral package before calling the receiving hospital. This demo advances to the booking deadline to show the coordinator’s exception workflow.</p>' + (state.includeInterpreter && !state.interpreterAssigned ? '<div class="info-banner"><strong>Optional task included</strong><br>Assign the interpreter requested during referral setup before moving on.</div>' + button('Assign interpreter in mock →', 'assign-interpreter', 'secondary') : button('Advance demo to booking deadline →', 'advance-booking', 'primary')) + '</div>';
      case 'booking_due': case 'retry': return '<div class="work-card"><h3>Appointment still needs action</h3><p>' + (state.retry ? 'Last attempt: ' + esc(state.retry.reason) + '. Retry due ' + esc(state.retry.due) + '.' : 'The booking task is overdue. Decide how to contact the hospital.') + '</p><div class="action-row">' + button('Review alert →', 'triage', 'primary') + button('Start guided booking', 'booking', 'ghost') + '</div></div>';
      case 'booked': return '<div class="work-card"><h3>Appointment confirmed</h3><p>' + esc(state.booking.date + ' · ' + state.booking.time + ' · ' + state.booking.location) + '. Patient preview now shows the same details.</p><div class="action-row">' + button('View patient preview', 'patient', 'secondary') + button('Advance demo to after visit →', 'advance-visit', 'primary') + '</div></div>';
      case 'report_pending': case 'report_delayed': return '<div class="work-card"><h3>' + (state.phase === 'report_delayed' ? 'Report follow-up is due' : 'Track the receiving hospital’s report') + '</h3><p>Keep the patient informed about progress; clinical interpretation remains with the clinician.</p>' + button('Open report workflow →', 'report', 'primary') + '</div>';
      case 'report_received': return '<div class="work-card"><h3>Wait for clinical review</h3><p>The report has been routed to ' + esc(state.report.reviewer) + '. Confirm that a clinician has reviewed it before arranging the next visit.</p>' + button('Confirm clinician review →', 'review', 'primary') + '</div>';
      case 'report_reviewed': return '<div class="work-card"><h3>Arrange clinical follow-up</h3><p>' + esc(state.report.reviewer) + ' has completed review. Set the patient’s next appointment.</p>' + button('Schedule follow-up →', 'followup', 'primary') + '</div>';
      case 'handed_off': return '<div class="work-card"><h3>Handoff arranged</h3><p>' + esc(state.followup.clinician + ' · ' + state.followup.date + ' at ' + state.followup.time) + '. The patient sees the next step without an automated clinical interpretation.</p>' + button('View patient preview', 'patient', 'secondary') + '</div>';
    }
  }
  function caseView() {
    return pageHead('Active referral / ' + esc(name()), esc(name()), esc(state.patient.referralReason), badge(phaseLabel(), M.alertCount(state) ? 'danger' : 'good')) + journey() +
      '<div class="grid two"><div class="grid">' + panel('Task chain · ' + esc(state.template), taskChain()) + '</div><div class="grid">' + panel('Case context', '<div class="review" style="grid-template-columns:1fr"><div><small>TRANSFER</small><strong>' + esc(state.patient.referringHospital) + ' → ' + esc(state.patient.targetHospital) + '</strong></div><div><small>DEPARTMENT / LANGUAGE</small><strong>' + esc(state.patient.department) + ' · ' + esc(state.patient.language) + '</strong></div></div>' + nextWork()) + panel('Activity', '<ul class="activity">' + state.log.map(function (entry) { return '<li>' + esc(entry) + '</li>'; }).join('') + '</ul>') + '</div></div>';
  }
  function triage() {
    return pageHead('Exception review / booking', 'Appointment overdue', 'Review the case and choose the next action before the patient is left waiting.') +
      '<div class="grid equal">' + panel('What happened', '<div class="alert-box"><div style="font-size:23px">⚠</div><div><strong>' + esc(name()) + ' · fetal cardiac echo</strong><p>' + (state.retry ? 'Previous call: ' + esc(state.retry.reason) + '. Retry by ' + esc(state.retry.due) + '.' : 'The receiving hospital appointment has not been confirmed by the task deadline.') + '</p></div></div><div class="review" style="grid-template-columns:1fr"><div><small>RECEIVING HOSPITAL</small><strong>' + esc(state.patient.targetHospital) + ' · ' + esc(state.patient.department) + '</strong></div><div><small>COORDINATOR</small><strong>Yuzhu Dai · owns the next hospital contact</strong></div></div>') +
      panel('Decision', '<div class="info-banner"><strong>Why a person stays in the loop</strong><br>The hospital has no reliable booking API in this scenario. BridgeCare provides context and records the outcome; the coordinator handles the call.</div><div class="action-row">' + button('Start guided booking →', 'booking', 'primary') + button('Open task chain', 'case', 'ghost') + '</div>') + '</div>';
  }
  function booking() {
    const s = state.patient;
    const script = 'Hello, I’m calling from <mark>' + esc(s.referringHospital) + '</mark> about <mark>' + esc(name()) + '</mark>. We’re arranging a <mark>' + esc(s.referralReason) + '</mark> with <mark>' + esc(s.department) + '</mark>. Could you confirm availability, location and required documents?';
    let form = '<div class="info-banner">Start the simulated call to record an outcome. A failed call cannot confirm an appointment.</div>' + button('📞 Start simulated call', 'start-call', 'primary');
    if (callStarted) form = '<div class="info-banner"><strong>Connected to call workspace.</strong> Choose the outcome reported by the hospital.</div><div class="segmented"><button data-action="outcome-connected" class="' + (callOutcome === 'connected' ? 'active' : '') + '">Connected · slot available</button><button data-action="outcome-no-answer" class="' + (callOutcome === 'no-answer' ? 'active' : '') + '">No answer · retry</button></div>' + (callOutcome === 'connected' ? '<div class="form-grid">' + field('Appointment date', 'date', 'October 8, 2026') + field('Appointment time', 'time', '09:30') + field('Building / floor / check-in', 'location', 'Building B, 3F · Foreign Patients Window', true) + field('Instructions from hospital', 'notes', 'Bring passport and translated referral letter', true) + '</div><div style="margin-top:18px">' + button('Confirm appointment and update patient →', 'confirm-booking', 'primary') + '</div>' : '<div class="form-grid">' + field('Call outcome', 'reason', 'No answer at registration desk', true) + field('Retry by', 'due', 'Tomorrow, 09:00', true) + '</div><div style="margin-top:18px">' + button('Record attempt and assign retry →', 'record-retry', 'primary') + '</div>');
    return pageHead('Manual coordination / ' + esc(name()), 'Guided hospital booking', 'The system supplies context. The coordinator makes and records the call.') + '<div class="grid equal">' + panel('Call brief', '<div class="info-banner"><strong>Target</strong><br>' + esc(s.targetHospital) + ' · ' + esc(s.department) + '<br><strong>Referral documents</strong><br>Referral letter and translated summary prepared in this demo.</div><div class="eyebrow">Suggested script</div><div class="call-script">' + script + '</div><p class="subtle">This is suggested wording for a simulated call. The coordinator confirms facts with the hospital.</p>') + panel('Record the outcome', form) + '</div>';
  }
  function reportView() {
    const delayed = state.phase === 'report_delayed';
    return pageHead('After visit / continuity', delayed ? 'Report follow-up' : 'Track the report', 'The visit is over, but the coordinator still owns the handoff.') + '<div class="grid equal">' + panel('Case status', '<div class="info-banner ' + (delayed ? 'warn' : '') + '"><strong>Patient-facing status</strong><br>' + esc(M.patientMessage(state)) + '</div><div class="review" style="grid-template-columns:1fr"><div><small>RECEIVING HOSPITAL</small><strong>' + esc(state.patient.targetHospital) + '</strong></div><div><small>OWNER</small><strong>Yuzhu Dai</strong></div></div>') + panel('Coordinator action', (!delayed ? '<div class="work-card" style="margin-top:0"><h3>Report has not arrived</h3><p>Record a follow-up deadline so this does not disappear after the visit.</p>' + field('Follow up by', 'due', 'Tomorrow, 16:00', true) + '<div style="margin-top:14px">' + button('Record report delay →', 'delay-report', 'secondary') + '</div></div>' : '') + '<div class="work-card"><h3>Report received</h3><p>Log receipt and route the report for clinician review. Do not write an automated interpretation.</p>' + field('Route to clinician', 'reviewer', 'Dr. Chen', true) + '<div style="margin-top:14px">' + button('Mark received and route for review →', 'receive-report', 'primary') + '</div></div>') + '</div>';
  }
  function reviewView() {
    return pageHead('Clinical checkpoint / human review', 'Confirm clinician review', 'The coordinator records completion of clinical review before arranging a follow-up.') + '<div class="grid equal">' + panel('Report handoff', '<div class="info-banner"><strong>Report received</strong><br>Routed to ' + esc(state.report.reviewer) + '. Clinical findings are not represented or interpreted in this prototype.</div><p class="subtle">In a real service, this status would come from a verified clinician action or a documented confirmation.</p>') + panel('Coordinator check', '<div class="work-card" style="margin-top:0"><h3>Review completed?</h3><p>Use this simulated checkpoint only after the clinician has reviewed the report. It unlocks follow-up scheduling.</p>' + button('Record clinician review completed →', 'confirm-review', 'primary') + '</div>') + '</div>';
  }
  function followupView() {
    return pageHead('Clinical handoff / final step', 'Arrange follow-up', 'The coordinator completes the loop by giving the patient a clear next appointment.') + '<div class="grid equal">' + panel('Before scheduling', '<div class="info-banner"><strong>Clinician review completed</strong><br>' + esc(state.report.reviewer) + ' reviewed the report. The prototype does not display or interpret findings.</div><p class="subtle">Confirm a suitable appointment with the clinician and communicate the logistics to the patient.</p>') + panel('Follow-up details', '<div class="form-grid">' + field('Clinician', 'clinician', state.report.reviewer) + field('Date', 'date', 'October 12, 2026') + field('Time', 'time', '11:00') + '</div><div style="margin-top:19px">' + button('Arrange follow-up and update patient →', 'schedule-followup', 'primary') + '</div>') + '</div>';
  }
  function patient() {
    const booking = state.booking;
    let next = 'Your care team will share your appointment details once confirmed.';
    if (state.phase === 'booked') next = 'Bring your passport and translated referral letter. Your coordinator can help if you need to change the appointment.';
    if (['report_pending','report_delayed','report_received'].includes(state.phase)) next = 'Your coordinator will share the next step after the care team reviews the report.';
    if (state.phase === 'report_reviewed') next = 'Your coordinator is arranging a follow-up appointment with your clinician.';
    if (state.phase === 'handed_off') next = 'Your coordinator will help you prepare for the clinician follow-up.';
    return pageHead('Patient view / read-only preview', 'What ' + esc(state.patient.firstName) + ' sees', 'A clear next step, synced to the coordinator’s latest action.', button('← Back to case', 'case', 'ghost')) + '<div class="grid equal"><div class="panel panel-pad"><h2 style="margin-bottom:16px">Shared status</h2><div class="info-banner"><strong>Current coordinator stage</strong><br>' + esc(phaseLabel()) + '</div><p class="subtle">This is a local preview of the message that would be shown to a patient. No notification is actually sent.</p><div class="review" style="grid-template-columns:1fr"><div><small>APPOINTMENT</small><strong>' + (booking ? esc(booking.date + ' at ' + booking.time + ' · ' + booking.location) : 'Not confirmed yet') + '</strong></div><div><small>NEXT STEP</small><strong>' + esc(next) + '</strong></div></div></div><div class="patient-phone"><div class="phone-top"><small>BridgeCare · Patient view</small><h2>Hi, ' + esc(state.patient.firstName) + '</h2><small>Your care journey, one step at a time</small></div><div class="phone-body"><div class="phone-card"><small>TODAY’S UPDATE</small><h3>' + esc(phaseLabel()) + '</h3><p>' + esc(M.patientMessage(state)) + '</p></div><div class="phone-section">WHAT’S NEXT</div><div class="phone-item">' + esc(next) + '<small>Updated from your coordinator’s case plan</small></div><div class="phone-item">Contact Yuzhu Dai<small>Care coordinator · Questions about logistics or timing</small></div></div></div></div>';
  }

  function render() {
    const labels = { dashboard:'Dashboard', wizard:'New referral', case:'Case', triage:'Review alert', booking:'Guided booking', report:'Report follow-up', review:'Clinician review', followup:'Clinical handoff', patient:'Patient preview' };
    document.getElementById('current-view-label').textContent = view === 'case' && state.patient ? name() + '’s case' : labels[view];
    document.getElementById('case-nav-label').textContent = state.patient ? name() + '’s case' : 'Sarah’s case';
    document.getElementById('nav-alert-count').textContent = M.alertCount(state) || '';
    document.querySelectorAll('.nav').forEach(function (nav) { nav.classList.toggle('active', nav.dataset.view === view || (view === 'triage' && nav.dataset.view === 'dashboard') || (['report','review','followup','booking'].includes(view) && nav.dataset.view === 'case')); });
    app.innerHTML = { dashboard:dashboard, wizard:wizard, case:caseView, triage:triage, booking:booking, report:reportView, review:reviewView, followup:followupView, patient:patient }[view]();
  }
  function captureDraft() {
    ['firstName','lastName','language','referringHospital','targetHospital','department','referralReason'].forEach(function (key) { const el = document.getElementById('f-' + key); if (el) draft[key] = el.value.trim(); });
    const interpreter = document.getElementById('f-interpreter'); if (interpreter) draft.includeInterpreter = interpreter.checked;
  }
  function validateWizardStep() {
    const keys = wizardStep === 1 ? ['firstName','lastName','language'] : wizardStep === 2 ? ['referringHospital','targetHospital','department','referralReason'] : [];
    for (const key of keys) {
      if (!draft[key]) { toast('Complete ' + key.replace(/([A-Z])/g, ' $1').toLowerCase() + ' before continuing.'); return false; }
    }
    return true;
  }
  function formData(keys) { const out = {}; keys.forEach(function (key) { const el = document.getElementById('f-' + key); out[key] = el ? el.value.trim() : ''; }); return out; }
  document.addEventListener('click', function (event) {
    const el = event.target.closest('[data-action], .nav[data-view]'); if (!el) return;
    const action = el.dataset.action || el.dataset.view;
    if (['dashboard','case','patient'].includes(action)) { setView(action); return; }
    if (action === 'reset') { state = M.initialState(); draft = freshDraft(); wizardStep = 1; callStarted = false; view = 'dashboard'; render(); toast('Demo reset.'); return; }
    if (action === 'new') { draft = freshDraft(); wizardStep = 1; setView('wizard'); return; }
    if (action === 'template-standard') { draft.template = 'Cross-Hospital OB Referral'; draft.includeInterpreter = false; render(); return; }
    if (action === 'template-interpreter') { draft.template = 'OB Referral · Interpreter-ready'; draft.includeInterpreter = true; render(); return; }
    if (action === 'wizard-next') { captureDraft(); if (validateWizardStep()) { wizardStep += 1; render(); } return; }
    if (action === 'wizard-back') { captureDraft(); wizardStep -= 1; render(); return; }
    if (action === 'launch') { captureDraft(); if (dispatch('CREATE', draft)) setView('case'); return; }
    if (action === 'assign-interpreter') { if (dispatch('ASSIGN_INTERPRETER')) { render(); toast('Interpreter assigned in mock.'); } return; }
    if (action === 'advance-booking') { if (dispatch('ADVANCE_TO_BOOKING')) setView('dashboard'); return; }
    if (action === 'triage') { setView('triage'); return; }
    if (action === 'booking') { callStarted = false; callOutcome = 'connected'; setView('booking'); return; }
    if (action === 'start-call') { callStarted = true; render(); return; }
    if (action === 'outcome-connected' || action === 'outcome-no-answer') { callOutcome = action === 'outcome-connected' ? 'connected' : 'no-answer'; render(); return; }
    if (action === 'record-retry') { if (dispatch('CALL_NO_ANSWER', formData(['reason','due']))) setView('case'); return; }
    if (action === 'confirm-booking') { if (dispatch('CONFIRM_BOOKING', formData(['date','time','location','notes']))) setView('case'); return; }
    if (action === 'advance-visit') { if (dispatch('ADVANCE_TO_VISIT')) setView('case'); return; }
    if (action === 'report') { setView('report'); return; }
    if (action === 'delay-report') { if (dispatch('REPORT_DELAYED', formData(['due']))) setView('case'); return; }
    if (action === 'receive-report') { if (dispatch('REPORT_RECEIVED', formData(['reviewer']))) setView('case'); return; }
    if (action === 'review') { setView('review'); return; }
    if (action === 'confirm-review') { if (dispatch('CONFIRM_REVIEW')) setView('case'); return; }
    if (action === 'followup') { setView('followup'); return; }
    if (action === 'schedule-followup') { if (dispatch('SCHEDULE_FOLLOWUP', formData(['clinician','date','time']))) setView('case'); return; }
  });
  render();
})();
