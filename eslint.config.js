// ESLint 9 Flat Config.
//
// Bis Next.js 16 lief das Linting über `next lint`. Der Befehl wurde in
// Next.js 16 entfernt, eine Config gab es im Projekt nie — Lint war damit
// faktisch abgeschaltet. `eslint-config-next` exportiert seit v16 direkt
// Flat-Config-Arrays, die hier eingebunden werden.

const nextCoreWebVitals = require('eslint-config-next/core-web-vitals')
const nextTypescript = require('eslint-config-next/typescript')

module.exports = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'android/**',
      'ios/**',
      'playwright-report/**',
      'test-results/**',
      'supabase/functions/**', // Deno-Runtime, eigene Globals
      // Exportiertes Design-Bundle, kein Projektcode. Bewusst ohne den
      // führenden '#' des Ordnernamens formuliert: ESLint liest ein Pattern,
      // das mit '#' beginnt, wie einen .gitignore-Kommentar und verwirft es.
      '**/*Icon-Set Design/**',
      // Marketing-Website (lokal, gitignored) und Browser-Automations-Artefakte
      'website/**',
      '.playwright-mcp/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Node-Config-Dateien im Projektwurzelverzeichnis sind CommonJS.
    files: ['*.config.js', '*.config.mjs', '*.config.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
