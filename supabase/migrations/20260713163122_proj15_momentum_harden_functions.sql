-- PROJ-15 Härtung: Die Momentum-Automatik ist nicht als RPC gedacht.
-- Trigger feuern unabhängig von EXECUTE-Rechten (Privileg-Check erfolgt beim
-- CREATE TRIGGER durch den Owner) — Revoke nimmt sie nur aus der REST-API.
revoke execute on function public.refresh_group_momentum(uuid) from public, anon, authenticated;
revoke execute on function public.handle_activity_momentum() from public, anon, authenticated;
revoke execute on function public.handle_group_momentum_init() from public, anon, authenticated;
revoke execute on function public.handle_member_momentum_seen_seed() from public, anon, authenticated;
revoke execute on function public.set_momentum_seen_updated_at() from public, anon, authenticated;
revoke execute on function public.momentum_milestone_for(integer) from public, anon, authenticated;
