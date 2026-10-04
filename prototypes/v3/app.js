(function () {
  'use strict';

  const M = window.BridgeCareModel;
  const app = document.getElementById('app');
  let state = M.initialState();
  let view = 'dashboard';
  let wizardStep = 1;
  let callStarted = false;
  let callOutcome = null;
  let draft = freshDraft();

  function freshDraft() {
    return {
      firstName: 'Sarah',
      lastName: 'Johnson',
      language: 'English',
      referringHospital: 'Beijing United Family Hospital',
      targetHospital: 'Beijing Anzhen Hospital',
      department: 'Fetal Cardiology',
      referralReason: 'Fetal cardiac echo after a suspected anomaly on the anatomy scan',
      template: 'Cross-Hospital OB Referral',
      includeInterpreter: false
    };
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function name() {
    return state.patient ? state.patient.firstName + ' ' + state.patient.lastName : 'Sarah Johnson';
  }

  function initials() {
    return state.patient ? esc((state.patient.firstName[0] || '') + (state.patient.lastName[0] || '')) : 'SJ';
  }

  function phaseLabel() {
    return {
      empty: 'No active case',
      intake: 'Referral accepted',
      booking_due: 'Booking overdue',
      retry: 'Call retry needed',
      booked: 'Appointment confirmed',
      report_pending: 'Report due',
      report_delayed: 'Report delayed',
      report_received: 'Clinician review pending',
      report_reviewed: 'Arrange follow-up',
      handed_off: 'Clinical handoff arranged'
    }[state.phase] || 'Case in progress';
  }

  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.classList.remove('show'); }, 3200);
  }

  function dispatch(type, data) {
    try {
      state = M.transition(state, { type: type, data: data || {} });
      return true;
    } catch (err) {
      toast(err.message);
      return false;
    }
  }

  function setView(next) {
    const route = {
      case: ['intake', 'booking_due', 'retry', 'booked', 'report_pending', 'report_delayed', 'report_received', 'report_reviewed', 'handed_off'],
      patient: ['intake', 'booking_due', 'retry', 'booked', 'report_pending', 'report_delayed', 'report_received', 'report_reviewed', 'handed_off'],
      triage: ['booking_due', 'retry'],
      booking: ['booking_due', 'retry'],
      report: ['report_pending', 'report_delayed'],
      review: ['report_received'],
      followup: ['report_reviewed']
    };
    if (route[next] && !route[next].includes(state.phase)) {
      toast('This step is not available at the current stage.');
      return;
    }
    if (next === 'case' && !state.patient) {
      toast('Accept a referral to create Sarah’s case first.');
      return;
    }
    if (next === 'patient' && !state.patient) {
      toast('The patient preview will appear after the referral is accepted.');
      return;
    }
    view = next;
    render();
    window.scrollTo(0, 0);
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

  function badge(text, kind) {
    return '<span class="badge ' + (kind || '') + '">' + esc(text) + '</span>';
  }

  function stageLane() {
    if (state.phase === 'intake') return 0;
    if (['booking_due', 'retry'].includes(state.phase)) return 1;
    if (['booked', 'report_pending', 'report_delayed', 'report_received'].includes(state.phase)) return 2;
    return 3;
  }

  function caseCard() {
    const overdue = M.alertCount(state) > 0;
    return '<button class="case-card ' + (overdue ? 'case-card-alert' : '') + '" data-action="case" aria-label="Open ' + esc(name()) + ' case">' +
      '<div class="case-card-top"><span class="patient-avatar">' + initials() + '</span><span class="card-name">' + esc(name()) + '</span>' +
      badge(phaseLabel(), overdue ? 'danger' : state.phase === 'handed_off' ? 'good' : '') + '</div>' +
      '<p class="card-detail">' + esc(state.patient.referringHospital) + ' <span>→</span> ' + esc(state.patient.targetHospital) + '</p>' +
      '<div class="card-tags"><span>' + esc(state.patient.language) + '</span><span>' + esc(state.patient.department) + '</span></div>' +
      '<div class="card-progress"><span><i style="width:' + progressPercent() + '%"></i></span><small>' + progressPercent() + '% complete</small></div>' +
      '<div class="card-bottom"><span>' + (overdue ? 'Coordinator action needed' : 'Owner · Yuzhu Dai') + '</span><strong>Open case <b>→</b></strong></div></button>';
  }

  function progressPercent() {
    const done = M.TEMPLATE_STEPS.filter(function (step) { return stepStatus(step) === 'Done' || stepStatus(step) === 'Skipped'; }).length;
    return Math.round(done / M.TEMPLATE_STEPS.length * 100);
  }

  function visitHasPassed() {
    return ['report_pending', 'report_delayed', 'report_received', 'report_reviewed', 'handed_off'].includes(state.phase);
  }

  function dashboard() {
    const has = Boolean(state.patient);
    const lane = has ? stageLane() : -1;
    const labels = ['Referral received', 'Coordinator action', 'Awaiting care team', 'Handoff'];
    const laneDescriptions = ['New cases and records', 'Calls, decisions and exceptions', 'Visit and report tracking', 'Clinician review and next visit'];
    let attention = '<div class="attention-empty"><span class="attention-icon">✓</span><div><strong>Nothing needs urgent attention</strong><p>Overdue booking and report follow-up will appear here.</p></div></div>';
    if (state.phase === 'booking_due' || state.phase === 'retry') {
      attention = '<div class="attention-card"><span class="attention-icon">!</span><div class="attention-copy"><strong>' + esc(name()) + ' · appointment not confirmed</strong><p>' +
        (state.retry ? 'Last call: ' + esc(state.retry.reason) + '. Retry by ' + esc(state.retry.due) + '.' : 'The booking deadline has passed. Review the referral before contacting the hospital.') +
        '</p></div>' + button('Review alert', 'triage', 'danger small') + '</div>';
    } else if (state.phase === 'report_delayed') {
      attention = '<div class="attention-card amber"><span class="attention-icon">◷</span><div class="attention-copy"><strong>' + esc(name()) + ' · report delayed</strong><p>Yuzhu Dai will follow up by ' + esc(state.report.due) + '.</p></div>' + button('Open report task', 'report', 'secondary small') + '</div>';
    }

    const stats = '<div class="stat-row">' +
      '<div class="stat"><small>ACTIVE CASES</small><strong>' + (has ? '01' : '00') + '</strong><em>' + (has ? 'Sarah Johnson' : 'Ready for referral intake') + '</em></div>' +
      '<div class="stat ' + (M.alertCount(state) ? 'stat-alert' : '') + '"><small>EXCEPTIONS</small><strong>' + M.alertCount(state) + '</strong><em>Needs coordinator judgment</em></div>' +
      '<div class="stat"><small>CASE STAGE</small><strong class="stat-stage">' + (has ? phaseLabel() : 'Open workspace') + '</strong><em>One shared case record</em></div></div>';

    const board = '<section class="board-section"><div class="section-top board-title"><div><span class="eyebrow">CARE JOURNEY</span><h2>Sarah’s coordination board</h2><p>One referral moves through the work. The coordinator owns every handoff.</p></div>' +
      (has ? button('Open Sarah’s case →', 'case', 'ghost small') : '') + '</div><div class="kanban-board">' +
      labels.map(function (label, index) {
        let body = '<div class="lane-empty"><span class="lane-mark">' + (index + 1) + '</span><strong>No case in this stage</strong><small>' + laneDescriptions[index] + '</small></div>';
        if (has && index === lane) body = caseCard();
        return '<section class="kanban-col lane-' + index + (has && index === lane ? ' lane-active' : '') + '"><div class="kanban-col-header"><div><h3>' + label + '</h3><small>' + laneDescriptions[index] + '</small></div><span class="lane-count">' + (has && index === lane ? '1' : '0') + '</span></div><div class="kanban-col-body">' + body + '</div></section>';
      }).join('') + '</div></section>';

    const intro = !has
      ? '<section class="welcome-card"><div><span class="eyebrow">HUMAN-IN-THE-LOOP CARE</span><h2>Keep Sarah’s next step from getting lost between hospitals.</h2><p>Start with the referral. BridgeCare keeps the care plan visible while Yuzhu makes the calls and decisions.</p></div><div class="welcome-route"><span>UFamily</span><i>→</i><b>Anzhen</b><small>Fetal Cardiology</small></div></section>'
      : '<section class="attention-panel"><div class="section-top"><div><span class="eyebrow">ATTENTION QUEUE</span><h2>Needs coordinator attention</h2></div><small>' + (M.alertCount(state) ? '1 open exception' : 'No open exceptions') + '</small></div>' + attention + '</section>';

    return pageHead('Today / care operations', 'Care dashboard', 'A clear view of the work that keeps Sarah’s care moving.', has ? '' : button('+ New referral', 'new', 'primary')) +
      stats + intro + (has ? '<section class="attention-panel"><div class="section-top"><div><span class="eyebrow">ATTENTION QUEUE</span><h2>Needs coordinator attention</h2></div><small>' + (M.alertCount(state) ? '1 open exception' : 'No open exceptions') + '</small></div>' + attention + '</section>' : '') +
      board;
  }

  function wizardProgress() {
    const labels = ['Patient', 'Referral', 'Template', 'Adjust', 'Launch'];
    return '<div class="wizard-progress" aria-label="Referral setup progress">' + labels.map(function (label, index) {
      const n = index + 1;
      return (n > 1 ? '<i class="progress-line ' + (n <= wizardStep ? 'done' : '') + '"></i>' : '') +
        '<div class="progress-step ' + (n < wizardStep ? 'done' : n === wizardStep ? 'current' : '') + '"><span>' + (n < wizardStep ? '✓' : n) + '</span><small>' + label + '</small></div>';
    }).join('') + '</div>';
  }

  function wizard() {
    const titles = ['Patient information', 'Referral context', 'Select a task chain', 'Adjust optional steps', 'Review and launch'];
    const descriptions = [
      'Start with the patient and the language they use for care.',
      'Capture where the referral starts and which team will receive it.',
      'Choose a focused care plan for this cross-hospital referral.',
      'Keep only the support this patient needs. You can revise the optional interpreter task.',
      'Check the case details before creating the shared task chain.'
    ];
    let content = '';

    if (wizardStep === 1) {
      content = '<div class="form-grid">' + field('First name', 'firstName', draft.firstName) +
        field('Last name', 'lastName', draft.lastName) + field('Preferred language', 'language', draft.language, true) + '</div>';
    }
    if (wizardStep === 2) {
      content = '<div class="form-grid">' + field('Referring hospital', 'referringHospital', draft.referringHospital) +
        field('Receiving hospital', 'targetHospital', draft.targetHospital) +
        field('Receiving department', 'department', draft.department) +
        field('Reason for referral', 'referralReason', draft.referralReason, true) + '</div>';
    }
    if (wizardStep === 3) {
      content = '<button class="choice ' + (draft.template === 'Cross-Hospital OB Referral' ? 'selected' : '') + '" data-action="template-standard" aria-pressed="' + (draft.template === 'Cross-Hospital OB Referral') + '">' +
        '<span class="choice-mark">↗</span><span><strong>Cross-Hospital OB Referral</strong><p>Prepare records, coordinate booking, guide the visit, track the report and arrange follow-up.</p></span><b class="choice-check">' + (draft.template === 'Cross-Hospital OB Referral' ? 'Selected' : 'Select') + '</b></button>' +
        '<button class="choice ' + (draft.template !== 'Cross-Hospital OB Referral' ? 'selected' : '') + '" data-action="template-interpreter" aria-pressed="' + (draft.template !== 'Cross-Hospital OB Referral') + '">' +
        '<span class="choice-mark">文</span><span><strong>OB Referral · Interpreter-ready</strong><p>Use the same care plan with interpreter coordination included as a suggested support task.</p></span><b class="choice-check">' + (draft.template !== 'Cross-Hospital OB Referral' ? 'Selected' : 'Select') + '</b></button>' +
        '<p class="subtle">Two preset configurations are shown for this case. Full template authoring is outside this prototype.</p>';
    }
    if (wizardStep === 4) {
      content = '<div class="info-banner"><strong>The task chain is a starting point.</strong> Yuzhu decides whether translation support is needed and stays responsible for each handoff.</div>' +
        '<div class="chain-edit-list">' + M.TEMPLATE_STEPS.map(function (step, index) {
          if (step.optional) {
            return '<label class="check-row optional-row" for="f-interpreter"><input id="f-interpreter" type="checkbox" ' + (draft.includeInterpreter ? 'checked' : '') + '><span class="check-copy"><strong>' + esc(step.title) + '</strong><small>' + esc(step.owner) + ' · Optional support</small></span><span class="optional-pill">Optional</span></label>';
          }
          return '<div class="check-row"><span class="task-index">' + String(index + 1).padStart(2, '0') + '</span><span class="check-copy"><strong>' + esc(step.title) + '</strong><small>' + esc(step.owner) + ' · Included in this chain</small></span><span class="included-pill">Included</span></div>';
        }).join('') + '</div>';
    }
    if (wizardStep === 5) {
      content = '<div class="review-grid"><div><small>PATIENT</small><strong>' + esc(draft.firstName + ' ' + draft.lastName) + '</strong><span>' + esc(draft.language) + '</span></div>' +
        '<div><small>REFERRAL</small><strong>' + esc(draft.referringHospital) + ' → ' + esc(draft.targetHospital) + '</strong><span>' + esc(draft.department) + '</span></div>' +
        '<div class="review-wide"><small>REASON FOR REFERRAL</small><strong>' + esc(draft.referralReason) + '</strong></div>' +
        '<div class="review-wide"><small>TASK CHAIN</small><strong>' + esc(draft.template) + '</strong><span>' + (draft.includeInterpreter ? 'Interpreter coordination included' : 'Interpreter coordination skipped') + '</span></div></div>' +
        '<div class="info-banner review-note">Launching creates a local case and task chain. This prototype does not send a patient invitation.</div>';
    }

    return pageHead('Referral setup / step ' + wizardStep + ' of 5', titles[wizardStep - 1], descriptions[wizardStep - 1], button('Save and exit', 'dashboard', 'ghost small')) +
      '<section class="wizard-card"><div class="wizard-card-top"><div><span class="eyebrow">NEW REFERRAL</span><h2>' + titles[wizardStep - 1] + '</h2><p>' + descriptions[wizardStep - 1] + '</p></div><span class="step-count">0' + wizardStep + '<i>/ 05</i></span></div>' +
      wizardProgress() + '<div class="wizard-content">' + content + '</div><div class="wizard-footer">' +
      (wizardStep === 1 ? button('Cancel', 'dashboard', 'ghost') : button('← Back', 'wizard-back', 'ghost')) +
      (wizardStep === 5 ? button('Launch task chain →', 'launch', 'primary') : button('Continue →', 'wizard-next', 'primary')) + '</div></section>';
  }

  function journey() {
    const labels = ['Referral', 'Documents', 'Booking', 'Visit', 'Report', 'Follow-up'];
    const stage = { intake: 2, booking_due: 3, retry: 3, booked: 4, report_pending: 5, report_delayed: 5, report_received: 5, report_reviewed: 6, handed_off: 7 }[state.phase] || 0;
    return '<div class="journey" aria-label="Care journey progress">' + labels.map(function (label, index) {
      const n = index + 1;
      const current = n === stage;
      const cls = n < stage ? 'done' : current ? M.alertCount(state) ? 'alert' : 'active' : '';
      return '<div class="journey-step ' + cls + '"><small>STEP 0' + n + '</small><strong>' + label + '</strong></div>';
    }).join('') + '</div>';
  }

  function stepStatus(step) {
    const p = state.phase;
    if (step.id === 'interpreter' && !state.includeInterpreter) return 'Skipped';
    if (step.id === 'intake') return 'Done';
    if (step.id === 'documents') return p === 'intake' ? 'Active' : 'Done';
    if (step.id === 'booking') return p === 'intake' ? 'Waiting' : ['booking_due', 'retry'].includes(p) ? 'Attention' : 'Done';
    if (step.id === 'interpreter') return state.interpreterAssigned ? 'Done' : 'Active';
    if (step.id === 'notify') return ['intake', 'booking_due', 'retry'].includes(p) ? 'Waiting' : 'Done';
    if (step.id === 'visit') return ['intake', 'booking_due', 'retry'].includes(p) ? 'Waiting' : p === 'booked' ? 'Active' : 'Done';
    if (step.id === 'report') return ['intake', 'booking_due', 'retry', 'booked'].includes(p) ? 'Waiting' : p === 'report_delayed' ? 'Attention' : ['report_pending', 'report_received'].includes(p) ? 'Active' : 'Done';
    if (step.id === 'followup') return p === 'handed_off' ? 'Done' : p === 'report_reviewed' ? 'Active' : 'Waiting';
    return 'Waiting';
  }

  function taskChain() {
    return M.TEMPLATE_STEPS.map(function (step, index) {
      const status = stepStatus(step);
      const kind = status === 'Attention' ? 'alert' : status === 'Done' || status === 'Skipped' ? 'done' : status === 'Active' ? 'active' : '';
      const marker = status === 'Done' || status === 'Skipped' ? '✓' : String(index + 1).padStart(2, '0');
      return '<div class="task-row"><span class="task-dot ' + kind + '">' + marker + '</span><div class="task-copy"><strong>' + esc(step.title) + '</strong><small>' + esc(step.owner) + (step.optional ? ' · Optional' : '') + '</small></div>' +
        badge(status, status === 'Attention' ? 'danger' : status === 'Done' || status === 'Skipped' ? 'good' : status === 'Active' ? 'active' : '') + '</div>';
    }).join('');
  }

  function nextWork() {
    switch (state.phase) {
      case 'intake':
        return '<div class="work-card"><span class="work-kicker">NEXT · PREPARE THE REFERRAL</span><h3>Review records before the hospital call</h3><p>Keep the referral package ready. This demo advances to the booking deadline so the exception workflow can be reviewed.</p>' +
          (state.includeInterpreter && !state.interpreterAssigned
            ? '<div class="info-banner compact"><strong>Interpreter task included</strong><br>Assign the interpreter before the care plan moves to booking.</div>' + button('Assign interpreter in mock →', 'assign-interpreter', 'secondary')
            : button('Advance demo to booking deadline →', 'advance-booking', 'primary')) + '</div>';
      case 'booking_due':
      case 'retry':
        return '<div class="work-card"><span class="work-kicker">NEXT · HOSPITAL CONTACT</span><h3>Appointment still needs confirmation</h3><p>' +
          (state.retry ? 'Last call: ' + esc(state.retry.reason) + '. Retry by ' + esc(state.retry.due) + '.' : 'The booking deadline has passed. Review the case context and decide how to contact the hospital.') +
          '</p><div class="action-row">' + button('Review alert →', 'triage', 'primary') + button('Start guided booking', 'booking', 'ghost') + '</div></div>';
      case 'booked':
        return '<div class="work-card"><span class="work-kicker">NEXT · PATIENT VISIT</span><h3>Appointment confirmed</h3><p>' + esc(state.booking.date + ' · ' + state.booking.time + ' · ' + state.booking.location) + '. The patient preview shows these same details.</p><div class="action-row">' +
          button('View patient preview', 'patient', 'secondary') + button('Advance demo to after visit →', 'advance-visit', 'primary') + '</div></div>';
      case 'report_pending':
      case 'report_delayed':
        return '<div class="work-card"><span class="work-kicker">NEXT · REPORT CONTINUITY</span><h3>' + (state.phase === 'report_delayed' ? 'Report follow-up is due' : 'Track the hospital report') + '</h3><p>Keep the patient informed while the care team completes its report handoff.</p>' +
          button('Open report workflow →', 'report', 'primary') + '</div>';
      case 'report_received':
        return '<div class="work-card"><span class="work-kicker">NEXT · CLINICAL REVIEW</span><h3>Wait for clinician review</h3><p>The report was routed to ' + esc(state.report.reviewer) + '. Confirm review before arranging another visit.</p>' +
          button('Confirm clinician review →', 'review', 'primary') + '</div>';
      case 'report_reviewed':
        return '<div class="work-card"><span class="work-kicker">NEXT · FOLLOW-UP</span><h3>Arrange clinical follow-up</h3><p>' + esc(state.report.reviewer) + ' completed review. Confirm the clinician and appointment details.</p>' +
          button('Schedule follow-up →', 'followup', 'primary') + '</div>';
      case 'handed_off':
        return '<div class="work-card"><span class="work-kicker">CARE PLAN HANDED OFF</span><h3>Follow-up is arranged</h3><p>' + esc(state.followup.clinician + ' · ' + state.followup.date + ' at ' + state.followup.time) + '. The patient sees the next step and appointment details.</p>' +
          button('View patient preview', 'patient', 'secondary') + '</div>';
      default:
        return '<div class="work-card"><h3>Start a referral</h3><p>Create Sarah’s care plan to see the next coordinator action.</p>' + button('+ New referral', 'new', 'primary') + '</div>';
    }
  }

  function appointmentDetails() {
    if (!state.booking) return '';
    return '<section class="appointment-strip"><span class="appointment-mark">↗</span><div><small>' + (visitHasPassed() ? 'COMPLETED HOSPITAL VISIT' : 'CONFIRMED HOSPITAL APPOINTMENT') + '</small><strong>' +
      esc(state.booking.date + ' · ' + state.booking.time) + '</strong><span>' + esc(state.patient.targetHospital + ' · ' + state.booking.location) + '</span></div><span class="appointment-note">' +
      esc(state.booking.notes || 'Bring your passport and referral documents.') + '</span></section>';
  }

  function caseView() {
    const headAction = M.alertCount(state)
      ? button('Review exception →', state.phase === 'report_delayed' ? 'report' : 'triage', 'danger small')
      : button('Patient preview', 'patient', 'ghost small');
    return pageHead('Active referral / ' + esc(name()), esc(name()), esc(state.patient.referralReason), headAction) +
      journey() + appointmentDetails() +
      '<div class="case-layout"><div class="case-primary">' +
      panel('Task chain · ' + esc(state.template), '<div class="chain-summary"><span>CARE PLAN</span><strong>' + progressPercent() + '% complete</strong></div><div class="task-chain">' + taskChain() + '</div>') +
      '</div><div class="case-secondary">' +
      panel('Case context', '<div class="context-grid"><div><small>REFERRAL SOURCE</small><strong>' + esc(state.patient.referringHospital) + '</strong></div><div><small>RECEIVING HOSPITAL</small><strong>' + esc(state.patient.targetHospital) + '</strong></div><div><small>DEPARTMENT</small><strong>' + esc(state.patient.department) + '</strong></div><div><small>PREFERRED LANGUAGE</small><strong>' + esc(state.patient.language) + '</strong></div></div>' + nextWork()) +
      panel('Activity', '<ul class="activity">' + state.log.map(function (entry) { return '<li><span class="activity-dot"></span><p>' + esc(entry) + '</p></li>'; }).join('') + '</ul>') +
      '</div></div>';
  }

  function triage() {
    const retry = state.retry;
    return pageHead('Exception review / booking', 'Appointment overdue', 'Review the referral context and choose how to move the hospital contact forward.', button('← Back to case', 'case', 'ghost small')) +
      '<div class="triage-layout">' +
      panel('What happened', '<div class="exception-banner"><span>!</span><div><strong>' + esc(name()) + ' · ' + esc(state.patient.referralReason) + '</strong><p>' +
        (retry ? 'Last attempt: ' + esc(retry.reason) + '. Retry by ' + esc(retry.due) + '; Yuzhu Dai owns the next call.' : 'No appointment was confirmed by the booking deadline. This is the first hospital contact attempt.') +
        '</p></div></div><div class="context-grid single"><div><small>RECEIVING HOSPITAL</small><strong>' + esc(state.patient.targetHospital) + ' · ' + esc(state.patient.department) + '</strong></div><div><small>REFERRAL SOURCE</small><strong>' + esc(state.patient.referringHospital) + '</strong></div><div><small>OWNER</small><strong>Yuzhu Dai · Care Coordinator</strong></div></div>') +
      panel('Coordinator decision', '<div class="decision-note"><span class="decision-orbit">◎</span><div><strong>Why a person stays in the loop</strong><p>This hospital has no reliable booking interface in the scenario. BridgeCare keeps the context and outcome structured; Yuzhu makes and records the call.</p></div></div><div class="action-row">' +
        button(retry ? 'Retry guided booking →' : 'Start guided booking →', 'booking', 'primary') + button('Open task chain', 'case', 'ghost') + '</div>') +
      '</div>';
  }

  function booking() {
    const s = state.patient;
    const script = 'Hello, I’m calling from <mark>' + esc(s.referringHospital) + '</mark> about <mark>' + esc(name()) +
      '</mark>. We’re arranging a <mark>' + esc(s.referralReason) + '</mark> with <mark>' + esc(s.department) +
      '</mark>. Could you confirm availability, location and required documents?';
    let outcomePanel = '<div class="call-start"><span class="call-wave">☎</span><div><strong>Ready to contact the hospital?</strong><p>This is a simulated call. No call will be placed.</p></div>' + button('Start simulated call', 'start-call', 'primary') + '</div>';

    if (callStarted) {
      const selected = callOutcome || '';
      outcomePanel = '<div class="call-state"><span class="call-state-dot"></span><div><strong>Call workspace open</strong><small>Choose the outcome reported by the hospital desk.</small></div></div>' +
        '<div class="outcome-options">' +
        '<button data-action="outcome-connected" class="outcome-option ' + (selected === 'connected' ? 'selected' : '') + '" aria-pressed="' + (selected === 'connected') + '"><span class="outcome-symbol">✓</span><span><strong>Connected</strong><small>The desk confirmed an available slot</small></span></button>' +
        '<button data-action="outcome-no-answer" class="outcome-option ' + (selected === 'no-answer' ? 'selected' : '') + '" aria-pressed="' + (selected === 'no-answer') + '"><span class="outcome-symbol">↻</span><span><strong>No answer</strong><small>Record the attempt and assign a retry</small></span></button></div>';

      if (selected === 'connected') {
        outcomePanel += '<div class="booking-fields"><div class="form-grid">' +
          field('Appointment date', 'date', 'October 8, 2026') + field('Appointment time', 'time', '09:30') +
          field('Building / floor / check-in', 'location', 'Building B, 3F · Foreign Patients Window', true) +
          field('Instructions from hospital', 'notes', 'Bring passport and translated referral letter', true) +
          '</div><div class="confirm-row"><p>Confirm only the slot and logistics the hospital provided.</p>' +
          button('Confirm appointment and update patient →', 'confirm-booking', 'primary') + '</div></div>';
      } else if (selected === 'no-answer') {
        outcomePanel += '<div class="booking-fields retry-fields"><div class="info-banner compact"><strong>No appointment has been booked.</strong><br>Recording this attempt creates a retry task for Yuzhu Dai.</div><div class="form-grid">' +
          field('Why the call did not connect', 'reason', 'No answer at the registration desk', true) +
          field('Retry by', 'due', 'Tomorrow, 09:00', true) +
          '</div><div class="confirm-row"><p>The patient preview will continue to say the appointment is not confirmed.</p>' +
          button('Record attempt and assign retry →', 'record-retry', 'primary') + '</div></div>';
      }
    }

    return pageHead('Manual coordination / ' + esc(name()), 'Guided hospital booking', 'The system supplies context. The coordinator makes and records the call.', button('← Back to case', 'case', 'ghost small')) +
      '<div class="booking-layout">' +
      panel('Call brief', '<div class="call-target"><small>CALLING</small><strong>' + esc(s.targetHospital) + '</strong><span>' + esc(s.department) + ' · Booking desk</span></div><div class="eyebrow script-eyebrow">SUGGESTED SCRIPT</div><blockquote class="call-script">' + script + '</blockquote><div class="script-footer"><span>PREPARE</span><small>Referral letter · Translated summary · Passport</small></div><p class="subtle">Suggested wording only. Yuzhu confirms facts with the hospital.</p>') +
      panel('Record the outcome', outcomePanel) +
      '</div>';
  }

  function reportView() {
    const delayed = state.phase === 'report_delayed';
    const due = state.report && state.report.due;
    const delaySummary = due ? '<div class="report-due"><small>FOLLOW-UP DEADLINE</small><strong>' + esc(due) + '</strong><span>Owner · Yuzhu Dai</span></div>' : '';
    return pageHead('After visit / continuity', delayed ? 'Report follow-up' : 'Track the report', 'The visit is over; the coordinator keeps the hospital handoff visible.', button('← Back to case', 'case', 'ghost small')) +
      '<div class="report-layout">' +
      panel('Case status', '<div class="patient-status-card"><span class="status-icon">◷</span><div><small>PATIENT-FACING STATUS</small><strong>' + esc(phaseLabel()) + '</strong><p>' + esc(M.patientMessage(state)) + '</p></div></div>' +
        '<div class="context-grid single"><div><small>RECEIVING HOSPITAL</small><strong>' + esc(state.patient.targetHospital) + '</strong></div><div><small>OWNER</small><strong>Yuzhu Dai</strong></div></div>' + delaySummary) +
      panel('Coordinator action', (state.phase === 'report_pending' ? '<div class="work-card"><span class="work-kicker">IF THE DEADLINE PASSES</span><h3>Record a report delay</h3><p>Set a follow-up time so the missing report stays visible on the workbench.</p>' +
        field('Follow up by', 'due', 'Tomorrow, 16:00', true) + '<div class="action-row">' + button('Record report delay →', 'delay-report', 'secondary') + '</div></div>' : '') +
        '<div class="work-card ' + (state.phase === 'report_pending' ? 'work-card-separate' : '') + '"><span class="work-kicker">WHEN THE REPORT ARRIVES</span><h3>Route it for clinician review</h3><p>Log receipt and send the report to the named clinician. Findings remain with the clinical team.</p>' +
        field('Route to clinician', 'reviewer', 'Dr. Chen', true) + '<div class="action-row">' + button('Mark received and route for review →', 'receive-report', 'primary') + '</div></div>') +
      '</div>';
  }

  function reviewView() {
    return pageHead('Clinical checkpoint / human review', 'Confirm clinician review', 'The coordinator records review completion before another visit can be arranged.', button('← Back to case', 'case', 'ghost small')) +
      '<div class="review-layout">' +
      panel('Report handoff', '<div class="patient-status-card review-status"><span class="status-icon">✓</span><div><small>REPORT RECEIVED</small><strong>Routed to ' + esc(state.report.reviewer) + '</strong><p>Clinical findings are not represented or interpreted in this prototype.</p></div></div><div class="review-proof"><span>Human checkpoint</span><p>In a real service, this status would come from a verified clinician action or a documented confirmation.</p></div>') +
      panel('Coordinator check', '<div class="review-checkpoint"><span class="decision-orbit">◎</span><h3>Has the clinician completed review?</h3><p>Use this simulated checkpoint only after the clinician has reviewed the report. It unlocks follow-up scheduling.</p>' +
        button('Record clinician review completed →', 'confirm-review', 'primary') + '</div>') +
      '</div>';
  }

  function followupView() {
    return pageHead('Clinical handoff / final step', 'Arrange follow-up', 'Complete the loop with a clear next appointment for Sarah.', button('← Back to case', 'case', 'ghost small')) +
      '<div class="followup-layout">' +
      panel('Before scheduling', '<div class="patient-status-card review-status"><span class="status-icon">✓</span><div><small>CLINICIAN REVIEW COMPLETED</small><strong>' + esc(state.report.reviewer) + '</strong><p>The report has been reviewed. Findings are not shown in this prototype.</p></div></div><div class="review-proof"><span>Human handoff</span><p>Confirm a suitable appointment with the clinician and communicate the logistics to Sarah.</p></div>') +
      panel('Follow-up details', '<div class="form-grid">' + field('Clinician', 'clinician', state.report.reviewer) +
        field('Date', 'date', 'October 12, 2026') + field('Time', 'time', '11:00') + '</div>' +
        '<div class="action-row schedule-action">' + button('Arrange follow-up and update patient →', 'schedule-followup', 'primary') + '</div>') +
      '</div>';
  }

  function patientNextStep() {
    if (state.phase === 'booked') return state.booking.notes + ' Contact Yuzhu Dai if you need to change the appointment.';
    if (['report_pending', 'report_delayed', 'report_received'].includes(state.phase)) return 'Your coordinator will share the next step after the care team reviews the report.';
    if (state.phase === 'report_reviewed') return 'Your coordinator is arranging a follow-up appointment with your clinician.';
    if (state.phase === 'handed_off') return 'Attend your clinician follow-up with ' + state.followup.clinician + ' on ' + state.followup.date + ' at ' + state.followup.time + '.';
    return 'Your care team will share the appointment details once the hospital confirms a slot.';
  }

  function patient() {
    const bookingSummary = state.booking
      ? esc(state.booking.date + ' at ' + state.booking.time + ' · ' + state.patient.targetHospital + ' · ' + state.booking.location)
      : 'Not confirmed yet';
    const followupSummary = state.followup
      ? '<div class="preview-detail"><small>CLINICIAN FOLLOW-UP</small><strong>' + esc(state.followup.clinician + ' · ' + state.followup.date + ' at ' + state.followup.time) + '</strong></div>'
      : '';
    const bookingInstructions = state.booking
      ? '<div class="preview-detail"><small>HOSPITAL INSTRUCTIONS</small><strong>' + esc(state.booking.notes) + '</strong></div>'
      : '';
    const next = patientNextStep();
    return pageHead('Patient view / read-only preview', 'What ' + esc(state.patient.firstName) + ' sees', 'One accurate next step, shared from the coordinator’s case plan.', button('← Back to case', 'case', 'ghost small')) +
      '<div class="patient-layout"><section class="patient-shared panel panel-pad"><span class="eyebrow">SHARED CASE STATUS</span><h2>' + esc(phaseLabel()) + '</h2><div class="shared-message">' + esc(M.patientMessage(state)) + '</div>' +
      '<p class="subtle">Local preview only. No real patient notification is sent.</p><div class="preview-detail"><small>' + (visitHasPassed() ? 'COMPLETED HOSPITAL VISIT' : 'HOSPITAL APPOINTMENT') + '</small><strong>' + bookingSummary + '</strong></div>' + bookingInstructions + followupSummary +
      '<div class="preview-detail next-detail"><small>NEXT STEP</small><strong>' + esc(next) + '</strong></div></section>' +
      '<div class="patient-phone"><div class="phone-camera"></div><div class="phone-top"><span class="phone-brand-mark">BC</span><small>BRIDGECARE · CARE UPDATE</small><h2>Hi, ' + esc(state.patient.firstName) + '</h2><p>Your care journey, one step at a time.</p></div>' +
      '<div class="phone-body"><div class="phone-card"><div class="phone-card-label"><span class="phone-live"></span>TODAY’S UPDATE</div><h3>' + esc(phaseLabel()) + '</h3><p>' + esc(M.patientMessage(state)) + '</p></div>' +
      '<div class="phone-section">WHAT’S NEXT</div><div class="phone-item">' + esc(next) + '<small>Updated from your coordinator’s case plan</small></div>' +
      (state.booking ? '<div class="phone-section">' + (visitHasPassed() ? 'COMPLETED HOSPITAL VISIT' : 'HOSPITAL APPOINTMENT') + '</div><div class="phone-item">' + esc(state.booking.date + ' · ' + state.booking.time) + '<small>' + esc(state.patient.targetHospital + ' · ' + state.booking.location) + '</small><small>' + esc(state.booking.notes) + '</small></div>' : '') +
      (state.followup ? '<div class="phone-section">CLINICIAN FOLLOW-UP</div><div class="phone-item">' + esc(state.followup.clinician + ' · ' + state.followup.date + ' at ' + state.followup.time) + '</div>' : '') +
      '<div class="phone-contact"><span class="contact-avatar">YD</span><span><strong>Contact Yuzhu Dai</strong><small>Care coordinator · Questions about logistics or timing</small></span><b>→</b></div></div></div></div>';
  }

  function render() {
    const labels = {
      dashboard: 'Dashboard',
      wizard: 'New referral',
      case: 'Case',
      triage: 'Review alert',
      booking: 'Guided booking',
      report: 'Report follow-up',
      review: 'Clinician review',
      followup: 'Clinical handoff',
      patient: 'Patient preview'
    };
    document.getElementById('current-view-label').textContent = view === 'case' && state.patient ? name() + '’s case' : labels[view];
    document.getElementById('case-nav-label').textContent = state.patient ? name() + '’s case' : 'Sarah’s case';
    document.getElementById('nav-alert-count').textContent = M.alertCount(state) || '';
    document.querySelectorAll('.nav').forEach(function (nav) {
      nav.classList.toggle('active', nav.dataset.view === view ||
        (view === 'triage' && nav.dataset.view === 'dashboard') ||
        (['report', 'review', 'followup', 'booking'].includes(view) && nav.dataset.view === 'case'));
    });
    const views = {
      dashboard: dashboard,
      wizard: wizard,
      case: caseView,
      triage: triage,
      booking: booking,
      report: reportView,
      review: reviewView,
      followup: followupView,
      patient: patient
    };
    app.innerHTML = views[view]();
  }

  function captureDraft() {
    ['firstName', 'lastName', 'language', 'referringHospital', 'targetHospital', 'department', 'referralReason'].forEach(function (key) {
      const el = document.getElementById('f-' + key);
      if (el) draft[key] = el.value.trim();
    });
    const interpreter = document.getElementById('f-interpreter');
    if (interpreter) draft.includeInterpreter = interpreter.checked;
  }

  function validateWizardStep() {
    const keys = wizardStep === 1
      ? ['firstName', 'lastName', 'language']
      : wizardStep === 2
        ? ['referringHospital', 'targetHospital', 'department', 'referralReason']
        : [];
    for (const key of keys) {
      if (!draft[key]) {
        toast('Complete ' + key.replace(/([A-Z])/g, ' $1').toLowerCase() + ' before continuing.');
        const el = document.getElementById('f-' + key);
        if (el) el.focus();
        return false;
      }
    }
    return true;
  }

  function formData(keys) {
    const out = {};
    keys.forEach(function (key) {
      const el = document.getElementById('f-' + key);
      out[key] = el ? el.value.trim() : '';
    });
    return out;
  }

  document.addEventListener('click', function (event) {
    const el = event.target.closest('[data-action], .nav[data-view]');
    if (!el) return;
    const action = el.dataset.action || el.dataset.view;

    if (['dashboard', 'case', 'patient', 'triage', 'booking', 'report', 'review', 'followup'].includes(action)) {
      if (action === 'booking') {
        callStarted = false;
        callOutcome = null;
      }
      setView(action);
      return;
    }
    if (action === 'reset') {
      state = M.initialState();
      draft = freshDraft();
      wizardStep = 1;
      callStarted = false;
      callOutcome = null;
      view = 'dashboard';
      render();
      toast('Demo reset.');
      return;
    }
    if (action === 'new') {
      draft = freshDraft();
      wizardStep = 1;
      setView('wizard');
      return;
    }
    if (action === 'template-standard') {
      draft.template = 'Cross-Hospital OB Referral';
      draft.includeInterpreter = false;
      render();
      return;
    }
    if (action === 'template-interpreter') {
      draft.template = 'OB Referral · Interpreter-ready';
      draft.includeInterpreter = true;
      render();
      return;
    }
    if (action === 'wizard-next') {
      captureDraft();
      if (validateWizardStep()) {
        wizardStep += 1;
        render();
      }
      return;
    }
    if (action === 'wizard-back') {
      captureDraft();
      wizardStep = Math.max(1, wizardStep - 1);
      render();
      return;
    }
    if (action === 'launch') {
      captureDraft();
      if (dispatch('CREATE', draft)) setView('case');
      return;
    }
    if (action === 'assign-interpreter') {
      if (dispatch('ASSIGN_INTERPRETER')) {
        render();
        toast('Interpreter assigned in the case plan.');
      }
      return;
    }
    if (action === 'advance-booking') {
      if (dispatch('ADVANCE_TO_BOOKING')) setView('dashboard');
      return;
    }
    if (action === 'start-call') {
      callStarted = true;
      callOutcome = null;
      render();
      return;
    }
    if (action === 'outcome-connected') {
      callOutcome = 'connected';
      render();
      return;
    }
    if (action === 'outcome-no-answer') {
      callOutcome = 'no-answer';
      render();
      return;
    }
    if (action === 'record-retry') {
      if (dispatch('CALL_NO_ANSWER', formData(['reason', 'due']))) {
        callStarted = false;
        callOutcome = null;
        setView('case');
      }
      return;
    }
    if (action === 'confirm-booking') {
      const data = formData(['date', 'time', 'location', 'notes']);
      data.callOutcome = callOutcome;
      if (dispatch('CONFIRM_BOOKING', data)) {
        callStarted = false;
        callOutcome = null;
        setView('case');
      }
      return;
    }
    if (action === 'advance-visit') {
      if (dispatch('ADVANCE_TO_VISIT')) setView('case');
      return;
    }
    if (action === 'delay-report') {
      if (dispatch('REPORT_DELAYED', formData(['due']))) setView('case');
      return;
    }
    if (action === 'receive-report') {
      if (dispatch('REPORT_RECEIVED', formData(['reviewer']))) setView('case');
      return;
    }
    if (action === 'confirm-review') {
      if (dispatch('CONFIRM_REVIEW')) setView('case');
      return;
    }
    if (action === 'schedule-followup') {
      if (dispatch('SCHEDULE_FOLLOWUP', formData(['clinician', 'date', 'time']))) setView('case');
      return;
    }
  });

  render();
})();
