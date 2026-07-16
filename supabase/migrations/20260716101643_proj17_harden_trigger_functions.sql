-- PROJ-17 Härtung (Muster aus PROJ-15): Trigger-Funktionen sind nicht als RPC
-- gedacht. Trigger feuern unabhängig von EXECUTE-Rechten — Revoke nimmt sie
-- nur aus der REST-API. Die is_or_was_*-Helper bleiben ausführbar, weil
-- RLS-Policies sie mit den Rechten des aufrufenden Nutzers auswerten
-- (gleiche Baseline wie is_group_member/is_group_admin).
revoke execute on function public.set_activity_completed_at() from public, anon, authenticated;
revoke execute on function public.handle_member_left_history() from public, anon, authenticated;
