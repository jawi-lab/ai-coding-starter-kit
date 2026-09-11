# Product Requirements Document – Mellon

## Vision

Mellon (ehemals ZUSAMMEN) ist eine Mobile-First-App, in der Freundesgruppen Unternehmungen demokratisch per Voting auswählen, über ein Kanban-Board planen, Termine per Kalender-Sync finden und Aktivitäten nach Abschluss als persönliche Erinnerung archivieren. Ziel: von der gemeinsamen Idee bis zur geteilten Erinnerung — in einer App, ohne Chaos im Gruppen-Chat.

## Target Users

Freundesgruppen (3–10 Personen), die regelmäßig gemeinsame Aktivitäten planen und an fehlender Koordination scheitern.

**Schmerz:** Zu viele Messenger-Nachrichten, niemand entscheidet, Termine fallen ins Wasser, Erinnerungen gehen verloren.

**Bedürfnis:** Eine strukturierte, demokratische Entscheidungsfindung + klare Planung + ein Ort für gemeinsame Erinnerungen.

## Core Features (Roadmap)

> **Statusquelle:** `features/INDEX.md` ist die verbindliche Quelle für den Feature-Status. Diese Tabelle spiegelt sie — bei Abweichung gilt INDEX.md. Skills, die den Status ändern, aktualisieren beide Dateien.
>
> _Stand: 2026-09-09_

| ID | Priority | Feature | Status |
|----|----------|---------|--------|
| PROJ-1 | P0 | Supabase Infrastructure Setup | Deployed |
| PROJ-2 | P0 | Authentifizierung & User Accounts | Deployed |
| PROJ-3 | P0 | Gruppe & Mitglieder-Management | Deployed |
| PROJ-4 | P0 | Aktivitäts-Vorschläge & Voting | Deployed |
| PROJ-5 | P0 | Kanban-Board | Deployed |
| PROJ-6 | P0 | Aktivitäts-Detail | Deployed |
| PROJ-7 | P0 | Terminfindung & Kalender-Export | Deployed |
| PROJ-8 | P0 | Nutzerprofil & Archiv | Deployed |
| PROJ-9 | P1 | Capacitor Native Apps (iOS + Android) | Approved |
| PROJ-10 | P1 | Push-Benachrichtigungen (FCM/APNs) | Deployed |
| PROJ-11 | P2 | OTA-Updates via Capgo | Deployed |
| PROJ-12 | P1 | Benachrichtigungen & Einstellungen (In-App + E-Mail) | Deployed |
| PROJ-13 | P1 | Onboarding-Flow (Erst-Login) | Deployed |
| PROJ-14 | P1 | Umfragen in Aktivitäten (sichtbar, Mehrfachauswahl) | Deployed |
| PROJ-15 | P1 | Gruppen-Momentum (Gamification) | Deployed |
| PROJ-16 | P2 | Persönliche Rollen-Badges (Gamification) | Deployed |
| PROJ-17 | P1 | Memory Cards & Album (Gamification) | Deployed |
| PROJ-18 | P2 | ZUSAMMEN Wrapped (Gamification) | Deployed |

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
