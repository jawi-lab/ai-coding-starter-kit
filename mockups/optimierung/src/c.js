/* Variante C – Mutig „Anstehend“: neue IA (Anstehend · Gruppe-Fluss · Album), Terminabstimmung, Rechtemodell Admin/Mitglied/Gastgeber:in. */
(function () {
  'use strict';
  const M = window.Mellon;
  const { esc, icon, member, st, fmtDay, fmtRange, relDay, level, tier, A, D, group, can, online, ME, TODAY } = M;
  const ROLE = { admin: 'Admin', member: 'Mitglied', host: 'Gastgeber:in' };
  const MROLE = { admin: 'Admin', editor: 'Mitglied', observer: 'Mitglied' };
  const COVER_ICON = { green: 'pin', gold: 'sparkles', blush: 'heart', ink: 'star' };

  const ROUTES = ['welcome', 'login', 'join', 'agenda', 'calendar', 'flow', 'newproposal', 'activity', 'datepoll', 'datefinder', 'group', 'notifications', 'notifsettings', 'profile', 'album', 'celebrate'];
  const NAMES = { welcome: 'Onboarding', login: 'Login & Registrierung', join: 'Gruppe beitreten', agenda: 'Anstehend (Start)', calendar: 'Kalender', flow: 'Gruppe: Fluss mit Ideen & Abstimmung', group: 'Mitglieder & Einladen', newproposal: 'Idee erstellen', activity: 'Aktivitäts-Detail', datepoll: 'Terminabstimmung', datefinder: 'Termin direkt festlegen', notifications: 'Benachrichtigungen', notifsettings: 'Push & E-Mail', profile: 'Profil & Einstellungen', album: 'Album', celebrate: 'Erfolgsmoment: Erinnerung entsteht' };

  /* ---------- Bausteine ---------- */
  const av = (id, size) => { const m = member(id); return m ? '<span class="av av-' + m.hue + (size ? ' av-' + size : '') + '" aria-hidden="true">' + esc(M.initials(m)) + '</span>' : ''; };
  const avStack = (ids, max) => '<span class="avs">' + ids.slice(0, max || 5).map((i) => av(i, 'sm')).join('') + (ids.length > (max || 5) ? '<span class="av av-sm av-more" aria-hidden="true">+' + (ids.length - (max || 5)) + '</span>' : '') + '</span>';
  const tag = (txt, kind) => '<span class="tag tag-' + kind + '">' + esc(txt) + '</span>';
  const newTag = () => tag('Neu', 'new');
  const propTag = () => tag('Vorschlag', 'prop');
  const statusChip = (s) => '<span class="status status-' + s + '"><span class="dot" aria-hidden="true"></span>' + esc(st(s)) + '</span>';
  const btn = (label, attrs, kind, ic) => '<button type="button" class="btn btn-' + (kind || 'default') + '" ' + attrs + '>' + (ic ? icon(ic) : '') + '<span>' + label + '</span></button>';
  const navA = (to, label, params, extra) => '<a href="' + M.href(to, params || {}) + '" data-action="nav" data-to="' + to + '"' + Object.entries(params || {}).map(([k, v]) => ' data-p' + k[0].toUpperCase() + k.slice(1) + '="' + v + '"').join('') + (extra || '') + '>' + label + '</a>';
  const cover = (a, cls) => '<span class="cover cover-' + a.cover + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + icon(COVER_ICON[a.cover]) + '</span>';
  const deny = (txt) => '<p class="deny">' + icon('lock') + '<span>' + esc(txt) + '</span></p>';
  const sectionHead = (title, extra) => '<div class="sec-head"><h2>' + title + '</h2>' + (extra || '') + '</div>';
  const field = (id, label, input, err, hint) => '<div class="field' + (err ? ' has-err' : '') + '"><label for="' + id + '">' + label + '</label>' + input + (hint ? '<p class="hint" id="' + id + '-hint">' + hint + '</p>' : '') + (err ? '<p class="err" id="' + id + '-err">' + icon('alert') + esc(err) + '</p>' : '') + '</div>';
  const inputAttrs = (id, err, hint) => 'id="' + id + '" data-k="' + id + '"' + (err ? ' aria-invalid="true"' : '') + ((err || hint) ? ' aria-describedby="' + [hint ? id + '-hint' : '', err ? id + '-err' : ''].filter(Boolean).join(' ') + '"' : '');
  const sw = (on, attrs, label) => '<button type="button" role="switch" class="switch" aria-checked="' + on + '" ' + attrs + '><span class="sr-only">' + label + '</span><span class="knob" aria-hidden="true"></span></button>';
  const myVoteMissing = () => M.state().activities.filter((a) => a.status === 'vorschlag' && !a.votes.includes(ME));

  function stateBlock(S, what) {
    const st8 = S.ui.state;
    if (st8 === 'loading') return '<div class="skel-list" aria-busy="true"><p class="sr-only">' + esc(what) + ' werden geladen …</p>' + '<div class="skel"></div>'.repeat(3) + '</div>';
    if (st8 === 'error') return '<div class="state-card state-error" role="alert">' + icon('alert') + '<h2>' + esc(what) + ' konnten nicht geladen werden</h2><p>Prüfe deine Verbindung und versuch es noch einmal. Deine Eingaben bleiben erhalten.</p>' + btn('Erneut versuchen', 'data-action="retry" data-k="retry"', 'default', 'refresh') + '</div>';
    return null;
  }
  const emptyBlock = (ic, title, text, cta) => '<div class="state-card state-empty">' + '<span class="empty-art" aria-hidden="true">' + icon(ic) + '</span><h2>' + title + '</h2><p>' + text + '</p>' + (cta || '') + '</div>';

  /* ---------- Screens ---------- */
  const SCREENS = {};
  /* ---------- Shell C: Anstehend · Gruppe · Erstellen · Album ---------- */
  const TABS = [['agenda', 'Anstehend', 'clock'], ['flow', 'Gruppe', 'users'], ['create', 'Erstellen', 'plus'], ['album', 'Album', 'camera']];
  const ACTIVE = { agenda: 'agenda', calendar: 'agenda', flow: 'flow', group: 'flow', newproposal: 'flow', activity: 'flow', datepoll: 'flow', datefinder: 'flow', album: 'album', notifications: 'agenda', notifsettings: 'profile', profile: 'profile', celebrate: 'agenda' };
  function unread(S) { return S.notifications.filter((n) => n.unread).length; }
  function shell(S, title, body, opts) {
    opts = opts || {};
    const act = ACTIVE[S.route];
    const item = (r, l, ic, cls) => r === 'create'
      ? '<li><button type="button" class="' + cls + ' create" data-action="openModal" data-modal="create" data-k="nav-create-' + cls + '">' + icon('plus') + '<span>' + l + '</span></button></li>'
      : '<li>' + navA(r, icon(ic) + '<span>' + l + '</span>' + (r === 'agenda' && agendaCount(S) ? '<span class="nav-n" aria-label="' + agendaCount(S) + ' offen">' + agendaCount(S) + '</span>' : ''), {}, ' class="' + cls + '"' + (act === r ? ' aria-current="page"' : '')) + '</li>';
    const bell = navA('notifications', icon('bell') + (unread(S) ? '<span class="badge-dot">' + unread(S) + '</span>' : '') + '<span class="sr-only">Benachrichtigungen, ' + unread(S) + ' ungelesen</span>', {}, ' class="icon-btn bell"');
    const me = navA('profile', av(ME, 'sm') + '<span class="sr-only">Profil</span>', {}, ' class="icon-btn me"' + (act === 'profile' ? ' aria-current="page"' : ''));
    return '<div class="app' + (opts.split ? ' has-split' : '') + '">' +
      '<button type="button" class="skip" data-action="skipToMain">Zum Inhalt springen</button>' +
      '<nav class="rail" aria-label="Hauptnavigation"><div class="rail-logo">' + window.MELLON_LOGO + '</div><ul>' + TABS.map(([r, l, ic]) => item(r, l, ic, 'rail-link')).join('') + '</ul>' +
      '<div class="rail-foot">' + navA('profile', av(ME, 'sm') + '<span>Mara K.</span>', {}, ' class="rail-link"' + (act === 'profile' ? ' aria-current="page"' : '')) + '<p class="kbd-hint">' + (S.shortcuts === false ? 'Tastenkürzel aus' : 'Tasten: 1 · 2 · 3 · N') + '</p></div></nav>' +
      '<div class="col"><header class="topbar">' + (opts.back ? '<button type="button" class="icon-btn" data-action="back" data-k="back" aria-label="Zurück">' + icon('arrowL') + '</button>' : '<span class="top-logo">' + window.MELLON_LOGO + '</span>') + '<span class="top-title">' + esc(opts.kicker || '') + '</span>' + bell + me + '</header>' +
      (online() ? '' : '<div class="offline" role="status">' + icon('wifiOff') + '<span>Offline. Du siehst den letzten Stand; Ändern geht wieder mit Verbindung.</span><button type="button" class="btn btn-sm" data-action="goOnline" data-k="online">Erneut verbinden</button></div>') +
      '<div class="panes"><main id="main" class="scroll" data-scroll tabindex="-1"><div class="page' + (opts.wide ? ' page-wide' : '') + '">' + (title ? '<h1 class="screen-title">' + title + '</h1>' : '') + body + '</div></main>' + (opts.split || '') + '</div></div>' +
      '<nav class="tabbar" aria-label="Hauptnavigation mobil"><ul>' + TABS.map(([r, l, ic]) => item(r, l, ic, 'tab')).join('') + '</ul></nav>' +
      modalLayer(S) + celebrateLayer(S) + '</div>';
  }
  function agendaCount(S) { return myVoteMissing().length + (A('a7').status === 'planung_abgeschlossen' ? 1 : 0) + (D('a5').datePoll && !D('a5').datePoll.some((o) => o.ans[ME]) && A('a5').status === 'zu_planen' ? 1 : 0); }

  /* ---------- Anstehend ---------- */
  SCREENS.agenda = (S) => {
    const a7 = A('a7'), a5 = A('a5'), a8 = A('a8');
    const missing = myVoteMissing();
    const myTasks = []; Object.entries(S.detail).forEach(([aid, det]) => det.tasks.forEach((t) => { if (t.who === ME && (!t.done || (S.recentDone || []).includes(t.id))) myTasks.push([aid, t]); }));
    const pollOpen = a5.status === 'zu_planen' && D('a5').datePoll && !D('a5').datePoll.some((o) => o.ans[ME]);
    const n = agendaCount(S) + myTasks.length;
    let body = '<header class="ag-head"><p class="overline">' + esc(M.fmtDay(TODAY, true)) + '</p><h1 class="mega">' + (n ? n + ' Dinge brauchen dich.' : 'Alles erledigt.') + '</h1><div class="ag-switch" role="group" aria-label="Ansicht">' + navA('agenda', 'Liste', {}, ' class="pill-link" aria-current="page"') + navA('calendar', 'Kalender', {}, ' class="pill-link"') + '</div></header>';
    const block = (h, inner, count) => '<section class="ag-block" aria-labelledby="ag-' + h.replace(/\W/g, '') + '"><h2 id="ag-' + h.replace(/\W/g, '') + '" class="ag-h">' + h + (count != null ? '<span class="ag-n">' + count + '</span>' : '') + '</h2>' + inner + '</section>';
    if (a7.status === 'planung_abgeschlossen') body += block('Gestern', '<article class="row-card hl">' + cover(a7, 'cover-xs') + '<div class="li-main"><strong class="disp">' + esc(a7.title) + '</strong><small>Feierabend-Crew · Wie war’s?</small></div>' + (can('complete', a7) ? btn('Als erlebt markieren', 'data-action="complete" data-id="a7" data-k="ag-done"', 'default btn-sm', 'check') : '<span class="small">Gastgeber:in markiert es</span>') + '</article>');
    if (pollOpen) body += block('Termin abstimmen', '<article class="row-card">' + cover(a5, 'cover-xs') + '<div class="li-main"><strong class="disp">' + esc(a5.title) + '</strong><small>3 Wochenenden zur Auswahl · endet So., 8. Nov. ' + newTag() + '</small></div>' + navA('datepoll', 'Antworten', { id: 'a5' }, ' class="btn btn-default btn-sm" data-k="ag-poll"') + '</article>');
    body += block('Deine Stimme fehlt', missing.length ? missing.map((a) => '<article class="row-card">' + cover(a, 'cover-xs') + '<div class="li-main">' + navA('activity', '<strong class="disp">' + esc(a.title) + '</strong>', { id: a.id }, ' class="inline-link"') + '<small>' + a.votes.length + ' von ' + a.need + ' Stimmen · ' + esc(M.DUR[a.dur]) + '</small></div>' + voteBtn(a) + '</article>').join('') : '<p class="small">Überall abgestimmt.</p>', missing.length);
    body += block('Deine Aufgaben', myTasks.length ? myTasks.map(([aid, t]) => '<article class="row-card">' + taskCheck(aid, t) + '<div class="li-main"><strong>' + esc(t.label) + '</strong><small>' + esc(A(aid).title) + (t.due ? ' · bis ' + fmtDay(t.due) : '') + '</small></div></article>').join('') : '<p class="small">Keine offenen Aufgaben.</p>', myTasks.length);
    const soon = S.activities.filter((a) => a.start && a.start >= TODAY && a.status !== 'abgeschlossen').sort((x, y) => x.start.localeCompare(y.start));
    body += block('Bald', soon.map((a) => { const det = D(a.id); return '<article class="row-card">' + '<span class="date-box"><strong>' + Number(a.start.slice(8)) + '</strong><small>' + M.fmtDay(a.start).split(' ').slice(-1)[0] + '</small></span><div class="li-main">' + navA('activity', '<strong class="disp">' + esc(a.title) + '</strong>', { id: a.id }, ' class="inline-link"') + '<small>' + fmtRange(a.start, a.end) + ' · ' + relDay(a.start) + ' · ' + Object.values(det.rsvp).filter((v) => v === 'yes').length + ' dabei</small></div>' + (det.rsvp[ME] ? '<span class="tagline">' + icon('check') + 'Zugesagt</span>' : btn('Zusagen', 'data-action="rsvp" data-id="' + a.id + '" data-val="yes" data-k="ag-rsvp-' + a.id + '"', 'outline btn-sm')) + '</article>'; }).join(''));
    return shell(S, '', body, { kicker: 'Anstehend · alle Gruppen' });
  };

  /* ---------- Gruppe: Fluss ---------- */
  const STAGES = [['vorschlag', 'Ideen'], ['zu_planen', 'Zu planen'], ['in_planung', 'In Planung'], ['planung_abgeschlossen', 'Termin steht'], ['abgeschlossen', 'Erlebt']];
  const FNEXT = {
    vorschlag: (a) => voteBtn(a),
    zu_planen: (a) => can('findDate', a) ? navA('datepoll', icon('calendar') + '<span>Termin abstimmen</span>', { id: a.id }, ' class="btn btn-outline btn-sm" data-k="fx-' + a.id + '"') : navA('datepoll', 'Antworten', { id: a.id }, ' class="btn btn-outline btn-sm"'),
    in_planung: (a) => can('move', a) ? btn('Weiter: Termin steht', 'data-action="moveStatus" data-id="' + a.id + '" data-val="planung_abgeschlossen" data-k="fx-' + a.id + '"', 'outline btn-sm', 'arrowR') : '',
    planung_abgeschlossen: (a) => a.start > TODAY ? '' : can('complete', a) ? btn('Als erlebt markieren', 'data-action="complete" data-id="' + a.id + '" data-k="fx-' + a.id + '"', 'outline btn-sm', 'check') : '',
    abgeschlossen: () => '',
  };
  SCREENS.flow = (S) => {
    const g = group(); const lv = level(g.done);
    const sb = stateBlock(S, 'Die Gruppe');
    S.collapsed = S.collapsed || { abgeschlossen: true };
    let body = '<header class="grp-head"><div><p class="overline">Gruppe</p><h1 class="mega">' + esc(g.name) + '</h1><p class="small">' + g.members + ' Mitglieder · Level ' + lv.cur.n + ' „' + esc(lv.cur.name) + '“ · ' + g.done + ' erlebt</p></div>' + navA('group', icon('users') + '<span>Mitglieder & Einladen</span>', {}, ' class="btn btn-outline btn-sm"') + '</header>';
    if (sb) return shell(S, '', body + sb, { kicker: 'Fluss' });
    const acts = S.ui.state === 'empty' ? [] : S.activities;
    if (!acts.length) return shell(S, '', body + emptyBlock('sparkles', 'Noch keine Ideen', 'Was wolltet ihr schon immer zusammen machen? Ein Titel reicht.', btn('Idee teilen', 'data-action="openModal" data-modal="proposal" data-k="empty-new"', 'default', 'plus')), { kicker: 'Fluss' });
    const sel = S.params.sel;
    body += '<ol class="flow">' + STAGES.map(([s, l], i) => {
      const items = acts.filter((a) => a.status === s); const closed = !!S.collapsed[s];
      return '<li class="stage st-' + s + '"><div class="stage-head"><span class="node" aria-hidden="true">' + (i + 1) + '</span><h2 class="stage-h">' + l + '</h2><span class="ag-n">' + items.length + '</span><button type="button" class="icon-btn sm" data-action="toggleStage" data-val="' + s + '" data-k="stg-' + s + '" aria-expanded="' + !closed + '" aria-label="' + l + (closed ? ' aufklappen' : ' zuklappen') + '">' + icon(closed ? 'chevD' : 'chevR') + '</button></div>' +
        (closed ? '' : '<ul class="stage-list">' + (items.length ? items.map((a) => '<li class="f-card' + (sel === a.id ? ' is-sel' : '') + '">' + cover(a, 'cover-xs') + '<div class="li-main">' + navA('flow', '<strong class="disp">' + esc(a.title) + '</strong>', { sel: a.id }, ' class="inline-link desk-sel"') + navA('activity', '<strong class="disp">' + esc(a.title) + '</strong>', { id: a.id }, ' class="inline-link mob-sel"') + '<small>' + (s === 'vorschlag' ? a.votes.length + '/' + a.need + ' Stimmen · ' : '') + (a.start ? fmtRange(a.start, a.end) + ' · ' : '') + 'Gastgeber:in ' + esc(member(a.by).name) + '</small></div>' + FNEXT[s](a) + '</li>').join('') : '<li class="small stage-empty">Gerade nichts.</li>') + (s === 'vorschlag' ? '<li>' + btn('Idee teilen', 'data-action="openModal" data-modal="proposal" data-k="flow-new"', 'ghost btn-sm', 'plus') + '</li>' : '') + '</ul>') + '</li>';
    }).join('') + '</ol>';
    const split = sel && A(sel) ? '<aside class="split" aria-labelledby="split-h">' + detailBody(S, A(sel), true) + '</aside>' : '<aside class="split split-empty" aria-label="Detail"><p class="small">Wähle eine Aktivität, um sie hier zu sehen.</p></aside>';
    return shell(S, '', body, { kicker: 'Fluss', split });
  };

  /* ---------- Terminabstimmung ---------- */
  const ANS = [['yes', 'Passt', 'check'], ['maybe', 'Passt vielleicht', 'help'], ['no', 'Passt nicht', 'x']];
  SCREENS.datepoll = (S) => {
    const a = A(S.params.id || 'a5') || A('a5'); const det = D(a.id);
    let body = '<header class="grp-head"><div><p class="overline">Terminabstimmung ' + newTag() + '</p><h1 class="mega">' + esc(a.title) + '</h1><p class="small">Gastgeber:in ' + esc(member(a.by).name) + ' · endet So., 8. Nov. · Antworten sieht nur die Gruppe</p></div></header>';
    if (S.ui.state === 'loading' || S.ui.state === 'error') return shell(S, '', body + stateBlock(S, 'Die Terminoptionen'), { kicker: 'Termin', back: true });
    if (a.status !== 'zu_planen') body += '<div class="note">' + icon('check') + '<span>Termin steht: <strong>' + fmtRange(a.start, a.end) + '</strong>.</span></div>';
    const opts = S.ui.state === 'empty' ? [] : (det.datePoll || []);
    if (!opts.length) body += emptyBlock('calendar', 'Noch keine Terminoptionen', 'Die Gastgeber:in schlägt zwei bis drei Zeiträume vor. Alle antworten mit Passt, Passt vielleicht oder Passt nicht.');
    body += '<ul class="opts">' + opts.map((o) => {
      const vals = Object.values(o.ans); const y = vals.filter((v) => v === 'yes').length, m = vals.filter((v) => v === 'maybe').length, nn = vals.filter((v) => v === 'no').length;
      const mine = M.availability(o.start); const hint = mine === 'free' ? 'Dein Kalender: frei' : mine === 'partial' ? 'Dein Kalender: teilweise belegt' : 'Dein Kalender: belegt';
      return '<li class="opt"><div class="opt-top"><p class="opt-date">' + fmtRange(o.start, o.end) + '</p><p class="opt-sum" aria-label="' + y + ' passt, ' + m + ' vielleicht, ' + nn + ' passt nicht"><span class="sum-y">' + icon('check') + y + '</span><span class="sum-m">' + icon('help') + m + '</span><span class="sum-n">' + icon('x') + nn + '</span></p></div>' +
        '<p class="small">' + icon('lock') + ' ' + hint + ' (nur für dich sichtbar)</p><div class="ans" role="group" aria-label="Deine Antwort für ' + fmtRange(o.start, o.end) + '">' + ANS.map(([v, l, ic]) => '<button type="button" class="ans-btn ans-' + v + '" data-action="datePollVote" data-id="' + a.id + '" data-opt="' + o.id + '" data-val="' + v + '" data-k="dp-' + o.id + '-' + v + '" aria-pressed="' + (o.ans[ME] === v) + '">' + icon(ic) + '<span>' + l + '</span></button>').join('') + '</div>' +
        (a.status === 'zu_planen' && can('findDate', a) ? btn('Diesen Termin festlegen', 'data-action="pickDateOption" data-id="' + a.id + '" data-opt="' + o.id + '" data-k="pick-' + o.id + '"', 'default btn-sm', 'check') : '') + '</li>';
    }).join('') + '</ul>';
    if (can('findDate', a)) body += '<div class="row-btns">' + btn('Option hinzufügen', 'data-action="toast" data-msg="Demo: Zeitraum im Kalender wählen und als Option hinzufügen."', 'ghost', 'plus') + navA('datefinder', icon('calendar') + '<span>Ohne Abstimmung direkt festlegen</span>', { id: a.id }, ' class="btn btn-ghost"') + '</div>';
    else body += deny('Festlegen kann die Gastgeber:in oder ein Admin. Du kannst antworten.');
    return shell(S, '', body, { kicker: 'Termin', back: true });
  };


  SCREENS.welcome = (S) => {
    const steps = [
      ['Von der Idee zur Erinnerung.', 'Mellon hilft deiner Freundesgruppe, gemeinsam zu entscheiden, zu planen und festzuhalten – ohne Chaos im Gruppenchat.', 'sparkles'],
      ['Abstimmen statt endlos schreiben.', 'Schlagt Ideen vor und stimmt mit einem Tipp ab. Ab der Schwelle geht’s in die Planung.', 'heart'],
      ['Planen, zusagen, festhalten.', 'Termin finden, Aufgaben verteilen, zusagen – und danach landet alles als Memory Card in eurem Album.', 'camera'],
    ];
    const i = Math.min(S.onboardStep, 2); const [h, p, ic] = steps[i];
    return '<div class="auth"><main id="main" class="auth-card" tabindex="-1">' +
      '<div class="auth-logo">' + window.MELLON_LOGO + '</div>' +
      '<div class="onb-art onb-' + i + '" aria-hidden="true"><span class="cover cover-green">' + icon(ic) + '</span><span class="cover cover-gold">' + icon('heart') + '</span><span class="cover cover-blush">' + icon('star') + '</span></div>' +
      '<p class="overline">Schritt ' + (i + 1) + ' von 3</p><h1 class="display">' + h + '</h1><p class="lead">' + p + '</p>' +
      '<div class="dots" aria-hidden="true">' + [0, 1, 2].map((x) => '<span class="' + (x === i ? 'on' : '') + '"></span>').join('') + '</div>' +
      '<div class="auth-actions">' + (i < 2 ? btn('Weiter', 'data-action="onboardNext" data-k="onb-next"', 'default', 'arrowR') : navA('login', 'Los geht’s', {}, ' class="btn btn-default" data-k="onb-next"')) +
      (i > 0 ? btn('Zurück', 'data-action="onboardBack" data-k="onb-back"', 'ghost') : navA('login', 'Überspringen', {}, ' class="btn btn-ghost"')) + '</div></main></div>';
  };

  SCREENS.login = (S) => {
    const e = S.errors, sign = S.authTab === 'signup';
    const tabs = '<div class="seg" role="group" aria-label="Anmelden oder registrieren">' + [['login', 'Anmelden'], ['signup', 'Registrieren']].map(([v, l]) => '<button type="button" data-action="authTab" data-val="' + v + '" data-k="tab-' + v + '" aria-pressed="' + (S.authTab === v) + '">' + l + '</button>').join('') + '</div>';
    return '<div class="auth"><main id="main" class="auth-card" tabindex="-1"><div class="auth-logo">' + window.MELLON_LOGO + '</div>' +
      '<h1 class="display-s">' + (sign ? 'Konto erstellen' : 'Willkommen zurück') + '</h1>' + tabs +
      '<form data-form="login" novalidate class="form">' +
      (sign ? field('f-name', 'Name <span class="opt">(optional)</span>', '<input name="name" autocomplete="nickname" ' + inputAttrs('f-name') + '>') : '') +
      field('f-email', 'E-Mail', '<input name="email" type="email" autocomplete="email" value="' + esc(S.formDraft.email || '') + '" ' + inputAttrs('f-email', e.email) + '>', e.email) +
      field('f-password', 'Passwort', '<input name="password" type="password" autocomplete="' + (sign ? 'new-password' : 'current-password') + '" ' + inputAttrs('f-password', e.password, 'Mindestens 8 Zeichen. Einfügen aus dem Passwort-Manager ist erlaubt.') + '>', e.password, 'Mindestens 8 Zeichen. Einfügen aus dem Passwort-Manager ist erlaubt.') +
      (sign ? '<div class="field consent' + (e.terms ? ' has-err' : '') + '"><label><input type="checkbox" name="terms" id="f-terms" data-k="f-terms"' + (e.terms ? ' aria-invalid="true" aria-describedby="f-terms-err"' : '') + '> Ich habe die <button type="button" class="link" data-action="toast" data-msg="Demo: öffnet die Datenschutzhinweise.">Datenschutzhinweise</button> und <button type="button" class="link" data-action="toast" data-msg="Demo: öffnet die Nutzungsbedingungen.">Nutzungsbedingungen</button> gelesen.</label>' + (e.terms ? '<p class="err" id="f-terms-err">' + icon('alert') + esc(e.terms) + '</p>' : '') + '</div>' : '') +
      '<button class="btn btn-default btn-block" type="submit" data-k="submit">' + (sign ? 'Konto erstellen' : 'Anmelden') + '</button>' +
      (sign ? '<p class="hint center">Wir schicken dir eine Bestätigungs-Mail.</p>' : '<p class="center"><button type="button" class="link" data-action="toast" data-msg="Demo: Link zum Zurücksetzen wurde verschickt.">Passwort vergessen?</button></p>') +
      '</form><div class="divider"><span>oder</span></div>' +
      '<div class="sso">' + btn('Mit Apple fortfahren', 'data-action="ssoLogin" data-val="Apple"', 'outline') + btn('Mit Google fortfahren', 'data-action="ssoLogin" data-val="Google"', 'outline') + '</div>' +
      '<p class="hint center">Schon eine Einladung? ' + navA('join', 'Mit Code beitreten', {}, ' class="link"') + '</p></main></div>';
  };

  SCREENS.join = (S) => {
    const e = S.errors;
    return '<div class="auth"><main id="main" class="auth-card" tabindex="-1"><div class="auth-logo">' + window.MELLON_LOGO + '</div>' +
      '<h1 class="display-s">Gruppe beitreten</h1><p class="lead">Gib den Code ein, den dir jemand aus der Gruppe geschickt hat.</p>' +
      '<form data-form="join" novalidate class="form">' + field('f-code', 'Einladungs-Code', '<input name="code" class="code-input" maxlength="10" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(S.formDraft.code || '') + '" ' + inputAttrs('f-code', e.code, 'Zehn Zeichen. Demo-Code: LAUFNORD24') + '>', e.code, 'Zehn Zeichen. Demo-Code: LAUFNORD24') +
      '<button class="btn btn-default btn-block" type="submit" data-k="submit">Beitreten</button></form>' +
      '<div class="proposal-box"><div class="pb-head">' + icon('link') + '<h2>Per Link beitreten</h2>' + propTag() + '</div>' +
      '<p>Gibt es noch nicht. Vorschlag: Ein Tipp auf den Einladungs-Link öffnet Mellon direkt hier – mit Vorschau, bevor du beitrittst.</p>' +
      '<div class="invite-preview"><span class="cover cover-green" aria-hidden="true">' + icon('users') + '</span><div><strong class="serif">Laufgruppe Nord</strong><small>Einladung per Link · Mitglieder siehst du nach dem Beitritt</small></div></div>' +
      btn('Vorschau: Beitreten per Link', 'data-action="toast" data-msg="Vorschlag: Nach dem Tipp wärst du direkt Mitglied – ohne Code abzutippen."', 'outline') + '</div>' +
      '<p class="center">' + navA('agenda', 'Später – erst einmal umsehen', {}, ' class="link"') + '</p></main></div>';
  };

  SCREENS.group = (S) => {
    const g = group(); const lv = level(g.done); const isAdmin = can('manageMembers');
    let body = '<p class="lead">' + g.members + ' Mitglieder · ' + g.done + ' gemeinsame Aktivitäten</p>';
    body += '<section class="card mom-card"><p class="overline">Gruppen-Momentum</p><h2 class="serif">Level ' + lv.cur.n + ': ' + esc(lv.cur.name) + '</h2>' + (lv.next ? '<span class="bar bar-lg" role="img" aria-label="' + g.done + ' von ' + lv.next.from + '"><span style="width:' + Math.round((g.done - lv.cur.from) / (lv.next.from - lv.cur.from) * 100) + '%"></span></span><p class="small">Noch ' + (lv.next.from - g.done) + ' gemeinsame Aktivität' + (lv.next.from - g.done === 1 ? '' : 'en') + ' bis „' + esc(lv.next.name) + '“. Kein Zeitdruck – euer Fortschritt verfällt nicht.</p>' : '') + '</section>';
    body += '<section class="card" aria-labelledby="inv-h">' + sectionHead('<span id="inv-h">Freunde einladen</span>') +
      '<p class="overline">Einladungs-Code</p><div class="code-row"><code class="code">' + esc(g.code) + '</code>' + btn('Kopieren', 'data-action="copyCode" data-k="copy"', 'outline', 'copy') + '</div>' +
      (isAdmin ? btn('Neuen Code erzeugen', 'data-action="openModal" data-modal="regen" data-k="regen"', 'ghost', 'refresh') : deny('Nur Admins können den Code erneuern.')) +
      '<div class="proposal-box"><div class="pb-head">' + icon('share') + '<h3>Einladungs-Link teilen</h3>' + propTag() + '</div><p>Gibt es noch nicht. Vorschlag: persönlicher Link, 7 Tage gültig, jederzeit widerrufbar. Öffnet die App direkt in der Gruppe; ohne App die Web-Version.</p>' +
      '<div class="share-row">' + btn(S.shareCopied ? 'Link verschickt (Demo)' : 'Link teilen', 'data-action="shareLink" data-k="share"', 'default', 'share') + '<span class="qr-box">' + M.qr(11) + '<small>QR-Code zum Scannen</small></span></div></div></section>';
    body += '<section class="card" aria-labelledby="mem-h">' + sectionHead('<span id="mem-h">Mitglieder</span>') + '<ul class="members">' +
      M.members.map((m) => '<li>' + av(m.id) + '<span class="li-main"><strong>' + esc(m.name) + (m.id === ME ? ' (du)' : '') + '</strong><small>' + (m.cal ? 'Kalender verbunden' : 'Kein Kalender verbunden') + '</small></span>' + (m.id !== ME ? '<button type="button" class="icon-btn sm" data-action="openModal" data-modal="reportMenu" data-id="Mitglied" data-k="mm-' + m.id + '" aria-label="Optionen für ' + esc(m.name) + '">' + icon('more') + '</button>' : '') +
        (isAdmin && m.id !== ME ? '<label class="sr-only" for="role-' + m.id + '">Rolle von ' + esc(m.name) + '</label><select id="role-' + m.id + '" data-k="role-' + m.id + '" data-change="setRole" data-id="' + m.id + '" class="select-sm">' + [['admin', 'Admin'], ['editor', 'Mitglied']].map(([k, l]) => '<option value="' + k + '"' + ((m.role === 'admin' ? 'admin' : 'editor') === k ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>' : '<span class="role role-' + (m.role === 'admin' || (m.id === ME && S.ui.role === 'admin') ? 'admin' : 'editor') + '">' + (m.id === ME ? (S.ui.role === 'admin' ? 'Admin' : 'Mitglied') : MROLE[m.role]) + '</span>') + '</li>').join('') + '</ul>' +
      '<p class="small">Neu: Es gibt nur noch Admin und Mitglied. Gastgeber:in ist man je Aktivität. Frühere Beobachter:innen sind jetzt Mitglieder.</p>' + btn('Gruppe verlassen', 'data-action="toast" data-msg="Demo: Mindestens ein Admin muss bleiben. Übertrage vorher deine Rechte."', 'ghost', 'logout') + '</section>';
    return shell(S, 'Mitglieder & Einladen', body, { kicker: g.name, back: true });
  };

  function voteBtn(a) {
    const voted = a.votes.includes(ME);
    return '<button type="button" class="heart' + (voted ? ' on' : '') + (online() ? '' : ' is-off') + '" data-action="vote" data-id="' + a.id + '" data-k="vote-' + a.id + '" aria-pressed="' + voted + '" aria-label="Für „' + esc(a.title) + '“ stimmen, ' + a.votes.length + ' von ' + a.need + '">' + icon('heart') + '</button>';
  }
  function proposalCard(a) {
    const pct = Math.min(100, Math.round(a.votes.length / a.need * 100));
    return '<li class="p-card">' + cover(a, 'cover-thumb') + '<div class="p-main">' + navA('activity', '<span class="serif p-title">' + esc(a.title) + '</span>', { id: a.id }, ' class="p-link"') +
      '<p class="small">von ' + esc(member(a.by).name) + ' ' + '<span class="cat">' + esc(M.DUR[a.dur]) + '</span></p>' +
      '<div class="progress"><span class="bar" aria-hidden="true"><span style="width:' + pct + '%"></span></span><span class="small"><strong>' + a.votes.length + '/' + a.need + '</strong> Stimmen</span></div></div>' + voteBtn(a) + '</li>';
  }

  function rsvpBtns(id, det) {
    const me = det.rsvp[ME];
    return [['yes', 'Bin dabei', 'check'], ['maybe', 'Vielleicht', 'help'], ['no', 'Kann nicht', 'x']].map(([v, l, ic]) => '<button type="button" class="rsvp-btn rsvp-' + v + '" data-action="rsvp" data-id="' + id + '" data-val="' + v + '" data-k="rsvp-' + id + '-' + v + '" aria-pressed="' + (me === v) + '">' + icon(ic) + '<span>' + l + '</span></button>').join('');
  }
  function taskCheck(aid, t) {
    return '<button type="button" role="checkbox" class="check' + (t.done ? ' on' : '') + '" aria-checked="' + t.done + '" data-action="toggleTask" data-id="' + aid + '" data-task="' + t.id + '" data-k="task-' + t.id + '" aria-label="' + esc(t.label) + (t.done ? ' – erledigt' : ' – offen') + '">' + icon('check') + '</button>';
  }

  function detailBody(S, a, inSplit) {
    const sb = stateBlock(S, 'Die Aktivität');
    if (sb) return sb;
    const hT = inSplit ? 'h2 id="split-h" tabindex="-1"' : 'h1';
    const empty = S.ui.state === 'empty';
    const det = empty ? { tasks: [], polls: [], comments: [], rsvp: {} } : D(a.id);
    const yes = Object.keys(det.rsvp).filter((k) => det.rsvp[k] === 'yes'); const maybe = Object.keys(det.rsvp).filter((k) => det.rsvp[k] === 'maybe').length; const no = Object.keys(det.rsvp).filter((k) => det.rsvp[k] === 'no').length;
    const done = det.tasks.filter((t) => t.done).length;
    let hero = '<div class="hero cover-' + a.cover + '"><span class="hero-ic" aria-hidden="true">' + icon(COVER_ICON[a.cover]) + '</span><div class="hero-in">' + statusChip(a.status) + '<' + hT + ' class="display-s hero-title">' + esc(a.title) + '</' + hT.split(' ')[0] + '><p>' + icon('calendar') + fmtRange(a.start, a.end) + (a.place ? ' · ' + icon('pin') + esc(a.place) : '') + '</p></div></div>';
    let main = '';
    if (a.status === 'planung_abgeschlossen' && a.start < TODAY) main += '<section class="card impulse"><div><p class="overline">Vorbei</p><h2 class="serif">Wie war’s?</h2><p>Markiere sie als erlebt – dann entsteht die Erinnerung im Album.</p>' + (can('complete', a) ? btn('Als erlebt markieren', 'data-action="complete" data-id="' + a.id + '" data-k="act-complete"', 'default', 'check') : deny('Als erlebt markiert es die Gastgeber:in oder ein Admin.')) + '</div></section>';
    main += '<div class="title-row"><p class="lead">' + esc(a.desc || '') + '</p><button type="button" class="icon-btn sm" data-action="openModal" data-modal="reportMenu" data-id="' + (a.status === 'vorschlag' ? 'Vorschlag' : 'Aktivität') + '" data-k="act-menu" aria-label="Optionen: melden oder ausblenden">' + icon('more') + '</button></div><p class="small host-line">' + av(a.by, 'xs') + 'Gastgeber:in ' + esc(member(a.by).name) + ' · ' + esc(M.DUR[a.dur]) + '</p>' + (S.ui.role === 'member' ? '<p class="small">Gastgeber:in wird man, wenn die Rolle frei ist oder ein Admin dich einträgt.</p>' : '');
    if (a.status === 'vorschlag') main += '<section class="card"><h2>Abstimmung</h2><div class="progress"><span class="bar bar-lg" aria-hidden="true"><span style="width:' + Math.min(100, Math.round(a.votes.length / a.need * 100)) + '%"></span></span><span><strong>' + a.votes.length + ' von ' + a.need + '</strong> Stimmen bis zur Planung</span></div>' + voteBtn(a) + '</section>';
    // Verantwortlichkeiten
    main += '<section class="card" aria-labelledby="t-h">' + sectionHead('<span id="t-h">Verantwortlichkeiten</span>', det.tasks.length ? '<span class="small">' + done + ' von ' + det.tasks.length + ' erledigt</span>' : '') + (det.tasks.length ? '<p class="small">' + newTag() + ' Fälligkeit und „Übernehmen“ sind neu.</p>' : '') +
      (det.tasks.length ? '<span class="bar" aria-hidden="true"><span style="width:' + Math.round(done / det.tasks.length * 100) + '%"></span></span><ul class="tasks">' + det.tasks.map((t) => '<li class="task-row' + (t.done ? ' is-done' : '') + '">' + taskCheck(a.id, t) + '<span class="li-main"><strong>' + esc(t.label) + '</strong><small>' + (t.who ? av(t.who, 'xs') + esc(member(t.who).name) : 'Noch niemand') + (t.due ? ' · bis ' + fmtDay(t.due) : '') + '</small></span>' + (!t.who ? btn('Übernehmen', 'data-action="claimTask" data-id="' + a.id + '" data-task="' + t.id + '" data-k="claim-' + t.id + '"', 'outline btn-sm', 'plus') : '') + '</li>').join('') + '</ul>'
        : '<p class="small">Noch keine Aufgaben. Wer kümmert sich um was?</p>') +
      (['in_planung', 'planung_abgeschlossen'].includes(a.status) || empty ? (can('addTask') ? btn('Aufgabe hinzufügen', 'data-action="openModal" data-modal="task" data-id="' + a.id + '" data-k="add-task"', 'ghost', 'plus') : '') : '') + '</section>';
    // Umfragen
    main += '<section class="card" aria-labelledby="p-h">' + sectionHead('<span id="p-h">Umfragen</span>') + (det.polls.length ? det.polls.map((p) => pollCard(a.id, p)).join('') : '<p class="small">Noch keine Umfrage. Fragt die Gruppe, was ihr lieber mögt.</p>') +
      (can('poll') ? btn('Umfrage starten', 'data-action="openModal" data-modal="poll" data-id="' + a.id + '" data-k="add-poll"', 'ghost', 'plus') : '') + '</section>';
    // Fotos
    if (a.status === 'abgeschlossen') main += '<section class="card"><h2>Erinnerungsfotos</h2><div class="photos">' + Array.from({ length: a.photos || 0 }, (_, i) => '<span class="photo cover-' + ['green', 'gold', 'blush'][i % 3] + '" role="img" aria-label="Foto ' + (i + 1) + ' (Platzhalter)">' + icon('image') + '</span>').join('') + '</div>' + '<div class="row-btns">' + btn('Fotos hinzufügen', 'data-action="toast" data-msg="Demo: Fotoauswahl öffnet sich (bis 5 Bilder)."', 'ghost', 'camera') + btn('Foto melden', 'data-action="openModal" data-modal="reportMenu" data-id="Foto" data-k="photo-rep"', 'ghost', 'alert') + '</div></section>';
    // Kommentare
    main += '<section class="card" aria-labelledby="c-h">' + sectionHead('<span id="c-h">Kommentare</span>', '<span class="small">' + det.comments.length + '</span>') +
      (det.comments.length ? '<ul class="comments">' + det.comments.map((c) => '<li>' + av(c.by) + '<div class="c-body"><p class="c-meta"><strong>' + esc(member(c.by).name) + '</strong> <span class="small">' + esc(c.at) + '</span></p><p class="c-text">' + esc(c.text).replace(/@(\w+)/g, '<span class="mention">@$1</span>') + '</p></div>' +
        (c.by !== ME ? '<button type="button" class="icon-btn sm" data-action="openModal" data-modal="commentMenu" data-id="' + c.id + '" data-k="cm-' + c.id + '" aria-label="Optionen für Kommentar von ' + esc(member(c.by).name) + '">' + icon('more') + '</button>' : '') + '</li>').join('') + '</ul>' : '<p class="small">Noch keine Kommentare. Fang das Gespräch an.</p>') +
      '<form data-form="comment" data-id="' + a.id + '" class="composer" novalidate><label for="f-comment" class="sr-only">Kommentar schreiben</label><textarea id="f-comment" data-k="f-comment" name="text" rows="2" placeholder="Schreib etwas … @ erwähnt jemanden"' + (S.errors.comment ? ' aria-invalid="true" aria-describedby="f-comment-err"' : '') + '></textarea><button class="btn btn-default" type="submit" data-k="send">Senden</button></form>' + (S.errors.comment ? '<p class="err" id="f-comment-err">' + icon('alert') + esc(S.errors.comment) + '</p>' : '') + '</section>';
    // Seitenleiste: Zusage + Termin
    let side = '';
    if (['zu_planen', 'in_planung', 'planung_abgeschlossen'].includes(a.status)) {
      side += '<section class="card" aria-labelledby="r-h"><h2 id="r-h">Bist du dabei? ' + newTag() + '</h2><div class="rsvp">' + rsvpBtns(a.id, det) + '</div><p class="small rsvp-sum">' + (yes.length ? avStack(yes) : '') + '<span><strong>' + yes.length + ' dabei</strong>' + (maybe ? ' · ' + maybe + ' vielleicht' : '') + (no ? ' · ' + no + ' können nicht' : '') + '</span></p></section>';
    }
    side += '<section class="card" aria-labelledby="d-h"><h2 id="d-h">Termin</h2>' + (a.start ? '<p class="date-big">' + icon('calendar') + '<span>' + fmtRange(a.start, a.end) + '</span></p>' + (a.status !== 'abgeschlossen' ? btn('Zum Kalender hinzufügen', 'data-action="toast" data-msg="Demo: Kalenderdatei (.ics) wird heruntergeladen."', 'outline', 'download') : '') : '<p class="small">Noch kein Termin.</p>') +
      (a.status !== 'abgeschlossen' && a.status !== 'vorschlag' ? (a.status === 'zu_planen' ? navA('datepoll', icon('calendar') + '<span>Zur Terminabstimmung</span>', { id: a.id }, ' class="btn btn-ghost"') : can('findDate', a) ? navA('datefinder', icon('calendar') + '<span>Termin anpassen</span>', { id: a.id }, ' class="btn btn-ghost"') : deny('Den Termin legt die Gastgeber:in ' + esc(member(a.by).name) + ' oder ein Admin fest.')) : '') +
      (a.start && a.status !== 'abgeschlossen' ? '<div class="proposal-box slim"><div class="pb-head">' + icon('bell') + '<h3>Vorab-Hinweis</h3>' + propTag() + '</div><div class="sw-row"><span>Einen Tag vorher erinnern</span>' + sw(!!S.reminders.r_date, 'data-action="toggleReminder" data-ev="r_date" data-k="rem-act"', 'Einen Tag vorher erinnern') + '</div></div>' : '') + '</section>';
    return (inSplit ? navA('activity', icon('arrowR') + '<span>Ganze Seite öffnen</span>', { id: a.id }, ' class="btn btn-ghost btn-sm split-open"') : '') + hero + '<div class="detail-grid' + (inSplit ? ' in-split' : '') + '"><div class="detail-main">' + main + '</div><aside class="detail-side" aria-label="Zusage und Termin">' + side + '</aside></div>';
  }
  SCREENS.activity = (S) => { const a = A(S.params.id || 'a6') || A('a6'); return shell(S, '', detailBody(S, a, false), { kicker: st(a.status), back: true, wide: true }); };


  function pollCard(aid, p) {
    const total = Math.max(1, new Set(p.options.flatMap((o) => o.votes)).size);
    return '<div class="poll"><div class="poll-head"><p class="poll-q serif">' + esc(p.q) + '</p><button type="button" class="icon-btn sm" data-action="openModal" data-modal="reportMenu" data-id="Umfrage" data-k="pm-' + p.id + '" aria-label="Optionen für Umfrage">' + icon('more') + '</button></div><p class="small">Mehrfachauswahl · ' + total + ' haben abgestimmt</p><ul>' + p.options.map((o) => { const on = o.votes.includes(ME); const pct = Math.round(o.votes.length / total * 100); return '<li><button type="button" class="poll-opt' + (on ? ' on' : '') + '" data-action="pollVote" data-id="' + aid + '" data-poll="' + p.id + '" data-opt="' + o.id + '" data-k="po-' + o.id + '" aria-pressed="' + on + '"><span class="po-fill" style="width:' + pct + '%" aria-hidden="true"></span><span class="po-check" aria-hidden="true">' + icon('check') + '</span><span class="po-label">' + esc(o.label) + '</span><span class="po-n">' + o.votes.length + '</span></button></li>'; }).join('') + '</ul></div>';
  }

  function monthView(S, opts) {
    const g = M.monthGrid(S.calMonth); const atMin = opts && opts.minMonth && S.calMonth <= opts.minMonth;
    const events = {}; S.activities.forEach((a) => { if (a.start && a.status !== 'vorschlag') { let x = a.start; while (x <= a.end) { (events[x] = events[x] || []).push(a); const dd = new Date(x + 'T00:00:00Z'); dd.setUTCDate(dd.getUTCDate() + 1); x = dd.toISOString().slice(0, 10); } } });
    const head = '<div class="cal-head"><button type="button" class="icon-btn" data-action="calMonth" data-val="-1" data-k="cm-prev" aria-label="Vorheriger Monat"' + (atMin ? ' disabled' : '') + '>' + icon('chevL') + '</button><h2 class="cal-title" aria-live="polite">' + g.label + '</h2><button type="button" class="icon-btn" data-action="calMonth" data-val="1" data-k="cm-next" aria-label="Nächster Monat">' + icon('chevR') + '</button></div>';
    const wd = '<div class="cal-wd" aria-hidden="true">' + ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((x) => '<span>' + x + '</span>').join('') + '</div>';
    const cells = g.cells.map((day) => {
      if (!day) return '<span class="cal-c empty" aria-hidden="true"></span>';
      const n = Number(day.slice(8));
      if (opts && opts.finder) return opts.finder(day, n);
      const ev = events[day];
      return '<span class="cal-c' + (day === TODAY ? ' today' : '') + (ev ? ' has-ev' : '') + '"' + (ev ? ' title="' + esc(ev.map((e) => e.title).join(', ')) + '"' : '') + '><span>' + n + '</span>' + (ev ? '<i class="ev-dot" aria-hidden="true"></i><span class="sr-only">: ' + esc(ev.map((e) => e.title).join(', ')) + '</span>' : '') + '</span>';
    }).join('');
    return head + wd + '<div class="cal-grid">' + cells + '</div>';
  }

  SCREENS.calendar = (S) => {
    const sb = stateBlock(S, 'Termine');
    let body = '<p class="lead">Eure Termine und was noch einen braucht.</p>';
    if (sb) return shell(S, 'Kalender', body + sb, { kicker: 'Anstehend' });
    const acts = S.ui.state === 'empty' ? [] : S.activities;
    const upcoming = acts.filter((a) => a.start && a.end >= TODAY && a.status !== 'abgeschlossen').sort((x, y) => x.start.localeCompare(y.start));
    const noDate = acts.filter((a) => a.status === 'zu_planen');
    body += '<div class="grid-2 cal-layout"><section class="card">' + monthView(S) + '</section><div>';
    body += '<section class="card" aria-labelledby="up-h">' + sectionHead('<span id="up-h">Kommende Termine</span>') + (upcoming.length ? upcoming.map((a) => { const det = D(a.id); const y = Object.values(det.rsvp).filter((v) => v === 'yes').length; return navA('activity', '<span class="date-box"><strong>' + Number(a.start.slice(8)) + '</strong><small>' + M.fmtDay(a.start).split(' ').slice(-1)[0] + '</small></span><span class="li-main"><strong class="serif">' + esc(a.title) + '</strong><small>' + fmtRange(a.start, a.end) + ' · ' + relDay(a.start) + ' · ' + y + ' dabei</small></span>' + icon('chevR'), { id: a.id }, ' class="list-row"'); }).join('') : emptyBlock('calendar', 'Keine Termine', 'Sobald ein Termin steht, siehst du ihn hier.')) + '</section>';
    body += '<section class="card" aria-labelledby="nd-h">' + sectionHead('<span id="nd-h">Braucht einen Termin</span>') + (noDate.length ? noDate.map((a) => '<div class="list-row static">' + cover(a, 'cover-xs') + '<span class="li-main"><strong class="serif">' + esc(a.title) + '</strong><small>' + st(a.status) + '</small></span>' + navA('datepoll', 'Abstimmen', { id: a.id }, ' class="btn btn-default btn-sm"') + '</div>').join('') : '<p class="small">Alles terminiert.</p>') + '</section>';
    body += '<section class="card"><h2>Dein Kalender</h2><p class="small">' + icon('check') + ' Google Kalender verbunden. Die Gruppe sieht nur „frei“ oder „belegt“, nie Termintitel.</p>' + btn('Tage blockieren', 'data-action="toast" data-msg="Demo: Hier markierst du Tage, an denen du nicht kannst."', 'outline', 'calendar') + '</section>';
    body += '</div></div>';
    return shell(S, 'Kalender', '<div class="ag-switch" role="group" aria-label="Ansicht">' + navA('agenda', 'Liste', {}, ' class="pill-link"') + navA('calendar', 'Kalender', {}, ' class="pill-link" aria-current="page"') + '</div>' + body, { kicker: 'Anstehend · alle Gruppen', wide: true });
  };

  function bestRanges() {
    const out = [];
    for (let i = 0; i < 61; i++) { const dd = new Date(Date.UTC(2026, 10, 2 + i)); if (dd.getUTCDay() !== 6) continue; const a0 = dd.toISOString().slice(0, 10); const e0 = new Date(dd.getTime() + 86400000).toISOString().slice(0, 10); const sc = { free: 4, partial: 3, busy: 1 }; const v = Math.min(sc[M.availability(a0)] || 0, sc[M.availability(e0)] || 0); out.push({ a0, e0, v }); }
    return out.sort((x, y) => y.v - x.v || x.a0.localeCompare(y.a0)).slice(0, 3);
  }
  const AV = { free: ['Alle frei', 'check'], partial: ['Teilweise frei', 'help'], busy: ['Viele belegt', 'x'], past: ['Vergangen', ''], unknown: ['Unbekannt', 'help'] };
  SCREENS.datefinder = (S) => {
    const a = A(S.params.id || 'a5') || A('a5');
    const allowed = can('findDate', a); S.myBlocks = S.myBlocks || [];
    if (S.calMonth < '2026-11') S.calMonth = '2026-11';
    const sel = S.dateSel;
    const inSel = (day) => sel.start && (day === sel.start || (sel.end && day >= sel.start && day <= sel.end));
    const finder = (day, n) => {
      const av0 = M.availability(day); const mine = S.myBlocks.includes(day);
      const avl = mine ? 'busy' : av0; const past = av0 === 'past';
      const free = avl === 'free' ? 4 : avl === 'partial' ? 3 : avl === 'busy' ? 1 : 0;
      const label = M.fmtDay(day, true) + ': ' + (past ? 'vergangen' : AV[avl][0] + ', ' + free + ' von 4 mit Kalender frei' + (mine ? ', von dir blockiert' : '')) + (inSel(day) ? ', ausgewählt' : '');
      return '<button type="button" class="cal-c av av-' + avl + (inSel(day) ? ' sel' : '') + (mine ? ' mine' : '') + '" ' + (past ? 'disabled ' : '') + 'data-action="' + (S.blockMode ? 'toggleBlock' : 'pickDay') + '" data-day="' + day + '" data-k="d-' + day + '" aria-label="' + label + '" aria-pressed="' + (S.blockMode ? mine : !!inSel(day)) + '"><span>' + n + '</span>' + (past ? '' : '<i aria-hidden="true">' + (AV[avl][1] ? icon(AV[avl][1]) : '') + '</i>') + '</button>';
    };
    let body = '<p class="lead">' + esc(a.title) + ' · ' + esc(M.DUR[a.dur]) + '</p>';
    if (S.ui.state === 'loading' || S.ui.state === 'error') return shell(S, 'Termin direkt festlegen', body + stateBlock(S, 'Verfügbarkeiten'), { kicker: 'Termin', back: true });
    body += '<div class="note">' + icon('users') + '<span><strong>2 von 6</strong> Mitgliedern haben keinen Kalender verbunden. Ihre Verfügbarkeit ist unbekannt.</span></div>';
    body += '<div class="legend" aria-label="Legende">' + ['free', 'partial', 'busy'].map((k) => '<span class="lg lg-' + k + '"><i>' + icon(AV[k][1]) + '</i>' + AV[k][0] + '</span>').join('') + '</div>';
    body += '<div class="seg" role="group" aria-label="Modus">' + '<button type="button" data-action="setBlockMode" data-val="0" data-k="bm-0" aria-pressed="' + !S.blockMode + '">' + (allowed ? 'Zeitraum wählen' : 'Überblick') + '</button><button type="button" data-action="setBlockMode" data-val="1" data-k="bm-1" aria-pressed="' + !!S.blockMode + '">Meine „Kann nicht“-Tage</button></div>';
    if (S.blockMode) body += '<p class="small">Tippe Tage an, an denen du nicht kannst. Die Gruppe sieht nur die Summe, nicht deinen Grund.</p>';
    else if (!allowed) body += deny('Festlegen kann die Gastgeber:in ' + member(a.by).name + ' oder ein Admin. Du kannst deine „Kann nicht“-Tage markieren.');
    else body += '<p class="small">Tippe auf den ersten und den letzten Tag. Ein Tag allein ist auch möglich.</p>';
    if (!S.blockMode) body += '<section class="card" aria-labelledby="best-h"><h2 id="best-h">Beste Zeiträume</h2><p class="small">Wochenenden, an denen die meisten mit Kalender frei sind. 2 ohne Kalender sind nicht eingerechnet.</p><ul class="best">' + bestRanges().map((b, i) => '<li><button type="button" class="best-btn" data-action="pickRange" data-start="' + b.a0 + '" data-end="' + b.e0 + '" data-k="best-' + i + '" aria-pressed="' + (S.dateSel.start === b.a0 && S.dateSel.end === b.e0) + '"><strong>' + fmtRange(b.a0, b.e0) + '</strong><span>' + icon(b.v === 4 ? 'check' : 'help') + b.v + ' von 4 mit Kalender frei</span></button></li>').join('') + '</ul></section>';
    body += '<section class="card cal-card">' + monthView(S, { finder, minMonth: '2026-11' }) + '</section>';
    if (S.errors.date) body += '<p class="err" role="alert">' + icon('alert') + esc(S.errors.date) + '</p>';
    body += '<div class="sticky-cta"><p><span class="small">Gewählt</span><strong>' + (sel.start ? fmtRange(sel.start, sel.end || sel.start) : 'Noch nichts') + '</strong></p>' + (allowed && !S.blockMode ? btn('Termin festlegen', 'data-action="confirmDate" data-id="' + a.id + '" data-k="confirm"' + (online() ? '' : ' aria-disabled="true"'), 'default', 'check') : '') + '</div>';
    return shell(S, 'Termin direkt festlegen', body, { kicker: 'Termin', back: true });
  };

  const NICON = { mention: 'message', new_proposal: 'sparkles', umfrage_erstellt: 'list', now_planning: 'board', responsibility: 'check', date_set: 'calendar' };
  function notifTabs(S) { return '<div class="seg" role="group" aria-label="Ansicht">' + navA('notifications', 'Postfach', {}, ' class="seg-a"' + (S.route === 'notifications' ? ' aria-current="page"' : '')) + navA('notifsettings', 'Einstellungen', {}, ' class="seg-a"' + (S.route === 'notifsettings' ? ' aria-current="page"' : '')) + '</div>'; }
  SCREENS.notifications = (S) => {
    const sb = stateBlock(S, 'Benachrichtigungen');
    let body = '<div class="title-row">' + notifTabs(S) + (unread(S) ? btn('Alle als gelesen markieren', 'data-action="markAllRead" data-k="readall"', 'ghost btn-sm', 'check') : '') + '</div>';
    if (sb) return shell(S, 'Benachrichtigungen', body + sb, { kicker: 'Alle Gruppen', back: true });
    const list = S.ui.state === 'empty' ? [] : S.notifications;
    if (!list.length) body += emptyBlock('bell', 'Alles ruhig', 'Neues aus deinen Gruppen landet hier – auch wenn Push und E-Mail aus sind.');
    else {
      const row = (n) => '<li><button type="button" class="n-row' + (n.unread ? ' unread' : '') + '" data-action="openNotif" data-id="' + n.id + '" data-k="n-' + n.id + '"><span class="n-ic">' + icon(NICON[n.type]) + '</span><span class="li-main"><span class="n-text">' + esc(n.text) + '</span><small>' + esc(n.at) + ' · Feierabend-Crew</small></span>' + (n.unread ? '<span class="unread-dot"><span class="sr-only">ungelesen</span></span>' : '') + '</button></li>';
      const nu = list.filter((n) => n.unread), old = list.filter((n) => !n.unread);
      body += (nu.length ? '<h2 class="list-h">Neu</h2><ul class="n-list card">' + nu.map(row).join('') + '</ul>' : '') + (old.length ? '<h2 class="list-h">Früher</h2><ul class="n-list card">' + old.map(row).join('') + '</ul>' : '');
    }
    body += '<div class="proposal-box"><div class="pb-head">' + icon('clock') + '<h2>Vorab-Hinweise</h2>' + propTag() + '</div><p>Gibt es noch nicht. So könnte ein Hinweis vor dem Termin aussehen:</p><div class="n-row static"><span class="n-ic">' + icon('bell') + '</span><span class="li-main"><span class="n-text">Morgen: Kinoabend im Programmkino. 2 haben zugesagt.</span><small>Vorab-Hinweis · Vorschlag</small></span></div>' + navA('notifsettings', 'Vorab-Hinweise einstellen', {}, ' class="btn btn-ghost btn-sm"') + '</div>';
    return shell(S, 'Benachrichtigungen', body, { kicker: 'Alle Gruppen', back: true });
  };

  SCREENS.notifsettings = (S) => {
    let body = '<div class="title-row">' + notifTabs(S) + '</div>';
    body += '<section class="card"><div class="sw-row big"><span><strong>Push und E-Mail</strong><small>Hauptschalter. Das Postfach in der App bekommt immer alles.</small></span>' + sw(S.master, 'data-action="toggleMaster" data-k="master"', 'Push und E-Mail insgesamt') + '</div></section>';
    body += '<section class="card' + (S.master ? '' : ' is-muted') + '"><div class="pref-head" aria-hidden="true"><span></span><span>' + icon('phone') + 'Push</span><span>' + icon('mail') + 'E-Mail</span></div><ul class="prefs">' + M.EVENTS.map((e) => '<li class="pref"><span class="li-main"><strong>' + e.label + '</strong><small>' + e.desc + '</small></span>' + sw(S.prefs[e.key].push && S.master, 'data-action="togglePref" data-ev="' + e.key + '" data-ch="push" data-k="pp-' + e.key + '"' + (S.master ? '' : ' disabled'), e.label + ' per Push') + sw(S.prefs[e.key].email && S.master, 'data-action="togglePref" data-ev="' + e.key + '" data-ch="email" data-k="pe-' + e.key + '"' + (S.master ? '' : ' disabled'), e.label + ' per E-Mail') + '</li>').join('') + '</ul><p class="small">E-Mail ist freiwillig und standardmäßig aus. Jede Mail hat einen Abmelde-Link.</p></section>';
    body += '<section class="proposal-box"><div class="pb-head">' + icon('clock') + '<h2>Vorab-Hinweise</h2>' + propTag() + '</div><p>Gibt es noch nicht. Hinweise sind freiwillig, tagesgenau und höchstens einmal je Anlass.</p><ul class="prefs">' + M.REMINDERS.map((r) => '<li class="pref pref-1"><span class="li-main"><strong>' + r.label + '</strong><small>' + r.desc + '</small></span>' + sw(!!S.reminders[r.key], 'data-action="toggleReminder" data-ev="' + r.key + '" data-k="rm-' + r.key + '"', r.label) + '</li>').join('') + '</ul></section>';
    return shell(S, 'Benachrichtigungen', body, { kicker: 'Einstellungen', back: true });
  };

  SCREENS.profile = (S) => {
    let body = '<section class="card profile-head">' + av(ME, 'xl') + '<div><h2 class="serif">Mara K.</h2><p class="small">mara@example.org · 3 Gruppen</p></div>' + btn('Bearbeiten', 'data-action="toast" data-msg="Demo: Name und Profilbild ändern."', 'outline btn-sm') + '</section>';
    body += '<section class="card"><h2>Deine Rollen-Badges</h2><p class="small">Badges zeigen, was für ein Typ du in der Gruppe bist – ohne Rangliste.</p><ul class="badges">' + M.BADGES.map((b) => { const t = tier(b.count); return '<li class="badge-item tier-' + (t.cur ? t.cur.name.toLowerCase() : 'none') + '"><span class="b-medal" aria-hidden="true">' + icon('star') + '</span><span class="li-main"><strong>' + b.name + '</strong><small>' + (t.cur ? t.cur.name : 'Noch keine Stufe') + ' · ' + b.count + ' ' + b.what + (t.next ? ' · ' + (t.next.from - b.count) + ' bis ' + t.next.name : '') + '</small></span></li>'; }).join('') + '</ul></section>';
    body += '<section class="card">' + navA('album', icon('camera') + '<span class="li-main"><strong>Album</strong><small>' + (S.newCards.length ? S.newCards.length + ' neue Memory Card' + (S.newCards.length > 1 ? 's' : '') : 'Alle gesehen') + '</small></span>' + icon('chevR'), {}, ' class="list-row"') +
      navA('notifsettings', icon('bell') + '<span class="li-main"><strong>Benachrichtigungen</strong><small>Push, E-Mail und Vorab-Hinweise</small></span>' + icon('chevR'), {}, ' class="list-row"') +
      navA('group', icon('users') + '<span class="li-main"><strong>Mitglieder & Einladen</strong><small>Feierabend-Crew</small></span>' + icon('chevR'), {}, ' class="list-row"') + '</section>';
    body += '<section class="card"><h2>Bedienung</h2><div class="sw-row"><span><strong>Tastenkürzel</strong><small>1 Anstehend · 2 Gruppe · 3 Album · N Erstellen. Wirken nicht in Eingabefeldern.</small></span>' + sw(S.shortcuts !== false, 'data-action="toggleShortcuts" data-k="kbd"', 'Tastenkürzel') + '</div></section>';
    body += '<section class="card"><h2>Darstellung</h2><div class="seg" role="group" aria-label="Farbmodus">' + [['light', 'Hell'], ['dark', 'Dunkel']].map(([v, l]) => '<button type="button" data-action="setUi" data-key="theme" data-val="' + v + '" data-k="th-' + v + '" aria-pressed="' + (S.ui.theme === v) + '">' + icon(v === 'light' ? 'sun' : 'moon') + l + '</button>').join('') + '</div></section>';
    body += '<section class="card"><h2>Kalender</h2><p class="small">Google Kalender verbunden. Mellon liest nur frei/belegt.</p>' + btn('Verbindung trennen', 'data-action="toast" data-msg="Demo: Kalender-Verbindung getrennt."', 'ghost btn-sm') + '</section>';
    body += '<section class="card"><h2>Konto & Datenschutz</h2>' + btn('Meine Daten exportieren', 'data-action="exportData" data-k="export"', 'outline', 'download') + btn('Hilfe & Feedback', 'data-action="toast" data-msg="Demo: Hilfe-Center und Feedback-Formular."', 'ghost', 'help') + btn('Abmelden', 'data-action="logout"', 'ghost', 'logout') + btn('Konto löschen', 'data-action="openModal" data-modal="deleteAccount" data-k="del"', 'danger', 'x') + '<p class="legal"><button type="button" class="link" data-action="toast" data-msg="Demo: öffnet die Datenschutzerklärung.">Datenschutzerklärung</button> · <button type="button" class="link" data-action="toast" data-msg="Demo: öffnet das Impressum.">Impressum</button> · <button type="button" class="link" data-action="toast" data-msg="Demo: öffnet die Nutzungsbedingungen.">Nutzungsbedingungen</button></p><p class="small">Mellon ist kostenlos, ohne Werbung und ohne Tracking.</p></section>';
    return shell(S, 'Profil', body, { kicker: 'Profil' });
  };

  const OTHER_CARDS = [{ id: 'x1', title: 'Sushi selbst gerollt', start: '2026-06-14', cover: 'blush', group: 'Uni-Kochclub', quote: 'Die Reispampe war am Ende doch lecker.' }, { id: 'x2', title: 'Pasta-Workshop', start: '2026-03-08', cover: 'gold', group: 'Uni-Kochclub', quote: 'Zwei Stunden Teig, zehn Minuten gegessen.' }];
  function memCard(c, isNew, groupName) {
    return '<li><' + (c.id[0] === 'a' ? 'a href="' + M.href('activity', { id: c.id }) + '" data-action="nav" data-to="activity" data-pId="' + c.id + '"' : 'button type="button" data-action="toast" data-msg="In der Demo ist nur die Feierabend-Crew befüllt."') + ' class="mem cover-' + c.cover + '" data-k="mem-' + c.id + '">' +
      (isNew ? '<span class="tag tag-new on-photo">Neu</span>' : '') + '<span class="mem-ic" aria-hidden="true">' + icon(COVER_ICON[c.cover]) + '</span><span class="mem-in"><span class="overline">' + esc(groupName) + ' · ' + fmtDay(c.start) + '</span><strong class="serif">' + esc(c.title) + '</strong><small>„' + esc(c.quote || '') + '“</small></span></' + (c.id[0] === 'a' ? 'a' : 'button') + '></li>';
  }
  SCREENS.album = (S) => {
    const sb = stateBlock(S, 'Memory Cards');
    let body = '<div class="title-row"><p class="lead">Jede gemeinsame Aktivität wird zur Memory Card.</p>' + (S.newCards.length ? btn('Alle als gesehen markieren', 'data-action="markCardsSeen" data-k="seen"', 'ghost btn-sm', 'check') : '') + '</div>';
    if (sb) return shell(S, 'Album', body + sb, { kicker: 'Alle Gruppen' });
    const cards = S.ui.state === 'empty' ? [] : S.activities.filter((a) => a.status === 'abgeschlossen');
    if (!cards.length) body += emptyBlock('camera', 'Euer Album ist noch leer', 'Schließt eure erste Aktivität ab – dann entsteht hier die erste Memory Card.');
    else body += '<ul class="album">' + cards.map((c) => memCard(c, S.newCards.includes(c.id), 'Feierabend-Crew')).join('') + OTHER_CARDS.map((c) => memCard(c, false, c.group)).join('') + '</ul>';
    body += '<div class="card wrapped-teaser"><span class="overline">Ab 1. Dezember</span><h2 class="serif">Euer Jahr in Mellon</h2><p class="small">Der Jahresrückblick der Feierabend-Crew erscheint, sobald ihr drei Aktivitäten abgeschlossen habt. Schon geschafft.</p></div>';
    return shell(S, 'Album', body, { kicker: 'Alle Gruppen' });
  };
  SCREENS.celebrate = SCREENS.agenda;
  SCREENS.newproposal = SCREENS.flow;

  /* ---------- Modals ---------- */
  function modalLayer(S) {
    if (!S.modal) return '';
    const m = S.modal; const e = S.errors; let title = '', body = '', role = 'dialog';
    if (m.type === 'proposal') {
      const dft = S.formDraft; const n = group().members; const maj = Math.floor(n / 2) + 1;
      title = 'Neue Idee';
      body = '<form data-form="proposal" novalidate class="form">' +
        field('f-title', 'Was wollt ihr machen?', '<input name="title" maxlength="80" autofocus value="' + esc(dft.title || '') + '" placeholder="z. B. Minigolf im Park" ' + inputAttrs('f-title', e.title) + '>', e.title) +
        '<fieldset class="field"><legend>Wie lange?</legend><div class="chips">' + [['spontan', 'Spontan'], ['wochenende', 'Wochenende'], ['laenger', 'Längerer Zeitraum']].map(([v, l]) => '<label class="chip-radio"><input type="radio" name="dur" value="' + v + '"' + ((dft.dur || 'spontan') === v ? ' checked' : '') + '><span>' + l + '</span></label>').join('') + '</div></fieldset>' +
        field('f-need', 'Ab wie vielen Stimmen geht’s in die Planung?', '<input name="need" type="number" inputmode="numeric" min="1" max="' + n + '" value="' + esc(dft.need || maj) + '" ' + inputAttrs('f-need', e.need, 'Vorbelegt mit der Mehrheit: ' + maj + ' von ' + n + ' Stimmen. Deine eigene zählt mit.') + '>', e.need, 'Vorbelegt mit der Mehrheit: ' + maj + ' von ' + n + ' Stimmen. Deine eigene zählt mit.') +
        field('f-link', 'Link <span class="opt">(optional)</span>', '<input name="link" type="url" inputmode="url" placeholder="https://" ' + inputAttrs('f-link', null, 'Vorschaubild wird später automatisch geladen.') + '>', null, 'Vorschaubild wird später automatisch geladen.') +
        field('f-desc', 'Beschreibung <span class="opt">(optional)</span>', '<textarea name="desc" rows="2" ' + inputAttrs('f-desc') + '>' + esc(dft.desc || '') + '</textarea>') +
        '<div class="modal-actions"><button class="btn btn-default" type="submit" data-k="submit">Idee teilen</button>' + btn('Abbrechen', 'data-action="closeModal"', 'ghost') + '</div></form>';
    } else if (m.type === 'create') {
      title = 'Erstellen';
      body = '<div class="menu">' + btn('Idee teilen', 'data-action="openModal" data-modal="proposal" data-k="cr-idea"', 'ghost', 'sparkles') + navA('datepoll', icon('calendar') + '<span>Terminabstimmung starten</span>', { id: 'a5' }, ' class="btn btn-ghost"') + navA('activity', icon('list') + '<span>Umfrage in einer Aktivität</span>', { id: 'a6' }, ' class="btn btn-ghost"') + btn('Abbrechen', 'data-action="closeModal"', 'ghost') + '</div>';
    } else if (m.type === 'task') {
      title = 'Aufgabe hinzufügen';
      body = '<form data-form="task" data-id="' + m.id + '" novalidate class="form">' + field('f-task', 'Was ist zu tun?', '<input name="label" autofocus ' + inputAttrs('f-task', e.task) + '>', e.task) + field('f-who', 'Wer kümmert sich?', '<select name="who" ' + inputAttrs('f-who') + '><option value="">Noch offen</option>' + M.members.map((x) => '<option value="' + x.id + '">' + esc(x.name) + '</option>').join('') + '</select>') + '<div class="modal-actions"><button class="btn btn-default" type="submit">Hinzufügen</button>' + btn('Abbrechen', 'data-action="closeModal"', 'ghost') + '</div></form>';
    } else if (m.type === 'poll') {
      title = 'Umfrage starten';
      body = '<form data-form="poll" data-id="' + m.id + '" novalidate class="form">' + field('f-q', 'Frage', '<input name="q" autofocus placeholder="z. B. Wer fährt?" ' + inputAttrs('f-q', e.q) + '>', e.q) + field('f-o1', 'Antwort 1', '<input name="o1" ' + inputAttrs('f-o1', e.o1) + '>', e.o1) + field('f-o2', 'Antwort 2', '<input name="o2" ' + inputAttrs('f-o2') + '>') + field('f-o3', 'Antwort 3 <span class="opt">(optional)</span>', '<input name="o3" ' + inputAttrs('f-o3') + '>') + '<p class="small">Alle sehen, wer wofür gestimmt hat. Mehrfachauswahl ist möglich.</p><div class="modal-actions"><button class="btn btn-default" type="submit">Umfrage starten</button>' + btn('Abbrechen', 'data-action="closeModal"', 'ghost') + '</div></form>';
    } else if (m.type === 'regen') {
      role = 'alertdialog'; title = 'Neuen Code erzeugen?';
      body = '<p>Der alte Code gilt dann sofort nicht mehr. Wer ihn noch nicht benutzt hat, braucht den neuen.</p><div class="modal-actions">' + btn('Neuen Code erzeugen', 'data-action="regenerate" data-k="regen-ok"', 'default') + btn('Abbrechen', 'data-action="closeModal"', 'ghost') + '</div>';
    } else if (m.type === 'deleteAccount') {
      role = 'alertdialog'; title = 'Konto wirklich löschen?';
      body = '<p>Dein Profil, deine Stimmen, Kommentare, Fotos und Kommentarbilder werden innerhalb von 30 Tagen vollständig gelöscht. Gemeinsame Aktivitäten bleiben für die Gruppe erhalten, ohne deinen Namen. Das lässt sich nicht rückgängig machen.</p><p class="small">Tipp: Exportiere vorher deine Daten.</p><div class="modal-actions">' + btn('Konto endgültig löschen', 'data-action="deleteAccount" data-k="del-ok"', 'danger') + btn('Abbrechen', 'data-action="closeModal"', 'ghost') + '</div>';
    } else if (m.type === 'commentMenu' || m.type === 'reportMenu') {
      const kind = m.type === 'commentMenu' ? 'Kommentar' : (m.id || 'Inhalt');
      title = kind;
      body = '<div class="menu">' + btn(kind + ' melden', 'data-action="report" data-k="rep"', 'ghost', 'alert') + btn('Für mich ausblenden', 'data-action="hideContent"', 'ghost', 'x') + (kind === 'Mitglied' ? btn('Blockieren (Inhalte ausblenden)', 'data-action="block"', 'ghost', 'lock') : '') + (M.can('manageMembers') ? btn(kind === 'Mitglied' ? 'Aus der Gruppe entfernen' : 'Inhalt entfernen (Admin)', 'data-action="removeContent"', 'ghost', 'x') : '') + btn('Abbrechen', 'data-action="closeModal"', 'ghost') + '<p class="small">Meldungen gehen vertraulich an die Admins der Gruppe. Bei Verstößen gegen die Regeln prüft auch das Mellon-Team.</p></div>';
    }
    return '<div class="scrim" aria-hidden="false"></div><div class="sheet" role="' + role + '" aria-modal="true" aria-labelledby="m-title"><span class="grip" aria-hidden="true"></span><div class="sheet-head"><h2 id="m-title">' + title + '</h2><button type="button" class="icon-btn" data-action="closeModal" data-k="m-close" aria-label="Schließen">' + icon('x') + '</button></div><div class="sheet-body">' + body + '</div></div>';
  }

  function celebrateLayer(S) {
    const c = S.celebrate; if (!c) return '';
    const a = A(c.id) || A('a7'); let k = '', h = '', p = '', btns = '';
    if (c.kind === 'threshold') { k = 'Genug Stimmen'; h = a.title; p = 'rückt im Fluss vor: Zu planen. Als Nächstes stimmt ihr über den Termin ab.'; btns = navA('datepoll', 'Terminabstimmung starten', { id: a.id }, ' class="btn btn-light"') + btn('Weiter', 'data-action="closeCelebrate"', 'ghost-light'); }
    else if (c.kind === 'date') { k = 'Termin steht'; h = fmtRange(a.start, a.end); p = a.title + '. Alle in der Gruppe sehen es jetzt unter „Anstehend“.'; btns = btn('Zum Kalender hinzufügen', 'data-action="toast" data-msg="Demo: Kalenderdatei (.ics) wird heruntergeladen."', 'light', 'download') + btn('Fertig', 'data-action="closeCelebrate"', 'ghost-light'); }
    else { const lv = c.kind === 'levelup' ? M.LEVELS[(c.level || 3) - 1] : null; k = 'Erinnerung entsteht'; h = a.title; p = 'Erlebt am ' + fmtDay(a.start || TODAY, true) + '. ' + (lv ? 'Und: Level ' + lv.n + ' – ' + lv.name + '. Zehn gemeinsame Erlebnisse!' : 'Liegt jetzt in eurem Album.'); btns = navA('album', 'Ins Album', {}, ' class="btn btn-light"') + btn('Fertig', 'data-action="closeCelebrate"', 'ghost-light'); }
    return '<div class="scrim cel-scrim"></div><div class="celebrate story cover-' + a.cover + '" role="dialog" aria-modal="true" aria-labelledby="cel-h"><div class="story-bar" aria-hidden="true"><span></span></div><p class="overline">' + esc(k) + ' · Feierabend-Crew</p><h2 id="cel-h" class="mega">' + esc(h) + '</h2><p>' + esc(p) + '</p><div class="cel-btns">' + btns + '</div></div>';
  }

  /* ---------- Variante registrieren ---------- */
  M.start({
    routes: ROUTES, home: 'agenda', groupHome: 'flow', dateOwner: 'die Gastgeber:in oder ein Admin',
    statusLabels: { vorschlag: 'Idee', zu_planen: 'Zu planen', in_planung: 'In Planung', planung_abgeschlossen: 'Termin steht', abgeschlossen: 'Erlebt' },
    routeModals: { newproposal: { modal: 'proposal', back: 'flow' }, celebrate: { celebrate: 'levelup', id: 'a7', level: 3, back: 'agenda' } },
    screenList: ROUTES.map((r) => [r, NAMES[r], r === 'activity' ? { id: 'a6' } : r === 'datefinder' || r === 'datepoll' ? { id: 'a5' } : null]),
    screenName: (r) => NAMES[r] || r,
    roles: [['member', 'Mitglied'], ['host', 'Gastgeber:in'], ['admin', 'Admin']],
    roleTitle: 'Rechtemodell', roleNote: 'Neu in C: Admin und Mitglied, dazu Gastgeber:in je Aktivität. „Gastgeber:in“ simuliert, dass du die angezeigten Aktivitäten ausrichtest.',
    roleLabel: (r) => ROLE[r] || MROLE[r] || r,
    can: (action, act, S) => { const r = S.ui.role; const lead = r === 'admin' || r === 'host'; switch (action) { case 'findDate': case 'move': case 'complete': case 'edit': return lead; case 'manageMembers': case 'regenerate': return r === 'admin'; default: return true; } },
    about: '<p>Richtung C „Mutig – Anstehend“: neue Informationsarchitektur. Start ist „Anstehend“ über alle Gruppen, die Gruppe ist ein Fluss von der Idee bis „Erlebt“ (statt Board), das Album ist ein eigener Bereich. Termine werden per Abstimmung gefunden; Admins können weiter direkt festlegen.</p><p>Abweichungen vom Styleguide: Bricolage Grotesque statt Source Serif für Display, flache Flächen ohne Glas und Schatten, dunkles Waldgrün als große Fläche, neue Navigation.</p><p>Markiert: <strong>Vorschlag</strong> = gibt es noch nicht (Teilen-Link, Vorab-Hinweise). <strong>Neu</strong> = neue Funktion ohne heutiges Datenmodell.</p><p>Alle Daten sind erfunden. Keine Netzwerkzugriffe, kein Tracking.</p><p>Schriften: Bricolage Grotesque (The Bricolage Grotesque Project Authors) und Hanken Grotesk, beide SIL Open Font License 1.1. Logo: Mellon-Wortmarke als SVG.</p>',
    render: (S) => SCREENS[S.route] ? SCREENS[S.route](S) : SCREENS.agenda(S),
    onKey: (ev, S) => {
      if (S.shortcuts === false || ev.ctrlKey || ev.metaKey || ev.altKey || S.modal || S.celebrate) return;
      const t = ev.target; if (t && (t.matches('input, textarea, select') || t.isContentEditable)) return;
      const map = { 1: 'agenda', 2: 'flow', 3: 'album' };
      if (map[ev.key]) { ev.preventDefault(); M.go(map[ev.key]); }
      else if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); const a0 = document.activeElement; S.modal = { type: 'create', opener: a0 && a0.getAttribute('data-k') }; M.render(); }
    },
    actions: {
      toggleStage: (el, ev, S) => { S.collapsed[el.dataset.val] = !S.collapsed[el.dataset.val]; M.render({ focus: el.dataset.k }); },
      toggleShortcuts: (el, ev, S) => { S.shortcuts = S.shortcuts === false; M.render({ focus: el.dataset.k }); M.toast(S.shortcuts ? 'Tastenkürzel an.' : 'Tastenkürzel aus.'); },
      setBlockMode: (el, ev, S) => { S.blockMode = el.dataset.val === '1'; M.render({ focus: el.dataset.k }); },
      toggleBlock: (el, ev, S) => { S.myBlocks = S.myBlocks || []; const d0 = el.dataset.day; const i = S.myBlocks.indexOf(d0); if (i >= 0) S.myBlocks.splice(i, 1); else S.myBlocks.push(d0); M.render({ focus: el.dataset.k }); M.toast(i >= 0 ? 'Tag wieder frei.' : 'Als „Kann nicht“ markiert.'); },
    },
  });
})();
