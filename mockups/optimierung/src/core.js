/* Mellon Mockups – gemeinsamer Kern (Demodaten, Zustand, Router, Steuerung, Interaktionen).
   Alle Daten sind frei erfunden. Kein Netzwerkzugriff, kein Tracking, kein Speicher außer dem Arbeitsspeicher. */
(function () {
  'use strict';
  const M = (window.Mellon = window.Mellon || {});

  /* ---------- Demodaten (in allen drei Mockups identisch) ---------- */
  const TODAY = '2026-11-01';
  const members = [
    { id: 'u1', name: 'Mara', full: 'Mara K.', role: 'admin', hue: 'green', cal: true },
    { id: 'u2', name: 'Jonas', full: 'Jonas B.', role: 'editor', hue: 'gold', cal: true },
    { id: 'u3', name: 'Aylin', full: 'Aylin D.', role: 'editor', hue: 'blush', cal: true },
    { id: 'u4', name: 'Tim', full: 'Tim R.', role: 'observer', hue: 'ink', cal: false },
    { id: 'u5', name: 'Sophie', full: 'Sophie L.', role: 'editor', hue: 'green', cal: true },
    { id: 'u6', name: 'Malik', full: 'Malik S.', role: 'observer', hue: 'gold', cal: false },
  ];
  const ME = 'u1';

  function seedActivities() {
    return [
      { id: 'a1', title: 'Bouldern in der Kletterhalle', status: 'vorschlag', dur: 'spontan', need: 4, votes: ['u2', 'u3', 'u5'], by: 'u2', cover: 'green', created: '2026-10-29', link: 'kletterhalle.example', desc: 'Feierabend-Session, Schuhe kann man leihen.' },
      { id: 'a2', title: 'Pizza-Abend mit Spieleturnier', status: 'vorschlag', dur: 'spontan', need: 4, votes: ['u1', 'u4'], by: 'u3', cover: 'gold', created: '2026-10-30', desc: 'Jede:r bringt einen Belag mit, Gewinner:in wählt das nächste Spiel.' },
      { id: 'a3', title: 'Weihnachtsmarkt-Bummel', status: 'vorschlag', dur: 'spontan', need: 3, votes: ['u5'], by: 'u1', cover: 'blush', created: '2026-10-31', desc: 'Glühwein, Maronen, danach Essen gehen.' },
      { id: 'a4', title: 'Städtetrip nach Leipzig', status: 'vorschlag', dur: 'laenger', need: 5, votes: [], by: 'u5', cover: 'ink', created: '2026-11-01', desc: 'Drei Tage, Zug und Hostel – Frühjahr?' },
      { id: 'a5', title: 'Kanutour auf der Lahn', status: 'zu_planen', dur: 'wochenende', need: 4, votes: ['u1', 'u2', 'u3', 'u5'], by: 'u3', cover: 'green', created: '2026-10-12', desc: 'Zwei Tage paddeln, Übernachtung am Campingplatz.' },
      { id: 'a6', title: 'Hüttenwochenende im Harz', status: 'in_planung', dur: 'wochenende', need: 4, votes: ['u1', 'u2', 'u3', 'u5', 'u6'], by: 'u1', cover: 'ink', created: '2026-09-20', start: '2027-01-15', end: '2027-01-17', place: 'Waldhütte bei Schierke', desc: 'Hütte mit Kamin für sechs Personen. Anreise Freitag ab 15 Uhr.' },
      { id: 'a7', title: 'Escape Room „Das Labor“', status: 'planung_abgeschlossen', dur: 'spontan', need: 3, votes: ['u1', 'u2', 'u4', 'u6'], by: 'u2', cover: 'gold', created: '2026-10-02', start: '2026-10-31', end: '2026-10-31', place: 'Innenstadt', desc: '60 Minuten, Team gegen die Uhr.' },
      { id: 'a8', title: 'Kinoabend im Programmkino', status: 'planung_abgeschlossen', dur: 'spontan', need: 3, votes: ['u3', 'u5', 'u1'], by: 'u5', cover: 'blush', created: '2026-10-20', start: '2026-11-20', end: '2026-11-20', place: 'Programmkino am Markt', desc: 'Originalfassung, danach noch auf ein Getränk.' },
      { id: 'a9', title: 'Herbstwanderung zum Aussichtsturm', status: 'abgeschlossen', dur: 'spontan', need: 4, votes: ['u1', 'u2', 'u3', 'u5', 'u6'], by: 'u3', cover: 'gold', created: '2026-09-28', start: '2026-10-18', end: '2026-10-18', photos: 3, quote: 'Oben gab es Kakao aus der Thermoskanne.' },
      { id: 'a10', title: 'Grillabend am See', status: 'abgeschlossen', dur: 'spontan', need: 4, votes: ['u1', 'u2', 'u4', 'u5'], by: 'u2', cover: 'green', created: '2026-08-01', start: '2026-08-22', end: '2026-08-22', photos: 2, quote: 'Sonnenuntergang und viel zu viele Würstchen.' },
      { id: 'a11', title: 'Spieleabend mit Raclette', status: 'abgeschlossen', dur: 'spontan', need: 3, votes: ['u1', 'u3', 'u5'], by: 'u5', cover: 'blush', created: '2026-09-05', start: '2026-09-26', end: '2026-09-26', photos: 1, quote: 'Revanche ist schon versprochen.' },
    ];
  }

  function seedDetail() {
    return {
      a6: {
        tasks: [
          { id: 't1', label: 'Hütte buchen und Anzahlung leisten', who: 'u1', due: '2026-11-01', done: true },
          { id: 't2', label: 'Einkaufsliste schreiben', who: 'u3', due: '2027-01-10', done: false },
          { id: 't3', label: 'Fahrgemeinschaften klären', who: 'u2', due: '2027-01-08', done: false },
          { id: 't4', label: 'Spiele mitbringen', who: 'u4', due: null, done: false },
          { id: 't5', label: 'Playlist für die Autofahrt', who: null, due: null, done: false },
        ],
        polls: [
          { id: 'p1', q: 'Was kochen wir am Samstagabend?', multi: true, by: 'u3', options: [
            { id: 'o1', label: 'Raclette', votes: ['u3', 'u5', 'u6'] },
            { id: 'o2', label: 'Chili sin Carne', votes: ['u2', 'u4'] },
            { id: 'o3', label: 'Pasta-Bar', votes: ['u3'] },
          ] },
        ],
        comments: [
          { id: 'c1', by: 'u3', at: 'vor 3 Tagen', text: 'Ich habe drei Hütten verglichen. Die am Waldrand hat einen Kamin und Platz für sechs.' },
          { id: 'c2', by: 'u2', at: 'vor 2 Tagen', text: '@Mara kannst du die Anzahlung vorstrecken? Ich überweise dir meinen Teil.' },
          { id: 'c3', by: 'u1', at: 'gestern', text: 'Erledigt, die Hütte ist gebucht. Anreise ab 15 Uhr.' },
          { id: 'c4', by: 'u4', at: 'vor 2 Std.', text: 'Ich bringe zwei Kartenspiele und die Lautsprecherbox mit.' },
        ],
        rsvp: { u1: 'yes', u2: 'yes', u3: 'yes', u5: 'yes', u4: 'maybe' },
      },
      a5: {
        tasks: [], polls: [], comments: [
          { id: 'c5', by: 'u3', at: 'vor 5 Tagen', text: 'Geschafft, vier Stimmen! Wer hat an welchen Wochenenden Zeit?' },
        ], rsvp: { u3: 'yes', u1: 'yes' },
        datePoll: [
          { id: 'd1', start: '2026-11-21', end: '2026-11-22', ans: { u1: 'yes', u2: 'yes', u3: 'yes', u5: 'maybe' } },
          { id: 'd2', start: '2026-11-28', end: '2026-11-29', ans: { u2: 'yes', u6: 'yes', u1: 'no' } },
          { id: 'd3', start: '2026-12-05', end: '2026-12-06', ans: { u3: 'yes', u5: 'yes', u6: 'yes', u2: 'maybe' } },
        ],
      },
      a7: { tasks: [
          { id: 't6', label: 'Raum reservieren', who: 'u2', due: '2026-10-20', done: true },
          { id: 't7', label: 'Treffpunkt festlegen', who: 'u1', due: '2026-10-30', done: true },
        ], polls: [], comments: [{ id: 'c6', by: 'u2', at: 'vor 2 Tagen', text: 'Treffpunkt 18:30 vor dem Eingang.' }], rsvp: { u1: 'yes', u2: 'yes', u4: 'yes', u6: 'yes' } },
      a8: { tasks: [{ id: 't8', label: 'Tickets reservieren', who: 'u1', due: '2026-11-15', done: false }], polls: [], comments: [], rsvp: { u5: 'yes', u3: 'yes' } },
    };
  }

  function seedNotifications() {
    return [
      { id: 'n1', type: 'mention', text: 'Jonas hat dich in „Hüttenwochenende im Harz“ erwähnt.', at: 'vor 2 Std.', unread: true, to: ['activity', { id: 'a6' }] },
      { id: 'n2', type: 'new_proposal', text: 'Sophie schlägt „Städtetrip nach Leipzig“ vor.', at: 'vor 5 Std.', unread: true, to: ['proposals', {}] },
      { id: 'n3', type: 'umfrage_erstellt', text: 'Aylin hat eine Umfrage gestartet: „Was kochen wir am Samstagabend?“', at: 'gestern', unread: true, to: ['activity', { id: 'a6' }] },
      { id: 'n4', type: 'now_planning', text: '„Kanutour auf der Lahn“ hat genug Stimmen. Jetzt einen Termin finden.', at: 'gestern', unread: false, to: ['datefinder', { id: 'a5' }] },
      { id: 'n5', type: 'responsibility', text: 'Du bist verantwortlich für „Hütte buchen und Anzahlung leisten“.', at: 'vor 3 Tagen', unread: false, to: ['activity', { id: 'a6' }] },
      { id: 'n6', type: 'date_set', text: 'Termin steht: „Kinoabend im Programmkino“ am Fr., 20. November.', at: 'vor 4 Tagen', unread: false, to: ['activity', { id: 'a8' }] },
    ];
  }

  const EVENTS = [
    { key: 'new_proposal', label: 'Neue Vorschläge', desc: 'Wenn jemand eine Aktivität vorschlägt' },
    { key: 'now_planning', label: 'In Planung', desc: 'Wenn ein Vorschlag genug Stimmen hat' },
    { key: 'date_set', label: 'Termin steht', desc: 'Wenn ein Termin festgelegt wurde' },
    { key: 'mention', label: 'Erwähnungen', desc: 'Wenn dich jemand in einem Kommentar erwähnt' },
    { key: 'responsibility', label: 'Aufgaben', desc: 'Wenn du für etwas verantwortlich wirst' },
    { key: 'umfrage_erstellt', label: 'Umfragen', desc: 'Wenn jemand eine Umfrage startet' },
  ];
  const REMINDERS = [
    { key: 'r_date', label: 'Vor dem Termin', desc: 'Einen Tag vorher, mit Ort und Zusagen' },
    { key: 'r_vote', label: 'Offene Abstimmungen', desc: 'Wenn deine Stimme nach 3 Tagen noch fehlt' },
    { key: 'r_task', label: 'Fällige Aufgaben', desc: 'Zwei Tage vor der Deadline deiner Aufgabe' },
  ];

  const LEVELS = [
    { n: 1, name: 'Neue Gruppe', from: 0 },
    { n: 2, name: 'Gruppe', from: 5 },
    { n: 3, name: 'Eingespielte Gruppe', from: 10 },
    { n: 4, name: 'Legendäre Gruppe', from: 25 },
  ];
  const BADGES = [
    { key: 'idee', name: 'Ideengeber:in', what: 'Vorschläge eingebracht', count: 17 },
    { key: 'entscheid', name: 'Entscheider:in', what: 'Stimmen abgegeben', count: 34 },
    { key: 'planer', name: 'Planer:in', what: 'Aufgaben übernommen', count: 7 },
    { key: 'dabei', name: 'Immer dabei', what: 'Aktivitäten mitgemacht', count: 9 },
  ];
  const TIERS = [{ name: 'Bronze', from: 5 }, { name: 'Silber', from: 15 }, { name: 'Gold', from: 30 }];

  const STATUS = {
    vorschlag: { label: 'Vorschlag', short: 'Vorschlag' },
    zu_planen: { label: 'Zu planen', short: 'Zu planen' },
    in_planung: { label: 'In Planung', short: 'In Planung' },
    planung_abgeschlossen: { label: 'Termin steht', short: 'Termin steht' },
    abgeschlossen: { label: 'Abgeschlossen', short: 'Abgeschlossen' },
  };
  const st = (s) => (V && V.statusLabels && V.statusLabels[s]) || STATUS[s].label;
  const BOARD = ['zu_planen', 'in_planung', 'planung_abgeschlossen', 'abgeschlossen'];
  const DUR = { spontan: 'Spontan', wochenende: 'Wochenende', laenger: 'Längerer Zeitraum' };

  function fresh() {
    return {
      route: 'welcome', params: {},
      ui: { state: 'normal', role: 'admin', view: 'auto', theme: 'light', panel: false },
      groups: [
        { id: 'g1', name: 'Feierabend-Crew', code: 'DEMOCREW42', done: 9, members: 6 },
        { id: 'g2', name: 'Uni-Kochclub', code: 'KOCHCLUB77', done: 3, members: 4 },
      ],
      activities: seedActivities(),
      detail: seedDetail(),
      notifications: seedNotifications(),
      prefs: Object.fromEntries(EVENTS.map((e) => [e.key, { push: true, email: false }])),
      reminders: Object.fromEntries(REMINDERS.map((r) => [r.key, false])),
      master: true,
      filter: 'alle',
      boardCol: 'in_planung',
      onboardStep: 0,
      authTab: 'login',
      dateSel: { start: null, end: null },
      modal: null,
      celebrate: null,
      errors: {},
      formDraft: {},
      newCards: ['a9'],
      joined: false,
      shareCopied: false,
      calMonth: '2026-11',
    };
  }

  /* ---------- Hilfsfunktionen ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const member = (id) => members.find((m) => m.id === id);
  const WD = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
  const WDL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const MONS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
  const d = (iso) => { const [y, m, dd] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd)); };
  const iso = (dt) => dt.toISOString().slice(0, 10);
  function fmtDay(s, long) { const x = d(s); return (long ? WDL : WD)[x.getUTCDay()] + (long ? ', ' : ' ') + x.getUTCDate() + '. ' + (long ? MON : MONS)[x.getUTCMonth()]; }
  function fmtRange(a, b) {
    if (!a) return 'Noch kein Termin';
    if (!b || a === b) return fmtDay(a);
    const x = d(a), y = d(b);
    if (x.getUTCMonth() === y.getUTCMonth()) return WD[x.getUTCDay()] + ' ' + x.getUTCDate() + '.–' + WD[y.getUTCDay()] + ' ' + y.getUTCDate() + '. ' + MONS[y.getUTCMonth()];
    return fmtDay(a) + ' – ' + fmtDay(b);
  }
  function daysUntil(s) { return Math.round((d(s) - d(TODAY)) / 86400000); }
  function relDay(s) {
    const n = daysUntil(s);
    if (n === 0) return 'heute'; if (n === 1) return 'morgen'; if (n === -1) return 'gestern';
    if (n > 1) return 'in ' + n + ' Tagen'; return 'vor ' + -n + ' Tagen';
  }
  const initials = (m) => m.name.slice(0, 1);
  function level(done) { let l = LEVELS[0]; LEVELS.forEach((x) => { if (done >= x.from) l = x; }); const next = LEVELS.find((x) => x.from > done) || null; return { cur: l, next }; }
  function tier(count) { let t = null; TIERS.forEach((x) => { if (count >= x.from) t = x; }); const next = TIERS.find((x) => x.from > count) || null; return { cur: t, next }; }

  /* Verfügbarkeit (Terminfindung): deterministisch erzeugt. free / partial / busy / unknown */
  function availability(day) {
    const x = d(day); const wd = x.getUTCDay();
    const fixed = { '2026-11-21': 'free', '2026-11-22': 'free', '2026-11-28': 'partial', '2026-11-29': 'busy', '2026-12-05': 'free', '2026-12-06': 'partial', '2026-11-14': 'busy', '2026-11-15': 'partial', '2026-11-07': 'partial', '2026-11-08': 'busy', '2026-12-12': 'partial', '2026-12-13': 'free', '2026-12-19': 'busy', '2026-12-20': 'busy' };
    if (fixed[day]) return fixed[day];
    if (day < TODAY) return 'past';
    const h = (x.getUTCDate() * 7 + x.getUTCMonth() * 3) % 5;
    if (wd === 0 || wd === 6) return h < 2 ? 'free' : 'partial';
    return h < 2 ? 'busy' : h < 4 ? 'partial' : 'free';
  }
  function busyNames(day) {
    const a = availability(day);
    if (a === 'free') return [];
    if (a === 'partial') return [member('u2').name];
    if (a === 'busy') return [member('u2').name, member('u3').name, member('u5').name];
    return [];
  }
  function monthGrid(ym) {
    const [y, m] = ym.split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const offset = (first.getUTCDay() + 6) % 7; // Montag zuerst
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let i = 1; i <= days; i++) cells.push(iso(new Date(Date.UTC(y, m - 1, i))));
    while (cells.length % 7) cells.push(null);
    return { label: MON[m - 1] + ' ' + y, cells };
  }
  function shiftMonth(ym, delta) { const [y, m] = ym.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1 + delta, 1)); return iso(t).slice(0, 7); }


  const ICONS = {
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    heart: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z',
    board: 'M4 4h4v16H4z M10 4h4v10h-4z M16 4h4v13h-4z',
    calendar: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.9 1.9 0 0 0 3.4 0',
    plus: 'M12 5v14 M5 12h14', check: 'M20 6 9 17l-5-5', chevL: 'm15 18-6-6 6-6', chevR: 'm9 18 6-6-6-6', chevD: 'm6 9 6 6 6-6', x: 'M18 6 6 18 M6 6l12 12',
    wifiOff: 'M2 2l20 20 M8.5 16.5a5 5 0 0 1 7 0 M5 12.9a10 10 0 0 1 5.2-2.8 M19 12.9a10 10 0 0 0-2.3-1.6 M12 20h.01',
    share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13', copy: 'M8 8h12v12H8z M4 16V4h12',
    link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
    pin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
    sparkles: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z M19 3v4 M21 5h-4',
    trophy: 'M8 21h8 M12 17v4 M7 4h10v5a5 5 0 0 1-10 0z M17 5h3v2a3 3 0 0 1-3 3 M7 5H4v2a3 3 0 0 0 3 3',
    camera: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    sliders: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
    message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    alert: 'M12 9v4 M12 17h.01 M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5',
    arrowR: 'M5 12h14 M12 5l7 7-7 7', arrowL: 'M19 12H5 M12 19l-7-7 7-7',
    flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.2.4 1.2 1.5 2.2 2.5 2.7z',
    star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
    list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01', layers: 'M12 2 2 7l10 5 10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4', moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
    lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4', search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
    mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6', phone: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M12 18h.01',
    more: 'M5 12h.01 M12 12h.01 M19 12h.01', help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3 M12 17h.01',
    thumb: 'M7 10v12 M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9z',
    skip: 'M5 4l10 8-10 8z M19 5v14', image: 'M3 3h18v18H3z M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M21 15l-5-5L5 21', logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9', key: 'M15.5 7.5 19 4 M21 2l-9.6 9.6 M15.5 7.5l3 3L22 7l-3-3 M7.5 21a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z',
  };
  const icon = (n, cls) => '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + ICONS[n] + '"/></svg>';
  function qr(seed) {
    let h = '<svg class="qr" viewBox="0 0 25 25" role="img" aria-label="QR-Code-Platzhalter (Vorschlag)"><rect width="25" height="25" fill="#fff"/>'; let x = seed || 7;
    const fin = (a, b) => '<path d="M' + a + ' ' + b + 'h7v7h-7zM' + (a + 1) + ' ' + (b + 1) + 'v5h5v-5zM' + (a + 2) + ' ' + (b + 2) + 'h3v3h-3z" fill="#111" fill-rule="evenodd"/>';
    h += fin(0, 0) + fin(18, 0) + fin(0, 18);
    for (let i = 0; i < 25; i++) for (let j = 0; j < 25; j++) { if ((i < 8 && j < 8) || (i > 16 && j < 8) || (i < 8 && j > 16)) continue; x = (x * 1103515245 + 12345) % 2147483648; if (x % 3 === 0) h += '<rect x="' + i + '" y="' + j + '" width="1" height="1" fill="#111"/>'; }
    return h + '</svg>';
  }
  function confetti(n) {
    let h = '<div class="confetti" aria-hidden="true">';
    for (let i = 0; i < (n || 22); i++) { const x = ((i * 47) % 100) - 50; const r = (i * 73) % 360; const dl = (i % 6) * 40; h += '<i style="--x:' + x + 'vw;--r:' + r + 'deg;--d:' + dl + 'ms;--c:' + (i % 4) + '"></i>'; }
    return h + '</div>';
  }

  /* ---------- Zustand und Rendering ---------- */
  let S = fresh();
  let V = null; // Variante
  const actions = {};

  function A(id) { return S.activities.find((a) => a.id === id); }
  function D(id) { if (!S.detail[id]) S.detail[id] = { tasks: [], polls: [], comments: [], rsvp: {} }; return S.detail[id]; }
  function group() { return S.groups[0]; }
  function myRole() { return S.ui.role; }

  function defaultCan(action, act) {
    const r = myRole();
    switch (action) {
      case 'create': return r === 'admin' || r === 'editor';
      case 'vote': return true;
      case 'edit': return r === 'admin' || (act && act.by === ME);
      case 'findDate': return r === 'admin' || (act && act.by === ME);
      case 'move': return r === 'admin' || (act && act.by === ME);
      case 'complete': return r === 'admin' || (act && act.by === ME);
      case 'manageMembers': return r === 'admin';
      case 'regenerate': return r === 'admin';
      case 'addTask': return true;
      case 'poll': return true;
      default: return true;
    }
  }
  function can(action, act) { if (S.ui.state === 'offline' && action !== 'vote-view') { if (['create', 'move', 'complete', 'findDate', 'addTask', 'poll', 'edit', 'regenerate', 'manageMembers'].includes(action)) return false; } return V && V.can ? V.can(action, act, S) : defaultCan(action, act); }
  const online = () => S.ui.state !== 'offline';

  function parseHash() {
    let h = ''; try { h = decodeURIComponent((location.hash || '').replace(/^#\/?/, '')); } catch (e) { h = ''; }
    if (!h) return null;
    const [route, q] = h.split('?');
    const params = {};
    (q || '').split('&').filter(Boolean).forEach((kv) => { const [k, v] = kv.split('='); params[k] = v; });
    return { route, params };
  }
  function href(route, params) {
    const q = Object.entries(params || {}).map(([k, v]) => k + '=' + v).join('&');
    return '#/' + route + (q ? '?' + q : '');
  }
  function go(route, params) {
    if (V && V.routes && !V.routes.includes(route)) route = V.home || V.routes[0];
    const h = href(route, params || {});
    if (location.hash === h) { S.route = route; S.params = params || {}; render(); }
    else location.hash = h;
  }

  const trail = []; // App-interner Verlauf, damit „Zurück“ nie die Datei verlässt
  function onHash() {
    const p = parseHash();
    if (!p) return;
    if (trail[trail.length - 1] !== location.hash) trail.push(location.hash);
    if (V.routes && !V.routes.includes(p.route)) { p.route = V.routes[0]; }
    const changed = p.route !== S.route || JSON.stringify(p.params) !== JSON.stringify(S.params);
    S.route = p.route; S.params = p.params;
    if (changed) { S.recentDone = []; S.modal = null; S.celebrate = S.celebrate && !S.celebrate.preview && S.celebrate.kind === 'date' ? S.celebrate : null; S.errors = {}; S.dateSel = p.route === 'datefinder' ? S.dateSel : { start: null, end: null }; }
    render({ scrollTop: changed });
  }

  function focusKey(el) { if (!el || el === document.body) return null; return el.getAttribute('data-k') || (el.id ? '#' + el.id : null); }
  function findKey(k) { if (!k) return null; if (k[0] === '#') return document.getElementById(k.slice(1)); return document.querySelector('[data-k="' + CSS.escape(k) + '"]'); }

  const root = () => document.getElementById('app');
  let toastTimer = null; let lastModalKey = '';
  let undoFn = null;
  function toast(msg, kind, undo) {
    const r = document.getElementById('toast-region');
    if (!r) return;
    undoFn = undo || null;
    r.innerHTML = '<div class="toast toast-' + (kind || 'info') + '"><span>' + esc(msg) + '</span>' + (undo ? '<button type="button" class="toast-undo" data-action="undoLast">Rückgängig</button>' : '') + '</div>';
    clearTimeout(toastTimer);
    const hide = () => { r.innerHTML = ''; undoFn = null; };
    toastTimer = setTimeout(hide, undo ? 10000 : 3600);
    if (undo) { const t = r.querySelector('.toast'); t.addEventListener('mouseenter', () => clearTimeout(toastTimer)); t.addEventListener('focusin', () => clearTimeout(toastTimer)); t.addEventListener('mouseleave', () => { toastTimer = setTimeout(hide, 4000); }); }
  }

  function render(opts) {
    opts = opts || {};
    const app = root(); if (!app) return;
    const active = document.activeElement;
    const keepKey = opts.focus || (app.contains(active) ? focusKey(active) : null);
    const scroller = app.querySelector('[data-scroll]');
    const prevScroll = scroller ? scroller.scrollTop : 0;
    document.documentElement.dataset.theme = S.ui.theme;
    const frame = document.getElementById('frame');
    frame.dataset.view = S.ui.view;
    const rm = routeModal();
    if (rm && rm.modal && !S.modal) S.modal = { type: rm.modal, id: rm.id };
    if (rm && rm.celebrate && !S.celebrate) S.celebrate = { kind: rm.celebrate, id: rm.id, level: rm.level, preview: true };
    const mKey = S.modal ? 'm:' + S.modal.type + ':' + (S.modal.id || '') : S.celebrate ? 'c:' + S.celebrate.kind : '';
    app.innerHTML = V.render(S);
    if (mKey && mKey === lastModalKey) app.querySelectorAll('.sheet, .scrim, .celebrate').forEach((x) => x.classList.add('stay'));
    lastModalKey = mKey;
    if (mKey) app.querySelectorAll('.app > :not(.sheet):not(.scrim):not(.celebrate):not(.confetti)').forEach((x) => x.setAttribute('inert', ''));
    syncPanel();
    const sc = app.querySelector('[data-scroll]');
    if (sc) sc.scrollTop = opts.scrollTop ? 0 : prevScroll;
    if (S.modal || S.celebrate) {
      const dlg = app.querySelector('[role="dialog"], [role="alertdialog"]');
      const kk = keepKey && findKey(keepKey); const target = (kk && dlg && dlg.contains(kk) ? kk : null) || (dlg && (dlg.querySelector('[autofocus]') || dlg.querySelector(FOCUSABLE)));
      if (target) target.focus({ preventScroll: true });
    } else {
      const el = findKey(keepKey);
      if (el) el.focus({ preventScroll: true });
      else if (opts.scrollTop || keepKey || opts.fallback) { const h = app.querySelector('h1') || document.getElementById('main'); if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    }
  }
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /* ---------- Aktionen ---------- */
  function reg(name, fn) { actions[name] = fn; }
  reg('nav', (el) => { const p = {}; Object.entries(el.dataset).forEach(([k, v]) => { if (k.startsWith('p') && k.length > 1 && k !== 'pressed') p[k[1].toLowerCase() + k.slice(2)] = v; }); go(el.dataset.to, p); });
  reg('back', () => { trail.pop(); const prev = trail.pop(); if (prev) location.hash = prev; else go(V.home || 'home'); });
  reg('setUi', (el) => {
    const k = el.dataset.key, v = el.dataset.val;
    if (k === 'view' && v === 'desktop' && window.innerWidth < 768) { toast('Die Desktop-Ansicht braucht mindestens 768 px Fensterbreite. Vergrößere das Fenster.', 'info'); return; }
    S.ui[k] = v; render(); if (k === 'theme') toast(v === 'dark' ? 'Dunkler Modus' : 'Heller Modus');
  });
  reg('togglePanel', () => { S.ui.panel = !S.ui.panel; syncPanel(); if (S.ui.panel) { const f = document.querySelector('#mk-panel ' + FOCUSABLE); if (f) f.focus(); } else document.getElementById('mk-toggle').focus(); });
  reg('retry', () => { S.ui.state = 'normal'; render(); toast('Neu geladen.'); });
  reg('goOnline', () => { S.ui.state = 'normal'; render(); toast('Wieder online. Alles ist synchron.', 'success'); });
  reg('openModal', (el) => { S.modal = { type: el.dataset.modal, id: el.dataset.id, opener: focusKey(el) }; S.errors = {}; render(); });
  reg('closeModal', () => closeModal());
  const routeModal = () => V.routeModals && V.routeModals[S.route];
  function closeModal() { const rm = routeModal(); const op = S.modal && S.modal.opener; S.modal = null; S.errors = {}; if (rm && rm.modal) { go(rm.back); return; } render({ focus: op, fallback: true }); }
  reg('closeCelebrate', () => { const rm = routeModal(); const op = S.celebrate && S.celebrate.opener; S.celebrate = null; if (rm && rm.celebrate) { go(rm.back); return; } render({ focus: op, fallback: true }); });

  reg('onboardNext', () => { S.onboardStep++; render({ focus: 'onb-next' }); });
  reg('onboardBack', () => { S.onboardStep = Math.max(0, S.onboardStep - 1); render(); });
  reg('authTab', (el) => { S.authTab = el.dataset.val; S.errors = {}; render(); });
  reg('ssoLogin', (el) => { toast('Demo: Anmeldung mit ' + el.dataset.val + ' simuliert.', 'success'); go(V.home || 'home'); });

  reg('filter', (el) => { S.filter = el.dataset.val; render(); });
  reg('boardCol', (el) => { S.boardCol = el.dataset.val; render(); });

  reg('vote', (el) => {
    const a = A(el.dataset.id); if (!a) return;
    if (!online()) { offlineToast(); return; }
    const i = a.votes.indexOf(ME);
    if (i >= 0) { a.votes.splice(i, 1); render(); toast('Stimme zurückgenommen.'); return; }
    a.votes.push(ME);
    if (a.status === 'vorschlag' && a.votes.length >= a.need) {
      a.status = 'zu_planen';
      S.celebrate = { kind: 'threshold', id: a.id, opener: focusKey(el) };
      render();
    } else { render(); const left = a.need - a.votes.length; toast(left > 0 ? 'Deine Stimme zählt. Noch ' + left + ' bis zur Planung.' : 'Deine Stimme zählt.', 'success'); pop(el.dataset.k); }
  });
  function pop(k) { const el = findKey(k); if (el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } }

  reg('rsvp', (el) => {
    const a = D(el.dataset.id); const v = el.dataset.val;
    if (!online()) { offlineToast(); return; }
    if (a.rsvp[ME] === v) delete a.rsvp[ME]; else a.rsvp[ME] = v; render();
    if (a.rsvp[ME] === 'yes') { toast('Du bist dabei!', 'success'); pop(el.dataset.k); }
    else if (a.rsvp[ME] === 'maybe') toast('Vermerkt: vielleicht.');
    else if (a.rsvp[ME] === 'no') toast('Schade! Die Gruppe sieht, dass du diesmal nicht kannst.');
    else toast('Antwort zurückgenommen.');
  });

  reg('toggleTask', (el) => {
    const det = D(el.dataset.id); const t = det.tasks.find((x) => x.id === el.dataset.task);
    if (!t) return;
    if (!online()) { offlineToast(); return; }
    t.done = !t.done; S.recentDone = S.recentDone || []; if (t.done) S.recentDone.push(t.id); render();
    if (t.done) { const open = det.tasks.filter((x) => !x.done).length; toast(open ? 'Erledigt! Noch ' + open + ' offen.' : 'Alles erledigt. Stark, Team!', 'success', () => { t.done = false; render({ focus: el.dataset.k }); toast('Wieder offen.'); }); pop(el.dataset.k); }
  });
  reg('claimTask', (el) => {
    const det = D(el.dataset.id); const t = det.tasks.find((x) => x.id === el.dataset.task);
    if (!t) return; if (!online()) { offlineToast(); return; }
    t.who = ME; render(); toast('Du übernimmst: ' + t.label, 'success');
  });
  reg('pollVote', (el) => {
    if (!online()) { offlineToast(); return; }
    const det = D(el.dataset.id); const p = det.polls.find((x) => x.id === el.dataset.poll); const o = p.options.find((x) => x.id === el.dataset.opt);
    const i = o.votes.indexOf(ME); if (i >= 0) o.votes.splice(i, 1); else o.votes.push(ME);
    render();
  });
  reg('datePollVote', (el) => {
    if (!online()) { offlineToast(); return; }
    const det = D(el.dataset.id); const o = det.datePoll.find((x) => x.id === el.dataset.opt);
    if (o.ans[ME] === el.dataset.val) delete o.ans[ME]; else o.ans[ME] = el.dataset.val; render();
  });
  reg('pickDateOption', (el) => {
    const a = A(el.dataset.id); const o = D(el.dataset.id).datePoll.find((x) => x.id === el.dataset.opt);
    if (!online()) { offlineToast(); return; } if (!can('findDate', a)) { toast('Den Termin legt die Gastgeber:in oder ein Admin fest.'); return; }
    a.start = o.start; a.end = o.end; if (a.status === 'zu_planen') a.status = 'in_planung';
    S.celebrate = { kind: 'date', id: a.id, opener: null };
    go('activity', { id: a.id });
  });

  reg('pickDay', (el) => {
    const day = el.dataset.day; const s = S.dateSel;
    if (!s.start || (s.start && s.end)) { s.start = day; s.end = null; }
    else { if (day < s.start) { s.end = s.start; s.start = day; } else s.end = day; }
    render({ focus: el.dataset.k });
  });
  reg('calMonth', (el) => { S.calMonth = shiftMonth(S.calMonth, Number(el.dataset.val)); render({ focus: el.dataset.k }); });
  reg('confirmDate', (el) => {
    const a = A(el.dataset.id); const s = S.dateSel;
    if (!online()) { offlineToast(); return; } if (!can('findDate', a)) { toast('Den Termin legt ' + (V.dateOwner || 'der Admin oder die Initiator:in') + ' fest.'); return; }
    if (!s.start) { S.errors.date = 'Tippe zuerst auf einen Start- und einen Endtag.'; render(); return; }
    a.start = s.start; a.end = s.end || s.start; if (a.status === 'zu_planen') a.status = 'in_planung';
    S.dateSel = { start: null, end: null };
    S.celebrate = { kind: 'date', id: a.id, opener: null };
    go('activity', { id: a.id });
  });

  reg('moveStatus', (el) => {
    const a = A(el.dataset.id); const to = el.dataset.val;
    if (!online()) { offlineToast(); return; }
    if (!can('move', a)) { toast('Dafür fehlt dir das Recht in dieser Rolle.'); return; }
    if (to === 'abgeschlossen') { complete(a, el); return; }
    a.status = to; S.modal = null; render({ focus: el.dataset.k }); toast('„' + a.title + '“ ist jetzt: ' + st(to) + '.', 'success');
  });
  function complete(a, el) {
    a.status = 'abgeschlossen'; a.photos = a.photos || 0; a.quote = a.quote || 'Neu im Album – fügt eure Fotos hinzu.';
    const g = group(); const before = level(g.done).cur.n; g.done++; const after = level(g.done).cur.n;
    S.newCards.push(a.id); S.modal = null;
    S.celebrate = { kind: after > before ? 'levelup' : 'card', id: a.id, level: after, opener: el ? focusKey(el) : null };
    render();
  }
  reg('complete', (el) => { const a = A(el.dataset.id); if (!online()) { offlineToast(); return; } if (!can('complete', a)) { toast('Dafür fehlt dir das Recht in dieser Rolle.'); return; } complete(a, el); });

  reg('markAllRead', () => { S.notifications.forEach((n) => (n.unread = false)); render(); toast('Alles gelesen.'); });
  reg('openNotif', (el) => { const n = S.notifications.find((x) => x.id === el.dataset.id); n.unread = false; go(n.to[0], n.to[1]); });
  reg('togglePref', (el) => { const p = S.prefs[el.dataset.ev]; p[el.dataset.ch] = !p[el.dataset.ch]; render({ focus: el.dataset.k }); });
  reg('toggleMaster', (el) => { S.master = !S.master; render({ focus: el.dataset.k }); toast(S.master ? 'Benachrichtigungen an.' : 'Alle Push- und E-Mail-Benachrichtigungen aus. Das Postfach in der App bleibt.'); });
  reg('toggleReminder', (el) => { S.reminders[el.dataset.ev] = !S.reminders[el.dataset.ev]; render({ focus: el.dataset.k }); });

  reg('copyCode', () => { toast('Code ' + group().code + ' kopiert.', 'success'); });
  reg('shareLink', () => { S.shareCopied = true; render(); toast('Vorschlag: Ein persönlicher Einladungs-Link (7 Tage gültig, jederzeit widerrufbar) würde jetzt über das Teilen-Menü verschickt.', 'info'); });
  reg('regenerate', () => { if (!can('regenerate')) return; group().code = 'NEUCODE7QX'; S.modal = null; render(); toast('Neuer Code erstellt. Der alte gilt nicht mehr.', 'success'); });
  reg('setRole', (el) => { if (!can('manageMembers')) { toast('Rollen ändern können nur Admins.'); return; } const m = member(el.dataset.id); const v = el.dataset.val || el.value; m.role = v; render({ focus: el.dataset.k }); toast(m.name + ' ist jetzt ' + V.roleLabel(v) + '.', 'success'); });
  reg('openGroup', (el) => { if (el.dataset.id !== 'g1') { toast('In der Demo ist nur die Feierabend-Crew befüllt.'); return; } go(V.groupHome || 'proposals'); });
  function offlineToast() { toast('Du bist offline. Das geht wieder, sobald die Verbindung zurück ist.', 'info'); }
  reg('markCardsSeen', () => { S.newCards = []; render(); });
  reg('demoReset', () => { const ui = S.ui; S = fresh(); S.ui = ui; S.route = V.home || 'home'; go(V.home || 'home'); toast('Demo zurückgesetzt.'); });
  reg('toast', (el) => toast(el.dataset.msg));
  reg('undoLast', () => { const f = undoFn; undoFn = null; document.getElementById('toast-region').innerHTML = ''; if (f) f(); });
  reg('pickRange', (el) => { S.dateSel = { start: el.dataset.start, end: el.dataset.end }; render({ focus: el.dataset.k }); toast('Zeitraum gewählt: ' + fmtRange(el.dataset.start, el.dataset.end)); });
  reg('exportData', () => toast('Demo: Dein Datenexport (JSON) würde jetzt erstellt und per E-Mail-Link bereitgestellt.', 'info'));
  reg('deleteAccount', () => { S.modal = null; toast('Demo: Konto gelöscht. In der echten App folgt eine Bestätigung per E-Mail.', 'info'); go('welcome'); });
  reg('report', (el) => { S.modal = null; render(); toast('Danke. Die Meldung geht vertraulich an die Admins der Gruppe. Der Inhalt bleibt für dich ausgeblendet.', 'success'); });
  reg('hideContent', () => { S.modal = null; render(); toast('Ausgeblendet. Niemand wird benachrichtigt.'); });
  reg('block', () => { S.modal = null; render(); toast('Blockiert. Du siehst die Inhalte dieser Person nicht mehr; sie erfährt es nicht.'); });
  reg('removeContent', () => { S.modal = null; render(); toast('Demo: Inhalt entfernt. Die Person erfährt den Grund.', 'success'); });
  reg('logout', () => { toast('Abgemeldet.'); go('login'); });
  reg('skipToMain', () => { const m = document.getElementById('main'); if (m) m.focus(); });

  /* Formulare */
  const forms = {};
  forms.login = (f) => {
    const email = f.email.value.trim(); const pw = f.password.value; const e = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Bitte gib eine gültige E-Mail-Adresse ein.';
    if (pw.length < 8) e.password = 'Das Passwort braucht mindestens 8 Zeichen.';
    if (S.authTab === 'signup' && !f.terms.checked) e.terms = 'Bitte bestätige die Datenschutzhinweise.';
    S.errors = e; S.formDraft = { email };
    if (Object.keys(e).length) { render({ focus: Object.keys(e)[0] === 'terms' ? 'f-terms' : 'f-' + Object.keys(e)[0] }); return; }
    if (S.authTab === 'signup') { toast('Demo: Bestätigungs-Mail an ' + email + ' simuliert.', 'success'); go('join'); }
    else { toast('Willkommen zurück!', 'success'); go(V.home || 'home'); }
  };
  forms.join = (f) => {
    const code = f.code.value.trim().toUpperCase(); const e = {};
    if (!code) e.code = 'Bitte gib einen Einladungs-Code ein.';
    else if (code === group().code) e.code = 'Du bist bereits Mitglied dieser Gruppe.';
    else if (code !== 'LAUFNORD24') e.code = 'Ungültiger Einladungs-Code. Prüfe die zehn Zeichen.';
    S.errors = e; S.formDraft = { code };
    if (e.code) { render({ focus: 'f-code' }); return; }
    if (!S.groups.find((g) => g.id === 'g3')) S.groups.push({ id: 'g3', name: 'Laufgruppe Nord', code: 'LAUFNORD24', done: 1, members: 5 });
    S.joined = true; toast('Willkommen in der Laufgruppe Nord!', 'success'); go(V.home || 'home');
  };
  forms.proposal = (f) => {
    const t = f.title.value.trim(); const need = Number(f.need.value); const dur = f.dur.value; const e = {};
    if (!t) e.title = 'Gib deinem Vorschlag einen Namen.';
    else if (t.length > 60) e.title = 'Höchstens 60 Zeichen.';
    if (!dur) e.dur = 'Wähle eine Dauer.';
    if (!need || need < 1) e.need = 'Mindestens 1 Stimme.';
    else if (need > group().members) e.need = 'Höchstens ' + group().members + ' – so viele seid ihr.';
    S.errors = e; S.formDraft = { title: t, need: f.need.value, dur, desc: f.desc ? f.desc.value : '' };
    if (Object.keys(e).length) { render({ focus: 'f-' + Object.keys(e)[0] }); return; }
    const id = 'n' + Date.now();
    S.activities.unshift({ id, title: t, status: 'vorschlag', dur, need, votes: [ME], by: ME, cover: ['green', 'gold', 'blush', 'ink'][S.activities.length % 4], created: TODAY, desc: S.formDraft.desc, link: f.link ? f.link.value.trim() : '' });
    S.modal = null; S.formDraft = {}; S.filter = 'alle';
    toast((V.ideaWord || 'Vorschlag') + ' ist online. Deine Stimme zählt schon – noch ' + Math.max(0, need - 1) + ' bis zur Planung.', 'success');
    go(V.groupHome || 'proposals');
  };
  forms.comment = (f) => {
    const txt = f.text.value.trim();
    if (!txt) { S.errors = { comment: 'Schreib erst etwas.' }; render({ focus: 'f-comment' }); return; }
    if (!online()) { offlineToast(); return; }
    D(f.dataset.id).comments.push({ id: 'c' + Date.now(), by: ME, at: 'gerade eben', text: txt }); S.errors = {}; render({ focus: 'f-comment' }); toast('Kommentar gesendet.', 'success');
  };
  forms.task = (f) => {
    const txt = f.label.value.trim(); if (!txt) { S.errors = { task: 'Beschreibe die Aufgabe kurz.' }; render({ focus: 'f-task' }); return; }
    D(f.dataset.id).tasks.push({ id: 't' + Date.now(), label: txt, who: f.who.value || null, due: null, done: false }); S.errors = {}; S.modal = null; render(); toast('Aufgabe angelegt.', 'success');
  };
  forms.poll = (f) => {
    const q = f.q.value.trim(); const opts = [f.o1.value.trim(), f.o2.value.trim(), f.o3.value.trim()].filter(Boolean);
    const e = {}; if (!q) e.q = 'Stell eine Frage.'; if (opts.length < 2) e.o1 = 'Mindestens zwei Antworten.';
    S.errors = e; if (Object.keys(e).length) { render({ focus: 'f-' + Object.keys(e)[0] }); return; }
    D(f.dataset.id).polls.push({ id: 'p' + Date.now(), q, multi: true, by: ME, options: opts.map((l, i) => ({ id: 'x' + i, label: l, votes: [] })) });
    S.modal = null; render(); toast('Umfrage gestartet.', 'success');
  };

  /* ---------- Steuerung (Mockup-Chrome, nicht Teil der App) ---------- */
  function syncPanel() {
    const p = document.getElementById('mk-panel'); const t = document.getElementById('mk-toggle');
    if (!p) return;
    p.hidden = !S.ui.panel; t.setAttribute('aria-expanded', String(S.ui.panel));
    p.querySelectorAll('[data-action="setUi"]').forEach((b) => b.setAttribute('aria-pressed', String(S.ui[b.dataset.key] === b.dataset.val)));
    p.querySelectorAll('[data-action="nav"]').forEach((b) => b.setAttribute('aria-current', b.dataset.to === S.route ? 'page' : 'false'));
    const st = document.getElementById('mk-status');
    if (st) st.textContent = [V.screenName(S.route), labelOf('state', S.ui.state), V.roleLabel(S.ui.role)].join(' · ');
  }
  function labelOf(k, v) { return { state: { normal: 'Normal', empty: 'Leer', loading: 'Laden', error: 'Fehler', offline: 'Offline' } }[k][v]; }

  function buildPanel() {
    const seg = (key, opts) => '<div class="mk-seg" role="group" aria-label="' + esc(opts.label) + '">' + opts.items.map(([v, l]) => '<button type="button" data-action="setUi" data-key="' + key + '" data-val="' + v + '" aria-pressed="false">' + esc(l) + '</button>').join('') + '</div>';
    const screens = V.screenList.map(([r, l, p]) => '<li><a href="' + href(r, p || {}) + '" data-action="nav" data-to="' + r + '"' + Object.entries(p || {}).map(([k, v]) => ' data-p' + k[0].toUpperCase() + k.slice(1) + '="' + v + '"').join('') + '>' + esc(l) + '</a></li>').join('');
    return '' +
      '<div class="mk-col"><h2>Screens</h2><ul class="mk-screens">' + screens + '</ul></div>' +
      '<div class="mk-col"><h2>Zustand</h2>' + seg('state', { label: 'Zustand', items: [['normal', 'Normal'], ['empty', 'Leer'], ['loading', 'Laden'], ['error', 'Fehler'], ['offline', 'Offline']] }) +
      '<p class="mk-note">Wirkt auf Vorschläge, Aktivitäts-Detail, Board, Kalender, Benachrichtigungen und Album.</p>' +
      '<h2>' + esc(V.roleTitle || 'Rolle') + '</h2>' + seg('role', { label: V.roleTitle || 'Rolle', items: V.roles }) +
      '<p class="mk-note">' + esc(V.roleNote || '') + '</p>' +
      '<h2>Ansicht</h2>' + seg('view', { label: 'Ansicht', items: [['auto', 'Automatisch'], ['mobile', 'Mobil'], ['desktop', 'Desktop']] }) +
      '<h2>Farbmodus</h2>' + seg('theme', { label: 'Farbmodus', items: [['light', 'Hell'], ['dark', 'Dunkel']] }) +
      '<p class="mk-actions"><button type="button" data-action="demoReset">Demo zurücksetzen</button></p></div>' +
      '<div class="mk-col"><h2>Über dieses Mockup</h2>' + V.about + '</div>';
  }

  /* ---------- Ereignisse ---------- */
  function handle(el, ev) {
    const name = el.dataset.action; const fn = actions[name] || (V.actions && V.actions[name]);
    if (!fn) { console.warn('Unbekannte Aktion', name); return; }
    if (el.tagName === 'A') ev.preventDefault();
    if (S.ui.panel && el.closest('#mk-panel') && name === 'nav') { S.ui.panel = false; }
    fn(el, ev, S);
  }
  function trap(ev) {
    const dlg = document.querySelector('#app [role="dialog"], #app [role="alertdialog"]');
    if (!dlg) return;
    const f = Array.from(dlg.querySelectorAll(FOCUSABLE)).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!dlg.contains(document.activeElement)) { ev.preventDefault(); first.focus(); return; }
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }

  M.start = function (variant) {
    V = variant;
    document.getElementById('mk-panel').innerHTML = buildPanel();
    document.addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-action]');
      if (el && !el.disabled) handle(el, ev);
      else if (ev.target.classList && ev.target.classList.contains('scrim')) { if (S.celebrate) actions.closeCelebrate(); else if (S.modal) closeModal(); }
    });
    document.addEventListener('submit', (ev) => { const f = ev.target; if (f.dataset.form) { ev.preventDefault(); const fn = forms[f.dataset.form] || (V.forms && V.forms[f.dataset.form]); if (fn) fn(f, S); else console.warn('Unbekanntes Formular', f.dataset.form); } });
    document.addEventListener('change', (ev) => { const el = ev.target; if (el.dataset && el.dataset.change) { const fn = actions[el.dataset.change] || (V.actions && V.actions[el.dataset.change]); if (fn) fn(el, ev, S); } });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        if (S.celebrate) { actions.closeCelebrate(); return; }
        if (S.modal) { closeModal(); return; }
        if (S.ui.panel) { actions.togglePanel(); return; }
      }
      if (ev.key === 'Tab' && (S.modal || S.celebrate)) trap(ev);
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[role="button"][data-action]')) { ev.preventDefault(); handle(ev.target, ev); }
      if (V.onKey) V.onKey(ev, S);
    });
    window.addEventListener('hashchange', onHash);
    // WCAG 2.4.11: Fokus nie unter Tab-Bar, Plus-Button oder Kopf verstecken
    document.addEventListener('focusin', (ev) => {
      const el = ev.target; const sc = el.closest && el.closest('[data-scroll]'); if (!sc) return;
      const r = el.getBoundingClientRect(); const s = sc.getBoundingClientRect();
      let bottom = s.bottom;
      document.querySelectorAll('#app .tabbar, #app .fab, #app .sticky-cta').forEach((o) => { if (o.contains(el)) return; const q = o.getBoundingClientRect(); if (q.height && q.top < bottom && q.bottom > r.top && getComputedStyle(o).display !== 'none' && getComputedStyle(o).position !== 'static') bottom = Math.min(bottom, q.top); });
      if (r.bottom > bottom - 8) sc.scrollTop += r.bottom - bottom + 24;
      else if (r.top < s.top + 8) sc.scrollTop -= s.top - r.top + 24;
    });
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) S.ui.theme = 'dark';
    const p = parseHash();
    if (p) { S.route = V.routes.includes(p.route) ? p.route : V.routes[0]; S.params = p.params; } else S.route = V.routes[0];
    render();
  };

  Object.assign(M, {
    members, ME, EVENTS, REMINDERS, LEVELS, BADGES, TIERS, STATUS, BOARD, DUR, TODAY,
    esc, member, st, icon, confetti, qr, fmtDay, fmtRange, relDay, daysUntil, initials, level, tier, availability, busyNames, monthGrid, shiftMonth, href,
    act: (n, el) => (actions[n] || V.actions[n])(el, null, S),
    A, D, group, can, online, go, toast, render, reg,
    actionNames: () => Object.keys(actions).concat(V && V.actions ? Object.keys(V.actions) : []),
    formNames: () => Object.keys(forms),
    state: () => S,
  });
})();
