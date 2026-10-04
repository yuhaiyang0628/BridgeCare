(function () {
  'use strict';

  const M = window.BridgeCareModel;
  const I18n = window.BridgeCareI18n;
  const app = document.getElementById('app');
  let state = M.buildDemoState('booking_overdue');
  let view = 'dashboard';
  let uiLanguage = 'en';
  let previewLanguage = null;
  let wizardStep = 1;
  let callStarted = false;
  let callOutcome = null;
  let draft = freshDraft();

  function freshDraft() {
    return M.defaultReferral();
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function raw(value) {
    return '<span data-preserve>' + esc(value) + '</span>';
  }

  function tx(text, values) {
    return I18n.translate(text, uiLanguage, values);
  }

  function pt(text, values) {
    return I18n.translate(text, effectivePreviewLanguage(), values);
  }

  function effectivePreviewLanguage() {
    if (previewLanguage) return previewLanguage;
    return I18n.preferredLocale(state.patient && state.patient.language);
  }

  function translateStaticMarkup(root) {
    if (!root || uiLanguage !== 'zh') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest('[data-preserve], [data-locale-lock]')) continue;
      const value = node.nodeValue;
      const trimmed = value.trim();
      if (!trimmed || !I18n.hasTranslation(trimmed)) continue;
      const leading = value.match(/^\s*/)[0];
      const trailing = value.match(/\s*$/)[0];
      node.nodeValue = leading + tx(trimmed) + trailing;
    }
    root.querySelectorAll('[aria-label], [title]').forEach(function (el) {
      ['aria-label', 'title'].forEach(function (attribute) {
        const value = el.getAttribute(attribute);
        if (I18n.hasTranslation(value)) el.setAttribute(attribute, tx(value));
      });
    });
  }

  function renderChrome() {
    const labels = {
      dashboard: 'Dashboard', wizard: 'New referral', case: 'Case', triage: 'Review alert',
      booking: 'Guided booking', report: 'Report follow-up', review: 'Clinician review',
      followup: 'Clinical handoff', patient: 'Patient preview'
    };
    document.documentElement.lang = uiLanguage;
    document.title = tx('BridgeCare · Care coordination');
    document.getElementById('workspace-label').textContent = tx('WORKSPACE');
    document.getElementById('workspace-crumb').textContent = tx('Coordinator workspace');
    document.getElementById('brand-subtitle').textContent = tx('Care coordination');
    document.getElementById('user-role-label').textContent = tx('Care coordinator');
    const current = view === 'case' && state.patient
      ? (uiLanguage === 'zh' ? name() + ' 的病例' : name() + '’s case')
      : tx(labels[view]);
    document.getElementById('current-view-label').textContent = current;
    document.getElementById('dashboard-nav-label').textContent = tx('Dashboard');
    document.getElementById('case-nav-label').textContent = state.patient
      ? (uiLanguage === 'zh' ? name() + ' 的病例' : name() + '’s case')
      : tx('Case');
    document.getElementById('patient-nav-label').textContent = tx('Patient preview');
    document.getElementById('nav-alert-count').textContent = M.alertCount(state) || '';
    document.getElementById('sidebar').setAttribute('aria-label', tx('Main navigation'));
    document.getElementById('demo-mode-label').textContent = tx('DEMO MODE');
    document.getElementById('demo-note-title').textContent = tx('One referral. Every handoff.');
    document.getElementById('demo-note-copy').textContent = tx('Opens with Sarah’s overdue booking. Calls and patient updates are simulated.');
    document.getElementById('mock-label').textContent = tx('INTERACTIVE MOCK');
    document.querySelectorAll('[data-action="reset"]').forEach(function (el) {
      el.setAttribute('title', tx('Return to Sarah’s booking-overdue case'));
    });
    const resetLabel = document.getElementById('desktop-reset-label');
    if (resetLabel) resetLabel.textContent = '↺ ' + tx('Reset demo');
    const mobileLanguage = document.getElementById('mobile-language-target');
    mobileLanguage.textContent = uiLanguage === 'en' ? '中文' : 'English';
    const mobileButton = document.querySelector('.mobile-language-switch');
    mobileButton.setAttribute('aria-label', uiLanguage === 'en' ? '切换界面语言为中文' : 'Switch interface language to English');
    document.querySelector('.desktop-locale').setAttribute('aria-label', tx('Interface language'));
    const mobileResetLabel = document.getElementById('mobile-reset-label');
    if (mobileResetLabel) mobileResetLabel.textContent = tx('Reset demo');
    document.querySelectorAll('.desktop-locale [data-language]').forEach(function (button) {
      const active = button.dataset.language === uiLanguage;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.nav').forEach(function (nav) {
      nav.classList.toggle('active', nav.dataset.view === view ||
        (view === 'triage' && nav.dataset.view === 'dashboard') ||
        (['report', 'review', 'followup', 'booking'].includes(view) && nav.dataset.view === 'case'));
    });
  }

  function snapshotInputs() {
    return Array.from(app.querySelectorAll('input, select, textarea')).map(function (el) {
      return { id: el.id, name: el.name, value: el.value, checked: el.type === 'checkbox' ? el.checked : undefined };
    });
  }

  function restoreInputs(snapshot) {
    snapshot.forEach(function (saved) {
      const el = saved.id ? document.getElementById(saved.id) : app.querySelector('[name="' + saved.name + '"]');
      if (!el) return;
      if (el.type === 'checkbox') el.checked = saved.checked;
      else el.value = saved.value;
    });
  }

  function setInterfaceLanguage(language) {
    if (!['en', 'zh'].includes(language) || language === uiLanguage) return;
    const savedInputs = snapshotInputs();
    if (view === 'wizard') captureDraft();
    uiLanguage = language;
    render();
    restoreInputs(savedInputs);
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
    el.textContent = tx(message);
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.classList.remove('show'); }, 3200);
  }

  function dispatch(type, data) {
    try {
      state = M.transition(state, { type: type, data: data || {} });
      return true;
    } catch (err) {
      toast(I18n.errorText(err.code, uiLanguage));
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
      toast('Accept a referral to create a case first.');
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
    return '<button class="btn ' + (style || 'ghost') + '" data-action="' + action + '" ' + (extra || '') + '>' + esc(tx(label)) + '</button>';
  }

  function pageHead(kicker, title, description, right) {
    return '<div class="page-head"><div><div class="eyebrow">' + tx(kicker) + '</div><h1>' + tx(title) + '</h1><p>' + tx(description) + '</p></div>' + (right || '') + '</div>';
  }

  function field(label, key, value, wide, type) {
    return '<div class="field ' + (wide ? 'wide' : '') + '"><label for="f-' + key + '">' + tx(label) + '</label><input id="f-' + key + '" name="' + key + '" type="' + (type || 'text') + '" value="' + esc(value) + '"></div>';
  }

  function panel(title, body, extra) {
    return '<section class="panel panel-pad ' + (extra || '') + '"><div class="section-top"><h2>' + tx(title) + '</h2></div>' + body + '</section>';
  }

  function badge(text, kind) {
    return '<span class="badge ' + (kind || '') + '">' + esc(tx(text)) + '</span>';
  }

  function stageLane() {
    if (state.phase === 'intake') return 0;
    if (['booking_due', 'retry'].includes(state.phase)) return 1;
    if (['booked', 'report_pending', 'report_delayed', 'report_received'].includes(state.phase)) return 2;
    return 3;
  }

  function caseCard() {
    const overdue = M.alertCount(state) > 0;
    return '<button class="case-card ' + (overdue ? 'case-card-alert' : '') + '" data-action="case" aria-label="' + esc(tx('Open {name} case', { name: name() })) + '">' +
      '<div class="case-card-top"><span class="patient-avatar">' + initials() + '</span><span class="card-name">' + raw(name()) + '</span>' +
      badge(phaseLabel(), overdue ? 'danger' : state.phase === 'handed_off' ? 'good' : '') + '</div>' +
      '<p class="card-detail">' + raw(state.patient.referringHospital) + ' <span>→</span> ' + raw(state.patient.targetHospital) + '</p>' +
      '<div class="card-tags"><span>' + raw(state.patient.language) + '</span><span>' + raw(state.patient.department) + '</span></div>' +
      '<div class="card-progress"><span><i style="width:' + progressPercent() + '%"></i></span><small>' + esc(tx('{value}% complete', { value: progressPercent() })) + '</small></div>' +
      '<div class="card-bottom"><span>' + tx(overdue ? 'Coordinator action needed' : 'Owner · Yuzhu Dai') + '</span><strong>' + tx('Open case') + ' <b>→</b></strong></div></button>';
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
      attention = '<div class="attention-card"><span class="attention-icon">!</span><div class="attention-copy"><strong>' + esc(tx('{name} · appointment not confirmed', { name: name() })) + '</strong><p>' +
        (state.retry ? esc(tx('Last call: {reason}. Retry by {due}.', { reason: state.retry.reason, due: state.retry.due })) : tx('The booking deadline has passed. Review the referral before contacting the hospital.')) +
        '</p></div>' + button('Review alert', 'triage', 'danger small') + '</div>';
    } else if (state.phase === 'report_delayed') {
      attention = '<div class="attention-card amber"><span class="attention-icon">◷</span><div class="attention-copy"><strong>' + esc(tx('{name} · report delayed', { name: name() })) + '</strong><p>' + esc(tx('Yuzhu Dai will follow up by {due}.', { due: state.report.due })) + '</p></div>' + button('Open report task', 'report', 'secondary small') + '</div>';
    }

    const stats = '<div class="stat-row">' +
      '<div class="stat"><small>ACTIVE CASES</small><strong>' + (has ? '01' : '00') + '</strong><em>' + (has ? raw(name()) : tx('Ready for referral intake')) + '</em></div>' +
      '<div class="stat ' + (M.alertCount(state) ? 'stat-alert' : '') + '"><small>EXCEPTIONS</small><strong>' + M.alertCount(state) + '</strong><em>Needs coordinator judgment</em></div>' +
      '<div class="stat"><small>CASE STAGE</small><strong class="stat-stage">' + (has ? phaseLabel() : 'Open workspace') + '</strong><em>One shared case record</em></div></div>';

    const scenarioPanel = '<section class="scenario-panel"><div class="scenario-heading"><div><span class="eyebrow">PROTOTYPE SHORTCUTS</span><h2>Demo scenarios</h2></div><small>Switches rebuild the case from valid task-chain steps.</small></div><div class="scenario-actions">' +
      '<button class="scenario-action scenario-start" data-action="start-referral"><span class="scenario-icon">＋</span><span><strong>Start from referral</strong><small>Clear this case and open the five-step wizard</small></span><b>→</b></button>' +
      '<button class="scenario-action ' + (state.phase === 'booking_due' ? 'current' : '') + '" data-action="scenario-booking"><span class="scenario-icon">!</span><span><strong>Booking overdue</strong><small>Open Sarah’s hospital booking exception</small></span><b>' + (state.phase === 'booking_due' ? 'Current' : '→') + '</b></button>' +
      '<button class="scenario-action ' + (state.phase === 'report_delayed' ? 'current' : '') + '" data-action="scenario-report"><span class="scenario-icon">◷</span><span><strong>Report delayed</strong><small>Open a post-visit report follow-up</small></span><b>' + (state.phase === 'report_delayed' ? 'Current' : '→') + '</b></button>' +
      '</div></section>';

    const focusCase = has
      ? '<section class="focus-case"><span class="patient-avatar">' + initials() + '</span><div class="focus-copy"><span class="eyebrow">YOUR ACTIVE CASE</span><h2>' + raw(name()) + ' <span>' + badge(phaseLabel(), M.alertCount(state) ? 'danger' : '') + '</span></h2><p>' + raw(state.patient.referringHospital) + ' → ' + raw(state.patient.targetHospital) + ' · ' + raw(state.patient.department) + '</p></div><div class="focus-actions">' +
        button(tx('{name}’s case', { name: name() }), 'case', 'primary') +
        button('Patient preview', 'patient', 'ghost') + '</div></section>'
      : '<section class="focus-case focus-empty"><div class="focus-copy"><span class="eyebrow">START A CARE JOURNEY</span><h2>No active referral</h2><p>Enter patient information and launch the task chain to begin.</p></div>' + button('Start from referral →', 'start-referral', 'primary') + '</section>';

    const boardTitle = has ? tx('{name}’s coordination board', { name: name() }) : tx('Care coordination board');
    const board = '<section class="board-section"><div class="section-top board-title"><div><span class="eyebrow">CARE JOURNEY</span><h2>' + esc(boardTitle) + '</h2><p>One referral moves through the work. The coordinator owns every handoff.</p></div>' +
      (has ? button(tx('Open {name}’s case →', { name: name() }), 'case', 'ghost small') : '') + '</div><div class="kanban-board">' +
      labels.map(function (label, index) {
        let body = '<div class="lane-empty"><span class="lane-mark">' + (index + 1) + '</span><strong>No case in this stage</strong><small>' + laneDescriptions[index] + '</small></div>';
        if (has && index === lane) body = caseCard();
        return '<section class="kanban-col lane-' + index + (has && index === lane ? ' lane-active' : '') + '"><div class="kanban-col-header"><div><h3>' + label + '</h3><small>' + laneDescriptions[index] + '</small></div><span class="lane-count">' + (has && index === lane ? '1' : '0') + '</span></div><div class="kanban-col-body">' + body + '</div></section>';
      }).join('') + '</div></section>';

    const attentionCount = M.alertCount(state) ? tx('{count} open exception', { count: M.alertCount(state) }) : tx('No open exceptions');
    const attentionQueue = '<section class="attention-panel"><div class="section-top"><div><span class="eyebrow">ATTENTION QUEUE</span><h2>Needs coordinator attention</h2></div><small>' + esc(attentionCount) + '</small></div>' + attention + '</section>';

    return pageHead('Today / care operations', 'Care dashboard', 'A clear view of the work that keeps each patient’s care moving.') +
      focusCase + scenarioPanel + stats + attentionQueue + board;
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
        '<span class="choice-mark">↗</span><span><strong>' + tx('Cross-Hospital OB Referral') + '</strong><p>Prepare records, coordinate booking, guide the visit, track the report and arrange follow-up.</p></span><b class="choice-check">' + tx(draft.template === 'Cross-Hospital OB Referral' ? 'Selected' : 'Select') + '</b></button>' +
        '<button class="choice ' + (draft.template !== 'Cross-Hospital OB Referral' ? 'selected' : '') + '" data-action="template-interpreter" aria-pressed="' + (draft.template !== 'Cross-Hospital OB Referral') + '">' +
        '<span class="choice-mark">文</span><span><strong>' + tx('OB Referral · Interpreter-ready') + '</strong><p>Use the same care plan with interpreter coordination included as a suggested support task.</p></span><b class="choice-check">' + tx(draft.template !== 'Cross-Hospital OB Referral' ? 'Selected' : 'Select') + '</b></button>' +
        '<p class="subtle">Two preset configurations are shown for this case. Full template authoring is outside this prototype.</p>';
    }
    if (wizardStep === 4) {
      content = '<div class="info-banner"><strong>The task chain is a starting point.</strong> Yuzhu decides whether translation support is needed and stays responsible for each handoff.</div>' +
        '<div class="chain-edit-list">' + M.TEMPLATE_STEPS.map(function (step, index) {
          if (step.optional) {
            return '<label class="check-row optional-row" for="f-interpreter"><input id="f-interpreter" type="checkbox" ' + (draft.includeInterpreter ? 'checked' : '') + '><span class="check-copy"><strong>' + esc(tx(step.title)) + '</strong><small>' + esc(tx(step.owner)) + ' · ' + tx('Optional support') + '</small></span><span class="optional-pill">' + tx('Optional') + '</span></label>';
          }
          return '<div class="check-row"><span class="task-index">' + String(index + 1).padStart(2, '0') + '</span><span class="check-copy"><strong>' + esc(tx(step.title)) + '</strong><small>' + esc(tx(step.owner)) + ' · ' + tx('Included in this chain') + '</small></span><span class="included-pill">' + tx('Included') + '</span></div>';
        }).join('') + '</div>';
    }
    if (wizardStep === 5) {
      content = '<div class="review-grid"><div><small>PATIENT</small><strong>' + raw(draft.firstName + ' ' + draft.lastName) + '</strong><span>' + raw(draft.language) + '</span></div>' +
        '<div><small>REFERRAL</small><strong>' + raw(draft.referringHospital) + ' → ' + raw(draft.targetHospital) + '</strong><span>' + raw(draft.department) + '</span></div>' +
        '<div class="review-wide"><small>REASON FOR REFERRAL</small><strong>' + raw(draft.referralReason) + '</strong></div>' +
        '<div class="review-wide"><small>TASK CHAIN</small><strong>' + tx(draft.template) + '</strong><span>' + tx(draft.includeInterpreter ? 'Interpreter coordination included' : 'Interpreter coordination skipped') + '</span></div></div>' +
        '<div class="info-banner review-note">Launching creates a local case and task chain. This prototype does not send a patient invitation.</div>';
    }

    return pageHead(tx('Referral setup / step {step} of 5', { step: wizardStep }), titles[wizardStep - 1], descriptions[wizardStep - 1], button('Exit setup', 'dashboard', 'ghost small')) +
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
      return '<div class="journey-step ' + cls + '"><small>' + tx('STEP 0{step}', { step: n }) + '</small><strong>' + tx(label) + '</strong></div>';
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
      return '<div class="task-row"><span class="task-dot ' + kind + '">' + marker + '</span><div class="task-copy"><strong>' + esc(tx(step.title)) + '</strong><small>' + esc(tx(step.owner)) + (step.optional ? ' · ' + tx('Optional') : '') + '</small></div>' +
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
          (state.retry ? esc(tx('Last call: {reason}. Retry by {due}.', { reason: state.retry.reason, due: state.retry.due })) : tx('The booking deadline has passed. Review the case context and decide how to contact the hospital.')) +
          '</p><div class="action-row">' + button('Review alert →', 'triage', 'primary') + button('Start guided booking', 'booking', 'ghost') + '</div></div>';
      case 'booked':
        return '<div class="work-card"><span class="work-kicker">NEXT · PATIENT VISIT</span><h3>Appointment confirmed</h3><p>' + esc(tx('Appointment confirmed for {date} at {time} · {location}. The patient preview shows these same details.', state.booking)) + '</p><div class="action-row">' +
          button('View patient preview', 'patient', 'secondary') + button('Advance demo to after visit →', 'advance-visit', 'primary') + '</div></div>';
      case 'report_pending':
      case 'report_delayed':
        return '<div class="work-card"><span class="work-kicker">NEXT · REPORT CONTINUITY</span><h3>' + (state.phase === 'report_delayed' ? 'Report follow-up is due' : 'Track the hospital report') + '</h3><p>Keep the patient informed while the care team completes its report handoff.</p>' +
          button('Open report workflow →', 'report', 'primary') + '</div>';
      case 'report_received':
        return '<div class="work-card"><span class="work-kicker">NEXT · CLINICAL REVIEW</span><h3>Wait for clinician review</h3><p>' + esc(tx('The report was routed to {reviewer}. Confirm review before arranging another visit.', { reviewer: state.report.reviewer })) + '</p>' +
          button('Confirm clinician review →', 'review', 'primary') + '</div>';
      case 'report_reviewed':
        return '<div class="work-card"><span class="work-kicker">NEXT · FOLLOW-UP</span><h3>Arrange clinical follow-up</h3><p>' + esc(tx('{reviewer} completed review. Confirm the clinician and appointment details.', { reviewer: state.report.reviewer })) + '</p>' +
          button('Schedule follow-up →', 'followup', 'primary') + '</div>';
      case 'handed_off':
        return '<div class="work-card"><span class="work-kicker">CARE PLAN HANDED OFF</span><h3>Follow-up is arranged</h3><p>' + esc(tx('Follow-up is arranged with {clinician} for {date} at {time}. The patient sees the next step and appointment details.', state.followup)) + '</p>' +
          button('View patient preview', 'patient', 'secondary') + '</div>';
      default:
        return '<div class="work-card"><h3>Start a referral</h3><p>Create a care plan to see the next coordinator action.</p>' + button('+ New referral', 'new', 'primary') + '</div>';
    }
  }

  function appointmentDetails() {
    if (!state.booking) return '';
    return '<section class="appointment-strip"><span class="appointment-mark">↗</span><div><small>' + tx(visitHasPassed() ? 'COMPLETED HOSPITAL VISIT' : 'CONFIRMED HOSPITAL APPOINTMENT') + '</small><strong>' +
      raw(state.booking.date + ' · ' + state.booking.time) + '</strong><span>' + raw(state.patient.targetHospital + ' · ' + state.booking.location) + '</span></div><span class="appointment-note">' +
      raw(state.booking.notes || 'Bring your passport and referral documents.') + '</span></section>';
  }

  function caseView() {
    const headAction = state.phase === 'booking_due' || state.phase === 'retry'
      ? button('Review alert →', 'triage', 'danger small')
      : state.phase === 'report_delayed'
        ? button('Open report workflow →', 'report', 'secondary small')
        : button('Patient preview', 'patient', 'ghost small');
    return pageHead(tx('Active referral / {name}', { name: name() }), raw(name()), raw(state.patient.referralReason), headAction) +
      journey() + appointmentDetails() +
      '<div class="case-layout"><div class="case-primary">' +
      panel(tx('Task chain') + ' · ' + tx(state.template), '<div class="chain-summary"><span>CARE PLAN</span><strong>' + esc(tx('{value}% complete', { value: progressPercent() })) + '</strong></div><div class="task-chain">' + taskChain() + '</div>') +
      '</div><div class="case-secondary">' +
      panel('Case context', '<div class="context-grid"><div><small>REFERRAL SOURCE</small><strong>' + raw(state.patient.referringHospital) + '</strong></div><div><small>RECEIVING HOSPITAL</small><strong>' + raw(state.patient.targetHospital) + '</strong></div><div><small>DEPARTMENT</small><strong>' + raw(state.patient.department) + '</strong></div><div><small>PREFERRED LANGUAGE</small><strong>' + raw(state.patient.language) + '</strong></div></div>' + nextWork()) +
      panel('Activity', '<ul class="activity">' + state.log.map(function (entry) { return '<li><span class="activity-dot"></span><p>' + esc(I18n.activity(entry, uiLanguage)) + '</p></li>'; }).join('') + '</ul>') +
      '</div></div>';
  }

  function triage() {
    const retry = state.retry;
    return pageHead('Exception review / booking', 'Appointment overdue', 'Review the referral context and choose how to move the hospital contact forward.', button('← Back to case', 'case', 'ghost small')) +
      '<div class="triage-layout">' +
      panel('What happened', '<div class="exception-banner"><span>!</span><div><strong>' + raw(name()) + ' · ' + raw(state.patient.referralReason) + '</strong><p>' +
        (retry ? esc(tx('Last attempt: {reason}. Retry by {due}; Yuzhu Dai owns the next call.', { reason: retry.reason, due: retry.due })) : tx('No appointment was confirmed by the booking deadline. This is the first hospital contact attempt.')) +
        '</p></div></div><div class="context-grid single"><div><small>RECEIVING HOSPITAL</small><strong>' + raw(state.patient.targetHospital) + ' · ' + raw(state.patient.department) + '</strong></div><div><small>REFERRAL SOURCE</small><strong>' + raw(state.patient.referringHospital) + '</strong></div><div><small>OWNER</small><strong>' + raw('Yuzhu Dai') + ' · ' + tx('Care Coordinator') + '</strong></div></div>') +
      panel('Coordinator decision', '<div class="decision-note"><span class="decision-orbit">◎</span><div><strong>Why a person stays in the loop</strong><p>This hospital has no reliable booking interface in the scenario. BridgeCare keeps the context and outcome structured; Yuzhu makes and records the call.</p></div></div><div class="action-row">' +
        button(retry ? 'Retry guided booking →' : 'Start guided booking →', 'booking', 'primary') + button('Open task chain', 'case', 'ghost') + '</div>') +
      '</div>';
  }

  function booking() {
    const s = state.patient;
    const script = uiLanguage === 'zh'
      ? '您好，我是来自 <mark>' + raw(s.referringHospital) + '</mark> 的工作人员，想为 <mark>' + raw(name()) +
        '</mark> 咨询转诊预约。患者拟就诊科室为 <mark>' + raw(s.department) + '</mark>，转诊原因为 <mark>' + raw(s.referralReason) +
        '</mark>。请问近期有哪些可预约时段？就诊地点和需要携带的材料是什么？'
      : 'Hello, I’m calling from <mark>' + raw(s.referringHospital) + '</mark> about <mark>' + raw(name()) +
        '</mark>. We’re arranging a <mark>' + raw(s.referralReason) + '</mark> with <mark>' + raw(s.department) +
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

    return pageHead(tx('Manual coordination / {name}', { name: name() }), 'Guided hospital booking', 'The system supplies context. The coordinator makes and records the call.', button('← Back to case', 'case', 'ghost small')) +
      '<div class="booking-layout">' +
      panel('Call brief', '<div class="call-target"><small>CALLING</small><strong>' + raw(s.targetHospital) + '</strong><span>' + raw(s.department) + ' · ' + tx('Booking desk') + '</span></div><div class="eyebrow script-eyebrow">SUGGESTED SCRIPT</div><blockquote class="call-script">' + script + '</blockquote><div class="script-footer"><span>PREPARE</span><small>Referral letter · Translated summary · Passport</small></div><p class="subtle">Suggested wording only. Yuzhu confirms facts with the hospital.</p>') +
      panel('Record the outcome', outcomePanel) +
      '</div>';
  }

  function reportView() {
    const delayed = state.phase === 'report_delayed';
    const due = state.report && state.report.due;
    const delaySummary = due ? '<div class="report-due"><small>FOLLOW-UP DEADLINE</small><strong>' + raw(due) + '</strong><span>Owner · Yuzhu Dai</span></div>' : '';
    return pageHead('After visit / continuity', delayed ? 'Report follow-up' : 'Track the report', 'The visit is over; the coordinator keeps the hospital handoff visible.', button('← Back to case', 'case', 'ghost small')) +
      '<div class="report-layout">' +
      panel('Case status', '<div class="patient-status-card"><span class="status-icon">◷</span><div><small>PATIENT-FACING STATUS</small><strong>' + esc(tx(phaseLabel())) + '</strong><p>' + esc(I18n.patientMessage(state, uiLanguage)) + '</p></div></div>' +
        '<div class="context-grid single"><div><small>RECEIVING HOSPITAL</small><strong>' + raw(state.patient.targetHospital) + '</strong></div><div><small>OWNER</small><strong>' + raw('Yuzhu Dai') + '</strong></div></div>' + delaySummary) +
      panel('Coordinator action', (state.phase === 'report_pending' ? '<div class="work-card"><span class="work-kicker">IF THE DEADLINE PASSES</span><h3>Record a report delay</h3><p>Set a follow-up time so the missing report stays visible on the workbench.</p>' +
        field('Follow up by', 'due', 'Tomorrow, 16:00', true) + '<div class="action-row">' + button('Record report delay →', 'delay-report', 'secondary') + '</div></div>' : '') +
        '<div class="work-card ' + (state.phase === 'report_pending' ? 'work-card-separate' : '') + '"><span class="work-kicker">WHEN THE REPORT ARRIVES</span><h3>Route it for clinician review</h3><p>Log receipt and send the report to the named clinician. Findings remain with the clinical team.</p>' +
        field('Route to clinician', 'reviewer', 'Dr. Chen', true) + '<div class="action-row">' + button('Mark received and route for review →', 'receive-report', 'primary') + '</div></div>') +
      '</div>';
  }

  function reviewView() {
    return pageHead('Clinical checkpoint / human review', 'Confirm clinician review', 'The coordinator records review completion before another visit can be arranged.', button('← Back to case', 'case', 'ghost small')) +
      '<div class="review-layout">' +
      panel('Report handoff', '<div class="patient-status-card review-status"><span class="status-icon">✓</span><div><small>REPORT RECEIVED</small><strong>' + tx('Routed to') + ' ' + raw(state.report.reviewer) + '</strong><p>Clinical findings are not represented or interpreted in this prototype.</p></div></div><div class="review-proof"><span>Human checkpoint</span><p>In a real service, this status would come from a verified clinician action or a documented confirmation.</p></div>') +
      panel('Coordinator check', '<div class="review-checkpoint"><span class="decision-orbit">◎</span><h3>Has the clinician completed review?</h3><p>Use this simulated checkpoint only after the clinician has reviewed the report. It unlocks follow-up scheduling.</p>' +
        button('Record clinician review completed →', 'confirm-review', 'primary') + '</div>') +
      '</div>';
  }

  function followupView() {
    return pageHead('Clinical handoff / final step', 'Arrange follow-up', tx('Complete the loop with a clear next appointment for {name}.', { name: name() }), button('← Back to case', 'case', 'ghost small')) +
      '<div class="followup-layout">' +
      panel('Before scheduling', '<div class="patient-status-card review-status"><span class="status-icon">✓</span><div><small>CLINICIAN REVIEW COMPLETED</small><strong>' + raw(state.report.reviewer) + '</strong><p>The report has been reviewed. Findings are not shown in this prototype.</p></div></div><div class="review-proof"><span>Human handoff</span><p>' + esc(tx('Confirm a suitable appointment with the clinician and communicate the logistics to {name}.', { name: name() })) + '</p></div>') +
      panel('Follow-up details', '<div class="form-grid">' + field('Clinician', 'clinician', state.report.reviewer) +
        field('Date', 'date', 'October 12, 2026') + field('Time', 'time', '11:00') + '</div>' +
        '<div class="action-row schedule-action">' + button('Arrange follow-up and update patient →', 'schedule-followup', 'primary') + '</div>') +
      '</div>';
  }

  function patientNextStep(locale) {
    if (state.phase === 'booked') return state.booking.notes + (locale === 'zh' ? ' 如需调整预约，请联系 Yuzhu Dai。' : ' Contact Yuzhu Dai if you need to change the appointment.');
    if (['report_pending', 'report_delayed', 'report_received'].includes(state.phase)) return I18n.translate('Your coordinator will share the next step after the care team reviews the report.', locale);
    if (state.phase === 'report_reviewed') return I18n.translate('Your coordinator is arranging a follow-up appointment with your clinician.', locale);
    if (state.phase === 'handed_off') return I18n.translate('Attend your clinician follow-up with {clinician} on {date} at {time}.', locale, state.followup);
    return I18n.translate('Your care team will share the appointment details once the hospital confirms a slot.', locale);
  }

  function patient() {
    const locale = effectivePreviewLanguage();
    const bookingSummary = state.booking
      ? esc(state.booking.date + (locale === 'zh' ? ' ' : ' at ') + state.booking.time + ' · ' + state.patient.targetHospital + ' · ' + state.booking.location)
      : pt('Not confirmed yet');
    const followupSummary = state.followup
      ? '<div class="preview-detail"><small>' + pt('CLINICIAN FOLLOW-UP') + '</small><strong>' + raw(state.followup.clinician + ' · ' + state.followup.date + (locale === 'zh' ? ' ' : ' at ') + state.followup.time) + '</strong></div>'
      : '';
    const bookingInstructions = state.booking
      ? '<div class="preview-detail"><small>' + pt('HOSPITAL INSTRUCTIONS') + '</small><strong>' + raw(state.booking.notes) + '</strong></div>'
      : '';
    const next = patientNextStep(locale);
    const status = I18n.translate(phaseLabel(), locale);
    const patientMessage = I18n.patientMessage(state, locale);
    const languageControl = '<div class="preview-controls"><label for="preview-language">' + tx('Preview language') + '</label><select id="preview-language" name="preview-language" data-preview-language><option value="en" ' + (locale === 'en' ? 'selected' : '') + '>English</option><option value="zh" ' + (locale === 'zh' ? 'selected' : '') + '>中文</option></select></div>';
    return pageHead('Patient view / read-only preview', tx('What {name} sees', { name: state.patient.firstName }), 'One accurate next step, shared from the coordinator’s case plan.', button('← Back to case', 'case', 'ghost small')) + languageControl +
      '<div class="patient-layout" data-locale-lock lang="' + locale + '"><section class="patient-shared panel panel-pad"><span class="eyebrow">' + pt('SHARED CASE STATUS') + '</span><h2>' + esc(status) + '</h2><div class="shared-message">' + esc(patientMessage) + '</div>' +
      '<p class="subtle">' + pt('Local preview only. No real patient notification is sent.') + '</p><div class="preview-detail"><small>' + pt(visitHasPassed() ? 'COMPLETED HOSPITAL VISIT' : 'HOSPITAL APPOINTMENT') + '</small><strong>' + bookingSummary + '</strong></div>' + bookingInstructions + followupSummary +
      '<div class="preview-detail next-detail"><small>' + pt('NEXT STEP') + '</small><strong>' + esc(next) + '</strong></div></section>' +
      '<div class="patient-phone"><div class="phone-camera"></div><div class="phone-top"><span class="phone-brand-mark">BC</span><small>' + pt('BRIDGECARE · CARE UPDATE') + '</small><h2>' + (locale === 'zh' ? '您好，' : 'Hi, ') + raw(state.patient.firstName) + '</h2><p>' + pt('Your care journey, one step at a time.') + '</p></div>' +
      '<div class="phone-body"><div class="phone-card"><div class="phone-card-label"><span class="phone-live"></span>' + pt('TODAY’S UPDATE') + '</div><h3>' + esc(status) + '</h3><p>' + esc(patientMessage) + '</p></div>' +
      '<div class="phone-section">' + pt('WHAT’S NEXT') + '</div><div class="phone-item">' + esc(next) + '<small>' + pt('Updated from your coordinator’s case plan') + '</small></div>' +
      (state.booking ? '<div class="phone-section">' + pt(visitHasPassed() ? 'COMPLETED HOSPITAL VISIT' : 'HOSPITAL APPOINTMENT') + '</div><div class="phone-item">' + raw(state.booking.date + (locale === 'zh' ? ' · ' : ' · ') + state.booking.time) + '<small>' + raw(state.patient.targetHospital + ' · ' + state.booking.location) + '</small><small>' + raw(state.booking.notes) + '</small></div>' : '') +
      (state.followup ? '<div class="phone-section">' + pt('CLINICIAN FOLLOW-UP') + '</div><div class="phone-item">' + raw(state.followup.clinician + ' · ' + state.followup.date + (locale === 'zh' ? ' ' : ' at ') + state.followup.time) + '</div>' : '') +
      '<div class="phone-contact"><span class="contact-avatar">YD</span><span><strong>' + pt('Contact Yuzhu Dai') + '</strong><small>' + pt('Care coordinator · Questions about logistics or timing') + '</small></span><b>→</b></div></div></div></div>';
  }

  function render() {
    renderChrome();
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
    translateStaticMarkup(app);
  }

  function startFromReferral() {
    state = M.initialState();
    draft = freshDraft();
    wizardStep = 1;
    callStarted = false;
    callOutcome = null;
    setView('wizard');
  }

  function loadDemoScenario(scenario, message) {
    try {
      state = M.buildDemoState(scenario);
      draft = freshDraft();
      wizardStep = 1;
      callStarted = false;
      callOutcome = null;
      view = 'dashboard';
      render();
      toast(message);
    } catch (err) {
      toast(err.message);
    }
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
        const fieldName = I18n.errorForField(key, uiLanguage);
        toast(I18n.translate('Complete {field} before continuing.', uiLanguage, { field: fieldName }));
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

    if (action === 'set-language') {
      setInterfaceLanguage(el.dataset.language);
      return;
    }
    if (action === 'toggle-language') {
      setInterfaceLanguage(uiLanguage === 'en' ? 'zh' : 'en');
      return;
    }

    if (['dashboard', 'case', 'patient', 'triage', 'booking', 'report', 'review', 'followup'].includes(action)) {
      if (action === 'booking') {
        callStarted = false;
        callOutcome = null;
      }
      setView(action);
      return;
    }
    if (action === 'reset') {
      state = M.buildDemoState('booking_overdue');
      draft = freshDraft();
      wizardStep = 1;
      callStarted = false;
      callOutcome = null;
      view = 'dashboard';
      render();
      toast('Demo reset to Sarah’s booking-overdue case.');
      return;
    }
    if (action === 'start-referral' || action === 'new') {
      startFromReferral();
      return;
    }
    if (action === 'scenario-booking') {
      loadDemoScenario('booking_overdue', 'Loaded the booking-overdue scenario.');
      return;
    }
    if (action === 'scenario-report') {
      loadDemoScenario('report_delayed', 'Loaded the report-delayed scenario.');
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

  document.addEventListener('change', function (event) {
    if (!event.target.matches('[data-preview-language]')) return;
    if (!['en', 'zh'].includes(event.target.value)) return;
    previewLanguage = event.target.value;
    render();
  });

  render();
})();
