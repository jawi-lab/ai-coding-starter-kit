-- PROJ-17 Baustein 2: „Album zuletzt geöffnet" pro Nutzer.
-- Eine Karte ist „neu", wenn ihr completed_at jünger ist als dieser Zeitstempel.
-- DEFAULT now() erledigt beide Backfill-Fälle: Bestandsnutzer erhalten den
-- Launch-Zeitpunkt (Backfill-Karten tragen nie „Neu"), Neu-Nutzer ihren
-- Registrierungszeitpunkt (profiles-Zeile entsteht beim Signup).
-- Schreiben: über die bestehende profiles_update_own-Policy (nur eigene Zeile);
-- ein gefälschter Wert beträfe ausschließlich die eigene Badge-Anzeige.

alter table public.profiles
  add column album_last_seen_at timestamptz not null default now();

comment on column public.profiles.album_last_seen_at is
  'PROJ-17: timestamp of the user''s last album visit. Cards with completed_at newer than this show the "Neu" badge.';
