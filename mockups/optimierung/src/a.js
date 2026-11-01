/* Variante A – Evolution: heutige Navigation, Lücken geschlossen, STYLEGUIDE.md strikt. */
(function () {
  'use strict';
  const M = window.Mellon;
  const { esc, icon, member, st, fmtDay, fmtRange, relDay, level, tier, A, D, group, can, online, ME, TODAY } = M;
  const ROLE = { admin: 'Admin', editor: 'Redakteur:in', observer: 'Beobachter:in' };
  const COVER_ICON = { green: 'pin', gold: 'sparkles', blush: 'heart', ink: 'star' };

  const ROUTES = ['welcome', 'login', 'join', 'home', 'group', 'proposals', 'newproposal', 'activity', 'board', 'calendar', 'datefinder', 'notifications', 'notifsettings', 'profile', 'album', 'celebrate'];
  const NAMES = { welcome: 'Onboarding', login: 'Login & Registrierung', join: 'Gruppe beitreten', home: 'Start: Was steht an', group: 'Gruppe & Einladen', proposals: 'Vorschläge & Abstimmung', newproposal: 'Vorschlag erstellen', activity: 'Aktivitäts-Detail', board: 'Board', calendar: 'Termine', datefinder: 'Terminfindung', notifications: 'Benachrichtigungen', notifsettings: 'Push & E-Mail', profile: 'Profil & Einstellungen', album: 'Erinnerungs-Album', celebrate: 'Erfolgsmoment' };

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

  /* ---------- Shell ---------- */
  const TABS = [['home', 'Start', 'home'], ['proposals', 'Vorschläge', 'heart'], ['board', 'Board', 'board'], ['calendar', 'Termine', 'calendar'], ['profile', 'Profil', 'user']];
  const ACTIVE = { home: 'home', group: 'home', proposals: 'proposals', newproposal: 'proposals', activity: 'board', board: 'board', calendar: 'calendar', datefinder: 'calendar', notifications: 'notifications', notifsettings: 'profile', profile: 'profile', album: 'profile', celebrate: 'home' };
  function unread(S) { return S.notifications.filter((n) => n.unread).length; }

  function shell(S, title, body, opts) {
    opts = opts || {};
    const act = ACTIVE[S.route];
    const tabs = TABS.map(([r, l, ic]) => '<li>' + navA(r, icon(ic) + '<span>' + l + '</span>', {}, ' class="tab"' + (act === r ? ' aria-current="page"' : '')) + '</li>').join('');
    const side = TABS.slice(0, 4).map(([r, l, ic]) => '<li>' + navA(r, icon(ic) + '<span>' + l + '</span>', {}, ' class="side-link"' + (act === r ? ' aria-current="page"' : '')) + '</li>').join('') +
      '<li>' + navA('notifications', icon('bell') + '<span>Benachrichtigungen</span>' + (unread(S) ? '<span class="count" aria-label="' + unread(S) + ' ungelesen">' + unread(S) + '</span>' : ''), {}, ' class="side-link"' + (act === 'notifications' ? ' aria-current="page"' : '')) + '</li>';
    const g = group();
    const bell = navA('notifications', icon('bell') + (unread(S) ? '<span class="badge-dot">' + unread(S) + '</span>' : '') + '<span class="sr-only">Benachrichtigungen, ' + unread(S) + ' ungelesen</span>', {}, ' class="icon-btn bell"');
    return '<div class="app">' +
      '<button type="button" class="skip" data-action="skipToMain">Zum Inhalt springen</button>' +
      '<aside class="sidebar" aria-label="Seitenleiste"><div class="side-logo">' + window.MELLON_LOGO + '</div>' +
      navA('group', '<span class="g-name">' + esc(g.name) + '</span><span class="g-meta">' + g.members + ' Mitglieder · Level ' + level(g.done).cur.n + '</span>', {}, ' class="g-switch"' + (S.route === 'group' ? ' aria-current="page"' : '')) +
      '<nav aria-label="Hauptnavigation"><ul>' + side + '</ul></nav>' +
      navA('profile', av(ME) + '<span><strong>Mara K.</strong><small>Profil & Einstellungen</small></span>', {}, ' class="user-card"' + (act === 'profile' ? ' aria-current="page"' : '')) + '</aside>' +
      '<div class="col">' +
      '<header class="topbar">' + (opts.back ? '<button type="button" class="icon-btn" data-action="back" data-k="back" aria-label="Zurück">' + icon('chevL') + '</button>' : '<span class="top-logo">' + window.MELLON_LOGO + '</span>') +
      '<span class="top-title">' + esc(opts.kicker || '') + '</span>' + bell + '</header>' +
      (online() ? '' : '<div class="offline" role="status">' + icon('wifiOff') + '<span>Du bist offline. Du siehst den zuletzt geladenen Stand.</span><button type="button" class="btn btn-ghost btn-sm" data-action="goOnline" data-k="online">Erneut verbinden</button></div>') +
      '<main id="main" class="scroll" data-scroll tabindex="-1"><div class="page' + (opts.wide ? ' page-wide' : '') + '">' +
      (title ? '<h1 class="screen-title">' + title + '</h1>' : '') + body + '</div></main></div>' +
      (opts.fab || '') +
      '<nav class="tabbar glass" aria-label="Hauptnavigation mobil"><ul>' + tabs + '</ul></nav>' +
      modalLayer(S) + celebrateLayer(S) + '</div>';
  }

  /* ---------- Screens ---------- */
  const SCREENS = {};

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
      '<p class="center">' + navA('home', 'Später – erst einmal umsehen', {}, ' class="link"') + '</p></main></div>';
  };

  SCREENS.home = (S) => {
    const g = group(); const lv = level(g.done);
    const a7 = A('a7'); const a8 = A('a8'); const det8 = D('a8');
    const myTasks = [];
    Object.entries(S.detail).forEach(([aid, det]) => det.tasks.forEach((t) => { if (t.who === ME && (!t.done || (S.recentDone || []).includes(t.id))) myTasks.push([aid, t]); }));
    const missing = myVoteMissing();
    let body = '<p class="lead">Hallo Mara. Das steht an:</p>';
    if (a7.status === 'planung_abgeschlossen') {
      body += '<section class="card impulse" aria-labelledby="imp-h">' + cover(a7, 'cover-sm') + '<div><p class="overline">Gestern</p><h2 id="imp-h" class="serif">Wie war der ' + esc(a7.title) + '?</h2><p>Markiere ihn als abgeschlossen – dann entsteht eure Memory Card. Fotos kannst du danach hinzufügen.</p>' +
        '<div class="row-btns">' + (can('complete', a7) ? btn('Als abgeschlossen markieren', 'data-action="complete" data-id="a7" data-k="imp-done"', 'default', 'check') : deny('Abschließen kann ein Admin oder die Initiator:in.')) + navA('activity', 'Details', { id: 'a7' }, ' class="btn btn-ghost"') + '</div></div></section>';
    }
    body += '<div class="grid-2">';
    body += '<section class="card" aria-labelledby="next-h">' + sectionHead('<span id="next-h">Als Nächstes</span>') +
      navA('activity', cover(a8, 'cover-sm') + '<span class="li-main"><strong class="serif">' + esc(a8.title) + '</strong><small>' + fmtDay(a8.start, true) + ' · ' + relDay(a8.start) + '</small></span>' + icon('chevR'), { id: 'a8' }, ' class="list-row"') +
      (det8.rsvp[ME] ? '<p class="ok">' + icon('check') + 'Du hast zugesagt.</p>' : '<p class="small">Bist du dabei?</p><div class="rsvp rsvp-compact">' + rsvpBtns('a8', det8) + '</div>') + '</section>';
    body += '<section class="card" aria-labelledby="tasks-h">' + sectionHead('<span id="tasks-h">Deine Aufgaben</span>', '<span class="count-pill">' + myTasks.length + '</span>') +
      (myTasks.length ? myTasks.map(([aid, t]) => '<div class="task-row">' + taskCheck(aid, t) + '<span class="li-main"><strong>' + esc(t.label) + '</strong><small>' + esc(A(aid).title) + (t.due ? ' · bis ' + fmtDay(t.due) : '') + '</small></span></div>').join('') : '<p class="small">Alles erledigt. Schön!</p>') + '</section>';
    body += '<section class="card" aria-labelledby="vote-h">' + sectionHead('<span id="vote-h">Deine Stimme fehlt</span>', '<span class="count-pill">' + missing.length + '</span>') +
      (missing.length ? missing.slice(0, 3).map((a) => navA('activity', cover(a, 'cover-xs') + '<span class="li-main"><strong class="serif">' + esc(a.title) + '</strong><small>' + a.votes.length + ' von ' + a.need + ' Stimmen</small></span>' + icon('chevR'), { id: a.id }, ' class="list-row"')).join('') + navA('proposals', 'Alle Vorschläge', {}, ' class="btn btn-ghost btn-sm"') : '<p class="small">Du hast überall abgestimmt.</p>') + '</section>';
    body += '</div>';
    body += sectionHead('Deine Gruppen', navA('join', icon('plus') + 'Gruppe hinzufügen', {}, ' class="btn btn-ghost btn-sm"')) + '<div class="groups">' +
      S.groups.map((x) => { const l = level(x.done); return '<button type="button" class="group-card" data-action="openGroup" data-id="' + x.id + '" data-k="grp-' + x.id + '"><span class="serif g-title">' + esc(x.name) + '</span><span class="small">' + x.members + ' Mitglieder</span><span class="momentum"><span class="mom-label">' + icon('trophy') + 'Level ' + l.cur.n + ' · ' + esc(l.cur.name) + '</span>' + (l.next ? '<span class="bar" role="img" aria-label="' + x.done + ' von ' + l.next.from + ' Aktivitäten bis ' + esc(l.next.name) + '"><span style="width:' + Math.round((x.done - l.cur.from) / (l.next.from - l.cur.from) * 100) + '%"></span></span><span class="small">' + x.done + ' von ' + l.next.from + ' bis „' + esc(l.next.name) + '“</span>' : '') + '</span></button>'; }).join('') + '</div>';
    return shell(S, '', '<h1 class="screen-title">Start</h1>' + body, { kicker: 'Start' });
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
        (isAdmin && m.id !== ME ? '<label class="sr-only" for="role-' + m.id + '">Rolle von ' + esc(m.name) + '</label><select id="role-' + m.id + '" data-k="role-' + m.id + '" data-change="setRole" data-id="' + m.id + '" class="select-sm">' + Object.entries(ROLE).map(([k, l]) => '<option value="' + k + '"' + (m.role === k ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>' : '<span class="role role-' + (m.id === ME ? S.ui.role : m.role) + '">' + ROLE[m.id === ME ? S.ui.role : m.role] + '</span>') + '</li>').join('') + '</ul>' +
      btn('Gruppe verlassen', 'data-action="toast" data-msg="Demo: Als Admin überträgst du vorher deine Rechte an ein anderes Mitglied."', 'ghost', 'logout') + '</section>';
    return shell(S, esc(g.name), body, { kicker: 'Gruppe', back: true });
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

  SCREENS.proposals = (S) => {
    const sb = stateBlock(S, 'Vorschläge');
    const create = can('create');
    const list = S.ui.state === 'empty' ? [] : S.activities.filter((a) => a.status === 'vorschlag' && (S.filter === 'alle' || a.dur === S.filter)).sort((x, y) => y.votes.length / y.need - x.votes.length / x.need);
    const chips = '<div class="chips" role="group" aria-label="Nach Dauer filtern">' + [['alle', 'Alle'], ['spontan', 'Spontan'], ['wochenende', 'Wochenende'], ['laenger', 'Längerer Zeitraum']].map(([v, l]) => '<button type="button" class="chip" data-action="filter" data-val="' + v + '" data-k="f-' + v + '" aria-pressed="' + (S.filter === v) + '">' + l + '</button>').join('') + '</div>';
    let body = '<div class="title-row"><p class="lead">Stimm für das, worauf du Lust hast. Ab der Schwelle geht’s ins Board.</p>' + (create ? navA('newproposal', icon('plus') + '<span>Vorschlag erstellen</span>', {}, ' class="btn btn-default desk-only" data-k="new-desk"') : '') + '</div>';
    if (!create) body += deny('Als Beobachter:in kannst du abstimmen, aber nichts vorschlagen.');
    body += chips;
    if (sb) body += sb;
    else if (!list.length) body += emptyBlock('sparkles', S.ui.state === 'empty' ? 'Noch keine Vorschläge' : 'Nichts in dieser Kategorie', 'Was wolltet ihr schon immer mal zusammen machen? Ein Titel reicht für den Anfang.', create ? navA('newproposal', icon('plus') + '<span>Ersten Vorschlag erstellen</span>', {}, ' class="btn btn-default"') : '');
    else body += '<ul class="p-list">' + list.map(proposalCard).join('') + '</ul>';
    const fab = create && !sb ? navA('newproposal', icon('plus') + '<span class="sr-only">Vorschlag erstellen</span>', {}, ' class="fab mob-only" data-k="fab"') : '';
    return shell(S, 'Vorschläge', body, { kicker: 'Feierabend-Crew', fab });
  };
  SCREENS.newproposal = SCREENS.proposals;

  function rsvpBtns(id, det) {
    const me = det.rsvp[ME];
    return [['yes', 'Bin dabei', 'check'], ['maybe', 'Vielleicht', 'help'], ['no', 'Kann nicht', 'x']].map(([v, l, ic]) => '<button type="button" class="rsvp-btn rsvp-' + v + '" data-action="rsvp" data-id="' + id + '" data-val="' + v + '" data-k="rsvp-' + id + '-' + v + '" aria-pressed="' + (me === v) + '">' + icon(ic) + '<span>' + l + '</span></button>').join('');
  }
  function taskCheck(aid, t) {
    return '<button type="button" role="checkbox" class="check' + (t.done ? ' on' : '') + '" aria-checked="' + t.done + '" data-action="toggleTask" data-id="' + aid + '" data-task="' + t.id + '" data-k="task-' + t.id + '" aria-label="' + esc(t.label) + (t.done ? ' – erledigt' : ' – offen') + '">' + icon('check') + '</button>';
  }

  SCREENS.activity = (S) => {
    const a = A(S.params.id || 'a6') || A('a6');
    const sb = stateBlock(S, 'Die Aktivität');
    if (sb) return shell(S, '', sb, { kicker: 'Aktivität', back: true });
    const empty = S.ui.state === 'empty';
    const det = empty ? { tasks: [], polls: [], comments: [], rsvp: {} } : D(a.id);
    const yes = Object.keys(det.rsvp).filter((k) => det.rsvp[k] === 'yes'); const maybe = Object.keys(det.rsvp).filter((k) => det.rsvp[k] === 'maybe').length; const no = Object.keys(det.rsvp).filter((k) => det.rsvp[k] === 'no').length;
    const done = det.tasks.filter((t) => t.done).length;
    let hero = '<div class="hero cover-' + a.cover + '"><span class="hero-ic" aria-hidden="true">' + icon(COVER_ICON[a.cover]) + '</span><div class="hero-in">' + statusChip(a.status) + '<h1 class="display-s hero-title">' + esc(a.title) + '</h1><p>' + icon('calendar') + fmtRange(a.start, a.end) + (a.place ? ' · ' + icon('pin') + esc(a.place) : '') + '</p></div></div>';
    let main = '';
    if (a.status === 'planung_abgeschlossen' && a.start < TODAY) main += '<section class="card impulse"><div><p class="overline">Vorbei</p><h2 class="serif">Wie war’s?</h2><p>Markiere die Aktivität als abgeschlossen, dann entsteht eure Memory Card.</p>' + (can('complete', a) ? btn('Als abgeschlossen markieren', 'data-action="complete" data-id="' + a.id + '" data-k="act-complete"', 'default', 'check') : deny('Abschließen kann ein Admin oder die Initiator:in.')) + '</div></section>';
    main += (a.link ? '<p class="small link-line">' + icon('link') + '<button type="button" class="link" data-action="toast" data-msg="Demo: öffnet ' + esc(a.link) + ' im Browser.">' + esc(a.link) + '</button></p>' : '') + '<div class="title-row"><p class="lead">' + esc(a.desc || '') + '</p><button type="button" class="icon-btn sm" data-action="openModal" data-modal="reportMenu" data-id="' + (a.status === 'vorschlag' ? 'Vorschlag' : 'Aktivität') + '" data-k="act-menu" aria-label="Optionen: melden oder ausblenden">' + icon('more') + '</button></div><p class="small">Vorgeschlagen von ' + esc(member(a.by).name) + ' · ' + esc(M.DUR[a.dur]) + '</p>';
    if (a.status === 'vorschlag') main += '<section class="card"><h2>Abstimmung</h2><div class="progress"><span class="bar bar-lg" aria-hidden="true"><span style="width:' + Math.min(100, Math.round(a.votes.length / a.need * 100)) + '%"></span></span><span><strong>' + a.votes.length + ' von ' + a.need + '</strong> Stimmen bis zur Planung</span></div>' + voteBtn(a) + '</section>';
    // Verantwortlichkeiten
    main += '<section class="card" aria-labelledby="t-h">' + sectionHead('<span id="t-h">Verantwortlichkeiten</span>', det.tasks.length ? '<span class="small">' + done + ' von ' + det.tasks.length + ' erledigt</span>' : '') + (det.tasks.length ? '<p class="small">' + newTag() + ' Fälligkeit und „Übernehmen“ sind neu.</p>' : '') +
      (det.tasks.length ? '<span class="bar" aria-hidden="true"><span style="width:' + Math.round(done / det.tasks.length * 100) + '%"></span></span><ul class="tasks">' + det.tasks.map((t) => '<li class="task-row' + (t.done ? ' is-done' : '') + '">' + taskCheck(a.id, t) + '<span class="li-main"><strong>' + esc(t.label) + '</strong><small>' + (t.who ? av(t.who, 'xs') + esc(member(t.who).name) : 'Noch niemand') + (t.due ? ' · bis ' + fmtDay(t.due) : '') + '</small></span>' + (!t.who ? btn('Übernehmen', 'data-action="claimTask" data-id="' + a.id + '" data-task="' + t.id + '" data-k="claim-' + t.id + '"', 'outline btn-sm', 'plus') : '') + '</li>').join('') + '</ul>'
        : '<p class="small">Noch keine Aufgaben. Wer kümmert sich um was?</p>') +
      (['in_planung', 'planung_abgeschlossen'].includes(a.status) || empty ? (can('addTask') ? btn('Aufgabe hinzufügen', 'data-action="openModal" data-modal="task" data-id="' + a.id + '" data-k="add-task"', 'ghost', 'plus') : deny('Beobachter:innen können keine Aufgaben anlegen.')) : '') + '</section>';
    // Umfragen
    main += '<section class="card" aria-labelledby="p-h">' + sectionHead('<span id="p-h">Umfragen</span>') + (det.polls.length ? det.polls.map((p) => pollCard(a.id, p)).join('') : '<p class="small">Noch keine Umfrage. Fragt die Gruppe, was ihr lieber mögt.</p>') +
      (can('poll') ? btn('Umfrage starten', 'data-action="openModal" data-modal="poll" data-id="' + a.id + '" data-k="add-poll"', 'ghost', 'plus') : '') + '</section>';
    // Fotos
    if (a.status === 'abgeschlossen') main += '<section class="card mem-detail"><p class="overline">Memory Card</p><p class="serif quote">„' + esc(a.quote || '') + '“</p>' + btn('Karte teilen', 'data-action="toast" data-msg="Demo: Die Memory Card würde als Bild über das Teilen-Menü verschickt."', 'outline btn-sm', 'share') + '</section>';
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
      (a.status !== 'abgeschlossen' && a.status !== 'vorschlag' ? (can('findDate', a) ? navA('datefinder', icon('calendar') + '<span>' + (a.start ? 'Termin anpassen' : 'Termin finden') + '</span>', { id: a.id }, ' class="btn btn-ghost"') : deny('Den Termin legen Admins oder ' + esc(member(a.by).name) + ' fest.')) : '') +
      (a.start && a.status !== 'abgeschlossen' ? '<div class="proposal-box slim"><div class="pb-head">' + icon('bell') + '<h3>Termin-Erinnerung</h3>' + propTag() + '</div><div class="sw-row"><span>Einen Tag vorher erinnern</span>' + sw(!!S.reminders.r_date, 'data-action="toggleReminder" data-ev="r_date" data-k="rem-act"', 'Einen Tag vorher erinnern') + '</div></div>' : '') + '</section>';
    return shell(S, '', hero + '<div class="detail-grid"><div class="detail-main">' + main + '</div><aside class="detail-side" aria-label="Zusage und Termin">' + side + '</aside></div>', { kicker: st(a.status), back: true, wide: true });
  };

  function pollCard(aid, p) {
    const total = Math.max(1, new Set(p.options.flatMap((o) => o.votes)).size);
    return '<div class="poll"><div class="poll-head"><p class="poll-q serif">' + esc(p.q) + '</p><button type="button" class="icon-btn sm" data-action="openModal" data-modal="reportMenu" data-id="Umfrage" data-k="pm-' + p.id + '" aria-label="Optionen für Umfrage">' + icon('more') + '</button></div><p class="small">Mehrfachauswahl · ' + total + ' haben abgestimmt</p><ul>' + p.options.map((o) => { const on = o.votes.includes(ME); const pct = Math.round(o.votes.length / total * 100); return '<li><button type="button" class="poll-opt' + (on ? ' on' : '') + '" data-action="pollVote" data-id="' + aid + '" data-poll="' + p.id + '" data-opt="' + o.id + '" data-k="po-' + o.id + '" aria-pressed="' + on + '"><span class="po-fill" style="width:' + pct + '%" aria-hidden="true"></span><span class="po-check" aria-hidden="true">' + icon('check') + '</span><span class="po-label">' + esc(o.label) + '</span><span class="po-n">' + o.votes.length + '</span></button></li>'; }).join('') + '</ul></div>';
  }

  const NEXT = {
    zu_planen: (a) => can('findDate', a) ? navA('datefinder', icon('arrowR') + '<span>Weiter: Termin finden</span>', { id: a.id }, ' class="btn btn-outline btn-sm" data-k="next-' + a.id + '"') : deny('Termin finden: Admin oder ' + member(a.by).name),
    in_planung: (a) => can('move', a) ? btn('Weiter: Termin steht', 'data-action="moveStatus" data-id="' + a.id + '" data-val="planung_abgeschlossen" data-k="next-' + a.id + '"', 'outline btn-sm', 'arrowR') : deny('Status ändern: Admin oder ' + member(a.by).name),
    planung_abgeschlossen: (a) => a.start > TODAY ? navA('activity', icon('check') + '<span>Zusagen ansehen</span>', { id: a.id }, ' class="btn btn-ghost btn-sm"') : can('complete', a) ? btn('Als abgeschlossen markieren', 'data-action="complete" data-id="' + a.id + '" data-k="next-' + a.id + '"', 'outline btn-sm', 'check') : deny('Abschließen: Admin oder ' + member(a.by).name),
    abgeschlossen: (a) => navA('album', icon('camera') + '<span>Im Album ansehen</span>', {}, ' class="btn btn-ghost btn-sm"'),
  };
  function kCard(a) {
    return '<li class="k-card"><span class="k-strip cover-' + a.cover + '" aria-hidden="true"></span><div class="k-in">' + navA('activity', '<span class="serif k-title">' + esc(a.title) + '</span>', { id: a.id }, ' class="k-link"') +
      '<p class="small">' + av(a.by, 'xs') + esc(member(a.by).name) + '</p>' + (a.start ? '<span class="date-pill">' + icon('calendar') + fmtRange(a.start, a.end) + '</span>' : '<span class="date-pill muted">Noch kein Termin</span>') + '<div class="k-next">' + NEXT[a.status](a) + '</div></div></li>';
  }
  SCREENS.board = (S) => {
    const sb = stateBlock(S, 'Das Board');
    const acts = S.ui.state === 'empty' ? [] : S.activities;
    let body = '<p class="lead">Was die Schwelle geschafft hat, wird hier geplant.</p>';
    if (sb) return shell(S, 'Board', body + sb, { kicker: 'Feierabend-Crew' });
    if (!acts.some((a) => a.status !== 'vorschlag')) return shell(S, 'Board', body + emptyBlock('board', 'Noch nichts auf dem Board', 'Sobald ein Vorschlag genug Stimmen hat, landet er hier.', navA('proposals', 'Zu den Vorschlägen', {}, ' class="btn btn-default"')), { kicker: 'Feierabend-Crew' });
    const counts = M.BOARD.map((s) => acts.filter((a) => a.status === s).length);
    body += '<div class="board-tabs mob-only" role="group" aria-label="Spalte wählen">' + M.BOARD.map((s, i) => '<button type="button" class="b-tab" data-action="boardCol" data-val="' + s + '" data-k="bt-' + s + '" aria-pressed="' + (S.boardCol === s) + '"><span class="dot dot-' + s + '" aria-hidden="true"></span><span class="b-label">' + esc(st(s)) + '</span><span class="b-n">' + counts[i] + '</span></button>').join('') + '</div>';
    body += '<div class="board">' + M.BOARD.map((s, i) => '<section class="col-k' + (S.boardCol === s ? ' is-active' : '') + '" aria-labelledby="col-' + s + '"><h2 id="col-' + s + '" class="col-head"><span class="dot dot-' + s + '" aria-hidden="true"></span>' + esc(st(s)) + '<span class="b-n">' + counts[i] + '</span></h2><ul>' + acts.filter((a) => a.status === s).map(kCard).join('') + '</ul>' + (counts[i] ? '' : '<p class="small col-empty">Gerade nichts hier.</p>') + '</section>').join('') + '</div>';
    return shell(S, 'Board', body, { kicker: 'Feierabend-Crew', wide: true });
  };

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
    if (sb) return shell(S, 'Termine', body + sb, { kicker: 'Feierabend-Crew' });
    const acts = S.ui.state === 'empty' ? [] : S.activities;
    const upcoming = acts.filter((a) => a.start && a.end >= TODAY && a.status !== 'abgeschlossen').sort((x, y) => x.start.localeCompare(y.start));
    const noDate = acts.filter((a) => a.status === 'zu_planen');
    body += '<div class="grid-2 cal-layout"><section class="card">' + monthView(S) + '</section><div>';
    body += '<section class="card" aria-labelledby="up-h">' + sectionHead('<span id="up-h">Kommende Termine</span>') + (upcoming.length ? upcoming.map((a) => { const det = D(a.id); const y = Object.values(det.rsvp).filter((v) => v === 'yes').length; return navA('activity', '<span class="date-box"><strong>' + Number(a.start.slice(8)) + '</strong><small>' + M.fmtDay(a.start).split(' ').slice(-1)[0] + '</small></span><span class="li-main"><strong class="serif">' + esc(a.title) + '</strong><small>' + fmtRange(a.start, a.end) + ' · ' + relDay(a.start) + ' · ' + y + ' dabei</small></span>' + icon('chevR'), { id: a.id }, ' class="list-row"'); }).join('') : emptyBlock('calendar', 'Keine Termine', 'Sobald ein Termin steht, siehst du ihn hier.')) + '</section>';
    body += '<section class="card" aria-labelledby="nd-h">' + sectionHead('<span id="nd-h">Braucht einen Termin</span>') + (noDate.length ? noDate.map((a) => '<div class="list-row static">' + cover(a, 'cover-xs') + '<span class="li-main"><strong class="serif">' + esc(a.title) + '</strong><small>' + st(a.status) + '</small></span>' + (can('findDate', a) ? navA('datefinder', 'Termin finden', { id: a.id }, ' class="btn btn-default btn-sm"') : '') + '</div>' + (can('findDate', a) ? '' : deny('Termin finden: Admins oder ' + member(a.by).name))).join('') : '<p class="small">Alles terminiert.</p>') + '</section>';
    body += '<section class="card"><h2>Dein Kalender</h2><p class="small">' + icon('check') + ' Google Kalender verbunden. Die Gruppe sieht nur „frei“ oder „belegt“, nie Termintitel.</p>' + btn('Tage blockieren', 'data-action="toast" data-msg="Demo: Hier markierst du Tage, an denen du nicht kannst."', 'outline', 'calendar') + '</section>';
    body += '</div></div>';
    return shell(S, 'Termine', body, { kicker: 'Feierabend-Crew', wide: true });
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
    if (S.ui.state === 'loading' || S.ui.state === 'error') return shell(S, 'Termin finden', body + stateBlock(S, 'Verfügbarkeiten'), { kicker: 'Termine', back: true });
    body += '<div class="note">' + icon('users') + '<span><strong>2 von 6</strong> Mitgliedern haben keinen Kalender verbunden. Ihre Verfügbarkeit ist unbekannt.</span></div>';
    body += '<div class="legend" aria-label="Legende">' + ['free', 'partial', 'busy'].map((k) => '<span class="lg lg-' + k + '"><i>' + icon(AV[k][1]) + '</i>' + AV[k][0] + '</span>').join('') + '</div>';
    body += '<div class="seg" role="group" aria-label="Modus">' + '<button type="button" data-action="setBlockMode" data-val="0" data-k="bm-0" aria-pressed="' + !S.blockMode + '">' + (allowed ? 'Zeitraum wählen' : 'Überblick') + '</button><button type="button" data-action="setBlockMode" data-val="1" data-k="bm-1" aria-pressed="' + !!S.blockMode + '">Meine „Kann nicht“-Tage</button></div>';
    if (S.blockMode) body += '<p class="small">Tippe Tage an, an denen du nicht kannst. Die Gruppe sieht nur die Summe, nicht deinen Grund.</p>';
    else if (!allowed) body += deny('Den Zeitraum legen Admins oder ' + member(a.by).name + ' fest. Du kannst deine „Kann nicht“-Tage markieren.');
    else body += '<p class="small">Tippe auf den ersten und den letzten Tag. Ein Tag allein ist auch möglich.</p>';
    if (!S.blockMode) body += '<section class="card" aria-labelledby="best-h"><h2 id="best-h">Beste Zeiträume</h2><p class="small">Wochenenden, an denen die meisten mit Kalender frei sind. 2 ohne Kalender sind nicht eingerechnet.</p><ul class="best">' + bestRanges().map((b, i) => '<li><button type="button" class="best-btn" data-action="pickRange" data-start="' + b.a0 + '" data-end="' + b.e0 + '" data-k="best-' + i + '" aria-pressed="' + (S.dateSel.start === b.a0 && S.dateSel.end === b.e0) + '"><strong>' + fmtRange(b.a0, b.e0) + '</strong><span>' + icon(b.v === 4 ? 'check' : 'help') + b.v + ' von 4 mit Kalender frei</span></button></li>').join('') + '</ul></section>';
    body += '<section class="card cal-card">' + monthView(S, { finder, minMonth: '2026-11' }) + '</section>';
    if (S.errors.date) body += '<p class="err" role="alert">' + icon('alert') + esc(S.errors.date) + '</p>';
    body += '<div class="sticky-cta"><p><span class="small">Gewählt</span><strong>' + (sel.start ? fmtRange(sel.start, sel.end || sel.start) : 'Noch nichts') + '</strong></p>' + (allowed && !S.blockMode ? btn('Termin festlegen', 'data-action="confirmDate" data-id="' + a.id + '" data-k="confirm"' + (online() ? '' : ' aria-disabled="true"'), 'default', 'check') : '') + '</div>';
    return shell(S, 'Termin finden', body, { kicker: 'Termine', back: true });
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
    body += '<div class="proposal-box"><div class="pb-head">' + icon('clock') + '<h2>Termin-Erinnerungen</h2>' + propTag() + '</div><p>Gibt es noch nicht. So könnte eine Erinnerung aussehen:</p><div class="n-row static"><span class="n-ic">' + icon('bell') + '</span><span class="li-main"><span class="n-text">Morgen: Kinoabend im Programmkino. 2 haben zugesagt.</span><small>Erinnerung · Vorschlag</small></span></div>' + navA('notifsettings', 'Erinnerungen einstellen', {}, ' class="btn btn-ghost btn-sm"') + '</div>';
    return shell(S, 'Benachrichtigungen', body, { kicker: 'Alle Gruppen', back: true });
  };

  SCREENS.notifsettings = (S) => {
    let body = '<div class="title-row">' + notifTabs(S) + '</div>';
    body += '<section class="card"><div class="sw-row big"><span><strong>Push und E-Mail</strong><small>Hauptschalter. Das Postfach in der App bekommt immer alles.</small></span>' + sw(S.master, 'data-action="toggleMaster" data-k="master"', 'Push und E-Mail insgesamt') + '</div></section>';
    body += '<section class="card' + (S.master ? '' : ' is-muted') + '"><div class="pref-head" aria-hidden="true"><span></span><span>' + icon('phone') + 'Push</span><span>' + icon('mail') + 'E-Mail</span></div><ul class="prefs">' + M.EVENTS.map((e) => '<li class="pref"><span class="li-main"><strong>' + e.label + '</strong><small>' + e.desc + '</small></span>' + sw(S.prefs[e.key].push && S.master, 'data-action="togglePref" data-ev="' + e.key + '" data-ch="push" data-k="pp-' + e.key + '"' + (S.master ? '' : ' disabled'), e.label + ' per Push') + sw(S.prefs[e.key].email && S.master, 'data-action="togglePref" data-ev="' + e.key + '" data-ch="email" data-k="pe-' + e.key + '"' + (S.master ? '' : ' disabled'), e.label + ' per E-Mail') + '</li>').join('') + '</ul><p class="small">E-Mail ist freiwillig und standardmäßig aus. Jede Mail hat einen Abmelde-Link.</p></section>';
    body += '<section class="proposal-box"><div class="pb-head">' + icon('clock') + '<h2>Termin-Erinnerungen</h2>' + propTag() + '</div><p>Gibt es noch nicht. Erinnerungen sind freiwillig, tagesgenau und höchstens einmal je Anlass.</p><ul class="prefs">' + M.REMINDERS.map((r) => '<li class="pref pref-1"><span class="li-main"><strong>' + r.label + '</strong><small>' + r.desc + '</small></span>' + sw(!!S.reminders[r.key], 'data-action="toggleReminder" data-ev="' + r.key + '" data-k="rm-' + r.key + '"', r.label) + '</li>').join('') + '</ul></section>';
    return shell(S, 'Benachrichtigungen', body, { kicker: 'Einstellungen', back: true });
  };

  SCREENS.profile = (S) => {
    let body = '<section class="card profile-head">' + av(ME, 'xl') + '<div><h2 class="serif">Mara K.</h2><p class="small">mara@example.org · 3 Gruppen</p></div>' + btn('Bearbeiten', 'data-action="toast" data-msg="Demo: Name und Profilbild ändern."', 'outline btn-sm') + '</section>';
    body += '<section class="card"><h2>Deine Rollen-Badges</h2><p class="small">Badges zeigen, was für ein Typ du in der Gruppe bist – ohne Rangliste.</p><ul class="badges">' + M.BADGES.map((b) => { const t = tier(b.count); return '<li class="badge-item tier-' + (t.cur ? t.cur.name.toLowerCase() : 'none') + '"><span class="b-medal" aria-hidden="true">' + icon('star') + '</span><span class="li-main"><strong>' + b.name + '</strong><small>' + (t.cur ? t.cur.name : 'Noch keine Stufe') + ' · ' + b.count + ' ' + b.what + (t.next ? ' · ' + (t.next.from - b.count) + ' bis ' + t.next.name : '') + '</small></span></li>'; }).join('') + '</ul></section>';
    body += '<section class="card">' + navA('album', icon('camera') + '<span class="li-main"><strong>Erinnerungs-Album</strong><small>' + (S.newCards.length ? S.newCards.length + ' neue Memory Card' + (S.newCards.length > 1 ? 's' : '') : 'Alle gesehen') + '</small></span>' + icon('chevR'), {}, ' class="list-row"') +
      navA('notifsettings', icon('bell') + '<span class="li-main"><strong>Benachrichtigungen</strong><small>Push, E-Mail und Termin-Erinnerungen</small></span>' + icon('chevR'), {}, ' class="list-row"') +
      navA('group', icon('users') + '<span class="li-main"><strong>Gruppe & Einladen</strong><small>Feierabend-Crew</small></span>' + icon('chevR'), {}, ' class="list-row"') + '</section>';
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
    if (sb) return shell(S, 'Album', body + sb, { kicker: 'Profil', back: true });
    const cards = S.ui.state === 'empty' ? [] : S.activities.filter((a) => a.status === 'abgeschlossen');
    if (!cards.length) body += emptyBlock('camera', 'Euer Album ist noch leer', 'Schließt eure erste Aktivität ab – dann entsteht hier die erste Memory Card.');
    else body += '<ul class="album">' + cards.map((c) => memCard(c, S.newCards.includes(c.id), 'Feierabend-Crew')).join('') + OTHER_CARDS.map((c) => memCard(c, false, c.group)).join('') + '</ul>';
    body += '<div class="card wrapped-teaser"><span class="overline">Ab 1. Dezember</span><h2 class="serif">Euer Jahr in Mellon</h2><p class="small">Der Jahresrückblick der Feierabend-Crew erscheint, sobald ihr drei Aktivitäten abgeschlossen habt. Schon geschafft.</p></div>';
    return shell(S, 'Erinnerungs-Album', body, { kicker: 'Profil', back: true });
  };
  SCREENS.celebrate = SCREENS.home;

  /* ---------- Modals ---------- */
  function modalLayer(S) {
    if (!S.modal) return '';
    const m = S.modal; const e = S.errors; let title = '', body = '', role = 'dialog';
    if (m.type === 'proposal') {
      const dft = S.formDraft; const n = group().members; const maj = Math.floor(n / 2) + 1;
      title = 'Neuer Vorschlag';
      body = '<form data-form="proposal" novalidate class="form">' +
        field('f-title', 'Was wollt ihr machen?', '<input name="title" maxlength="80" autofocus value="' + esc(dft.title || '') + '" placeholder="z. B. Minigolf im Park" ' + inputAttrs('f-title', e.title) + '>', e.title) +
        '<fieldset class="field"><legend>Wie lange?</legend><div class="chips">' + [['spontan', 'Spontan'], ['wochenende', 'Wochenende'], ['laenger', 'Längerer Zeitraum']].map(([v, l]) => '<label class="chip-radio"><input type="radio" name="dur" value="' + v + '"' + ((dft.dur || 'spontan') === v ? ' checked' : '') + '><span>' + l + '</span></label>').join('') + '</div></fieldset>' +
        field('f-need', 'Ab wie vielen Stimmen geht’s in die Planung?', '<input name="need" type="number" inputmode="numeric" min="1" max="' + n + '" value="' + esc(dft.need || maj) + '" ' + inputAttrs('f-need', e.need, 'Vorbelegt mit der Mehrheit: ' + maj + ' von ' + n + ' Stimmen. Deine eigene zählt mit.') + '>', e.need, 'Vorbelegt mit der Mehrheit: ' + maj + ' von ' + n + ' Stimmen. Deine eigene zählt mit.') +
        field('f-link', 'Link <span class="opt">(optional)</span>', '<input name="link" type="url" inputmode="url" placeholder="https://" ' + inputAttrs('f-link', null, 'Vorschaubild wird später automatisch geladen.') + '>', null, 'Vorschaubild wird später automatisch geladen.') +
        field('f-desc', 'Beschreibung <span class="opt">(optional)</span>', '<textarea name="desc" rows="2" ' + inputAttrs('f-desc') + '>' + esc(dft.desc || '') + '</textarea>') +
        '<div class="modal-actions"><button class="btn btn-default" type="submit" data-k="submit">Vorschlag teilen</button>' + btn('Abbrechen', 'data-action="closeModal"', 'ghost') + '</div></form>';
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
    const a = A(c.id) || A('a7'); let h = '', p = '', art = '', btns = '';
    if (c.kind === 'threshold') { h = 'Genug Stimmen!'; p = '„' + a.title + '“ wandert aufs Board. Jetzt fehlt nur noch ein Termin.'; art = '<span class="cel-ic">' + icon('heart') + '</span>'; btns = navA('board', 'Zum Board', {}, ' class="btn btn-light"') + btn('Weiter abstimmen', 'data-action="closeCelebrate"', 'ghost-light'); }
    else if (c.kind === 'date') { h = 'Termin steht!'; p = a.title + ': ' + fmtRange(a.start, a.end) + '. Alle in der Gruppe werden benachrichtigt.'; art = '<span class="cel-ic">' + icon('calendar') + '</span>'; btns = btn('Zum Kalender hinzufügen', 'data-action="toast" data-msg="Demo: Kalenderdatei (.ics) wird heruntergeladen."', 'light', 'download') + btn('Fertig', 'data-action="closeCelebrate"', 'ghost-light'); }
    else {
      const lv = c.kind === 'levelup' ? M.LEVELS[(c.level || 3) - 1] : null;
      h = lv ? 'Level ' + lv.n + ': ' + lv.name : 'Neue Memory Card';
      p = lv ? 'Zehn gemeinsame Aktivitäten. Ihr seid eine eingespielte Gruppe!' : 'Die Erinnerung an „' + a.title + '“ liegt jetzt in eurem Album.';
      art = '<div class="flip"><div class="mem big cover-' + a.cover + '"><span class="mem-ic" aria-hidden="true">' + icon(COVER_ICON[a.cover]) + '</span><span class="mem-in"><span class="overline">Feierabend-Crew · ' + fmtDay(a.start || TODAY) + '</span><strong class="serif">' + esc(a.title) + '</strong></span></div></div>';
      btns = navA('album', 'Ins Album', {}, ' class="btn btn-light"') + btn('Fertig', 'data-action="closeCelebrate"', 'ghost-light');
    }
    return '<div class="scrim cel-scrim"></div><div class="celebrate" role="dialog" aria-modal="true" aria-labelledby="cel-h">' + (c.kind === 'levelup' ? M.confetti(18) : '') + art + '<h2 id="cel-h" class="display">' + esc(h) + '</h2><p>' + esc(p) + '</p><div class="cel-btns">' + btns + '</div></div>';
  }

  /* FAB weicht beim Runterscrollen aus (wie useHideOnScrollDown in der App) */
  let lastY = 0;
  document.addEventListener('scroll', (ev) => { const t = ev.target; if (!t.matches || !t.matches('[data-scroll]')) return; const f = document.querySelector('#app .fab'); if (f) f.classList.toggle('is-hidden', t.scrollTop > lastY && t.scrollTop > 40); lastY = t.scrollTop; }, true);

  /* ---------- Variante registrieren ---------- */
  M.start({
    routes: ROUTES, home: 'home', groupHome: 'proposals',
    statusLabels: { zu_planen: 'Zu planen', in_planung: 'In Planung', planung_abgeschlossen: 'Termin steht', abgeschlossen: 'Abgeschlossen' },
    routeModals: { newproposal: { modal: 'proposal', back: 'proposals' }, celebrate: { celebrate: 'levelup', id: 'a7', level: 3, back: 'home' } },
    screenList: ROUTES.map((r) => [r, NAMES[r], r === 'activity' ? { id: 'a6' } : r === 'datefinder' ? { id: 'a5' } : null]),
    screenName: (r) => NAMES[r] || r,
    roles: [['admin', 'Admin'], ['editor', 'Redakteur:in'], ['observer', 'Beobachter:in']],
    roleTitle: 'Deine Rolle', roleNote: 'Wie heute: Admin verwaltet; Admin und Initiator:in verschieben den Status und legen Termine fest; Beobachter:in kann nicht vorschlagen, aber abstimmen, Umfragen und Aufgaben nutzen. Der Schalter wechselt deine eigene Rolle.',
    roleLabel: (r) => ROLE[r] || r,
    about: '<p>Richtung A „Evolution“: heutige Navigation, Lücken geschlossen, <code>STYLEGUIDE.md</code> strikt. Abweichungen nur für Barrierefreiheit (Fokusring mit dunkler Innenkante, Kontraste).</p><p>Markiert: <strong>Vorschlag</strong> = gibt es noch nicht (Teilen-Link, Erinnerungen). <strong>Neu</strong> = neue Funktion ohne heutiges Datenmodell.</p><p>Alle Daten sind erfunden. Keine Netzwerkzugriffe, kein Tracking.</p><p>Schriften: Hanken Grotesk und Source Serif 4, SIL Open Font License 1.1. Logo: Mellon-Wortmarke als SVG.</p>',
    render: (S) => SCREENS[S.route] ? SCREENS[S.route](S) : SCREENS.home(S),
    actions: {
      setBlockMode: (el, ev, S) => { S.blockMode = el.dataset.val === '1'; M.render({ focus: el.dataset.k }); },
      toggleBlock: (el, ev, S) => { S.myBlocks = S.myBlocks || []; const d0 = el.dataset.day; const i = S.myBlocks.indexOf(d0); if (i >= 0) S.myBlocks.splice(i, 1); else S.myBlocks.push(d0); M.render({ focus: el.dataset.k }); M.toast(i >= 0 ? 'Tag wieder frei.' : 'Als „Kann nicht“ markiert.'); },
    },
  });
})();
