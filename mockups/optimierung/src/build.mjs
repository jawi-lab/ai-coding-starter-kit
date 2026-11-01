// Baut mockup-a/b/c.html: je eine Datei mit inline CSS, JS, SVG-Logo und Base64-Schriften.
// Aufruf: node mockups/optimierung/src/build.mjs
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..');
const repoFonts = join(here, '..', '..', '..', 'src', 'fonts');
const read = (p) => readFileSync(p, 'utf8');
const b64 = (p) => readFileSync(p).toString('base64');

const FONTS = {
  hanken: { family: 'Hanken Grotesk', file: join(repoFonts, 'HankenGrotesk-wght.woff2'), weight: '100 900' },
  serif: { family: 'Source Serif 4', file: join(repoFonts, 'SourceSerif4-wght.woff2'), weight: '200 900' },
  nunito: { family: 'Nunito', file: join(here, 'fonts', 'Nunito-latin-wght.woff2'), weight: '200 1000' },
  bricolage: { family: 'Bricolage Grotesque', file: join(here, 'fonts', 'BricolageGrotesque-latin-wght.woff2'), weight: '200 800' },
};
const fontFace = (k) => `@font-face{font-family:"${FONTS[k].family}";src:url(data:font/woff2;base64,${b64(FONTS[k].file)}) format("woff2");font-weight:${FONTS[k].weight};font-style:normal;font-display:swap}`;

const VARIANTS = [
  { key: 'a', title: 'Mellon – Mockup A · Evolution', label: 'A · Evolution', fonts: ['hanken', 'serif'] },
  { key: 'b', title: 'Mellon – Mockup B · Spielerisch', label: 'B · Spielerisch', fonts: ['nunito'] },
  { key: 'c', title: 'Mellon – Mockup C · Mutig', label: 'C · Mutig', fonts: ['bricolage', 'hanken'] },
];

const logo = read(join(here, 'logo.svg'))
  .replace('<svg ', '<svg role="img" aria-label="Mellon" focusable="false" ')
  .replace('<path ', '<path fill="currentColor" ');
const core = read(join(here, 'core.js'));
const chrome = read(join(here, 'chrome.css'));

const CSP = "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'";

for (const v of VARIANTS) {
  const css = read(join(here, `${v.key}.css`));
  const js = read(join(here, `${v.key}.js`));
  const html = `<!doctype html>
<html lang="de" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="no-referrer">
<title>${v.title}</title>
<style>${v.fonts.map(fontFace).join('')}
${chrome}
${css}</style>
</head>
<body>
<header class="mk-bar">
  <span class="mk-brand"><span class="mk-logo" aria-hidden="true">${logo}</span><span class="mk-variant">Mockup ${v.label}</span></span>
  <span id="mk-status" class="mk-status"></span>
  <button type="button" id="mk-toggle" class="mk-toggle" data-action="togglePanel" aria-expanded="false" aria-controls="mk-panel">Steuerung</button>
</header>
<div id="mk-panel" class="mk-panel" role="region" aria-label="Mockup-Steuerung" hidden></div>
<div class="mk-stage">
  <div id="frame" class="frame" data-view="auto">
    <div id="app"></div>
    <div id="toast-region" class="toast-region" role="status" aria-live="polite"></div>
  </div>
</div>
<script>window.MELLON_LOGO=${JSON.stringify(logo)};</script>
<script>${core}</script>
<script>${js}</script>
</body>
</html>
`;
  const file = join(out, `mockup-${v.key}.html`);
  writeFileSync(file, html);
  const size = statSync(file).size;
  console.log(`mockup-${v.key}.html  ${(size / 1024).toFixed(1)} KB${size > 1024 * 1024 ? '  ÜBER 1 MB!' : ''}`);
}
