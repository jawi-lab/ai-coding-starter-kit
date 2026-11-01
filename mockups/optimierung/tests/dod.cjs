/* Automatische Prüfung der Definition of Done für die drei Mockups.
   Aufruf (aus dem Repo-Root):  NODE_PATH=$(npm root -g) node mockups/optimierung/tests/dod.cjs [a|b|c] [--no-shots]
   Nutzt das vorinstallierte Chromium (kein WebKit, kein Download). Ergebnis: tests/results.json + Konsolenzusammenfassung. */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const here = __dirname;
const cfg = JSON.parse(fs.readFileSync(path.join(here, 'dod.config.json'), 'utf8'));
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const noShots = process.argv.includes('--no-shots');
const shotDir = path.join(here, '..', 'screenshots');

/* ---------- Kontrast (WCAG 2.x) im Browser ---------- */
function contrastScan() {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  function bgStack(el) {
    // Liefert mögliche Hintergrundfarben (bei Verläufen mehrere Stopps)
    const layers = []; let n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      const img = cs.backgroundImage;
      if (img && img.includes('gradient')) { const stops = (img.match(/rgba?\([^)]+\)/g) || []).map(parse).filter(Boolean); if (stops.length) { layers.push({ stops }); break; } }
      const c = parse(cs.backgroundColor); if (c && c.a > 0) { layers.push({ stops: [c] }); if (c.a >= 0.99) break; }
      n = n.parentElement;
    }
    let base = [{ r: 255, g: 255, b: 255, a: 1 }];
    if (!layers.length || layers[layers.length - 1].stops.every((s) => s.a < 0.99)) { const bodyBg = parse(getComputedStyle(document.querySelector('#app .app, #app .auth, #app') || document.body).backgroundColor); if (bodyBg && bodyBg.a > 0) base = [bodyBg]; }
    for (let i = layers.length - 1; i >= 0; i--) { const out = []; layers[i].stops.forEach((s) => base.forEach((b) => out.push(over(s, b)))); base = out; }
    return base;
  }
  const res = { checked: 0, min: 99, fails: [] };
  const app = document.getElementById('app');
  const els = app.querySelectorAll('*');
  for (const el of els) {
    const txt = Array.from(el.childNodes).filter((c) => c.nodeType === 3 && c.textContent.trim()).map((c) => c.textContent.trim()).join(' ');
    if (!txt) continue;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (el.closest('.sr-only,[aria-hidden="true"],.skip,.confetti')) continue;
    let op = 1; let n = el; while (n && n !== app) { op *= Number(getComputedStyle(n).opacity); n = n.parentElement; }
    if (op < 0.2) continue;
    const fg = parse(cs.color); if (!fg) continue;
    const bgs = bgStack(el);
    const fgEff = { ...fg, a: fg.a * op };
    const rat = Math.min(...bgs.map((b) => ratio(over(fgEff, b), b)));
    const size = parseFloat(cs.fontSize); const bold = Number(cs.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    const disabled = el.closest('[disabled],[aria-disabled="true"],.is-off,.av-past');
    res.checked++;
    if (rat < res.min) res.min = rat;
    if (rat < need && !disabled) res.fails.push({ text: txt.slice(0, 40), ratio: Math.round(rat * 100) / 100, need, cls: el.className && el.className.baseVal === undefined ? String(el.className).slice(0, 40) : el.tagName });
  }
  res.min = Math.round(res.min * 100) / 100;
  return res;
}

function overflowScan() {
  const frame = document.getElementById('frame').getBoundingClientRect();
  const out = { doc: document.documentElement.scrollWidth - document.documentElement.clientWidth, scroll: 0, outside: [] };
  document.querySelectorAll('#app [data-scroll]').forEach((s) => { out.scroll = Math.max(out.scroll, s.scrollWidth - s.clientWidth); });
  document.querySelectorAll('#app *').forEach((el) => {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
    if (el.closest('.sheet,.confetti,.toast-region,.tabbar,.skip,.sr-only,.cal-c')) return;
    if (r.right > frame.right + 1.5 || r.left < frame.left - 1.5) { const cs = getComputedStyle(el); if (cs.position === 'fixed') return; out.outside.push((el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName) + ' ' + Math.round(r.right - frame.right)); }
  });
  out.outside = Array.from(new Set(out.outside)).slice(0, 8);
  return out;
}

