# Product Requirements Document – ZUSAMMEN

## Vision

ZUSAMMEN ist eine Mobile-First-App, in der Freundesgruppen Unternehmungen demokratisch per Voting auswählen, über ein Kanban-Board planen, Termine per Kalender-Sync finden und Aktivitäten nach Abschluss als persönliche Erinnerung archivieren. Ziel: von der gemeinsamen Idee bis zur geteilten Erinnerung — in einer App, ohne Chaos im Gruppen-Chat.

## Target Users

Freundesgruppen (3–10 Personen), die regelmäßig gemeinsame Aktivitäten planen und an fehlender Koordination scheitern.

**Schmerz:** Zu viele Messenger-Nachrichten, niemand entscheidet, Termine fallen ins Wasser, Erinnerungen gehen verloren.

**Bedürfnis:** Eine strukturierte, demokratische Entscheidungsfindung + klare Planung + ein Ort für gemeinsame Erinnerungen.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 | Supabase Infrastructure Setup | Roadmap |
| P0 | Authentifizierung & User Accounts | Roadmap |
| P0 | Gruppe & Mitglieder-Management | Roadmap |
| P0 | Aktivitäts-Vorschläge & Voting | Roadmap |
| P0 | Kanban-Board | Roadmap |
| P0 | Aktivitäts-Detail | Roadmap |
| P0 | Terminfindung & Kalender-Export | Roadmap |
| P0 | Nutzerprofil & Archiv | Roadmap |
| P1 | Capacitor Native Apps (iOS + Android) | Roadmap |
| P1 | Push-Benachrichtigungen | Roadmap |
| P2 | OTA-Updates (Capgo) | Roadmap |

## Success Metrics

- Aktive Gruppen mit mindestens 3 Aktivitäten im Status „Abgeschlossen"
- Durchschnittliche Zeit Idee → Abgeschlossen < 2 Wochen
- App Store Rating ≥ 4,5 (nach Capacitor-Release)

## Constraints

- Solo-Entwicklung mit KI-Unterstützung
- Web-App vollständig vor Capacitor-Integration (Konzept Abschnitt 17 — verbindlich)
- Next.js Static Export (`output: 'export'`) — keine Server Components, kein SSR, keine Server Actions
- Alle Datenoperationen client-seitig via Supabase JS Client; sensible Logik über RLS + Edge Functions
- Supabase MCP Server bereits verbunden (`.mcp.json`), Supabase-Projekt eingerichtet
- Vercel bereits eingerichtet
- Design System: siehe `STYLEGUIDE.md` (Archivo-Font, Terracotta/Navy/Gold, Warm Cream, Light + Dark Mode)

## Non-Goals (diese Version)

- Reminder via WhatsApp
- Aktivitäts-Vorlagen basierend auf Standort
- Monetarisierung / Abo-Modell
- Server-Side Rendering oder API Routes als Pflichtpfad
