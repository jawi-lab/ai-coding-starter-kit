-- Realtime liefert gefilterte DELETE-Ereignisse nur mit replica identity full.
-- Wegen RLS enthält das Ereignis trotzdem nur den Primärschlüssel.
alter table public.activity_comments replica identity full;