async function run() {
  const browser = await chromium.launch();
  const results = { date: new Date().toISOString(), browser: browser.version(), mockups: {} };
  for (const [key, m] of Object.entries(cfg.mockups)) {
    if (only.length && !only.includes(key)) continue;
    const file = path.resolve(here, m.file);
    const url = 'file://' + file;
    const R = { file: path.basename(file), bytes: fs.statSync(file).size, checks: {} };
    results.mockups[key] = R;
    console.log('\n=== Mockup ' + key.toUpperCase() + ' (' + (R.bytes / 1024).toFixed(1) + ' KB)');

    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const consoleErrors = []; const requests = [];
    page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') consoleErrors.push(msg.type() + ': ' + msg.text()); });
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
    page.on('request', (rq) => { if (!/^(file|data):/.test(rq.url())) requests.push(rq.url()); });
    const go = async (route, opts) => {
      await page.goto('about:blank'); // frischer Zustand je Aufruf
      await page.goto(url + '#/' + route);
      await page.waitForFunction(() => document.querySelector('#app') && document.querySelector('#app').children.length > 0);
      if (opts && opts.state) await page.evaluate((s) => { window.Mellon.state().ui.state = s; window.Mellon.render(); }, opts.state);
      if (opts && opts.theme) await page.evaluate((t) => { window.Mellon.state().ui.theme = t; window.Mellon.render(); }, opts.theme);
    };

    // 1) file://
    await go(m.start);
    R.checks.fileProtocol = { ok: (await page.evaluate(() => location.protocol)) === 'file:' && (await page.$$('#app *')).length > 10 };
    const routes = await page.$$eval('#mk-panel a[data-to]', (as) => as.map((a) => a.getAttribute('href').replace(/^#\//, '')));
    R.routes = routes;
    const actionNames = await page.evaluate(() => window.Mellon.actionNames());
    const formNames = await page.evaluate(() => window.Mellon.formNames());

    // 3) Erreichbarkeit per Klick (BFS über App-Links, Modals und Aktions-Kanten) + tote Klickziele
    const routeOf = (h) => h.replace(/^#\//, '');
    const seen = new Set(); const queue = [m.start]; const reached = new Set();
    const dead = [];
    while (queue.length) {
      const r = queue.shift(); if (seen.has(r)) continue; seen.add(r);
      await go(r);
      const info = await page.evaluate(({ actionNames, formNames }) => {
        const app = document.getElementById('app'); const links = []; const bad = []; const modals = []; let complete = false; let vote = false;
        app.querySelectorAll('a').forEach((a) => { const h = a.getAttribute('href') || ''; if (!h.startsWith('#/')) bad.push('a ohne Hash-Route: ' + h); else links.push(h); });
        app.querySelectorAll('[data-action]').forEach((el) => { const n = el.dataset.action; if (!actionNames.includes(n)) bad.push('unbekannte Aktion: ' + n); if (n === 'openModal') modals.push(el.dataset.modal); if (n === 'complete') complete = true; if (n === 'vote') vote = true; });
        app.querySelectorAll('[data-change]').forEach((el) => { if (!actionNames.includes(el.dataset.change)) bad.push('unbekannte Change-Aktion: ' + el.dataset.change); });
        app.querySelectorAll('form').forEach((f) => { if (!formNames.includes(f.dataset.form) && !(window.Mellon.state() && f.dataset.form)) bad.push('Formular ohne Handler: ' + f.dataset.form); });
        app.querySelectorAll('button').forEach((b) => { if (!b.dataset.action && b.type !== 'submit') bad.push('Button ohne Aktion: ' + (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 30)); });
        return { links, bad, modals: Array.from(new Set(modals)), complete, vote };
      }, { actionNames, formNames });
      reached.add(r.split('?')[0]);
      info.bad.forEach((b) => dead.push(r + ': ' + b));
      info.links.forEach((h) => { const t = routeOf(h); if (!seen.has(t)) queue.push(t); });
      if (info.complete) reached.add('celebrate');
      // Inhalte in Modals mitnehmen (z. B. „Erstellen“-Menü in C)
      for (const mod of info.modals) {
        await go(r); await page.evaluate((mm) => { const b = document.querySelector('#app [data-action="openModal"][data-modal="' + mm + '"]'); if (b) b.click(); }, mod);
        const inner = await page.$$eval('#app [role="dialog"] a, #app [role="alertdialog"] a', (as) => as.map((a) => a.getAttribute('href')));
        inner.forEach((h) => { if (h && h.startsWith('#/')) { const t = routeOf(h); if (!seen.has(t)) queue.push(t); } });
        const innerModals = await page.$$eval('#app [role="dialog"] [data-action="openModal"]', (bs) => bs.map((b) => b.dataset.modal));
        if (innerModals.includes('proposal')) reached.add('newproposal');
      }
    }
    // Alle Routen inkl. Zuständen auf tote Ziele prüfen
    for (const r of routes) for (const s of ['empty', 'loading', 'error', 'offline']) {
      await go(r, { state: s });
      const bad = await page.evaluate((names) => { const out = []; document.querySelectorAll('#app [data-action]').forEach((el) => { if (!names.includes(el.dataset.action)) out.push(el.dataset.action); }); document.querySelectorAll('#app button').forEach((b) => { if (!b.dataset.action && b.type !== 'submit') out.push('Button ohne Aktion'); }); return out; }, actionNames);
      bad.forEach((b) => dead.push(r + ' [' + s + ']: ' + b));
    }
    const required = cfg.required[key];
    const missing = Object.entries(required).filter(([k, v]) => k !== '_comment' && !reached.has(v)).map(([k, v]) => k + ' (' + v + ')');
    R.checks.reachable = { ok: missing.length === 0, reached: Array.from(reached).sort(), missing };
    // Klick-Rauchtest: jedes Klickziel jeder Route einmal anklicken, Wirkung prüfen
    const noEffect = []; let clicks = 0;
    for (const r of routes) {
      await go(r);
      const n = await page.$$eval('#app [data-action]:not([disabled]), #app a[href]', (els) => els.length); // Elemente unter [inert] (hinter offenen Dialogen) zählen mit, werden aber übersprungen
      for (let i = 0; i < n; i++) {
        await go(r);
        const before = await page.evaluate((i) => { const el = document.querySelectorAll('#app [data-action]:not([disabled]), #app a[href]')[i]; if (!el || el.closest('[inert]')) return null; const pressed = el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-current') === 'page' || (el.getAttribute('href') === location.hash); return { h: location.hash, html: document.getElementById('app').innerHTML.length + ':' + document.getElementById('app').innerHTML.slice(0, 0), full: document.getElementById('app').innerHTML, label: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30), pressed }; }, i);
        if (!before) continue;
        const errsBefore = consoleErrors.length;
        await page.evaluate((i) => { const el = document.querySelectorAll('#app [data-action]:not([disabled]), #app a[href]')[i]; el.click(); }, i);
        await page.waitForTimeout(30);
        clicks++;
        const after = await page.evaluate(() => ({ h: location.hash, full: document.getElementById('app').innerHTML, toast: document.getElementById('toast-region').textContent, focusMoved: document.activeElement && document.activeElement.id === 'main' }));
        if (consoleErrors.length > errsBefore) noEffect.push(r + ' → „' + before.label + '“ erzeugt Fehler');
        else if (after.h === before.h && after.full === before.full && !after.toast && !before.pressed && !after.focusMoved) noEffect.push(r + ' → „' + before.label + '“ ohne sichtbare Wirkung');
      }
    }
    R.checks.deadTargets = { ok: dead.length === 0 && noEffect.length === 0, clicks, dead: Array.from(new Set(dead)), noEffect: Array.from(new Set(noEffect)) };

    // 4) Kein horizontales Scrollen
    const ovs = [];
    for (const w of cfg.viewports) {
      await page.setViewportSize({ width: w, height: w < 500 ? 812 : 900 });
      for (const r of routes) for (const th of ['light', 'dark']) {
        await go(r, { theme: th });
        const o = await page.evaluate(overflowScan);
        if (o.doc > 0 || o.scroll > 0 || o.outside.length) ovs.push(w + 'px ' + th + ' ' + r + ': doc ' + o.doc + ', scroll ' + o.scroll + (o.outside.length ? ', außerhalb ' + o.outside.join(' | ') : ''));
      }
    }
    R.checks.noHorizontalScroll = { ok: ovs.length === 0, viewports: cfg.viewports, problems: ovs };

    // 4b) Vertikales Scrollen per Mausrad/Touch (Inhalt darf nicht abgeschnitten sein)
    const vs = []; let scrollTested = 0;
    for (const w of [375, 1440]) {
      await page.setViewportSize({ width: w, height: w < 500 ? 812 : 900 });
      for (const r of routes) {
        await go(r); await page.waitForTimeout(450); // Einblend-Animation abwarten
        const g = await page.evaluate(() => { const s = document.querySelector('#app .sheet, #app .celebrate') || document.querySelector('#app [data-scroll]') || document.querySelector('#app .auth'); if (!s) return null; const fr = document.getElementById('frame').getBoundingClientRect(); const b = s.getBoundingClientRect(); return { sh: s.scrollHeight, ch: s.clientHeight, bottom: b.bottom, frameBottom: fr.bottom, x: b.left + b.width / 2, y: b.top + Math.min(b.height / 2, 300) }; });
        if (!g) continue;
        if (g.bottom > g.frameBottom + 1) { vs.push(w + 'px ' + r + ': Scrollbereich ragt ' + Math.round(g.bottom - g.frameBottom) + ' px aus dem Rahmen'); continue; }
        if (g.sh > g.ch + 20) {
          scrollTested++;
          await page.mouse.move(g.x, g.y); await page.mouse.wheel(0, 600); await page.waitForTimeout(120);
          const top = await page.evaluate(() => { const s = document.querySelector('#app .sheet, #app .celebrate') || document.querySelector('#app [data-scroll]') || document.querySelector('#app .auth'); return s.scrollTop; });
          if (top <= 0) vs.push(w + 'px ' + r + ': Mausrad scrollt nicht');
        }
      }
    }
    R.checks.verticalScroll = { ok: vs.length === 0, scrollablePagesTested: scrollTested, problems: vs };

    // 5) Kontrast (Light + Dark, 375 und 1440, alle Routen + Zustände)
    const contrast = { light: { min: 99, checked: 0, fails: [] }, dark: { min: 99, checked: 0, fails: [] } };
    for (const w of [375, 1440]) {
      await page.setViewportSize({ width: w, height: w < 500 ? 812 : 900 });
      for (const th of ['light', 'dark']) for (const r of routes) for (const s of (cfg.stateRoutes[key].includes(r) ? cfg.states : ['normal'])) {
        await go(r, { theme: th, state: s });
        await page.waitForTimeout(450); // Animationen ausklingen lassen
        const c = await page.evaluate(contrastScan);
        const C = contrast[th]; C.checked += c.checked; C.min = Math.min(C.min, c.min);
        c.fails.forEach((f) => C.fails.push(w + 'px ' + r + (s !== 'normal' ? ' [' + s + ']' : '') + ': „' + f.text + '“ ' + f.ratio + ':1 (nötig ' + f.need + ')'));
      }
    }
    contrast.light.fails = Array.from(new Set(contrast.light.fails)); contrast.dark.fails = Array.from(new Set(contrast.dark.fails));
    // Fokusring-Kontrast (Nicht-Text, 3:1): Ringfarbe und Innenkante gegen Seitenhintergrund
    const ring = {};
    for (const th of ['light', 'dark']) {
      await go('login', { theme: th });
      ring[th] = await page.evaluate(() => {
        const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2] }; };
        const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
        const cs = getComputedStyle(document.getElementById('app'));
        const bg = parse(cs.backgroundColor);
        const ringC = parse(cs.getPropertyValue('--ring').trim().replace(/^#(..)(..)(..)$/, (m0, a, b, c) => 'rgb(' + parseInt(a, 16) + ',' + parseInt(b, 16) + ',' + parseInt(c, 16) + ')'));
        const inner = parse(cs.getPropertyValue('--ring-inner').trim().replace(/^#(..)(..)(..)$/, (m0, a, b, c) => 'rgb(' + parseInt(a, 16) + ',' + parseInt(b, 16) + ',' + parseInt(c, 16) + ')'));
        return { ringOnBg: Math.round(ratio(ringC, bg) * 100) / 100, innerOnBg: Math.round(ratio(inner, bg) * 100) / 100 };
      });
    }
    R.checks.contrast = { ok: contrast.light.fails.length === 0 && contrast.dark.fails.length === 0 && ['light', 'dark'].every((t) => Math.max(ring[t].ringOnBg, ring[t].innerOnBg) >= 3), light: contrast.light, dark: contrast.dark, focusRing: ring };

    // 5b) Tastatur: Tab erreicht Elemente mit sichtbarem Fokus, Enter/Leertaste lösen aus, Esc schließt Dialoge, Fokusfalle
    await page.setViewportSize({ width: 1440, height: 900 });
    const kb = { visibleFocus: 0, tabs: 0, invisible: [] };
    const homeRoute = routes.find((r) => ['home', 'agenda'].includes(r));
    await go(homeRoute, { theme: 'light' });
    await page.click('#mk-toggle'); await page.click('#mk-toggle'); // Fokus in die Steuerleiste setzen, Panel wieder zu
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab'); kb.tabs++;
      const f = await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const cs = getComputedStyle(a); const vis = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || (cs.boxShadow && cs.boxShadow !== 'none'); return { vis, inApp: !!a.closest('#app'), label: (a.textContent || a.getAttribute('aria-label') || a.tagName).trim().slice(0, 30) }; });
      if (f && f.inApp) { if (f.vis) kb.visibleFocus++; else kb.invisible.push(f.label); }
    }
    // Enter auf Herz-/Abstimmungs-Button
    const voteRoute = key === 'c' ? 'agenda' : 'proposals';
    await go(voteRoute);
    await page.focus('#app [data-action="vote"]');
    const pressedBefore = await page.$eval('#app [data-action="vote"]', (b) => b.getAttribute('aria-pressed'));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(50);
    const voteId = await page.evaluate(() => document.activeElement && document.activeElement.dataset && document.activeElement.dataset.id);
    const pressedAfter = voteId ? await page.$eval('#app [data-action="vote"][data-id="' + voteId + '"]', (b) => b.getAttribute('aria-pressed')).catch(() => null) : 'celebrate';
    kb.enterActivates = pressedBefore !== pressedAfter || (await page.$('#app .celebrate')) !== null;
    // Dialog: Fokus im Dialog, Tab bleibt drin, Esc schließt und Fokus kehrt zurück
    await go('newproposal');
    const inDlg = await page.evaluate(() => !!document.activeElement.closest('[role="dialog"]'));
    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
    const stillIn = await page.evaluate(() => !!document.activeElement.closest('[role="dialog"]'));
    await page.keyboard.press('Escape'); await page.waitForTimeout(80);
    const closed = await page.evaluate(() => !document.querySelector('#app [role="dialog"]'));
    kb.dialogFocus = inDlg; kb.focusTrap = stillIn; kb.escCloses = closed;
    R.checks.keyboard = { ok: kb.invisible.length === 0 && kb.visibleFocus > 5 && kb.enterActivates && inDlg && stillIn && closed, ...kb };

    // 2) Konsole und Netzwerk (über den ganzen Lauf gesammelt)
    R.checks.console = { ok: consoleErrors.length === 0, errors: Array.from(new Set(consoleErrors)).slice(0, 20) };
    R.checks.network = { ok: requests.length === 0, external: Array.from(new Set(requests)).slice(0, 20) };
    // 6) Dateigröße
    R.checks.size = { ok: R.bytes <= cfg.maxBytes, bytes: R.bytes, kb: Math.round(R.bytes / 102.4) / 10 };

    // Screenshots
    if (!noShots) {
      const dir = path.join(shotDir, key); fs.mkdirSync(dir, { recursive: true });
      let n = 0;
      for (const w of cfg.screenshotViewports) for (const th of cfg.themes) {
        await page.setViewportSize({ width: w, height: w < 500 ? 812 : 900 });
        for (const r of routes) { await go(r, { theme: th }); await page.waitForTimeout(r === 'celebrate' ? 1100 : 450); await page.screenshot({ path: path.join(dir, r.replace(/\?.*/, '') + '_' + w + '_' + th + '.jpg'), type: 'jpeg', quality: 62 }); n++; }
        if (w === 375) for (const r of cfg.stateRoutes[key]) for (const s of ['empty', 'loading', 'error', 'offline']) { await go(r, { theme: th, state: s }); await page.waitForTimeout(450); await page.screenshot({ path: path.join(dir, 'zustand_' + r.replace(/\?.*/, '') + '_' + s + '_' + w + '_' + th + '.jpg'), type: 'jpeg', quality: 62 }); n++; }
      }
      R.screenshots = n;
    }
    await ctx.close();
    for (const [k, v] of Object.entries(R.checks)) console.log((v.ok ? '  OK   ' : '  FAIL ') + k + (v.ok ? '' : ' → ' + JSON.stringify(v).slice(0, 600)));
  }
  await browser.close();
  const out = path.join(here, 'results' + (only.length ? '-' + only.join('') : '') + '.json');
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  console.log('\nErgebnis: ' + out);
}
run().catch((e) => { console.error(e); process.exit(1); });
